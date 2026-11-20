import { Component, ElementRef, NgZone, OnDestroy, OnInit, PLATFORM_ID, QueryList, ViewChild, ViewChildren, computed, inject, signal, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { HomeHeroComponent } from '../../components/home-hero/home-hero.component';
import { Project, ProjectsService } from '../../shared/services/projects.service';
import { Certificate, CertificatesService } from '../../shared/services/certificates.service';
import { ValleyService } from '../../shared/services/valley.service';
import { GITHUB_URL, LINKEDIN_URL } from '../../shared/constants/profile';

/** Proyecto que tiene su parada en el valle. */
interface Stop {
  id: string;
  /** Repositorio en GitHub: con él se busca el proyecto en la API */
  repo: string;
  place: string;
  title: string;
  summary: string;
  technologies: string[];
}

/**
 * Paradas del recorrido, en el orden en que la cámara las visita. Los textos vienen de la API;
 * estos son el respaldo si no responde.
 */
const STOPS: Stop[] = [
  {
    id: 'jones', repo: 'sistema-control-agua-riego', place: 'Patate · La Jones',
    title: 'Junta de Agua y Riego La Jones',
    summary: 'Gestión de la Junta de Agua y Riego La Jones: lotes, turnos de riego, cobros, multas y asambleas.',
    technologies: ['Angular', 'TypeScript', 'Express', 'MySQL'],
  },
  {
    id: 'karen', repo: 'sistema-inventario-supermercado', place: 'Ambato · Supermercado Karen',
    title: 'Ecosistema Karen',
    summary: 'Inventario por lotes (FEFO) y reservas con código de retiro. Web y dos apps móviles.',
    technologies: ['React', 'React Native', 'Express', 'PostgreSQL'],
  },
  {
    id: 'nomina', repo: 'sistema-rol-pagos-erp', place: 'Ambato · Nómina',
    title: 'Rol de Pagos Ecuador',
    summary: 'Nómina para Ecuador con reglas de ley parametrizables: IESS, impuesto a la renta, décimos y horas extras.',
    technologies: ['Angular', 'Express', 'PostgreSQL'],
  },
  {
    id: 'lms', repo: 'sistema-gestion-aprendizaje-ia', place: 'Ambato · Universidad Técnica',
    title: 'LMS inteligente con asistente de IA',
    summary: 'LMS sobre Moodle con un asistente de IA que planifica cursos desde el sílabo y responde sobre datos reales del curso.',
    technologies: ['Moodle', 'NestJS', 'PostgreSQL'],
  },
  {
    id: 'promocion', repo: 'sistema-promocion-docente', place: 'Ambato · Universidad Técnica',
    title: 'Promoción docente UTA',
    summary: 'Trámite de promoción docente de la UTA con dictamen normativo, votación y resolución en PDF.',
    technologies: ['ASP.NET Core', 'React', 'SQL Server'],
  },
  {
    id: 'quero', repo: 'sistema-gestion-deportiva', place: 'Quero · Liga Cantonal',
    title: 'Liga Cantonal de Quero',
    summary: 'Gestión de la Liga Cantonal de Quero: clubes, deportistas, campeonatos, árbitros, disciplina y portal público.',
    technologies: ['NestJS', 'React', 'PostgreSQL', 'Playwright'],
  },
];

const repoOf = (url?: string) => url?.replace(/\/+$/, '').split('/').pop()?.toLowerCase() ?? '';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, FooterComponent, HomeHeroComponent],
  templateUrl: './home.html',
  styleUrl: './home.sass',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('chapter') chapters!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('heroWrap', { static: true }) heroWrap!: ElementRef<HTMLElement>;

  private readonly valley = inject(ValleyService);
  private readonly projectsService = inject(ProjectsService);
  private readonly certificatesService = inject(CertificatesService);
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly githubUrl = GITHUB_URL;
  readonly linkedinUrl = LINKEDIN_URL;

  private readonly projects = signal<Project[]>([]);
  readonly certificates = signal<Certificate[]>([]);
  /** Capítulo que ocupa el centro de la pantalla */
  readonly current = signal(0);

  /** Paradas con los datos de la API cuando llegan. */
  readonly stops = computed(() => STOPS.map(stop => {
    const project = this.projects().find(p => repoOf(p.githubUrl) === stop.repo);
    return {
      ...stop,
      project,
      title: project?.title ?? stop.title,
      summary: project?.shortDescription || stop.summary,
      technologies: project?.technologies?.length ? project.technologies.slice(0, 5) : stop.technologies,
    };
  }));

  /** Proyectos que no tienen parada propia en el valle. */
  readonly others = computed(() => {
    const repos = new Set(STOPS.map(s => s.repo));
    return this.projects().filter(p => !repos.has(repoOf(p.githubUrl)));
  });

  readonly issuers = computed(() => {
    const counts = new Map<string, number>();
    for (const c of this.certificates()) counts.set(c.issuer, (counts.get(c.issuer) ?? 0) + 1);
    return [...counts].map(([issuer, count]) => ({ issuer, count }));
  });

  private frame = 0;
  private readonly onScroll = () => {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.measure());
  };

  ngOnInit(): void {
    this.valley.mode.set('journey');
    this.projectsService.getProjects().subscribe({ next: list => this.projects.set(list), error: () => {} });
    this.certificatesService.getCertificates().subscribe({ next: list => this.certificates.set(list), error: () => {} });
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onScroll);
    });
    this.measure();
  }

  ngOnDestroy(): void {
    this.valley.mode.set('ambient');
    this.valley.active.set(null);
    if (!this.isBrowser) return;
    cancelAnimationFrame(this.frame);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    document.documentElement.style.removeProperty('--valley-reveal');
  }

  /**
   * Traduce el scroll a una posición continua del recorrido: el capítulo cuyo cuerpo cruza
   * el centro de la pantalla, más cuánto de él ya se recorrió.
   */
  private measure(): void {
    // La portada se desvanece en la primera pantalla de scroll y el valle aparece detrás
    const fade = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.8)));
    this.heroWrap.nativeElement.style.setProperty('--hero-fade', fade.toFixed(3));
    // Ya desvanecida no debe recibir clics ni seguir animando por detrás
    this.heroWrap.nativeElement.style.visibility = fade >= 1 ? 'hidden' : '';
    document.documentElement.style.setProperty('--valley-reveal', Math.max(0, (fade - 0.25) / 0.75).toFixed(3));

    const center = window.innerHeight / 2;
    const items = this.chapters.toArray();
    let position = 0;
    items.forEach((ref, i) => {
      const rect = ref.nativeElement.getBoundingClientRect();
      if (rect.top <= center) position = i + Math.min(1, (center - rect.top) / rect.height);
    });
    // Se avanza al siguiente fotograma solo en la segunda mitad del capítulo,
    // así la cámara se queda quieta mientras se lee
    const index = Math.min(items.length - 1, Math.floor(position));
    const within = position - index;
    const journey = index + Math.max(0, (within - 0.55) / 0.45);

    this.zone.run(() => {
      this.valley.journey.set(journey);
      this.current.set(index);
      const id = items[index]?.nativeElement.dataset['stop'] ?? null;
      this.valley.active.set(id);
    });
  }
}
