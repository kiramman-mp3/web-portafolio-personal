/**
 * Curaduría del portafolio: qué proyectos van en la portada, en qué orden, y el caso de estudio
 * de cada uno. Los datos base (título, imágenes, enlaces, README) siguen viniendo de la API;
 * aquí solo va lo editorial, en español e inglés. La clave es el id del proyecto en la base.
 */

export type Tier = 'destacado' | 'principal' | 'temprano';
export interface L { es: string; en: string }

export interface CaseStudy {
  problem: L;
  solution: L;
  decisions: L[];
  result: L;
}

export interface Curated {
  tier: Tier;
  order: number;
  title?: L;
  summary?: L;
  role?: L;
  context?: L;
  caseStudy?: CaseStudy;
}

const l = (es: string, en: string): L => ({ es, en });

export const CURATION: Record<number, Curated> = {
  // ---------- Destacados: portada, CV y fijados de GitHub ----------
  16: {
    tier: 'destacado', order: 1,
    title: l('Junta de Agua y Riego La Jones', 'La Jones Water & Irrigation Board'),
    summary: l(
      'Sistema web que reemplazó los cuadernos de la junta de riego de La Jones (Patate): turnos de riego, mingas con multas, cobros con comprobante PDF y portal para los socios.',
      'Web system that replaced the paper logs of the La Jones irrigation board (Patate, Ecuador): irrigation shifts, community work with fines, payments with PDF receipts and a member portal.'
    ),
    role: l('Líder técnico · equipo de 10', 'Tech lead · team of 10'),
    context: l('Cliente real · vinculación con la sociedad (UTA), hoy en mantenimiento', 'Real client · university community-service program, now under maintenance'),
    caseStudy: {
      problem: l(
        'La junta llevaba turnos de riego, asistencia a mingas y cobros en cuadernos y actas impresas. Dos socios podían quedar con el mismo turno en una acequia, las multas no tenían forma de verificarse y los comprobantes se perdían.',
        'The board kept irrigation shifts, attendance to community work and payments in notebooks and printed minutes. Two members could get the same shift on a canal, fines could not be verified and receipts got lost.'
      ),
      solution: l(
        'Un sistema web en Angular y Express con MySQL: catastro de socios y lotes, turnos de riego por sector, asistencia a asambleas y mingas con multas automáticas, caja con comprobantes PDF y un portal donde cada socio consulta sus turnos y deudas. Las convocatorias salen por WhatsApp.',
        'An Angular and Express web system on MySQL: member and plot registry, irrigation shifts by sector, attendance to meetings and community work with automatic fines, cash desk with PDF receipts and a portal where each member checks shifts and debts. Meeting notices go out over WhatsApp.'
      ),
      decisions: [
        l('Sesión en cookie HttpOnly en lugar de token en el navegador (ADR 0002).', 'Session in an HttpOnly cookie instead of a token in the browser (ADR 0002).'),
        l('Rol de tesorero con acceso exclusivo a las finanzas (ADR 0003).', 'Treasurer role with exclusive access to finances (ADR 0003).'),
        l('Turnos de riego por sector con un representante, como trabaja la junta en la realidad (ADR 0004).', 'Irrigation shifts by sector with a representative, matching how the board actually works (ADR 0004).'),
        l('Los usuarios con historial se ocultan en vez de borrarse, para no romper cobros ni actas (ADR 0006).', 'Users with history are hidden instead of deleted, so payments and minutes stay intact (ADR 0006).'),
        l('whatsapp-web.js como riesgo aceptado y documentado, por costo cero frente a la API oficial (ADR 0001).', 'whatsapp-web.js as a documented accepted risk, at zero cost versus the official API (ADR 0001).')
      ],
      result: l(
        'La directiva lo aprobó formalmente tras la capacitación (noviembre de 2026). Servirá a 150 usuarios y 4 directivos; lleva 13 versiones publicadas, pruebas unitarias y e2e con Playwright y CI en GitHub Actions. Sigo a cargo del mantenimiento y la capacitación de los socios.',
        'The board formally approved it after training (November 2026). It will serve 150 users and 4 board members; it has 13 published releases, unit and end-to-end tests with Playwright and CI on GitHub Actions. I remain in charge of maintenance and member training.'
      )
    }
  },
  17: {
    tier: 'destacado', order: 2,
    title: l('Ecosistema Karen', 'Karen Ecosystem'),
    summary: l(
      'Inventario por lotes FEFO con alertas de caducidad, reservas con código de retiro y asistente de IA para un supermercado: portal web, app de bodega y app para clientes.',
      'Batch-based FEFO inventory with expiry alerts, pickup-code reservations and an AI assistant for a supermarket: web portal, warehouse app and customer app.'
    ),
    role: l('Líder técnico · equipo de 4', 'Tech lead · team of 4'),
    context: l('Cliente real · freelance pagado, en piloto', 'Real client · paid freelance, in pilot'),
    caseStudy: {
      problem: l(
        'El supermercado perdía producto por caducidad porque no sabía qué lote vencía primero, y los clientes no tenían forma de apartar productos. Lo conozco por dentro: trabajé en caja y bodega del local en 2024.',
        'The supermarket lost stock to expiry because it could not tell which batch expired first, and customers had no way to reserve products. I know it first-hand: I worked as cashier and stock clerk there in 2024.'
      ),
      solution: l(
        'Inventario por lotes con política FEFO (primero en caducar, primero en salir) y semáforo de caducidad; reservas con código de retiro y vencimiento; un portal web en React y dos apps en Expo: una para bodega y perchas, otra para clientes.',
        'Batch inventory with a FEFO policy (first expired, first out) and an expiry traffic light; reservations with pickup code and timeout; a React web portal and two Expo apps: one for the warehouse and shelves, one for customers.'
      ),
      decisions: [
        l('Backend dividido en store-api (tienda, única autoridad del inventario) y portal-api (nube, clientes), para que la tienda opere aunque se caiga internet (ADR-003).', 'Backend split into store-api (store, sole inventory authority) and portal-api (cloud, customers), so the store keeps working if the internet goes down (ADR-003).'),
        l('Reservas con TTL de 30 minutos para no bloquear stock indefinidamente (ADR-002).', 'Reservations with a 30-minute TTL so stock is never blocked indefinitely (ADR-002).'),
        l('Despliegue en mi homelab con Docker y Cloudflare Tunnel, con despliegue continuo desde main.', 'Deployed on my homelab with Docker and Cloudflare Tunnel, with continuous deployment from main.')
      ],
      result: l(
        'En piloto completo en el supermercado desde 2026: inventario, reservas y las dos apps. Tiene pruebas automatizadas y CI.',
        'In a full pilot at the supermarket since 2026: inventory, reservations and both apps. It has automated tests and CI.'
      )
    }
  },
  21: {
    tier: 'destacado', order: 3,
    title: l('Rastreo de Buses UTA', 'UTA Bus Tracking'),
    summary: l(
      'GPS en vivo de los buses universitarios: módulo Odoo 16, servidor Traccar, app de tableta para choferes y portal público de pasajeros.',
      'Live GPS tracking for university buses: Odoo 16 module, Traccar server, driver tablet app and public passenger portal.'
    ),
    role: l('Líder técnico · equipo de 2', 'Tech lead · team of 2'),
    context: l('Proyecto académico, desplegado', 'Academic project, deployed'),
    caseStudy: {
      problem: l(
        'Los estudiantes no sabían dónde estaban los buses de la universidad ni cuándo llegarían, y el personal no tenía registro de recorridos, alertas ni incidencias.',
        'Students did not know where university buses were or when they would arrive, and staff had no record of routes, alerts or incidents.'
      ),
      solution: l(
        'Un módulo propio de Odoo 16 como fuente de verdad, Traccar para recibir el GPS, una app de tableta en Expo para los choferes y un portal público con rutas y quejas.',
        'A custom Odoo 16 module as the source of truth, Traccar to receive GPS, an Expo tablet app for drivers and a public portal with routes and complaints.'
      ),
      decisions: [
        l('Odoo es la fuente de verdad; Traccar solo recibe el GPS y lo reenvía por webhook.', 'Odoo is the source of truth; Traccar only receives GPS and forwards it via webhook.'),
        l('Posiciones duplicadas descartadas con una restricción única por bus y hora GPS, aunque el webhook y el cron traigan la misma a la vez.', 'Duplicate positions discarded with a unique constraint per bus and GPS time, even when the webhook and the cron deliver the same one at once.'),
        l('Notificaciones Web Push al personal para alertas e incidencias.', 'Web Push notifications to staff for alerts and incidents.')
      ],
      result: l(
        'Desplegado en buses.madebyjohan.xyz con 11 versiones publicadas, pruebas y despliegue continuo.',
        'Deployed at buses.madebyjohan.xyz with 11 published releases, tests and continuous deployment.'
      )
    }
  },
  19: {
    tier: 'destacado', order: 4,
    title: l('LMS con asistente de IA', 'AI-assisted LMS'),
    summary: l(
      'Capa de IA sobre Moodle 5.1 que planifica cursos a partir del sílabo (PDF o DOCX) y responde con datos reales del curso.',
      'AI layer on top of Moodle 5.1 that plans courses from the syllabus (PDF or DOCX) and answers with real course data.'
    ),
    role: l('Líder técnico · equipo de 3', 'Tech lead · team of 3'),
    context: l('Producto en validación comercial', 'Product in commercial validation'),
    caseStudy: {
      problem: l(
        'Armar un curso en Moodle a partir del sílabo es lento y repetitivo, y los asistentes de IA genéricos responden sin conocer los datos reales del curso.',
        'Building a Moodle course from the syllabus is slow and repetitive, and generic AI assistants answer without knowing the real course data.'
      ),
      solution: l(
        'Un plugin de Moodle conectado a un backend NestJS que extrae la estructura del sílabo, propone el curso, lo publica en Moodle y responde preguntas con búsqueda semántica sobre los materiales.',
        'A Moodle plugin connected to a NestJS backend that extracts the syllabus structure, proposes the course, publishes it to Moodle and answers questions with semantic search over the materials.'
      ),
      decisions: [
        l('Vectores en PostgreSQL con pgvector en lugar de una base vectorial aparte (ADR-005).', 'Vectors in PostgreSQL with pgvector instead of a separate vector database (ADR-005).'),
        l('Worker documental con cola BullMQ y Redis, y escaneo antivirus con ClamAV (ADR-003, ADR-004).', 'Document worker with a BullMQ queue on Redis, plus ClamAV antivirus scanning (ADR-003, ADR-004).'),
        l('Capa de abstracción del proveedor de LLM y seudonimización de datos personales antes de llamarlo (ADR-009, ADR-010).', 'LLM provider abstraction layer and pseudonymization of personal data before calling it (ADR-009, ADR-010).'),
        l('JWT de vida corta entre el plugin y el backend (ADR-006).', 'Short-lived JWT between the plugin and the backend (ADR-006).')
      ],
      result: l(
        'Desplegado en lms.madebyjohan.xyz con 11 ADRs, pruebas y CI. Lo estamos ofreciendo como producto.',
        'Deployed at lms.madebyjohan.xyz with 11 ADRs, tests and CI. We are offering it as a product.'
      )
    }
  },
  14: {
    tier: 'destacado', order: 5,
    title: l('Rol de Pagos Ecuador', 'Ecuador Payroll'),
    summary: l(
      'Nómina multiempresa con reglas de ley parametrizables: Código del Trabajo, LOSEP, LOEP, IESS, décimos e impuesto a la renta.',
      'Multi-company payroll with configurable labor-law rules: Labor Code, LOSEP, LOEP, social security (IESS), bonuses and income tax.'
    ),
    role: l('Desarrollo completo · individual', 'Full development · solo'),
    context: l('Proyecto académico, desplegado', 'Academic project, deployed'),
    caseStudy: {
      problem: l(
        'Calcular la nómina en Ecuador cambia según el régimen (Código del Trabajo, LOSEP, LOEP), y las tasas y bases cambian cada año. Un error en un rol ya pagado no se puede simplemente editar.',
        'Payroll in Ecuador depends on the labor regime (Labor Code, LOSEP, LOEP), and rates and bases change every year. An error in an already paid payroll cannot just be edited.'
      ),
      solution: l(
        'Un ERP de nómina en Angular y Express sobre PostgreSQL con reglas de ley parametrizables y con vigencia, ciclo del rol (validar, aprobar, publicar, pagar) y explicación de cómo se calculó cada valor.',
        'A payroll ERP in Angular and Express on PostgreSQL with configurable, time-bound labor rules, a payroll cycle (validate, approve, publish, pay) and an explanation of how each value was calculated.'
      ),
      decisions: [
        l('Un rol publicado nunca se modifica: los errores se corrigen con reliquidaciones que guardan solo la diferencia.', 'A published payroll is never modified: errors are fixed with adjustment runs that store only the difference.'),
        l('Las reglas tienen vigencia: un mes se recalcula con las reglas que regían al cierre de ese mes.', 'Rules are time-bound: a month is recalculated with the rules in force when that month closed.'),
        l('Separación de funciones opcional entre quien calcula y quien aprueba.', 'Optional separation of duties between who calculates and who approves.')
      ],
      result: l(
        'Desplegado en nomina.madebyjohan.xyz, con pruebas automatizadas del cálculo.',
        'Deployed at nomina.madebyjohan.xyz, with automated tests for the calculations.'
      )
    }
  },
  25: {
    tier: 'destacado', order: 6,
    title: l('BIFRÖST', 'BIFRÖST'),
    summary: l(
      'Subsistema Android open source para Windows 11 en Rust y Tauri 2: virtualización con QEMU y WHPX, ventanas por app e instalador de APK.',
      'Open-source Android subsystem for Windows 11 in Rust and Tauri 2: QEMU and WHPX virtualization, per-app windows and an APK installer.'
    ),
    role: l('Autor · desarrollo asistido por IA', 'Author · AI-assisted development'),
    context: l('Open source, en desarrollo', 'Open source, in development'),
    caseStudy: {
      problem: l(
        'Microsoft retiró el Subsistema de Windows para Android (WSA) y no quedó una alternativa abierta, sin Google Apps, que instale APK con doble clic y abra cada app en su propia ventana.',
        'Microsoft retired the Windows Subsystem for Android (WSA), leaving no open alternative without Google Apps that installs APKs with a double click and opens each app in its own window.'
      ),
      solution: l(
        'Cuatro componentes en Rust: Midgard (Android x86_64 virtualizado con QEMU y WHPX), Heimdall (daemon que supervisa la VM), Mimir (CLI de diagnóstico y respaldos) y Valhalla (gestor de APK y APKM), con una interfaz Fluent en Tauri 2.',
        'Four Rust components: Midgard (Android x86_64 virtualized with QEMU and WHPX), Heimdall (daemon supervising the VM), Mimir (diagnostics and backup CLI) and Valhalla (APK and APKM manager), with a Fluent UI in Tauri 2.'
      ),
      decisions: [
        l('Lo construí con desarrollo asistido por IA: especificación y ADRs primero, generación, revisión humana de cada cambio, pruebas y CI antes de publicar.', 'Built with AI-assisted development: spec and ADRs first, generation, human review of every change, tests and CI before release.'),
        l('WHPX detrás de una abstracción de VMM en Rust (ADR-0002).', 'WHPX behind a Rust VMM abstraction (ADR-0002).'),
        l('Ventanas por app con VirtualDisplay de scrcpy como etapa intermedia (ADR-0005).', 'Per-app windows via scrcpy VirtualDisplay as an interim stage (ADR-0005).'),
        l('Almacén de confianza Ed25519 local para las imágenes del sistema (ADR-0006).', 'Local Ed25519 trust store for runtime images (ADR-0006).')
      ],
      result: l(
        '7 versiones publicadas, 4 pipelines de CI y 7 ADRs. Sigue en desarrollo y acepta contribuciones.',
        '7 published releases, 4 CI pipelines and 7 ADRs. Still in development and open to contributions.'
      )
    }
  },

  // ---------- Principales: en "Más proyectos" ----------
  18: {
    tier: 'principal', order: 1,
    title: l('Liga Cantonal de Quero', 'Quero Cantonal Sports League'),
    summary: l('Gestión deportiva para la liga: clubes, deportistas, campeonatos, árbitros, expedientes disciplinarios y portal público.', 'Sports management for the league: clubs, athletes, championships, referees, disciplinary records and a public portal.'),
    role: l('Desarrollador Full Stack · voluntario', 'Full Stack developer · volunteer'),
    context: l('Cliente real · en desarrollo, lanzamiento en 2027', 'Real client · in development, launching in 2027')
  },
  7: {
    tier: 'principal', order: 2,
    summary: l('Marketplace local para PyMEs de Tungurahua: carrito multivendedor, billetera virtual, pagos con comprobante y app Android.', 'Local marketplace for small businesses in Tungurahua: multi-vendor cart, virtual wallet, receipt-based payments and an Android app.'),
    role: l('Desarrollador principal · equipo de 3', 'Lead developer · team of 3'),
    context: l('Proyecto académico, desplegado', 'Academic project, deployed')
  },
  13: {
    tier: 'principal', order: 3,
    title: l('Eventos Académicos FISEI', 'FISEI Academic Events'),
    summary: l('Cursos, congresos y webinars con cupos, pagos con comprobante, calificaciones y certificados PDF verificables.', 'Courses, conferences and webinars with seat limits, receipt-based payments, grades and verifiable PDF certificates.'),
    role: l('Desarrollador · equipo de 5, flujo con pull requests', 'Developer · team of 5, pull-request workflow'),
    context: l('Proyecto académico, desplegado', 'Academic project, deployed')
  },
  20: {
    tier: 'principal', order: 4,
    title: l('Promoción Docente UTA', 'UTA Faculty Promotion'),
    summary: l('Trámite de promoción del escalafón docente con dictamen normativo, votación con quórum y resolución PDF con SHA-256.', 'Faculty promotion workflow with regulatory assessment, quorum voting and a PDF resolution signed with SHA-256.'),
    context: l('Proyecto académico · ASP.NET Core y React', 'Academic project · ASP.NET Core and React')
  },
  15: {
    tier: 'principal', order: 5,
    title: l('Asistente de Cursos CTT-FISEI', 'CTT-FISEI Course Assistant'),
    summary: l('Agente con IA que atiende consultas de cursos por Telegram y WhatsApp, con panel en tiempo real y traspaso a una persona.', 'AI agent that answers course inquiries on Telegram and WhatsApp, with a real-time panel and human handover.'),
    context: l('Proyecto académico', 'Academic project')
  },
  24: {
    tier: 'principal', order: 6,
    title: l('Agente de Proyectos', 'Project Agent'),
    summary: l('Sistema multiagente (ejecutor, revisor y aprobador) que vigila Trello y GitHub, detecta retrasos y revisa código con aprobación humana desde una app.', 'Multi-agent system (executor, reviewer and approver) that watches Trello and GitHub, detects delays and reviews code with human approval from an app.'),
    context: l('Proyecto académico · Python y FastAPI', 'Academic project · Python and FastAPI')
  },
  23: {
    tier: 'principal', order: 7,
    title: l('Portal REASONS UTA', 'REASONS UTA Portal'),
    summary: l('Portal institucional y CMS autoadministrable para un grupo de investigación: investigadores, proyectos y publicaciones.', 'Institutional website and self-managed CMS for a research group: researchers, projects and publications.'),
    context: l('Proyecto académico, desplegado', 'Academic project, deployed')
  },
  27: {
    tier: 'principal', order: 8,
    title: l('Este portafolio', 'This portfolio'),
    summary: l('Angular con SSR, API en Express con Prisma y PostgreSQL, panel de administración y despliegue continuo en mi homelab.', 'Angular with SSR, Express API with Prisma and PostgreSQL, admin panel and continuous deployment on my homelab.')
  },

  // ---------- Por mejorar: proyectos pequeños o antiguos, pendientes de refactorización ----------
  22: { tier: 'temprano', order: 1, summary: l('Paz y salvo y liquidación laboral offline-first con IndexedDB.', 'Offline-first employee clearance and severance calculator with IndexedDB.') },
  10: { tier: 'temprano', order: 2, summary: l('App de seguridad personal camuflada como calculadora, con alertas silenciosas.', 'Personal safety app disguised as a calculator, with silent alerts.') },
  12: { tier: 'temprano', order: 3, title: l('La Huelga de los Panaderos (1888)', 'The 1888 Bakers\' Strike'), summary: l('Scrollytelling histórico en HTML, CSS y JavaScript.', 'Historical scrollytelling in HTML, CSS and JavaScript.') },
  8: { tier: 'temprano', order: 4, summary: l('Enciclopedia web de Minecraft: bloques, mobs, crafteos y pociones.', 'Minecraft web encyclopedia: blocks, mobs, crafting and potions.') },
  26: { tier: 'temprano', order: 5, title: l('Alquiler de Vehículos', 'Vehicle Rental'), summary: l('Reservas de vehículos en PHP y MySQL con paneles por rol.', 'Vehicle bookings in PHP and MySQL with role-based dashboards.') }
};

export function curationOf(id: number | string): Curated | undefined {
  return CURATION[Number(id)];
}

/** Ordena por nivel y orden editorial; lo que no está curado va al final como "principal". */
export function byTier<T extends { id: number | string }>(items: T[], tier: Tier): T[] {
  return items
    .filter(p => (curationOf(p.id)?.tier ?? 'principal') === tier)
    .sort((a, b) => (curationOf(a.id)?.order ?? 99) - (curationOf(b.id)?.order ?? 99));
}

/** Copia del proyecto con el título y la descripción corta curados en el idioma pedido. */
export function localize<T extends { id: number | string; title: string; shortDescription: string }>(project: T, lang: 'es' | 'en'): T {
  const c = curationOf(project.id);
  return {
    ...project,
    title: c?.title?.[lang] ?? project.title,
    shortDescription: c?.summary?.[lang] ?? project.shortDescription
  };
}
