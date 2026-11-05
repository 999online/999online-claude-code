// Minimal ZIP central-directory reader + ELF program-header reader. No dependencies.
// Used to check 16 KB page-size alignment of native libraries inside APK / AAB / AAR files.

import fs from "node:fs";
import zlib from "node:zlib";

export const PAGE_16K = 16384;

const ABI_RE = /(?:^|\/)(?:lib|jni)\/(arm64-v8a|x86_64|armeabi-v7a|armeabi|x86|riscv64)\//;

/** ABI folder of a native-library path inside an APK/AAB/AAR, or null. */
export function abiOf(entryPath) {
  return entryPath.match(ABI_RE)?.[1] ?? null;
}

/** 16 KB alignment is required only for 64-bit ABIs. */
export function needs16k(abi) {
  return abi === "arm64-v8a" || abi === "x86_64";
}

/** Lists the entries of a ZIP-format file (APK, AAB, AAR, JAR). Supports ZIP64. */
export function listZipEntries(file) {
  const fd = fs.openSync(file, "r");
  try {
    const size = fs.fstatSync(fd).size;
    const tailLen = Math.min(size, 65557);
    const tail = Buffer.alloc(tailLen);
    fs.readSync(fd, tail, 0, tailLen, size - tailLen);
    let eocd = -1;
    for (let i = tailLen - 22; i >= 0; i--) {
      if (tail.readUInt32LE(i) === 0x06054b50) {
        eocd = i;
        break;
      }
    }
    if (eocd < 0) throw new Error("not a ZIP file (no end-of-central-directory record)");
    let count = tail.readUInt16LE(eocd + 10);
    let cdSize = tail.readUInt32LE(eocd + 12);
    let cdOffset = tail.readUInt32LE(eocd + 16);
    if (count === 0xffff || cdSize === 0xffffffff || cdOffset === 0xffffffff) {
      // ZIP64: the locator sits 20 bytes before the classic EOCD record.
      const loc = eocd - 20;
      if (loc < 0 || tail.readUInt32LE(loc) !== 0x07064b50) throw new Error("ZIP64 locator missing");
      const z64 = Buffer.alloc(56);
      fs.readSync(fd, z64, 0, 56, Number(tail.readBigUInt64LE(loc + 8)));
      if (z64.readUInt32LE(0) !== 0x06064b50) throw new Error("ZIP64 end-of-central-directory missing");
      count = Number(z64.readBigUInt64LE(32));
      cdSize = Number(z64.readBigUInt64LE(40));
      cdOffset = Number(z64.readBigUInt64LE(48));
    }
    const cd = Buffer.alloc(cdSize);
    fs.readSync(fd, cd, 0, cdSize, cdOffset);
    const entries = [];
    let p = 0;
    for (let n = 0; n < count && p + 46 <= cd.length; n++) {
      if (cd.readUInt32LE(p) !== 0x02014b50) throw new Error("corrupt central directory");
      const method = cd.readUInt16LE(p + 10);
      let compressedSize = cd.readUInt32LE(p + 20);
      let uncompressedSize = cd.readUInt32LE(p + 24);
      const nameLen = cd.readUInt16LE(p + 28);
      const extraLen = cd.readUInt16LE(p + 30);
      const commentLen = cd.readUInt16LE(p + 32);
      let localOffset = cd.readUInt32LE(p + 42);
      const name = cd.toString("utf8", p + 46, p + 46 + nameLen);
      // The ZIP64 extra field (0x0001) holds, in order, the 64-bit values saturated above.
      let e = p + 46 + nameLen;
      const extraEnd = e + extraLen;
      while (e + 4 <= extraEnd) {
        const id = cd.readUInt16LE(e);
        const len = cd.readUInt16LE(e + 2);
        if (id === 0x0001) {
          let q = e + 4;
          if (uncompressedSize === 0xffffffff) {
            uncompressedSize = Number(cd.readBigUInt64LE(q));
            q += 8;
          }
          if (compressedSize === 0xffffffff) {
            compressedSize = Number(cd.readBigUInt64LE(q));
            q += 8;
          }
          if (localOffset === 0xffffffff) localOffset = Number(cd.readBigUInt64LE(q));
        }
        e += 4 + len;
      }
      entries.push({ name, method, compressedSize, uncompressedSize, localOffset });
      p += 46 + nameLen + extraLen + commentLen;
    }
    return entries;
  } finally {
    fs.closeSync(fd);
  }
}

