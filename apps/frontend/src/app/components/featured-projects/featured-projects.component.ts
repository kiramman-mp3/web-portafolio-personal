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
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  ProjectsService,
  Project,
  getProjectCover,
  getProjectImages,
} from '../../shared/services/projects.service';
import { I18nService } from '../../shared/i18n/i18n.service';
import { byTier, localize } from '../../shared/content/curation';
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
  @ViewChild('scrollRunway') scrollRunwayRef?: ElementRef<HTMLElement>;
  @ViewChild('stageContainer') stageContainerRef?: ElementRef<HTMLElement>;
  @ViewChild('waveCanvas') waveCanvasRef?: ElementRef<HTMLCanvasElement>;

  featuredProjects: Project[] = [];
  totalProjects = 0;
  readonly i18n = inject(I18nService);
  isBrowser = false;
  hasError = false;
  isLoading = true;

  // 3D Carousel state
  selectedIndex = 0;
  isCanvasReady = false;
  isWebGLUnavailable = false;
  isPaused = false;
  reducedMotion = false;
  runwayProgress = 0;
  isPinned = false;
  isDetailCardOpen = true;

  private engine: ProjectWaveEngine | null = null;
  private initTriggered = false;
  private nearViewportObserver?: IntersectionObserver;
  private motionMediaQuery?: MediaQueryList;
  private boundPopState?: () => void;
  private boundMotionChange?: (e: MediaQueryListEvent) => void;
  private boundScroll?: () => void;
  private scrollRafId = 0;
  private settleTimer: ReturnType<typeof setTimeout> | null = null;
  private lastScrollY = 0;
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

  get isScrollPinEnabled(): boolean {
    return !this.reducedMotion && !this.isWebGLUnavailable && this.featuredProjects.length > 1;
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
      this.engine?.setScrollDriven(this.isScrollPinEnabled);
      this.cdr.detectChanges();
    };
    this.motionMediaQuery?.addEventListener?.('change', this.boundMotionChange);

    this.boundPopState = () => this.syncSelectionFromUrl();
    window.addEventListener('popstate', this.boundPopState);

    this.boundScroll = () => this.scheduleScrollSync();
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.boundScroll!, { passive: true });
      window.addEventListener('resize', this.boundScroll!, { passive: true });
    });

    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.nearViewportObserver?.disconnect();
    if (this.isBrowser) {
      if (this.boundPopState) window.removeEventListener('popstate', this.boundPopState);
      if (this.boundScroll) {
        window.removeEventListener('scroll', this.boundScroll);
        window.removeEventListener('resize', this.boundScroll);
      }
      if (this.scrollRafId) {
        cancelAnimationFrame(this.scrollRafId);
        this.scrollRafId = 0;
      }
      if (this.settleTimer) {
        clearTimeout(this.settleTimer);
        this.settleTimer = null;
      }
    }
    if (this.boundMotionChange) {
      this.motionMediaQuery?.removeEventListener?.('change', this.boundMotionChange);
    }
    this.engine?.dispose();
    this.engine = null;
  }

  private scheduleScrollSync(): void {
    if (this.scrollRafId) return;
    this.scrollRafId = requestAnimationFrame(() => {
      this.scrollRafId = 0;
      this.syncWaveWithScroll();
    });
  }

  private markScrollingActive(): void {
    if (this.reducedMotion) {
      if (!this.isDetailCardOpen) {
        this.isDetailCardOpen = true;
        this.cdr.detectChanges();
      }
      return;
    }
    if (this.isDetailCardOpen) {
      this.ngZone.run(() => {
        this.isDetailCardOpen = false;
        this.cdr.detectChanges();
      });
    }
    if (this.settleTimer) {
      clearTimeout(this.settleTimer);
    }
    this.settleTimer = setTimeout(() => {
      this.settleTimer = null;
      this.ngZone.run(() => {
        this.isDetailCardOpen = true;
        this.cdr.detectChanges();
      });
    }, 240);
  }

  private syncWaveWithScroll(): void {
    if (!this.isScrollPinEnabled || !this.scrollRunwayRef) return;
    const runway = this.scrollRunwayRef.nativeElement;
    const rect = runway.getBoundingClientRect();
    const scrollable = Math.max(runway.offsetHeight - window.innerHeight, 1);
    const rawProgress = -rect.top / scrollable;
    const clamped = Math.min(1, Math.max(0, rawProgress));
    const pinnedNow = rect.top <= 2 && rect.bottom >= window.innerHeight - 2;

    const scrollDelta = Math.abs(window.scrollY - this.lastScrollY);
    this.lastScrollY = window.scrollY;
    if (pinnedNow && scrollDelta > 1) {
      this.markScrollingActive();
    }

    if (this.engine && !this.isPaused) {
      this.engine.setScrollProgress(clamped);
    }

    if (pinnedNow !== this.isPinned || Math.abs(clamped - this.runwayProgress) > 0.002) {
      this.ngZone.run(() => {
        this.isPinned = pinnedNow;
        this.runwayProgress = clamped;
        this.cdr.detectChanges();
      });
    }
  }

  private scrollRunwayToIndex(index: number, instant = false): void {
    if (!this.isBrowser || !this.isScrollPinEnabled || !this.scrollRunwayRef) return;
    const count = this.featuredProjects.length;
    if (count <= 1) return;
    const clampedIdx = Math.min(count - 1, Math.max(0, index));
    const runway = this.scrollRunwayRef.nativeElement;
    const rect = runway.getBoundingClientRect();
    const runwayTopDoc = window.scrollY + rect.top;
    const scrollable = Math.max(runway.offsetHeight - window.innerHeight, 0);
    const targetY = runwayTopDoc + (clampedIdx / (count - 1)) * scrollable;

    window.scrollTo({
      top: Math.round(targetY),
      behavior: instant || this.reducedMotion ? 'auto' : 'smooth',
    });
  }

  loadProjects(): void {
    this.hasError = false;
    this.isLoading = true;
    this.projectsService.getProjects().subscribe({
      next: (projects) => {
        // En la portada solo van los destacados, en su orden y con el texto curado del idioma actual
        const lang = this.i18n.lang();
        this.totalProjects = projects.length;
        this.featuredProjects = byTier(projects, 'destacado').map(p => localize(p, lang));
        this.isLoading = false;
        this.selectedIndex = this.resolveInitialIndexFromUrl(this.featuredProjects);
        this.cdr.detectChanges();
        if (this.featuredProjects.length > 0) {
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
          labels: { status: this.i18n.copy().status, photos: this.i18n.copy().featured.photos },
          callbacks: {
            onReady: () => {
              this.ngZone.run(() => {
                this.isCanvasReady = true;
                this.engine?.setScrollDriven(this.isScrollPinEnabled);
                this.syncWaveWithScroll();
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
            onManualTargetIndex: (idx: number) => {
              this.ngZone.run(() => {
                this.scrollRunwayToIndex(idx);
              });
            },
            onMotionStateChange: (isMoving: boolean) => {
              if (this.reducedMotion) return;
              if (isMoving) {
                this.markScrollingActive();
              } else if (!this.settleTimer && !this.isDetailCardOpen) {
                this.ngZone.run(() => {
                  this.isDetailCardOpen = true;
                  this.cdr.detectChanges();
                });
              }
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
    if (this.isScrollPinEnabled && !this.isPaused) {
      const nextIdx = Math.max(0, this.selectedIndex - 1);
      this.scrollRunwayToIndex(nextIdx);
      return;
    }
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
    if (this.isScrollPinEnabled && !this.isPaused) {
      const nextIdx = Math.min(this.featuredProjects.length - 1, this.selectedIndex + 1);
      this.scrollRunwayToIndex(nextIdx);
      return;
    }
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
    if (this.isScrollPinEnabled && !this.isPaused) {
      this.scrollRunwayToIndex(index);
      return;
    }
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
    if (this.isScrollPinEnabled && !this.isPaused) {
      this.scrollRunwayToIndex(0);
      return;
    }
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
    return this.i18n.copy().status[status] ?? '';
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
