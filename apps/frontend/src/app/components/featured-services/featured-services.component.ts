import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ServicesService, ServiceItem } from '../../shared/services/services.service';
import { ConnectionErrorComponent } from '../../shared/components/connection-error/connection-error.component';

@Component({
  selector: 'app-featured-services',
  standalone: true,
  imports: [CommonModule, RouterModule, ConnectionErrorComponent],
  templateUrl: './featured-services.component.html',
  styleUrl: './featured-services.component.scss'
})
export class FeaturedServicesComponent implements OnInit {
  featuredServices: ServiceItem[] = [];
  isBrowser = false;
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
    }
  }

  loadServices(): void {
    this.hasError = false;
    this.servicesService.getServices().subscribe({
      next: (services) => {
        this.featuredServices = services;
        this.cdr.detectChanges();
      },
      error: () => {
        this.featuredServices = [];
        this.hasError = true;
        this.cdr.detectChanges();
      }
    });
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

