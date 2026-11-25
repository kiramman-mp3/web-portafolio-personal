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
  email: '907johan@gmail.com',
  phone: '+593 96 195 7956',
  web: 'madebyjohan.xyz',
  linkedin: 'linkedin.com/in/johan-rodriguez-dev',
  github: 'github.com/kiramman-mp3'
};

const langs = {
  es: {
    lang: 'es',
    file: 'cv-johan-rodriguez-es.pdf',
    title: 'Desarrollador Full Stack · TypeScript (Angular, React, Node.js)',
    location: 'Ambato, Ecuador · Remoto o híbrido',
    h: { profile: 'Perfil', experience: 'Experiencia', projects: 'Proyectos', skills: 'Habilidades', education: 'Educación', certs: 'Certificaciones e idiomas' },
    profile:
      'Desarrollador Full Stack con TypeScript. Construyo y mantengo sistemas que usan organizaciones reales de Tungurahua: una junta de riego, un supermercado y una liga deportiva. Trabajo con pruebas automatizadas, integración continua y despliegue en servidor propio. Busco un puesto Full Stack o Frontend, remoto o híbrido.',
    experience: [
      {
        role: 'Desarrollador Full Stack',
        org: 'Junta de Agua y Riego La Jones, Patate',
        note: 'Vinculación con la sociedad (UTA), luego mantenimiento y capacitación',
        dates: 'ago 2026 – actualidad',
        link: 'juntalajones.com',
        bullets: [
          'Líder técnico de un equipo de 10 en un sistema web que reemplazó los cuadernos de turnos de riego, el control de mingas con multas y los cobros con comprobante PDF.',
          'Aprobado por la directiva tras la capacitación (nov 2026): 150 usuarios y 4 directivos. 13 versiones publicadas.',
          'Pruebas unitarias y e2e con Playwright, CI en GitHub Actions y convocatorias automáticas por WhatsApp.'
        ],
        stack: 'Angular, TypeScript, Express, MySQL, Playwright, Docker'
      },
      {
        role: 'Desarrollador Full Stack freelance',
        org: 'Supermercado Karen',
        note: 'Sistema en piloto',
        dates: 'sep 2026 – actualidad',
        link: 'karen.madebyjohan.xyz',
        bullets: [
          'Líder técnico (equipo de 4) de un inventario por lotes FEFO con alertas de caducidad, reservas con código de retiro y un asistente de IA: portal web, app de bodega y app para clientes.',
          'Desplegado en mi servidor con Docker y Cloudflare Tunnel; hoy en piloto completo en el local. Conozco el proceso por dentro: trabajé en caja y bodega del supermercado (2024).'
        ],
        stack: 'React, React Native (Expo), Express, PostgreSQL, Docker'
      },
      {
        role: 'Desarrollador Full Stack (voluntario)',
        org: 'Liga Cantonal de Quero',
        note: 'En desarrollo, lanzamiento previsto en 2027',
        dates: 'oct 2026 – actualidad',
        bullets: [
          'Plataforma de gestión deportiva: clubes, deportistas, campeonatos, árbitros, expedientes disciplinarios y portal público. Pruebas y CI desde el inicio.'
        ],
        stack: 'NestJS, Prisma, PostgreSQL, React'
      }
    ],
    projects: [
      ['Rastreo de Buses UTA', 'buses.madebyjohan.xyz', 'Líder técnico (equipo de 2). GPS en vivo de los buses universitarios: módulo Odoo 16, servidor Traccar, app de tableta para choferes y portal público.', 'Python, Odoo, PostgreSQL, React Native'],
      ['LMS con asistente de IA', 'lms.madebyjohan.xyz', 'Líder técnico (equipo de 3). Capa de IA sobre Moodle 5.1 que planifica cursos a partir del sílabo (PDF/DOCX) y responde con datos reales del curso. Producto en validación comercial.', 'NestJS, TypeScript, PostgreSQL + pgvector, Redis'],
      ['Rol de Pagos Ecuador', 'nomina.madebyjohan.xyz', 'Nómina multiempresa con reglas de ley parametrizables: Código del Trabajo, LOSEP, LOEP, IESS, décimos e impuesto a la renta.', 'Angular, Express, PostgreSQL, Vitest'],
      ['BIFRÖST', 'github.com/kiramman-mp3/bifrost', 'Subsistema Android open source para Windows 11 (QEMU + WHPX). Construido con desarrollo asistido por IA: especificación, revisión, tests, 4 pipelines de CI y 7 versiones.', 'Rust, Tauri 2']
    ],
    skills: [
      ['Lenguajes', 'TypeScript, JavaScript, Python, SQL'],
      ['Frontend', 'Angular, React, React Native (Expo), Tailwind CSS, Sass'],
      ['Backend y datos', 'Node.js (Express, NestJS), PostgreSQL, MySQL, Prisma'],
      ['Calidad y DevOps', 'Playwright, Vitest, GitHub Actions, Docker, Linux, Caddy, Cloudflare Tunnel'],
      ['Infraestructura', 'Homelab propio: ~40 contenedores y 12 aplicaciones públicas en *.madebyjohan.xyz'],
      ['También', 'Laravel, ASP.NET Core, Odoo, Rust · desarrollo asistido por IA con revisión y pruebas']
    ],
    education: ['Universidad Técnica de Ambato', 'Ingeniería de Software', '2022 – 2027 (prevista)'],
    certs: [
      'Full Stack Open — University of Helsinki, 2025 (5 ECTS)',
      'IBM SkillsBuild, 2026 — Front-End, Back-End, Web Application Testing and Deployment'
    ],
    langList: 'Español nativo · Inglés C1- (Suficiencia en inglés, UTA, 2024)'
  },
  en: {
    lang: 'en',
    file: 'cv-johan-rodriguez-en.pdf',
    title: 'Full Stack Developer · TypeScript (Angular, React, Node.js)',
    location: 'Ambato, Ecuador · Remote or hybrid',
    h: { profile: 'Profile', experience: 'Experience', projects: 'Projects', skills: 'Skills', education: 'Education', certs: 'Certifications & languages' },
    profile:
      'Full Stack developer working in TypeScript. I build and maintain systems used by real organizations in Tungurahua, Ecuador: an irrigation board, a supermarket and a sports league. I work with automated tests, continuous integration and deployment on my own server. Looking for a Full Stack or Frontend role, remote or hybrid.',
    experience: [
      {
        role: 'Full Stack Developer',
        org: 'La Jones Water & Irrigation Board, Patate',
        note: 'University community-service program (UTA), then maintenance and training',
        dates: 'Aug 2026 – present',
        link: 'juntalajones.com',
        bullets: [
          'Tech lead of a 10-person team building a web system that replaced paper logs for irrigation shifts, community-work attendance with fines, and payments with PDF receipts.',
          'Approved by the board after training (Nov 2026): 150 users and 4 board members. 13 releases published.',
          'Unit and end-to-end tests with Playwright, CI on GitHub Actions and automated WhatsApp meeting notices.'
        ],
        stack: 'Angular, TypeScript, Express, MySQL, Playwright, Docker'
      },
      {
        role: 'Freelance Full Stack Developer',
        org: 'Supermercado Karen',
        note: 'System in pilot',
        dates: 'Sep 2026 – present',
        link: 'karen.madebyjohan.xyz',
        bullets: [
          'Tech lead (team of 4) of a batch-based FEFO inventory with expiry alerts, pickup-code reservations and an AI assistant: web portal, warehouse app and customer app.',
          'Deployed on my own server with Docker and Cloudflare Tunnel; now in a full pilot at the store. I know the process first-hand: I worked as cashier and stock clerk there (2024).'
        ],
        stack: 'React, React Native (Expo), Express, PostgreSQL, Docker'
      },
      {
        role: 'Full Stack Developer (volunteer)',
        org: 'Quero Cantonal Sports League',
        note: 'In development, launch planned for 2027',
        dates: 'Oct 2026 – present',
        bullets: [
          'Sports management platform: clubs, athletes, championships, referees, disciplinary records and a public portal. Tests and CI from day one.'
        ],
        stack: 'NestJS, Prisma, PostgreSQL, React'
      }
    ],
    projects: [
      ['UTA Bus Tracking', 'buses.madebyjohan.xyz', 'Tech lead (team of 2). Live GPS tracking for university buses: Odoo 16 module, Traccar server, driver tablet app and public portal.', 'Python, Odoo, PostgreSQL, React Native'],
      ['AI-assisted LMS', 'lms.madebyjohan.xyz', 'Tech lead (team of 3). AI layer on top of Moodle 5.1 that plans courses from the syllabus (PDF/DOCX) and answers with real course data. Product in commercial validation.', 'NestJS, TypeScript, PostgreSQL + pgvector, Redis'],
      ['Ecuador Payroll', 'nomina.madebyjohan.xyz', 'Multi-company payroll with configurable labor-law rules: Labor Code, LOSEP, LOEP, social security (IESS), bonuses and income tax.', 'Angular, Express, PostgreSQL, Vitest'],
      ['BIFRÖST', 'github.com/kiramman-mp3/bifrost', 'Open-source Android subsystem for Windows 11 (QEMU + WHPX). Built with AI-assisted development: specs, review, tests, 4 CI pipelines and 7 releases.', 'Rust, Tauri 2']
    ],
    skills: [
      ['Languages', 'TypeScript, JavaScript, Python, SQL'],
      ['Frontend', 'Angular, React, React Native (Expo), Tailwind CSS, Sass'],
      ['Backend & data', 'Node.js (Express, NestJS), PostgreSQL, MySQL, Prisma'],
      ['Quality & DevOps', 'Playwright, Vitest, GitHub Actions, Docker, Linux, Caddy, Cloudflare Tunnel'],
      ['Infrastructure', 'Own homelab: ~40 containers and 12 public apps on *.madebyjohan.xyz'],
      ['Also', 'Laravel, ASP.NET Core, Odoo, Rust · AI-assisted development with review and testing']
    ],
    education: ['Universidad Técnica de Ambato', 'B.Eng. in Software Engineering', '2022 – 2027 (expected)'],
    certs: [
      'Full Stack Open — University of Helsinki, 2025 (5 ECTS)',
      'IBM SkillsBuild, 2026 — Front-End, Back-End, Web Application Testing and Deployment'
    ],
    langList: 'Spanish (native) · English C1- (English proficiency, UTA, 2024)'
  }
};

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const link = (url, label = url) => `<a href="https://${url}">${esc(label)}</a>`;

