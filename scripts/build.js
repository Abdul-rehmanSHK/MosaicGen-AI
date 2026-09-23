const { execSync } = require('child_process');

console.log('> Running: prisma generate');
try {
  const out = execSync('npx prisma generate', {
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
  });
  console.log(out);
} catch (e) {
  const allOutput = (e.stdout || '') + (e.stderr || '') + (e.message || '');
  if (process.platform === 'win32' && allOutput.includes('EPERM')) {
    console.warn('⚠️  Prisma query engine is locked by a running dev server process.');
    console.warn('   Continuing with existing generated Prisma client...');
  } else {
    console.error(allOutput);
    process.exit(e.status || 1);
  }
}

console.log('> Running: next build');
try {
  execSync('npx next build', { stdio: 'inherit' });
} catch (e) {
  process.exit(e.status || 1);
}
