import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, HostListener, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProjectsService, Project, getProjectImages } from '../../shared/services/projects.service';
import { FooterComponent } from '../../components/footer/footer.component';
import { ConnectionErrorComponent } from '../../shared/components/connection-error/connection-error.component';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { getTechIcon, getTechColor } from '../../shared/constants/tech-list';
import { I18nService } from '../../shared/i18n/i18n.service';
import { Curated, curationOf } from '../../shared/content/curation';

@Component({
  selector: 'app-proyecto-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent, MarkdownPipe, ConnectionErrorComponent],
  templateUrl: './proyecto-detalle.component.html',
  styleUrl: './proyecto-detalle.component.scss'
})
export class ProyectoDetalleComponent implements OnInit {
  readonly i18n = inject(I18nService);
  project?: Project;
  isLoading = true;
  hasConnectionError = false;
  isBrowser = false;

  currentImageIndex = 0;
  isLightboxOpen = false;
  private touchStartX = 0;

  constructor(
    private route: ActivatedRoute,
    private projectsService: ProjectsService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /** Curaduría editorial del proyecto (rol, contexto y caso de estudio), si la tiene. */
  get curated(): Curated | undefined {
    return this.project ? curationOf(this.project.id) : undefined;
  }

  get title(): string {
    return this.i18n.pick(this.curated?.title) || this.project?.title || '';
  }

  get summary(): string {
    return this.i18n.pick(this.curated?.summary) || this.project?.shortDescription || '';
  }

  get galleryImages(): string[] {
    return getProjectImages(this.project);
  }

  get activeImage(): string {
    const imgs = this.galleryImages;
    if (imgs.length === 0) return '';
    const idx = Math.min(Math.max(this.currentImageIndex, 0), imgs.length - 1);
    return imgs[idx];
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadProject();
    } else {
      this.isLoading = false;
    }
  }

  loadProject(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    this.hasConnectionError = false;
    this.currentImageIndex = 0;
    this.isLightboxOpen = false;
    this.projectsService.getProjectById(id).subscribe({
      next: (data) => {
        this.project = data;
        this.currentImageIndex = 0;
        this.isLoading = false;
        this.i18n.setMeta(this.title + this.i18n.copy().meta.projectSuffix, this.summary);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load project details', err);
        this.project = undefined;
        // 404 = proyecto inexistente; cualquier otro fallo se trata como problema de conexión
        this.hasConnectionError = !(err instanceof HttpErrorResponse && err.status === 404);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectImage(index: number): void {
    const total = this.galleryImages.length;
    if (total === 0) return;
    this.currentImageIndex = ((index % total) + total) % total;
  }

  prevImage(event?: Event): void {
    event?.stopPropagation();
    this.selectImage(this.currentImageIndex - 1);
  }

  nextImage(event?: Event): void {
    event?.stopPropagation();
    this.selectImage(this.currentImageIndex + 1);
  }

  openLightbox(): void {
    if (this.galleryImages.length === 0) return;
    this.isLightboxOpen = true;
  }

  closeLightbox(): void {
    this.isLightboxOpen = false;
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0]?.clientX ?? 0;
  }

  onTouchEnd(event: TouchEvent): void {
    if (this.galleryImages.length <= 1) return;
    const endX = event.changedTouches[0]?.clientX ?? 0;
    const delta = endX - this.touchStartX;
    if (Math.abs(delta) > 45) {
      if (delta < 0) {
        this.nextImage();
      } else {
        this.prevImage();
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isBrowser || !this.project) return;
    if (event.key === 'Escape' && this.isLightboxOpen) {
      this.closeLightbox();
      return;
    }
    if (this.galleryImages.length > 1) {
      if (event.key === 'ArrowRight') {
        this.nextImage();
      } else if (event.key === 'ArrowLeft') {
        this.prevImage();
      }
    }
  }

  getTechIcon(tech: string): string {
    return getTechIcon(tech);
  }

  getTechColor(tech: string): string {
    return getTechColor(tech);
  }

  getStatusBadgeClass(status?: string): string {
    if (!status) return '';
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

  getStatusText(status?: string): string {
    return status ? this.i18n.copy().status[status] ?? '' : '';
  }

  getStatusIcon(status?: string): string {
    if (!status) return '';
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
