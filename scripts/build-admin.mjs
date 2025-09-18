import { build } from 'esbuild';
import { copyFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const adminDir = path.join(rootDir, 'admin');

const isProduction = process.env.NODE_ENV === 'production';

await build({
  entryPoints: [path.join(adminDir, 'main.jsx')],
  outfile: path.join(adminDir, 'app.js'),
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
  sourcemap: !isProduction,
  minify: isProduction,
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  external: ['react', 'react-dom', 'react-dom/client', 'react-router-dom', 'react-router', 'history']
});

await copyFile(path.join(adminDir, 'styles.css'), path.join(adminDir, 'app.css'));

console.log('Admin Bundle erfolgreich erstellt.');
