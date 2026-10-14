import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(frontendRoot, "src");
const assetsRoot = path.join(sourceRoot, "assets");
const productListPath = path.join(sourceRoot, "commponente", "productList", "productList.jsx");
const productListSource = await readFile(productListPath, "utf8");
const productAssets = new Set(
  [...productListSource.matchAll(/from\s+["']([^"']+\.(?:png|jpe?g))["']/gi)]
    .map((match) => path.resolve(path.dirname(productListPath), match[1]))
);

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? walk(entryPath)
      : /\.(?:png|jpe?g)$/i.test(entry.name)
        ? [entryPath]
        : [];
  }));
  return nested.flat();
};

const imageFiles = await walk(assetsRoot);
let originalBytes = 0;
let optimizedBytes = 0;

for (const inputPath of imageFiles) {
  const outputPath = inputPath.replace(/\.(?:png|jpe?g)$/i, ".webp");
  const maximumDimension = productAssets.has(inputPath) ? 800 : 1920;
  const inputSize = (await stat(inputPath)).size;
  const { width, height, size } = await sharp(inputPath)
    .rotate()
    .resize({
      width: maximumDimension,
      height: maximumDimension,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 80, effort: 5 })
    .toFile(outputPath);

  originalBytes += inputSize;
  optimizedBytes += size;
  console.log(`${path.relative(frontendRoot, inputPath)}: ${width}x${height}, ${(inputSize / 1024).toFixed(0)} KB -> ${(size / 1024).toFixed(0)} KB`);
}

const updateImports = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await updateImports(entryPath);
      continue;
    }

    if (!/\.(?:js|jsx|ts|tsx|css|html)$/i.test(entry.name)) continue;
    const source = await readFile(entryPath, "utf8");
    const updatedSource = source.replace(
      /(\bfrom\s*["']|\bimport\s*["'])(\.\.?\/[^"']+)\.(png|jpe?g)(["'])/gi,
      (match, prefix, importPath, extension, suffix) => {
        const originalPath = path.resolve(path.dirname(entryPath), `${importPath}.${extension}`);
        return imageFiles.includes(originalPath)
          ? `${prefix}${importPath}.webp${suffix}`
          : match;
      }
    );

    if (updatedSource !== source) await writeFile(entryPath, updatedSource);
  }
};

await updateImports(sourceRoot);

const savedBytes = originalBytes - optimizedBytes;
const savedPercent = originalBytes ? (savedBytes / originalBytes) * 100 : 0;
console.log(`Optimized ${imageFiles.length} images: ${(originalBytes / 1024 / 1024).toFixed(1)} MB -> ${(optimizedBytes / 1024 / 1024).toFixed(1)} MB (${savedPercent.toFixed(1)}% smaller).`);