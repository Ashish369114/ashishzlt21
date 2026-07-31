
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, 'src');

function findFiles(dir, files = []) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findFiles(fullPath, files);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      files.push(fullPath);
    }
  });
  return files;
}

function processFiles() {
  const allFiles = findFiles(ROOT_DIR);

  allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Add import if we make changes
    const importStatementUtils = "import { formatCurrency } from '../../utils/currencyFormatter';\n";
    const importStatementPages = "import { formatCurrency } from '../utils/currencyFormatter';\n";
    const importStatementRoot = "import { formatCurrency } from './utils/currencyFormatter';\n";

    // Determine relative depth
    let importStr = importStatementUtils;
    if (file.includes('pages\\components') || file.includes('pages/components') || file.includes('pages\\dashboards') || file.includes('pages/dashboards')) {
      importStr = importStatementUtils;
    } else if (file.includes('pages\\') || file.includes('pages/')) {
      importStr = importStatementPages;
    } else if (path.dirname(file) === ROOT_DIR) {
      importStr = importStatementRoot;
    }

    let modified = false;

    // Pattern 1: `₹${Number(something).toLocaleString('en-IN')}` -> `${formatCurrency(something)}`
    const regex1 = /₹\$\{([^}]+)\.toLocaleString\([^)]*\)\}/g;
    if (regex1.test(content)) {
      content = content.replace(regex1, '${formatCurrency($1)}');
      modified = true;
    }

    // Pattern 2: ₹{something.toLocaleString()} -> {formatCurrency(something)}
    const regex2 = /₹\{([^}]+)\.toLocaleString\([^)]*\)\}/g;
    if (regex2.test(content)) {
      content = content.replace(regex2, '{formatCurrency($1)}');
      modified = true;
    }

    // Pattern 3: ₹{something} -> {formatCurrency(something)}
    const regex3 = /₹\{([^}]+)\}/g;
    if (regex3.test(content)) {
      // Exclude if it's already wrapped in formatCurrency
      content = content.replace(regex3, (match, p1) => {
        if (p1.includes('formatCurrency')) return match;
        return `{formatCurrency(${p1})}`;
      });
      modified = true;
    }

    // Pattern 4: `₹${something}` -> `${formatCurrency(something)}`
    const regex4 = /₹\$\{([^}]+)\}/g;
    if (regex4.test(content)) {
      content = content.replace(regex4, (match, p1) => {
        if (p1.includes('formatCurrency')) return match;
        return `\${formatCurrency(${p1})}`;
      });
      modified = true;
    }

    // Pattern 5: const rupee = ... -> const rupee = formatCurrency;
    const regex5 = /const rupee = [^;]+;/g;
    if (regex5.test(content)) {
      content = content.replace(regex5, 'const rupee = formatCurrency;');
      modified = true;
    }

    const regex6 = /const fmt = [^;]+;/g;
    if (regex6.test(content)) {
      content = content.replace(regex6, 'const fmt = formatCurrency;');
      modified = true;
    }

    if (modified && !content.includes('formatCurrency')) {
      // Insert import after existing imports
      const importsEnd = content.lastIndexOf('import ');
      if (importsEnd !== -1) {
        const endOfLine = content.indexOf('\n', importsEnd);
        content = content.slice(0, endOfLine + 1) + importStr + content.slice(endOfLine + 1);
      } else {
        content = importStr + content;
      }
    } else if (modified && content.includes('formatCurrency') && !originalContent.includes('formatCurrency')) {
      const importsEnd = content.lastIndexOf('import ');
      if (importsEnd !== -1) {
        const endOfLine = content.indexOf('\n', importsEnd);
        content = content.slice(0, endOfLine + 1) + importStr + content.slice(endOfLine + 1);
      } else {
        content = importStr + content;
      }
    }

    if (originalContent !== content) {
      fs.writeFileSync(file, content);
      console.log('Modified', file);
    }
  });
}

processFiles();
