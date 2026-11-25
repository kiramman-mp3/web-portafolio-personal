import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectsService, Project, getProjectCover, getProjectImages } from '../../shared/services/projects.service';
import { ConnectionErrorComponent } from '../../shared/components/connection-error/connection-error.component';
import { I18nService } from '../../shared/i18n/i18n.service';
import { byTier, localize } from '../../shared/content/curation';

@Component({
  selector: 'app-featured-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, ConnectionErrorComponent],
  templateUrl: './featured-projects.component.html',
  styleUrl: './featured-projects.component.scss'
})
export class FeaturedProjectsComponent implements OnInit {
  readonly i18n = inject(I18nService);
  featuredProjects: Project[] = [];
  totalProjects = 0;
  isBrowser = false;
  hasError = false;

  constructor(
    private projectsService: ProjectsService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadProjects();
    }
  }

  loadProjects(): void {
    this.hasError = false;
    this.projectsService.getProjects().subscribe({
      next: (projects) => {
        // En la portada solo van los destacados, en el orden editorial y con el título del idioma actual
        const lang = this.i18n.lang();
        this.featuredProjects = byTier(projects, 'destacado').map(p => localize(p, lang));
        this.totalProjects = projects.length;
        this.cdr.detectChanges();
      },
      error: () => {
        this.featuredProjects = [];
        this.hasError = true;
        this.cdr.detectChanges();
      }
    });
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

