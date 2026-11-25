import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectsService, Project, getProjectCover, getProjectImages } from '../../shared/services/projects.service';
import { FooterComponent } from '../../components/footer/footer.component';
import { ConnectionErrorComponent } from '../../shared/components/connection-error/connection-error.component';
import { getTechIcon, getTechColor } from '../../shared/constants/tech-list';
import { I18nService } from '../../shared/i18n/i18n.service';
import { Tier, byTier, curationOf, localize } from '../../shared/content/curation';

interface ProjectGroup {
  tier: Tier;
  projects: Project[];
}

@Component({
  selector: 'app-proyectos-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent, ConnectionErrorComponent],
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.scss'
})
export class ProyectosComponent implements OnInit {
  readonly i18n = inject(I18nService);
  groups: ProjectGroup[] = [];
  total = 0;
  isBrowser = false;
  isLoading = true;
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
    } else {
      this.isLoading = false;
    }
  }

  loadProjects(): void {
    this.isLoading = true;
    this.hasError = false;
    this.projectsService.getProjects().subscribe({
      next: (data) => {
        // Tres grupos: destacados, el resto, y los primeros proyectos pendientes de refactorizar
        const lang = this.i18n.lang();
        this.total = data.length;
        this.groups = (['destacado', 'principal', 'temprano'] as Tier[]).map(tier => ({
          tier,
          projects: byTier(data, tier).map(p => localize(p, lang))
        }));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.groups = [];
        this.total = 0;
        this.hasError = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  roleOf(project: Project): string {
    return this.i18n.pick(curationOf(project.id)?.role);
  }

  getCoverImage(project: Project): string {
    return getProjectCover(project);
  }

  getImageCount(project: Project): number {
    return getProjectImages(project).length;
  }

  getTechIcon(tech: string): string {
    return getTechIcon(tech);
  }

  getTechColor(tech: string): string {
    return getTechColor(tech);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'completado': return 'badge-completed';
      case 'en-progreso': return 'badge-progress';
      case 'planificado': return 'badge-planned';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    return this.i18n.copy().status[status] ?? '';
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completado': return 'fa-check';
      case 'en-progreso': return 'fa-clock';
      case 'planificado': return 'fa-calendar';
      default: return '';
    }
  }
}
