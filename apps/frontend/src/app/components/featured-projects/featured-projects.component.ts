import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  NgZone,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  ProjectsService,
  Project,
  getProjectCover,
  getProjectImages,
} from '../../shared/services/projects.service';
import { ConnectionErrorComponent } from '../../shared/components/connection-error/connection-error.component';
import type { ProjectWaveEngine } from './project-wave-engine';

@Component({
  selector: 'app-featured-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, ConnectionErrorComponent],
  templateUrl: './featured-projects.component.html',
  styleUrl: './featured-projects.component.scss',
})
export class FeaturedProjectsComponent implements OnInit, OnDestroy {
  @ViewChild('stageContainer') stageContainerRef?: ElementRef<HTMLElement>;
  @ViewChild('waveCanvas') waveCanvasRef?: ElementRef<HTMLCanvasElement>;

  featuredProjects: Project[] = [];
  isBrowser = false;
  hasError = false;
  isLoading = true;

  // 3D Carousel state
  selectedIndex = 0;
  isCanvasReady = false;
  isWebGLUnavailable = false;
  isPaused = false;
  reducedMotion = false;

  private engine: ProjectWaveEngine | null = null;
  private initTriggered = false;
  private nearViewportObserver?: IntersectionObserver;
  private motionMediaQuery?: MediaQueryList;
  private boundPopState?: () => void;
  private boundMotionChange?: (e: MediaQueryListEvent) => void;
  private isRestoringFromHistory = false;

  constructor(
    private projectsService: ProjectsService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private hostRef: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  get activeProject(): Project | undefined {
    return this.featuredProjects[this.selectedIndex];
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      this.isLoading = false;
      return;
    }

    this.motionMediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    this.reducedMotion = this.motionMediaQuery?.matches ?? false;
    this.boundMotionChange = (e: MediaQueryListEvent) => {
      this.reducedMotion = e.matches;
      this.engine?.setReducedMotion(this.reducedMotion);
      this.cdr.detectChanges();
    };
    this.motionMediaQuery?.addEventListener?.('change', this.boundMotionChange);

    this.boundPopState = () => this.syncSelectionFromUrl();
    window.addEventListener('popstate', this.boundPopState);

    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.nearViewportObserver?.disconnect();
    if (this.boundPopState && this.isBrowser) {
      window.removeEventListener('popstate', this.boundPopState);
    }
    if (this.boundMotionChange) {
      this.motionMediaQuery?.removeEventListener?.('change', this.boundMotionChange);
    }
    this.engine?.dispose();
    this.engine = null;
  }

