import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectsService, Project, getProjectCover, getProjectImages } from '../../shared/services/projects.service';
import { FooterComponent } from '../../components/footer/footer.component';
import { ConnectionErrorComponent } from '../../shared/components/connection-error/connection-error.component';
import { getTechIcon, getTechColor } from '../../shared/constants/tech-list';

@Component({
  selector: 'app-proyectos-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent, ConnectionErrorComponent],
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.scss'
})
export class ProyectosComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  currentFilter = 'todos';
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
        this.projects = data;
        this.setFilter(this.currentFilter);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.projects = [];
        this.filteredProjects = [];
        this.hasError = true;
        this.isLoading = false;
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

  getTechIcon(tech: string): string {
    return getTechIcon(tech);
  }

  getTechColor(tech: string): string {
    return getTechColor(tech);
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    if (filter === 'todos') {
      this.filteredProjects = this.projects;
    } else {
      this.filteredProjects = this.projects.filter(p => p.status === filter);
    }
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
