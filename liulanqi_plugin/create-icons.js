import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 图标目录
const ICONS_DIR = path.join(__dirname, 'icons');

// 确保目录存在
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// 创建简单的SVG图标
const createSvgIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#4f46e5" />
    <text x="50%" y="50%" font-family="Arial" font-size="${size/3}" fill="white" text-anchor="middle" dominant-baseline="middle">AI</text>
  </svg>`;
};

// 创建不同尺寸的图标
const sizes = [16, 32, 48, 128];
sizes.forEach(size => {
  const iconPath = path.join(ICONS_DIR, `icon${size}.png`);
  // 由于我们不能直接生成PNG，这里创建SVG文件作为替代
  // 实际应用中，你需要将这些SVG转换为PNG或使用真实的图标
  fs.writeFileSync(path.join(ICONS_DIR, `icon${size}.svg`), createSvgIcon(size));
  console.log(`创建了图标: ${iconPath}`);
});

console.log('图标创建完成！');