  loadProjects(): void {
    this.hasError = false;
    this.isLoading = true;
    this.projectsService.getProjects().subscribe({
      next: (projects) => {
        this.featuredProjects = projects;
        this.isLoading = false;
        this.selectedIndex = this.resolveInitialIndexFromUrl(projects);
        this.cdr.detectChanges();
        if (projects.length > 0) {
          this.scheduleLazyThreeInit();
        }
      },
      error: () => {
        this.featuredProjects = [];
        this.hasError = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private resolveInitialIndexFromUrl(projects: Project[]): number {
    if (!this.isBrowser || projects.length === 0) return 0;
    try {
      const params = new URLSearchParams(window.location.search);
      const queryVal = params.get('project') || params.get('proyecto');
      const hashMatch = window.location.hash.match(/^#proyecto-(\d+)$/i);
      const rawId = queryVal || hashMatch?.[1];
      if (!rawId) return 0;

      const idxById = projects.findIndex((p) => String(p.id) === String(rawId));
      if (idxById >= 0) return idxById;

      const slug = rawId.toLowerCase();
      const idxByTitle = projects.findIndex((p) =>
        p.title.toLowerCase().includes(slug)
      );
      return idxByTitle >= 0 ? idxByTitle : 0;
    } catch {
      return 0;
    }
  }

  private syncSelectionFromUrl(): void {
    if (this.featuredProjects.length === 0) return;
    const idx = this.resolveInitialIndexFromUrl(this.featuredProjects);
    if (idx !== this.selectedIndex) {
      this.isRestoringFromHistory = true;
      this.selectedIndex = idx;
      this.engine?.goToProjectIndex(idx);
      this.cdr.detectChanges();
      this.isRestoringFromHistory = false;
    }
  }

  private pushHistoryForIndex(index: number): void {
    if (!this.isBrowser || this.isRestoringFromHistory) return;
    const proj = this.featuredProjects[index];
    if (!proj) return;
    try {
      const url = new URL(window.location.href);
      if (url.pathname !== '/') return;
      const currentParam = url.searchParams.get('project');
      const nextParam = String(proj.id);
      if (currentParam === nextParam) return;
      url.searchParams.set('project', nextParam);
      window.history.pushState({ projectId: proj.id }, '', url.toString());
    } catch {
      // Ignore history errors in restricted frames
    }
  }

  private scheduleLazyThreeInit(): void {
    if (!this.isBrowser || this.initTriggered) return;

    // Detect basic WebGL capability upfront before dynamic import
    if (!this.hasWebGLSupport()) {
      this.isWebGLUnavailable = true;
      this.cdr.detectChanges();
      return;
    }

    const hostEl = this.hostRef.nativeElement;
    if (typeof IntersectionObserver !== 'undefined') {
      this.nearViewportObserver?.disconnect();
      this.nearViewportObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            this.nearViewportObserver?.disconnect();
            this.bootWaveEngine();
          }
        },
        { rootMargin: '420px 0px' }
      );
      this.nearViewportObserver.observe(hostEl);
    } else {
      this.bootWaveEngine();
    }
  }

  private hasWebGLSupport(): boolean {
    try {
      const testCanvas = document.createElement('canvas');
      const gl =
        testCanvas.getContext('webgl2') ||
        testCanvas.getContext('webgl') ||
        testCanvas.getContext('experimental-webgl');
      return Boolean(gl);
    } catch {
      return false;
    }
  }

  private async bootWaveEngine(): Promise<void> {
    if (this.initTriggered || this.featuredProjects.length === 0) return;
    this.initTriggered = true;

    // Wait one microtask so ViewChild elements are mounted after Angular renders
    await Promise.resolve();
    const container = this.stageContainerRef?.nativeElement;
    const canvas = this.waveCanvasRef?.nativeElement;
    if (!container || !canvas) {
      this.isWebGLUnavailable = true;
      this.cdr.detectChanges();
      return;
    }

    this.ngZone.runOutsideAngular(async () => {
      try {
        const { ProjectWaveEngine } = await import('./project-wave-engine');
        const engine = new ProjectWaveEngine({
          container,
          canvas,
          projects: this.featuredProjects,
          initialIndex: this.selectedIndex,
          reducedMotion: this.reducedMotion,
          callbacks: {
            onReady: () => {
              this.ngZone.run(() => {
                this.isCanvasReady = true;
                this.cdr.detectChanges();
              });
            },
            onSelectIndex: (idx: number) => {
              this.ngZone.run(() => {
                this.selectedIndex = idx;
                this.pushHistoryForIndex(idx);
                this.cdr.detectChanges();
              });
            },
            onError: (reason: string) => {
              console.warn('3D Wave Carousel fallback activated:', reason);
              this.ngZone.run(() => {
                this.isWebGLUnavailable = true;
                this.isCanvasReady = false;
                this.cdr.detectChanges();
              });
            },
          },
        });
        this.engine = engine;
        await engine.init();
      } catch (err) {
        console.warn('Dynamic import of 3D Wave Carousel failed:', err);
        this.ngZone.run(() => {
          this.isWebGLUnavailable = true;
          this.cdr.detectChanges();
        });
      }
    });
  }

  // Controls
  prevProject(): void {
    if (this.featuredProjects.length === 0) return;
    if (this.engine && !this.isWebGLUnavailable) {
      this.engine.step(-1);
    } else {
      const total = this.featuredProjects.length;
      this.selectedIndex = (this.selectedIndex - 1 + total) % total;
      this.pushHistoryForIndex(this.selectedIndex);
    }
  }

  nextProject(): void {
    if (this.featuredProjects.length === 0) return;
    if (this.engine && !this.isWebGLUnavailable) {
      this.engine.step(1);
    } else {
      const total = this.featuredProjects.length;
      this.selectedIndex = (this.selectedIndex + 1) % total;
      this.pushHistoryForIndex(this.selectedIndex);
    }
  }

  selectProjectDot(index: number): void {
    if (this.featuredProjects.length === 0) return;
    if (this.engine && !this.isWebGLUnavailable) {
      this.engine.goToProjectIndex(index);
    } else {
      this.selectedIndex = index;
      this.pushHistoryForIndex(index);
    }
  }

  togglePause(): void {
    this.isPaused = !this.isPaused;
    this.engine?.setPaused(this.isPaused);
  }

  resetCarousel(): void {
    if (this.engine && !this.isWebGLUnavailable) {
      this.engine.reset();
    } else {
      this.selectedIndex = 0;
      this.pushHistoryForIndex(0);
    }
  }

  onCarouselKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.prevProject();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.nextProject();
    }
  }

  getCoverImage(project: Project): string {
    return getProjectCover(project);
  }

  getImageCount(project: Project): number {
    return getProjectImages(project).length;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'completado':
        return 'badge-completed';
      case 'en-progreso':
        return 'badge-progress';
      case 'planificado':
        return 'badge-planned';
      default:
        return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completado':
        return 'Completado';
      case 'en-progreso':
        return 'En Progreso';
      case 'planificado':
        return 'Planificado';
      default:
        return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completado':
        return 'fa-check';
      case 'en-progreso':
        return 'fa-clock';
      case 'planificado':
        return 'fa-calendar';
      default:
        return '';
    }
  }
}
