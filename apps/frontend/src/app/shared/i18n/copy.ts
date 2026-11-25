/**
 * Textos de la interfaz en español e inglés. El contenido editorial de los proyectos está en
 * shared/content/curation.ts. Para cambiar un texto, cámbialo en ambos idiomas.
 */
export type Lang = 'es' | 'en';

export interface ExperienceEntry {
  role: string;
  org: string;
  kind: string;
  dates: string;
  link?: string;
  projectId?: number;
  bullets: string[];
  stack: string[];
}

export interface ServiceCopy {
  title: string;
  description: string;
  extendedInfo: string[];
  imageAlt: string;
}

const es = {
  meta: {
    home: { title: 'Johan Rodríguez | Desarrollador Full Stack', description: 'Desarrollador Full Stack con TypeScript (Angular, React, Node.js) en Ecuador. Sistemas en uso por una junta de riego, un supermercado y una liga deportiva.' },
    projects: { title: 'Proyectos | Johan Rodríguez', description: 'Proyectos de Johan Rodríguez: sistemas con clientes reales, desplegados y con pruebas.' },
    services: { title: 'Servicios | Johan Rodríguez', description: 'Sistemas web a medida, tiendas en línea y apps móviles para negocios y organizaciones.' },
    education: { title: 'Educación | Johan Rodríguez', description: 'Formación y certificaciones de Johan Rodríguez.' },
    contact: { title: 'Contacto | Johan Rodríguez', description: 'Escríbeme por una oportunidad laboral o un proyecto.' },
    projectSuffix: ' | Proyecto de Johan Rodríguez'
  },
  nav: { home: 'Inicio', experience: 'Experiencia', projects: 'Proyectos', services: 'Servicios', education: 'Educación', contact: 'Contacto', cv: 'Descargar CV', menu: 'Abrir menú', main: 'Principal', switchLang: 'English', switchLangLabel: 'View this page in English' },
  cvUrl: '/cv-johan-rodriguez-es.pdf',
  intro: { line1: 'Hay un nuevo desarrollador', line2: 'en la ciudad', subtitle: 'Johan Rodríguez, desarrollador Full Stack', skip: 'Saltar intro' },
  hero: {
    word: 'Full Stack',
    role: 'Desarrollador Full Stack · TypeScript',
    lead: 'Construyo y mantengo sistemas que usan organizaciones reales de Tungurahua: una junta de riego, un supermercado y una liga deportiva. Angular, React, Node.js, pruebas y despliegue en mi propio servidor.',
    availability: 'Busco puesto Full Stack o Frontend · remoto o híbrido',
    write: 'Escríbeme',
    cv: 'Descargar CV',
    projects: 'Ver proyectos',
    terminalLabel: 'Actividad reciente en GitHub',
    noPush: 'Sin pushes públicos recientes',
    githubFail: 'No se pudo leer GitHub ahora mismo',
    reading: 'leyendo api.github.com'
  },
  chapters: { hero: 'Inicio', about: 'Sobre mí', experience: 'Experiencia', projects: 'Proyectos', scroll: 'Desliza para recorrer la historia', rail: 'Capítulos del recorrido', goTo: 'Ir a' },
  about: {
    title: 'Sobre mí',
    paragraphs: [
      'Soy desarrollador Full Stack y estudio Ingeniería de Software en la Universidad Técnica de Ambato. Trabajo con TypeScript de punta a punta: interfaz en Angular o React, API en Node.js, base de datos, pruebas y despliegue.',
      'Lo que más me interesa es software que la gente usa de verdad. Por eso mis proyectos principales tienen cliente: la Junta de Agua La Jones, el Supermercado Karen y la Liga Cantonal de Quero. Los despliego en un homelab propio con Docker y Cloudflare Tunnel, con despliegue continuo desde GitHub.',
      'Uso IA en mi forma de trabajar, con especificación, revisión de cada cambio, pruebas y CI. Busco un puesto Full Stack o Frontend, remoto o híbrido.'
    ],
    facts: [
      ['Ubicación', 'Ambato, Ecuador'],
      ['Estudios', 'Ingeniería de Software, UTA (2027)'],
      ['Frontend', 'Angular, React, TypeScript'],
      ['Backend', 'Node.js, Express, NestJS'],
      ['Datos', 'PostgreSQL, MySQL, Prisma'],
      ['Infraestructura', 'Docker, Linux, Cloudflare Tunnel']
    ] as [string, string][]
  },
  experience: {
    kicker: '03 · Experiencia',
    title: 'Experiencia',
    lead: 'Sistemas con clientes reales que siguen en uso o en piloto.',
    seeCase: 'Ver caso de estudio',
    entries: [
      {
        role: 'Desarrollador Full Stack', org: 'Junta de Agua y Riego La Jones, Patate', kind: 'Vinculación con la sociedad (UTA) → mantenimiento y capacitación', dates: 'ago 2026 – actualidad', link: 'https://juntalajones.com/', projectId: 16,
        bullets: [
          'Líder técnico de un equipo de 10 en un sistema web que reemplazó los cuadernos de turnos de riego, mingas con multas y cobros con comprobante PDF.',
          'Aprobado por la directiva tras la capacitación (nov 2026): 150 usuarios y 4 directivos. 13 versiones publicadas.',
          'Pruebas unitarias y e2e con Playwright, CI en GitHub Actions y convocatorias por WhatsApp.'
        ],
        stack: ['Angular', 'TypeScript', 'Express', 'MySQL', 'Playwright']
      },
      {
        role: 'Desarrollador Full Stack freelance', org: 'Supermercado Karen', kind: 'Freelance · sistema en piloto', dates: 'sep 2026 – actualidad', link: 'https://karen.madebyjohan.xyz/', projectId: 17,
        bullets: [
          'Líder técnico (equipo de 4) de un inventario por lotes FEFO con alertas de caducidad, reservas con código de retiro y asistente de IA.',
          'Portal web, app de bodega y app para clientes; desplegado en mi homelab y en piloto completo en el local.',
          'Conozco el proceso por dentro: trabajé en caja y bodega del supermercado los fines de semana en 2024.'
        ],
        stack: ['React', 'React Native', 'Express', 'PostgreSQL', 'Docker']
      },
      {
        role: 'Desarrollador Full Stack (voluntario)', org: 'Liga Cantonal de Quero', kind: 'Voluntariado · lanzamiento previsto en 2027', dates: 'oct 2026 – actualidad', projectId: 18,
        bullets: [
          'Plataforma de gestión deportiva: clubes, deportistas, campeonatos, árbitros, expedientes disciplinarios y portal público.',
          'Pruebas automatizadas y CI desde el primer commit.'
        ],
        stack: ['NestJS', 'Prisma', 'PostgreSQL', 'React']
      }
    ] as ExperienceEntry[]
  },
  featured: {
    kicker: '04 · Proyectos',
    title: 'Proyectos destacados',
    loading: 'Cargando proyectos...',
    regionLabel: 'Galería interactiva de proyectos',
    carouselRole: 'carrusel 3D',
    carouselLabel: 'Carrusel 3D de proyectos: arrastra o usa las teclas izquierda y derecha',
    skip: 'Saltar a los controles de proyectos',
    prev: 'Proyecto anterior',
    next: 'Proyecto siguiente',
    photos: 'capturas',
    view: 'Ver caso de estudio',
    demo: 'Demo en vivo',
    code: 'Código',
    all: 'Ver todos los proyectos',
    dots: 'Seleccionar proyecto',
    show: 'Mostrar proyecto'
  },
  projectsPage: {
    title: 'Proyectos',
    highlight: 'Lo que he construido',
    subtitle: 'Primero, los sistemas con clientes reales y los más completos. Al final, mis primeros proyectos, que todavía tengo pendiente refactorizar.',
    sections: {
      destacado: { title: 'Destacados', text: 'Clientes reales, despliegue, pruebas y CI.' },
      principal: { title: 'Más proyectos', text: 'Académicos y personales, la mayoría desplegados.' },
      temprano: { title: 'Primeros proyectos', text: 'De cuando empecé a programar. Pendientes de refactorización y mejora.' }
    },
    loading: 'Cargando proyectos...',
    more: 'Ver más',
    caseStudy: 'Caso de estudio',
    images: 'capturas',
    empty: 'Todavía no hay proyectos aquí.'
  },
  detail: {
    back: 'Volver a Proyectos',
    loading: 'Cargando el proyecto...',
    caseTitle: 'Caso de estudio',
    problem: 'El problema',
    solution: 'Qué construí',
    decisions: 'Decisiones técnicas',
    result: 'Resultado',
    role: 'Mi rol',
    context: 'Contexto',
    about: 'Sobre el proyecto',
    docs: 'Documentación técnica (README)',
    docsHint: 'Instalación, arquitectura y detalles del repositorio.',
    tech: 'Tecnologías',
    links: 'Enlaces',
    github: 'Repositorio en GitHub',
    web: 'Ver en vivo',
    api: 'API del backend',
    apk: 'Descargar APK (Android)',
    noLinks: 'Este proyecto no tiene enlaces públicos.',
    notFound: 'Proyecto no encontrado',
    notFoundText: 'No encontré el proyecto que buscas. Puede que el enlace esté desactualizado.',
    enlarge: 'Ampliar imagen del proyecto',
    image: 'Imagen',
    prevImage: 'Imagen anterior',
    nextImage: 'Imagen siguiente',
    thumbs: 'Miniaturas del proyecto',
    fullscreen: 'Ver en pantalla completa',
    gallery: 'Galería de',
    close: 'Cerrar vista ampliada',
    readmeLang: ''
  },
  status: { completado: 'Completado', 'en-progreso': 'En desarrollo', planificado: 'Planificado' } as Record<string, string>,
  services: {
    title: 'Servicios',
    highlight: 'Trabajo freelance',
    subtitle: 'Además de buscar un puesto, desarrollo proyectos a medida para negocios y organizaciones. Estos son los que hago, con ejemplos reales.',
    loading: 'Cargando servicios...',
    tech: 'Tecnologías',
    quote: 'Cuéntame tu proyecto',
    items: {
      'd81c79ff-a1d4-4073-b67a-b9b3220a43dc': {
        title: 'Tiendas en línea',
        description: 'Desarrollo tiendas en línea para negocios locales: catálogo, carrito, pedidos, inventario y pagos con comprobante. Ejemplo: TunguMarket.',
        extendedInfo: ['Catálogo con categorías, fotos, precios y stock, fácil de administrar.', 'Funciona igual de bien en el celular y en la computadora.', 'Pedidos, inventario y estados de compra en un solo panel.', 'Pagos con los medios que tu negocio pueda usar en Ecuador.'],
        imageAlt: 'Tienda en línea en un celular'
      },
      'd7aba01e-c026-4f4e-a890-42c8dabb6127': {
        title: 'Aplicaciones móviles',
        description: 'Desarrollo apps para Android e iOS con React Native y Expo, conectadas a tu sistema. Ejemplo: las apps de bodega y de clientes del Ecosistema Karen.',
        extendedInfo: ['Una sola base de código para Android e iOS.', 'Pantallas simples, pensadas para quien las usa todos los días.', 'Conexión con tu API, inicio de sesión y notificaciones.'],
        imageAlt: 'Aplicación móvil'
      },
      'web-dev': {
        title: 'Sistemas web a medida',
        description: 'Construyo sistemas web completos (interfaz, API, base de datos y despliegue) para organizaciones que hoy trabajan con papel o Excel. Ejemplo: el sistema de la Junta de Agua La Jones.',
        extendedInfo: ['Funciona en computadora, tablet y celular.', 'Inicio de sesión, roles y permisos para proteger la información.', 'Pruebas automatizadas y despliegue continuo para que crezca sin romperse.'],
        imageAlt: 'Sistema web en una computadora'
      },
      'ui-ux': {
        title: 'Diseño de interfaces',
        description: 'Diseño interfaces claras a partir de cómo trabaja la gente que las va a usar, y las valido con prototipos antes de programar.',
        extendedInfo: ['Entiendo el proceso y a los usuarios antes de diseñar.', 'Organizo contenidos y navegación para que todo se encuentre rápido.', 'Prototipos navegables para validar antes de desarrollar.'],
        imageAlt: 'Diseño de interfaces'
      }
    } as Record<string, ServiceCopy>
  },
  contact: {
    title: '¿Hablamos?',
    description: 'Si tienes una vacante o un proyecto, escríbeme. Leo cada mensaje y respondo desde mi correo personal.',
    features: ['Respondo en menos de 24 horas', 'Abierto a puestos Full Stack o Frontend, remotos o híbridos', 'Proyectos freelance con presupuesto a medida'],
    card: 'Escríbeme',
    name: 'Nombre', namePh: 'Tu nombre',
    email: 'Correo', emailPh: 'tu@correo.com',
    subject: 'Asunto', subjectPh: 'Ej.: Vacante Full Stack en mi empresa',
    message: 'Mensaje', messagePh: 'Cuéntame qué necesitas y para cuándo',
    send: 'Enviar mensaje', sending: 'Enviando...',
    ok: '¡Mensaje enviado! Te respondo pronto.',
    fail: 'No se pudo enviar el mensaje. Inténtalo de nuevo o escríbeme a 907johan@gmail.com.'
  },
  education: {
    title: 'Del colegio', highlight: 'a la universidad', lead: 'Mi recorrido académico, dos paradas en Tungurahua.',
    labels: { institution: 'Institución', program: 'Programa', place: 'Lugar', graduation: 'Grado', refrendation: 'Refrendación', status: 'Estado', crest: 'Escudo de' },
    steps: [
      { node: 'Colegio', stage: 'Colegio', title: 'Empecé en el colegio', text: 'Cursé el Bachillerato General Unificado en la Unidad Educativa 17 de Abril, en el cantón donde vivo.', program: 'Bachillerato General Unificado · Especialidad en Ciencias', place: 'Tungurahua, Ecuador', graduation: '20 de junio de 2022', status: '' },
      { node: 'Universidad', stage: 'Universidad', title: 'Sigo en Ambato', text: 'Hoy estudio Ingeniería de Software en la Universidad Técnica de Ambato, en la capital de la provincia.', program: 'Ingeniería de Software', place: 'Ambato, Tungurahua, Ecuador', graduation: '2027 (previsto)', status: 'En curso' }
    ]
  },
  certs: {
    title: 'Certificaciones', highlight: 'Formación continua',
    subtitle: 'Cursos y acreditaciones que complementan mi carrera, con su credencial verificable.',
    stats: ['Certificados', 'Horas de formación', 'Credenciales verificables', 'Áreas'],
    all: 'Todos', loading: 'Cargando certificaciones...', badge: 'CERTIFICADO DE FINALIZACIÓN', skills: 'Competencias:', credential: 'ID de credencial:',
    view: 'Ver detalle', verify: 'Validar', empty: 'No hay certificados aquí', emptyText: 'No hay certificaciones en esta categoría por ahora.', seeAll: 'Ver todos los certificados',
    close: 'Cerrar', modalSub: 'CREDENCIAL VERIFICABLE', issuedBy: 'Emitido por:', year: 'Año de emisión', hours: 'Horas', category: 'Categoría', expiration: 'Vencimiento',
    scope: 'Contenido', tech: 'Tecnologías y habilidades', credentialTitle: 'Identificador de la credencial', copied: '¡Copiado!', copy: 'Copiar ID', verifyIssuer: 'Validar en la plataforma emisora',
    categories: { web: 'Web y Frontend', backend: 'Backend y arquitectura', cloud: 'Cloud y DevOps', database: 'Bases de datos', mobile: 'Móvil', security: 'Redes y seguridad', support: 'Soporte técnico', iot: 'IoT', idiomas: 'Idiomas', general: 'General' } as Record<string, string>
  },
  footer: {
    tagline: 'Desarrollador Full Stack · TypeScript. Ambato, Ecuador.',
    links: 'Enlaces',
    contact: 'Contacto',
    cv: 'Descargar CV'
  },
  error: { title: 'Sin conexión', text: 'Comprueba tu conexión a internet e inténtalo de nuevo.', retry: 'Reintentar' }
};

