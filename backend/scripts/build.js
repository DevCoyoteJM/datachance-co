const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('1. Compiling TypeScript with nest build...');
execSync('npx nest build', { cwd: rootDir, stdio: 'inherit' });

console.log('2. Bundling with esbuild...');
execSync(
  'npx esbuild dist/main.js --bundle --platform=node --target=node20 --outfile=dist/bundle.js --external:@nestjs/microservices --external:@nestjs/websockets',
  { cwd: rootDir, stdio: 'inherit' }
);

console.log('3. Mirroring bundle to dist/main.js and root main.js...');
fs.copyFileSync(
  path.join(rootDir, 'dist', 'bundle.js'),
  path.join(rootDir, 'dist', 'main.js')
);

console.log('4. Copying Prisma query engine binaries...');
const prismaClientDir = path.join(rootDir, 'node_modules', '.prisma', 'client');
if (fs.existsSync(prismaClientDir)) {
  for (const f of fs.readdirSync(prismaClientDir)) {
    if (f.endsWith('.node')) {
      fs.copyFileSync(path.join(prismaClientDir, f), path.join(rootDir, 'dist', f));
    }
  }
}

console.log('Build completed successfully!');
