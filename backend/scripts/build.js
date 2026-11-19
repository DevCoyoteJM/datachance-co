const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('1. Cleaning dist directory and tsbuildinfo...');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
const tsBuildInfo = path.join(rootDir, 'tsconfig.tsbuildinfo');
if (fs.existsSync(tsBuildInfo)) {
  fs.unlinkSync(tsBuildInfo);
}

console.log('2. Compiling TypeScript with nest build...');
execSync('npx nest build', { cwd: rootDir, stdio: 'inherit' });

console.log('3. Bundling with esbuild...');
execSync(
  'npx esbuild dist/main.js --bundle --platform=node --target=node20 --outfile=dist/bundle.js --external:@nestjs/microservices --external:@nestjs/websockets',
  { cwd: rootDir, stdio: 'inherit' }
);

console.log('4. Mirroring bundle to dist/main.js...');
fs.copyFileSync(
  path.join(distDir, 'bundle.js'),
  path.join(distDir, 'main.js')
);

console.log('5. Copying Prisma query engine binaries...');
const prismaClientDir = path.join(rootDir, 'node_modules', '.prisma', 'client');
if (fs.existsSync(prismaClientDir)) {
  for (const f of fs.readdirSync(prismaClientDir)) {
    if (f.endsWith('.node')) {
      fs.copyFileSync(path.join(prismaClientDir, f), path.join(distDir, f));
    }
  }
}

console.log('Build completed successfully!');
