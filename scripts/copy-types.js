const fs = require("fs");
const path = require("path");

const sourceDir = path.resolve(__dirname, '..', "dist");
const targetDir = path.resolve(__dirname, '..', "build");
const entryFile = path.resolve(sourceDir, "index.d.ts");

const copiedFiles = new Set();

function copyFile(filePath) {
  if (copiedFiles.has(filePath)) return;
  copiedFiles.add(filePath);

  const relativePath = path.relative(sourceDir, filePath);
  const destPath = path.resolve(targetDir, relativePath);

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(filePath, destPath);
}

function getImports(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const importRegex = /import\s+.*?from\s+["'](.+?)["']/g;
  const imports = [];

  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    let fullPath = path.resolve(path.dirname(filePath), `${importPath}.d.ts`);

    if (!fs.existsSync(fullPath)) {
      const indexPath = path.resolve(path.dirname(filePath), importPath, "index.d.ts");
      if (fs.existsSync(indexPath)) {
        fullPath = indexPath;
      }
    }

    if (fs.existsSync(fullPath)) {
      imports.push(fullPath);
    }
  }

  return imports;
}

function processFile(filePath) {
  copyFile(filePath);
  const imports = getImports(filePath);
  imports.forEach(processFile);
}

processFile(entryFile);
console.log('Declaration files copied');
