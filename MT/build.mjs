import { build } from "esbuild";
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { zipSync, strToU8 } from "fflate";

process.chdir(fileURLToPath(new URL(".", import.meta.url)));
await mkdir("build", { recursive: true });
const revision = "9ea9f9bfc91319e2b18c6b1c9ac0b993f8600c1d";
const hashes = {
  build: "61cbb34f108bc3dd949532876b435f1fcd1818139af3d9d2df62aa5278795d59",
  "generate-index": "1973be5b1e7b1df1f49a573b8aef17286b6a55af03d44946f698660380a64f3f",
};
for (const [name, hash] of Object.entries(hashes)) {
  const path = `build/official-${name}.ts`;
  let source = await readFile(path).catch(() => null);
  if (!source) {
    const response = await fetch(`https://raw.githubusercontent.com/Valenced/valenced-plugin-cli/${revision}/src/${name}.ts`);
    if (!response.ok) throw new Error(`Compiler download failed: ${response.status}`);
    source = Buffer.from(await response.arrayBuffer());
  }
  if (createHash("sha256").update(source).digest("hex") !== hash) throw new Error(`Compiler checksum mismatch: ${name}`);
  await writeFile(path, source);
  await build({ entryPoints: [path], outfile: `build/official-${name}.mjs`, bundle: true, platform: "node", format: "esm", packages: "external" });
}
const { run } = await import("./build/official-build.mjs");
await run(["MT", "--plugins-dir", ".."]);
if (process.exitCode) throw new Error("Official Valenced compilation failed");
const manifest = JSON.parse(await readFile("manifest.json", "utf8"));
const entries = {
  "manifest.json": strToU8(JSON.stringify(manifest, null, 2)),
  "index.js": await readFile("build/js/index.js"),
};
for (const name of (await readdir("assets")).sort()) entries[`assets/${name}`] = await readFile(`assets/${name}`);
const filename = `Midnight-Mobile-Valenced-${manifest.version}.zip`;
const archive = zipSync(entries, { level: 9, mtime: new Date("2026-01-01T00:00:00Z") });
await writeFile(filename, archive);
const { generateIndex } = await import("./build/official-generate-index.mjs");
const index = generateIndex([{ file: filename, url: `https://raw.githubusercontent.com/dariussbezy/Midnight-Theme-Valenced/refs/heads/main/MT/${filename}` }], {
  name: "Midnight Mobile", description: "Midnight theme for Valenced on Discord mobile.",
});
if (index.plugins[manifest.id].channels.latest) throw new Error("A beta must not be published as latest");
await writeFile("index.json", JSON.stringify(index, null, 2) + "\n");
await writeFile("../index.json", JSON.stringify(index, null, 2) + "\n");
console.log(`Packaged ${manifest.id}@${manifest.version}: ${archive.length} bytes, beta channel only`);