export type Copy = typeof es;

const en: Copy = {
  meta: {
    home: { title: 'Johan Rodríguez | Full Stack Developer', description: 'Full Stack developer working in TypeScript (Angular, React, Node.js) in Ecuador. Systems used by an irrigation board, a supermarket and a sports league.' },
    projects: { title: 'Projects | Johan Rodríguez', description: 'Projects by Johan Rodríguez: systems with real clients, deployed and tested.' },
    services: { title: 'Services | Johan Rodríguez', description: 'Custom web systems, online stores and mobile apps for businesses and organizations.' },
    education: { title: 'Education | Johan Rodríguez', description: 'Education and certifications of Johan Rodríguez.' },
    contact: { title: 'Contact | Johan Rodríguez', description: 'Write to me about a job opening or a project.' },
    projectSuffix: ' | Project by Johan Rodríguez'
  },
  nav: { home: 'Home', experience: 'Experience', projects: 'Projects', services: 'Services', education: 'Education', contact: 'Contact', cv: 'Download CV', menu: 'Open menu', main: 'Main', switchLang: 'Español', switchLangLabel: 'Ver esta página en español' },
  cvUrl: '/cv-johan-rodriguez-en.pdf',
  intro: { line1: 'There is a new developer', line2: 'in town', subtitle: 'Johan Rodríguez, Full Stack developer', skip: 'Skip intro' },
  hero: {
    word: 'Full Stack',
    role: 'Full Stack Developer · TypeScript',
    lead: 'I build and maintain systems used by real organizations in Tungurahua, Ecuador: an irrigation board, a supermarket and a sports league. Angular, React, Node.js, tests and deployment on my own server.',
    availability: 'Looking for a Full Stack or Frontend role · remote or hybrid',
    write: 'Contact me',
    cv: 'Download CV',
    projects: 'See projects',
    terminalLabel: 'Recent GitHub activity',
    noPush: 'No recent public pushes',
    githubFail: 'Could not read GitHub right now',
    reading: 'reading api.github.com'
  },
  chapters: { hero: 'Home', about: 'About', experience: 'Experience', projects: 'Projects', scroll: 'Scroll to continue', rail: 'Page chapters', goTo: 'Go to' },
  about: {
    title: 'About me',
    paragraphs: [
      'I am a Full Stack developer studying Software Engineering at Universidad Técnica de Ambato. I work in TypeScript end to end: Angular or React frontends, Node.js APIs, databases, tests and deployment.',
      'What I care about most is software people actually use. That is why my main projects have clients: the La Jones Water Board, Supermercado Karen and the Quero Cantonal League. I deploy them on my own homelab with Docker and Cloudflare Tunnel, with continuous deployment from GitHub.',
      'AI is part of how I work, with specs, review of every change, tests and CI. I am looking for a Full Stack or Frontend role, remote or hybrid.'
    ],
    facts: [
      ['Location', 'Ambato, Ecuador'],
      ['Studies', 'Software Engineering, UTA (2027)'],
      ['Frontend', 'Angular, React, TypeScript'],
      ['Backend', 'Node.js, Express, NestJS'],
      ['Data', 'PostgreSQL, MySQL, Prisma'],
      ['Infrastructure', 'Docker, Linux, Cloudflare Tunnel']
    ],
    // (la tupla mantiene el mismo tipo que en español)
  } as Copy['about'],
  experience: {
    kicker: '03 · Experience',
    title: 'Experience',
    lead: 'Systems with real clients that are in use or in pilot.',
    seeCase: 'See case study',
    entries: [
      {
        role: 'Full Stack Developer', org: 'La Jones Water & Irrigation Board, Patate', kind: 'University community-service program → maintenance and training', dates: 'Aug 2026 – present', link: 'https://juntalajones.com/', projectId: 16,
        bullets: [
          'Tech lead of a 10-person team building a web system that replaced paper logs for irrigation shifts, community work with fines and payments with PDF receipts.',
          'Approved by the board after training (Nov 2026): 150 users and 4 board members. 13 releases published.',
          'Unit and end-to-end tests with Playwright, CI on GitHub Actions and WhatsApp meeting notices.'
        ],
        stack: ['Angular', 'TypeScript', 'Express', 'MySQL', 'Playwright']
      },
      {
        role: 'Freelance Full Stack Developer', org: 'Supermercado Karen', kind: 'Freelance · system in pilot', dates: 'Sep 2026 – present', link: 'https://karen.madebyjohan.xyz/', projectId: 17,
        bullets: [
          'Tech lead (team of 4) of a batch-based FEFO inventory with expiry alerts, pickup-code reservations and an AI assistant.',
          'Web portal, warehouse app and customer app; deployed on my homelab and in a full pilot at the store.',
          'I know the process first-hand: I worked weekends as cashier and stock clerk at the store in 2024.'
        ],
        stack: ['React', 'React Native', 'Express', 'PostgreSQL', 'Docker']
      },
      {
        role: 'Full Stack Developer (volunteer)', org: 'Quero Cantonal Sports League', kind: 'Volunteer · launch planned for 2027', dates: 'Oct 2026 – present', projectId: 18,
        bullets: [
          'Sports management platform: clubs, athletes, championships, referees, disciplinary records and a public portal.',
          'Automated tests and CI from the first commit.'
        ],
        stack: ['NestJS', 'Prisma', 'PostgreSQL', 'React']
      }
    ]
  },
  featured: {
    kicker: '04 · Projects',
    title: 'Featured projects',
    loading: 'Loading projects...',
    regionLabel: 'Interactive project gallery',
    carouselRole: '3D carousel',
    carouselLabel: '3D project carousel: drag or use the left and right arrow keys',
    skip: 'Skip to project controls',
    prev: 'Previous project',
    next: 'Next project',
    photos: 'screenshots',
    view: 'See case study',
    demo: 'Live demo',
    code: 'Code',
    all: 'See all projects',
    dots: 'Choose a project',
    show: 'Show project'
  },
  projectsPage: {
    title: 'Projects',
    highlight: 'What I have built',
    subtitle: 'First, the systems with real clients and the most complete ones. At the end, my first projects, which I still plan to refactor.',
    sections: {
      destacado: { title: 'Featured', text: 'Real clients, deployment, tests and CI.' },
      principal: { title: 'More projects', text: 'Academic and personal, most of them deployed.' },
      temprano: { title: 'Early projects', text: 'From when I started programming. Pending refactoring and improvement.' }
    },
    loading: 'Loading projects...',
    more: 'See more',
    caseStudy: 'Case study',
    images: 'screenshots',
    empty: 'No projects here yet.'
  },
  detail: {
    back: 'Back to Projects',
    loading: 'Loading the project...',
    caseTitle: 'Case study',
    problem: 'The problem',
    solution: 'What I built',
    decisions: 'Technical decisions',
    result: 'Outcome',
    role: 'My role',
    context: 'Context',
    about: 'About the project',
    docs: 'Technical documentation (README, in Spanish)',
    docsHint: 'Setup, architecture and repository details.',
    tech: 'Technologies',
    links: 'Links',
    github: 'GitHub repository',
    web: 'See it live',
    api: 'Backend API',
    apk: 'Download APK (Android)',
    noLinks: 'This project has no public links.',
    notFound: 'Project not found',
    notFoundText: 'I could not find that project. The link may be outdated.',
    enlarge: 'Enlarge project image',
    image: 'Image',
    prevImage: 'Previous image',
    nextImage: 'Next image',
    thumbs: 'Project thumbnails',
    fullscreen: 'View full screen',
    gallery: 'Gallery of',
    close: 'Close enlarged view',
    readmeLang: 'es'
  },
  status: { completado: 'Completed', 'en-progreso': 'In development', planificado: 'Planned' },
  services: {
    title: 'Services',
    highlight: 'Freelance work',
    subtitle: 'Besides looking for a role, I build custom projects for businesses and organizations. These are the ones I do, with real examples.',
    loading: 'Loading services...',
    tech: 'Technologies',
    quote: 'Tell me about your project',
    items: {
      'd81c79ff-a1d4-4073-b67a-b9b3220a43dc': {
        title: 'Online stores',
        description: 'I build online stores for local businesses: catalog, cart, orders, inventory and receipt-based payments. Example: TunguMarket.',
        extendedInfo: ['Catalog with categories, photos, prices and stock, easy to manage.', 'Works just as well on a phone as on a computer.', 'Orders, inventory and purchase status in a single dashboard.', 'Payments with the methods your business can use in Ecuador.'],
        imageAlt: 'Online store on a phone'
      },
      'd7aba01e-c026-4f4e-a890-42c8dabb6127': {
        title: 'Mobile apps',
        description: 'I build Android and iOS apps with React Native and Expo, connected to your system. Example: the warehouse and customer apps of the Karen Ecosystem.',
        extendedInfo: ['One codebase for Android and iOS.', 'Simple screens, designed for people who use them every day.', 'Connected to your API, sign-in and notifications.'],
        imageAlt: 'Mobile app'
      },
      'web-dev': {
        title: 'Custom web systems',
        description: 'I build complete web systems (interface, API, database and deployment) for organizations that still work on paper or spreadsheets. Example: the La Jones Water Board system.',
        extendedInfo: ['Works on computer, tablet and phone.', 'Sign-in, roles and permissions to protect information.', 'Automated tests and continuous deployment so it can grow without breaking.'],
        imageAlt: 'Web system on a computer'
      },
      'ui-ux': {
        title: 'Interface design',
        description: 'I design clear interfaces based on how the people who will use them actually work, and validate them with prototypes before coding.',
        extendedInfo: ['I understand the process and the users before designing.', 'I organize content and navigation so everything is easy to find.', 'Clickable prototypes to validate before development.'],
        imageAlt: 'Interface design'
      }
    }
  },
  contact: {
    title: 'Let\'s talk',
    description: 'If you have an opening or a project, write to me. I read every message and reply from my personal email.',
    features: ['I reply within 24 hours', 'Open to Full Stack or Frontend roles, remote or hybrid', 'Freelance projects with a tailored quote'],
    card: 'Write to me',
    name: 'Name', namePh: 'Your name',
    email: 'Email', emailPh: 'you@email.com',
    subject: 'Subject', subjectPh: 'e.g. Full Stack opening at my company',
    message: 'Message', messagePh: 'Tell me what you need and when',
    send: 'Send message', sending: 'Sending...',
    ok: 'Message sent! I will reply soon.',
    fail: 'The message could not be sent. Try again or write to 907johan@gmail.com.'
  },
  education: {
    title: 'From high school', highlight: 'to university', lead: 'My academic path, two stops in Tungurahua.',
    labels: { institution: 'Institution', program: 'Program', place: 'Place', graduation: 'Graduation', refrendation: 'Registration', status: 'Status', crest: 'Crest of' },
    steps: [
      { node: 'High school', stage: 'High school', title: 'It started in high school', text: 'I completed the Unified General Baccalaureate (science track) at Unidad Educativa 17 de Abril, in the canton where I live.', program: 'Unified General Baccalaureate · Science track', place: 'Tungurahua, Ecuador', graduation: 'June 20, 2022', status: '' },
      { node: 'University', stage: 'University', title: 'Still in Ambato', text: 'I now study Software Engineering at Universidad Técnica de Ambato, in the provincial capital.', program: 'B.Eng. in Software Engineering', place: 'Ambato, Tungurahua, Ecuador', graduation: '2027 (expected)', status: 'In progress' }
    ]
  },
  certs: {
    title: 'Certifications', highlight: 'Continuous learning',
    subtitle: 'Courses and credentials that complement my degree, each with a verifiable credential.',
    stats: ['Certificates', 'Training hours', 'Verifiable credentials', 'Areas'],
    all: 'All', loading: 'Loading certifications...', badge: 'CERTIFICATE OF COMPLETION', skills: 'Skills:', credential: 'Credential ID:',
    view: 'View details', verify: 'Verify', empty: 'No certificates here', emptyText: 'There are no certifications in this category yet.', seeAll: 'See all certificates',
    close: 'Close', modalSub: 'VERIFIABLE CREDENTIAL', issuedBy: 'Issued by:', year: 'Year issued', hours: 'Hours', category: 'Category', expiration: 'Expiration',
    scope: 'Content', tech: 'Technologies and skills', credentialTitle: 'Credential identifier', copied: 'Copied!', copy: 'Copy ID', verifyIssuer: 'Verify with the issuer',
    categories: { web: 'Web & Frontend', backend: 'Backend & architecture', cloud: 'Cloud & DevOps', database: 'Databases', mobile: 'Mobile', security: 'Networking & security', support: 'IT support', iot: 'IoT', idiomas: 'Languages', general: 'General' }
  },
  footer: {
    tagline: 'Full Stack Developer · TypeScript. Ambato, Ecuador.',
    links: 'Links',
    contact: 'Contact',
    cv: 'Download CV'
  },
  error: { title: 'No connection', text: 'Check your internet connection and try again.', retry: 'Retry' }
};

export const COPY: Record<Lang, Copy> = { es, en };
