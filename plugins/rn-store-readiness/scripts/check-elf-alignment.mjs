#!/usr/bin/env node
// Google Play 16 KB page-size check for Android native libraries. No dependencies.
// Reads .apk / .aab / .aar / .so files (or folders containing them) and reports, per 64-bit
// library, the smallest PT_LOAD alignment (must be >= 16384) and, for uncompressed libs in an
// APK, the zip alignment. 32-bit ABIs are exempt.
//
//   node check-elf-alignment.mjs <file-or-dir> [...] [--json]
//
// Exit code: 0 all 64-bit libs aligned, 1 at least one UNALIGNED, 2 usage or read error.

import fs from "node:fs";
import path from "node:path";

import { abiOf, checkZipNativeLibs, elfLoadAlignment, readFileHead, statusOf } from "./lib/zip-elf.mjs";

const argv = process.argv.slice(2);
const asJson = argv.includes("--json");
const inputs = argv.filter((a) => a !== "--json");
if (!inputs.length || inputs.includes("-h") || inputs.includes("--help")) {
  console.error("Usage: node check-elf-alignment.mjs <app.apk|app.aab|lib.aar|lib.so|dir> [...] [--json]");
  process.exit(2);
}

const ZIP_EXT = /\.(apk|aab|aar|apks|zip)$/i;
const files = [];
for (const input of inputs) {
  if (!fs.existsSync(input)) {
    console.error(`Not found: ${input}`);
    process.exit(2);
  }
  if (fs.statSync(input).isDirectory()) collect(input, files);
  else files.push(input);
}

const results = [];
for (const file of files) {
  try {
    if (ZIP_EXT.test(file)) results.push(...checkZipNativeLibs(file));
    else if (file.endsWith(".so")) {
      const elf = elfLoadAlignment(readFileHead(file));
      results.push({ container: null, path: file, abi: abiOf(file.split(path.sep).join("/")), minAlign: elf?.minAlign ?? null, elf: Boolean(elf) });
    }
  } catch (error) {
    results.push({ container: file, path: file, abi: null, error: error.message });
  }
}
for (const r of results) r.status = statusOf(r);

const unaligned = results.filter((r) => r.status === "UNALIGNED");
const errors = results.filter((r) => r.status === "ERROR");

if (asJson) {
  console.log(JSON.stringify({ files, results, unaligned: unaligned.length, errors: errors.length }, null, 2));
} else {
  if (!results.length) console.log("No native libraries (.so) found — nothing to align.");
  for (const r of results) {
    const align = r.minAlign == null ? "-" : r.minAlign >= 1024 ? `${r.minAlign / 1024}K` : String(r.minAlign);
    const zip = r.zipAligned16k === undefined ? "" : r.zipAligned16k ? "  zip:16K" : "  zip:NOT-16K";
    const where = r.container ? `${path.basename(r.container)}!${r.path}` : r.path;
    console.log(`${r.status.padEnd(9)} ${(r.abi ?? "?").padEnd(11)} align=${align.padEnd(5)}${zip}  ${where}${r.error ? `  (${r.error})` : ""}`);
  }
  console.log(`\n${results.length} libs checked · ${unaligned.length} UNALIGNED (64-bit) · ${errors.length} errors`);
  if (unaligned.length) {
    console.log("Fix: rebuild with NDK r28+, or pass -DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON / -Wl,-z,max-page-size=16384 to the library's native build, or upgrade the library.");
  }
}
process.exit(errors.length && !unaligned.length ? 2 : unaligned.length ? 1 : 0);

function collect(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== ".git" && entry.name !== "node_modules") collect(full, out);
    } else if (ZIP_EXT.test(entry.name) || entry.name.endsWith(".so")) out.push(full);
  }
}