function render(t) {
  return `<!doctype html>
<html lang="${t.lang}"><head><meta charset="utf-8"><title>Johan Rodríguez — CV</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 10mm 14mm; font: 9.2pt/1.33 'Segoe UI', Arial, sans-serif; color: #1f2328; }
  a { color: inherit; text-decoration: none; }
  header { border-bottom: 2px solid #d8434a; padding-bottom: 7px; margin-bottom: 6px; }
  h1 { margin: 0; font-size: 24pt; line-height: 1.1; letter-spacing: -0.5px; }
  .role { margin: 2px 0 0; font-size: 11.5pt; font-weight: 600; color: #d8434a; }
  .meta { margin: 5px 0 0; display: flex; flex-wrap: wrap; gap: 2px 14px; font-size: 8.7pt; color: #3d444d; }
  h2 { margin: 8px 0 3px; font-size: 9.3pt; text-transform: uppercase; letter-spacing: 1.4px; color: #d8434a; }
  p { margin: 0; }
  .row { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
  .item { margin-bottom: 6px; break-inside: avoid; }
  b { font-weight: 600; }
  .muted { color: #57606a; }
  .small { font-size: 8.6pt; }
  .stack { font-size: 8.6pt; color: #57606a; }
  ul.bul { margin: 2px 0 1px; padding-left: 14px; }
  ul.bul li { margin-bottom: 1px; }
  .skills p { margin-bottom: 1px; }
  ul.plain { margin: 0; padding: 0; list-style: none; }
</style></head><body>
<header>
  <h1>Johan Rodríguez</h1>
  <p class="role">${esc(t.title)}</p>
  <div class="meta">
    <span>${esc(t.location)}</span>
    <span>${contact.phone}</span>
    <a href="mailto:${contact.email}">${contact.email}</a>
  </div>
  <div class="meta">
    ${link(contact.web)}
    ${link(contact.linkedin)}
    ${link(contact.github)}
  </div>
</header>

<h2>${t.h.profile}</h2>
<p>${esc(t.profile)}</p>

<h2>${t.h.experience}</h2>
${t.experience.map(e => `<div class="item">
  <div class="row"><p><b>${esc(e.role)}</b> · ${esc(e.org)}</p><span class="muted small">${esc(e.dates)}</span></div>
  <div class="row"><p class="muted small">${esc(e.note)}</p>${e.link ? `<span class="muted small">${link(e.link)}</span>` : ''}</div>
  <ul class="bul">${e.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
  <p class="stack">${esc(e.stack)}</p>
</div>`).join('\n')}

<h2>${t.h.projects}</h2>
${t.projects.map(([name, url, desc, stack]) => `<div class="item">
  <div class="row"><p><b>${esc(name)}</b> — ${esc(desc)}</p></div>
  <p class="stack">${esc(stack)} · ${link(url)}</p>
</div>`).join('\n')}

<h2>${t.h.skills}</h2>
<div class="skills">
${t.skills.map(([k, v]) => `<p><b>${esc(k)}:</b> ${esc(v)}</p>`).join('\n')}
</div>

<h2>${t.h.education}</h2>
<div class="row"><p><b>${esc(t.education[0])}</b> · ${esc(t.education[1])}</p><span class="muted small">${esc(t.education[2])}</span></div>

<h2>${t.h.certs}</h2>
<ul class="plain">
${t.certs.map(c => `<li>${esc(c)}</li>`).join('\n')}
<li>${esc(t.langList)}</li>
</ul>
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
