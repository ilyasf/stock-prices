const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function copyFile(src, dest) {
    console.log(`Copying ${src} to ${dest}`);
    try {
        fs.copyFileSync(src, dest);
        console.log('Success!');
    } catch (error) {
        console.error(`Failed to copy ${src}:`, error);
    }
}

// Создаем необходимые директории
ensureDirectoryExists('dist');
ensureDirectoryExists('dist/components');
ensureDirectoryExists('dist/pkg');

// Копируем HTML файл
copyFile(
    path.join('src', 'index.html'),
    path.join('dist', 'index.html')
);

// Копируем WASM файлы
const wasmSrcDir = path.join('src-rust', 'pkg');
if (fs.existsSync(wasmSrcDir)) {
    console.log('Found WASM files, copying...');
    
    fs.readdirSync(wasmSrcDir).forEach(file => {
        copyFile(
            path.join(wasmSrcDir, file),
            path.join('dist', 'pkg', file)
        );
    });
}

// Копируем компоненты
const componentsDir = path.join('src', 'components');
if (fs.existsSync(componentsDir)) {
    fs.readdirSync(componentsDir).forEach(file => {
        if (file.endsWith('.ts')) {
            const destFile = file.replace('.ts', '.js');
            copyFile(
                path.join('dist', 'components', destFile),
                path.join('dist', 'components', destFile)
            );
        }
    });
} 