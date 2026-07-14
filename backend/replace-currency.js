const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, 'controllers');
const SERVICES_DIR = path.join(__dirname, 'services');

function findFiles(dir, files = []) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findFiles(fullPath, files);
    } else if (fullPath.endsWith('.js')) {
      files.push(fullPath);
    }
  });
  return files;
}

function processFiles() {
  const allFiles = [...findFiles(ROOT_DIR), ...findFiles(SERVICES_DIR)];
  
  allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    
    // Add import if we make changes
    const importStatement = "const { formatCurrency } = require('../utils/currencyFormatter');\n";
    
    let modified = false;

    const regex4 = /₹\$\{([^}]+)\}/g;
    if (regex4.test(content)) {
      content = content.replace(regex4, (match, p1) => {
        if (p1.includes('formatCurrency')) return match;
        return `\${formatCurrency(${p1})}`;
      });
      modified = true;
    }

    if (modified && !content.includes('formatCurrency')) {
       // Insert import after existing imports
       const importsEnd = content.lastIndexOf('require(');
       if (importsEnd !== -1) {
         const endOfLine = content.indexOf('\n', importsEnd);
         content = content.slice(0, endOfLine + 1) + importStatement + content.slice(endOfLine + 1);
       } else {
         content = importStatement + content;
       }
    } else if (modified && content.includes('formatCurrency') && !originalContent.includes('formatCurrency')) {
       const importsEnd = content.lastIndexOf('require(');
       if (importsEnd !== -1) {
         const endOfLine = content.indexOf('\n', importsEnd);
         content = content.slice(0, endOfLine + 1) + importStatement + content.slice(endOfLine + 1);
       } else {
         content = importStatement + content;
       }
    }
    
    if (originalContent !== content) {
      fs.writeFileSync(file, content);
      console.log('Modified', file);
    }
  });
}

processFiles();
