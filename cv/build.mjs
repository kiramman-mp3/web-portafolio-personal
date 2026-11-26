// Compila los CV en LaTeX (cv-es.tex y cv-en.tex, estilo en johancv.sty) y deja los PDF en public/.
// Uso: node cv/build.mjs   (TECTONIC=ruta/a/tectonic.exe si no está en el PATH)
// Requiere Tectonic (https://tectonic-typesetting.github.io): baja solo los paquetes que usa.
// En Overleaf también compila: sube los .tex, johancv.sty y foto.jpg, y elige XeLaTeX.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../apps/frontend/public');
const tmpDir = join(here, '.tmp');
const tectonic = process.env.TECTONIC ?? 'tectonic';

const builds = [
  ['cv-es.tex', 'cv-johan-rodriguez-es.pdf'],
  ['cv-en.tex', 'cv-johan-rodriguez-en.pdf']
];

mkdirSync(tmpDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

for (const [tex, pdf] of builds) {
  execFileSync(tectonic, ['-X', 'compile', tex, '--outdir', tmpDir], { cwd: here, stdio: 'inherit' });
  copyFileSync(join(tmpDir, tex.replace(/\.tex$/, '.pdf')), join(outDir, pdf));
  console.log('OK', pdf);
}
