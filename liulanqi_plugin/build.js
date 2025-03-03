import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 构建目录
const DIST_DIR = path.join(__dirname, 'dist');

// 确保目录存在
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// 运行Vite构建
console.log('正在构建项目...');
execSync('npx vite build', { stdio: 'inherit' });

// 复制manifest.json到dist目录
console.log('复制manifest.json...');
fs.copyFileSync(
  path.join(__dirname, 'manifest.json'),
  path.join(DIST_DIR, 'manifest.json')
);

// 复制图标到dist目录
console.log('复制图标文件...');
const iconsDir = path.join(__dirname, 'icons');
const distIconsDir = path.join(DIST_DIR, 'icons');

if (!fs.existsSync(distIconsDir)) {
  fs.mkdirSync(distIconsDir, { recursive: true });
}

fs.readdirSync(iconsDir).forEach(file => {
  fs.copyFileSync(
    path.join(iconsDir, file),
    path.join(distIconsDir, file)
  );
});

console.log('构建完成！');