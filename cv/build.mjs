// Genera los CV en PDF (español e inglés) desde los datos de abajo, con Chrome sin cabeza.
// Uso: node cv/build.mjs   (CHROME=ruta/a/chrome.exe si Chrome no está en la ruta por defecto)
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../apps/frontend/public');
const tmpDir = join(here, '.tmp');
const chrome = process.env.CHROME ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const contact = {
  emails: ['907johan@gmail.com', 'jrodriguez0612@uta.edu.ec'],
  phone: '+593 96 195 7956',
  linkedin: 'linkedin.com/in/johan-rodriguez-dev',
  github: 'github.com/kiramman-mp3',
  web: 'johandev-portafolio.vercel.app'
};

const skills = {
  frontend: 'Angular, React, Next.js, Vue.js, TypeScript, JavaScript, HTML5, CSS3, Sass, Tailwind CSS',
  backend: 'Node.js, Express, NestJS, Laravel, Prisma, PostgreSQL, MySQL, Supabase, SQLite',
  mobile: 'React Native, Expo',
  devops: 'Git, GitHub, GitHub Actions, Docker, Vercel, Railway, Azure',
  design: 'Figma, Adobe XD, Material UI, Bootstrap'
};

const certs = [
  ['TOEFL', 'ETS', '2023'],
  ['Front-End Web Development', 'IBM SkillsBuild', '2026'],
  ['Back-End Development', 'IBM SkillsBuild', '2026'],
  ['Responsive Web Page Development', 'IBM SkillsBuild', '2026'],
  ['Network Support and Security', 'Cisco', '2024'],
  ['Introduction to IoT', 'Cisco', '2024']
];

