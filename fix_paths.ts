import fs from 'fs';
import path from 'path';

function fixPaths(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.includes('\\')) {
      const oldPath = path.join(dir, file);
      // Construct the new path by replacing \ with /
      const newRelativePath = file.replace(/\\/g, '/');
      const newPath = path.join(dir, newRelativePath);
      
      // Ensure the directory exists
      const newDir = path.dirname(newPath);
      if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir, { recursive: true });
      }
      
      // Move the file
      fs.renameSync(oldPath, newPath);
      console.log(`Moved ${file} to ${newRelativePath}`);
    } else {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
         // skip .astro, src, etc. actually we just want to fix root since they are in root
      }
    }
  }
}

fixPaths(process.cwd());
