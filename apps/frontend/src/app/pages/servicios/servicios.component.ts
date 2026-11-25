import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ServicesService, ServiceItem } from '../../shared/services/services.service';
import { FooterComponent } from '../../components/footer/footer.component';
import { ConnectionErrorComponent } from '../../shared/components/connection-error/connection-error.component';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { getTechIcon, getTechColor } from '../../shared/constants/tech-list';
import { I18nService } from '../../shared/i18n/i18n.service';

@Component({
  selector: 'app-servicios-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent, MarkdownPipe, ConnectionErrorComponent],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.scss'
})
export class ServiciosComponent implements OnInit {
  readonly i18n = inject(I18nService);
  services: ServiceItem[] = [];
  isBrowser = false;
  isLoading = true;
  hasError = false;

  constructor(
    private servicesService: ServicesService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadServices();
    } else {
      this.isLoading = false;
    }
  }

  loadServices(): void {
    this.isLoading = true;
    this.hasError = false;
    this.servicesService.getServices().subscribe({
      next: (data) => {
        // Los textos de cada servicio salen de copy.ts en el idioma actual; la API aporta imagen y tecnologías
        const items = this.i18n.copy().services.items;
        this.services = data.map(svc => ({ ...svc, ...(items[svc.id] ?? {}) }));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.services = [];
        this.hasError = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getTechIcon(tech: string): string {
    return getTechIcon(tech);
  }

  getTechColor(tech: string): string {
    return getTechColor(tech);
  }

  getServiceIcon(id: string): string {
    const icons: { [key: string]: string } = {
      'web-dev': 'fa-code',
      'ui-ux': 'fa-palette',
      'ai-solutions': 'fa-brain'
    };
    return icons[id] || 'fa-star';
  }
}