const langs = {
  es: {
    lang: 'es',
    file: 'cv-johan-rodriguez-es.pdf',
    title: 'Desarrollador Full Stack · Frontend y UX/UI',
    available: 'Disponible para prácticas y proyectos freelance',
    location: 'Ambato, Tungurahua, Ecuador',
    h: { profile: 'Perfil', education: 'Educación', projects: 'Proyectos', skills: 'Habilidades', certs: 'Certificaciones', langs: 'Idiomas' },
    profile:
      'Estudiante de Ingeniería en Software en la Universidad Técnica de Ambato. Desarrollo sistemas web y móviles de punta a punta, con foco en Frontend y diseño UX/UI. Trabajo con Angular, React, TypeScript y Node.js, y mi portafolio reúne proyectos como una tienda en línea local, un sistema de nómina, gestión deportiva y un agente de IA.',
    education: [
      ['Universidad Técnica de Ambato', 'Ingeniería en Software', 'Ambato, Tungurahua · Graduación prevista 2027'],
      ['Unidad Educativa 17 de Abril', 'Bachillerato General Unificado, Especialidad en Ciencias', 'Tungurahua · Grado: 20 de junio de 2022']
    ],
    projects: [
      ['TunguMarket', 'Marketplace y e-commerce local para PyMEs de Tungurahua: carrito multi-vendedor, inventario en tiempo real, validación de pagos y billetera virtual. Web y app Android.', 'React, React Native (Expo), Node.js, PostgreSQL'],
      ['Rol de Pagos Ecuador', 'Sistema de nómina con reglas de ley parametrizables (Código del Trabajo, LOSEP, LOEP): décimos, horas extras e IESS.', 'Angular, Express, PostgreSQL (Supabase)'],
      ['Gestión deportiva, Liga Cantonal', 'Sistema privado y portal público con clubes, deportistas, campeonatos, árbitros, disciplina y noticias.', 'NestJS, React'],
      ['Agente de atención CTT-FISEI (UTA)', 'Agente de IA que atiende por Telegram y WhatsApp a interesados en cursos, con panel de mando en tiempo real.', 'Node.js, Express, SQLite, Azure'],
      ['Gestión de eventos académicos (FISEI, UTA)', 'Publicación de cursos y congresos con inscripciones con cupos, pagos con comprobante y certificados PDF verificables.', 'Laravel, MySQL'],
      ['Portafolio personal', 'SPA con renderizado en servidor, API propia y formulario de contacto, desplegada en Vercel.', 'Angular, Express, Prisma, PostgreSQL']
    ],
    skillLabels: { frontend: 'Frontend', backend: 'Backend y datos', mobile: 'Móvil', devops: 'Herramientas y despliegue', design: 'Diseño UX/UI' },
    langList: [['Español', 'Nativo'], ['Inglés', 'TOEFL (ETS, 2023) · Suficiencia en inglés, UTA (2024)']]
  },
  en: {
    lang: 'en',
    file: 'cv-johan-rodriguez-en.pdf',
    title: 'Full Stack Developer · Frontend & UX/UI',
    available: 'Available for internships and freelance projects',
    location: 'Ambato, Tungurahua, Ecuador',
    h: { profile: 'Profile', education: 'Education', projects: 'Projects', skills: 'Skills', certs: 'Certifications', langs: 'Languages' },
    profile:
      'Software Engineering student at Universidad Técnica de Ambato. I build web and mobile systems end to end, focused on Frontend and UX/UI design. I work with Angular, React, TypeScript and Node.js, and my portfolio includes projects such as a local online store, a payroll system, sports management and an AI agent.',
    education: [
      ['Universidad Técnica de Ambato', 'B.Eng. in Software Engineering', 'Ambato, Tungurahua · Expected graduation 2027'],
      ['Unidad Educativa 17 de Abril', 'General Unified Baccalaureate, Science track', 'Tungurahua · Graduated June 20, 2022']
    ],
    projects: [
      ['TunguMarket', 'Local marketplace and e-commerce for small businesses in Tungurahua: multi-vendor cart, real-time inventory, payment validation and a virtual wallet. Web and Android app.', 'React, React Native (Expo), Node.js, PostgreSQL'],
      ['Rol de Pagos Ecuador', 'Payroll system with configurable labor-law rules (Labor Code, LOSEP, LOEP): 13th/14th salaries, overtime and IESS.', 'Angular, Express, PostgreSQL (Supabase)'],
      ['Sports management, Cantonal League', 'Private system and public portal with clubs, athletes, championships, referees, discipline and news.', 'NestJS, React'],
      ['CTT-FISEI support agent (UTA)', 'AI agent that answers course inquiries on Telegram and WhatsApp, with a real-time control panel.', 'Node.js, Express, SQLite, Azure'],
      ['Academic events management (FISEI, UTA)', 'Course and conference publishing with seat-limited registration, receipt-based payments and verifiable PDF certificates.', 'Laravel, MySQL'],
      ['Personal portfolio', 'Server-rendered SPA with its own API and contact form, deployed on Vercel.', 'Angular, Express, Prisma, PostgreSQL']
    ],
    skillLabels: { frontend: 'Frontend', backend: 'Backend & data', mobile: 'Mobile', devops: 'Tools & deployment', design: 'UX/UI design' },
    langList: [['Spanish', 'Native'], ['English', 'TOEFL (ETS, 2023) · English proficiency, UTA (2024)']]
  }
};

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function render(t) {
  const link = (url, label = url) => `<a href="https://${url}">${label}</a>`;
  return `<!doctype html>
<html lang="${t.lang}"><head><meta charset="utf-8"><title>Johan Rodríguez — CV</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 13mm 15mm; font: 9.6pt/1.38 'Segoe UI', Arial, sans-serif; color: #1f2328; }
  a { color: inherit; text-decoration: none; }
  header { border-bottom: 2px solid #d8434a; padding-bottom: 8px; margin-bottom: 10px; }
  h1 { margin: 0; font-size: 25pt; line-height: 1.1; letter-spacing: -0.5px; }
  .role { margin: 2px 0 0; font-size: 12pt; font-weight: 600; color: #d8434a; }
  .meta { margin: 6px 0 0; display: flex; flex-wrap: wrap; gap: 2px 14px; font-size: 8.8pt; color: #3d444d; }
  .avail { margin: 4px 0 0; font-size: 8.8pt; color: #3d444d; font-style: italic; }
  h2 { margin: 11px 0 4px; font-size: 9.6pt; text-transform: uppercase; letter-spacing: 1.4px; color: #d8434a; }
  p { margin: 0; }
  .row { display: flex; justify-content: space-between; gap: 12px; }
  .item { margin-bottom: 5px; break-inside: avoid; }
  .item b { font-weight: 600; }
  .muted { color: #57606a; }
  .stack { font-size: 8.8pt; color: #57606a; }
  .skills p { margin-bottom: 2px; }
  .skills b { font-weight: 600; }
  ul { margin: 0; padding: 0; list-style: none; }
  .certs { columns: 2; column-gap: 18px; }
  .certs li { break-inside: avoid; margin-bottom: 2px; }
</style></head><body>
<header>
  <h1>Johan Rodríguez</h1>
  <p class="role">${esc(t.title)}</p>
  <div class="meta">
    <span>${esc(t.location)}</span>
    <span>${contact.phone}</span>
    ${contact.emails.map(e => `<a href="mailto:${e}">${e}</a>`).join('')}
  </div>
  <div class="meta">
    ${link(contact.web)}
    ${link(contact.linkedin)}
    ${link(contact.github)}
  </div>
  <p class="avail">${esc(t.available)}</p>
</header>

<h2>${t.h.profile}</h2>
<p>${esc(t.profile)}</p>

<h2>${t.h.education}</h2>
${t.education.map(([school, degree, note]) => `<div class="item"><div class="row"><b>${esc(school)}</b><span class="muted">${esc(note)}</span></div><p>${esc(degree)}</p></div>`).join('\n')}

<h2>${t.h.projects}</h2>
${t.projects.map(([name, desc, stack]) => `<div class="item"><p><b>${esc(name)}</b> — ${esc(desc)}</p><p class="stack">${esc(stack)}</p></div>`).join('\n')}

<h2>${t.h.skills}</h2>
<div class="skills">
${Object.keys(skills).map(k => `<p><b>${t.skillLabels[k]}:</b> ${skills[k]}</p>`).join('\n')}
</div>

<h2>${t.h.certs}</h2>
<ul class="certs">
${certs.map(([name, issuer, year]) => `<li><b>${name}</b> — ${issuer}, ${year}</li>`).join('\n')}
</ul>

<h2>${t.h.langs}</h2>
${t.langList.map(([l, level]) => `<p><b>${l}:</b> ${esc(level)}</p>`).join('\n')}
</body></html>`;
}

mkdirSync(tmpDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

for (const t of Object.values(langs)) {
  const html = join(tmpDir, `cv-${t.lang}.html`);
  writeFileSync(html, render(t), 'utf8');
  execFileSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${join(outDir, t.file)}`,
    pathToFileURL(html).href
  ], { stdio: 'ignore' });
  console.log('OK', t.file);
}