/** Data offset of an entry plus up to `maxBytes` of its uncompressed content (enough for ELF headers). */
export function readZipEntryHead(file, entry, maxBytes = 65536) {
  const fd = fs.openSync(file, "r");
  try {
    const local = Buffer.alloc(30);
    fs.readSync(fd, local, 0, 30, entry.localOffset);
    if (local.readUInt32LE(0) !== 0x04034b50) throw new Error(`bad local header for ${entry.name}`);
    const dataOffset = entry.localOffset + 30 + local.readUInt16LE(26) + local.readUInt16LE(28);
    if (entry.method === 0) {
      const n = Math.min(maxBytes, entry.uncompressedSize);
      const head = Buffer.alloc(n);
      fs.readSync(fd, head, 0, n, dataOffset);
      return { dataOffset, head };
    }
    if (entry.method === 8) {
      // Inflate only the start of the stream: ELF and program headers sit in the first few KB.
      const n = Math.min(entry.compressedSize, 65536);
      const chunk = Buffer.alloc(n);
      fs.readSync(fd, chunk, 0, n, dataOffset);
      const out = zlib.inflateRawSync(chunk, { finishFlush: zlib.constants.Z_SYNC_FLUSH });
      return { dataOffset, head: out.subarray(0, maxBytes) };
    }
    throw new Error(`unsupported compression method ${entry.method} for ${entry.name}`);
  } finally {
    fs.closeSync(fd);
  }
}

/** First `maxBytes` of a plain file. */
export function readFileHead(file, maxBytes = 65536) {
  const fd = fs.openSync(file, "r");
  try {
    const head = Buffer.alloc(Math.min(maxBytes, fs.fstatSync(fd).size));
    fs.readSync(fd, head, 0, head.length, 0);
    return head;
  } finally {
    fs.closeSync(fd);
  }
}

/**
 * Smallest p_align of the PT_LOAD segments of an ELF image, from its first bytes.
 * Returns null when `head` is not ELF. 16 KB-compatible libraries have minAlign >= 16384.
 */
export function elfLoadAlignment(head) {
  if (head.length < 52 || head.readUInt32BE(0) !== 0x7f454c46) return null;
  const is64 = head[4] === 2;
  const le = head[5] === 1;
  const u16 = (o) => (le ? head.readUInt16LE(o) : head.readUInt16BE(o));
  const u32 = (o) => (le ? head.readUInt32LE(o) : head.readUInt32BE(o));
  const u64 = (o) => Number(le ? head.readBigUInt64LE(o) : head.readBigUInt64BE(o));
  const machine = u16(18);
  const phoff = is64 ? u64(32) : u32(28);
  const phentsize = is64 ? u16(54) : u16(42);
  const phnum = is64 ? u16(56) : u16(44);
  let minAlign = Infinity;
  let loads = 0;
  for (let i = 0; i < phnum; i++) {
    const o = phoff + i * phentsize;
    if (o + phentsize > head.length) return { is64, machine, minAlign: null, loads, truncated: true };
    if (u32(o) !== 1) continue; // PT_LOAD only
    loads++;
    minAlign = Math.min(minAlign, is64 ? u64(o + 48) : u32(o + 28));
  }
  return { is64, machine, minAlign: loads ? minAlign : null, loads };
}

/** Checks every native library inside a ZIP-format file. */
export function checkZipNativeLibs(file) {
  const isApk = /\.apk$/i.test(file);
  const results = [];
  for (const entry of listZipEntries(file)) {
    if (!entry.name.endsWith(".so")) continue;
    const abi = abiOf(entry.name);
    try {
      const { dataOffset, head } = readZipEntryHead(file, entry);
      const elf = elfLoadAlignment(head);
      const result = {
        container: file,
        path: entry.name,
        abi,
        minAlign: elf?.minAlign ?? null,
        elf: Boolean(elf),
      };
      // Uncompressed libs in an APK are mmapped from the APK, so their zip offset must be 16 KB aligned too.
      if (isApk && entry.method === 0) result.zipAligned16k = dataOffset % PAGE_16K === 0;
      results.push(result);
    } catch (error) {
      results.push({ container: file, path: entry.name, abi, error: error.message });
    }
  }
  return results;
}

/** Status of one library result: ALIGNED, UNALIGNED, EXEMPT (32-bit / unknown ABI) or ERROR. */
export function statusOf(result) {
  if (result.error || (result.elf && result.minAlign == null)) return "ERROR";
  if (!result.elf) return "NOT-ELF";
  if (!needs16k(result.abi)) return "EXEMPT";
  if (result.minAlign < PAGE_16K || result.zipAligned16k === false) return "UNALIGNED";
  return "ALIGNED";
}
