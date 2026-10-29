const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'src');

function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      checkDir(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const importRegex = /import\s+.*?from\s+['"`](.*?)['"`]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('.')) {
          const resolvedPath = path.resolve(dir, importPath);
          let finalPath = resolvedPath;
          if (!path.extname(resolvedPath)) {
            if (fs.existsSync(resolvedPath + '.jsx')) {
              finalPath += '.jsx';
            } else if (fs.existsSync(resolvedPath + '.js')) {
              finalPath += '.js';
            }
          }
          if (fs.existsSync(finalPath)) {
            const dirName = path.dirname(finalPath);
            const baseName = path.basename(finalPath);
            const actualFiles = fs.readdirSync(dirName);
            if (!actualFiles.includes(baseName)) {
              console.log('CASE SENSITIVITY ERROR in ' + fullPath + ': import ' + importPath + ' resolves to ' + baseName + ' but actual file is ' + actualFiles.find(f => f.toLowerCase() === baseName.toLowerCase()));
            }
          }
        }
      }
    }
  }
}
checkDir(srcDir);
console.log('Case check done.');
