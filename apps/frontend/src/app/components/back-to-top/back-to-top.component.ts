import { ChangeDetectionStrategy, Component, HostListener, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { scrollBehavior } from '../../shared/services/scroll.service';

// Distancia de scroll a partir de la cual aparece el botón
const SHOW_AFTER = 700;

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  template: `
    <button type="button" class="back-to-top glass" [class.is-visible]="visible()" [attr.tabindex]="visible() ? 0 : -1"
      aria-label="Volver arriba" (click)="toTop()">
      <i class="fas fa-arrow-up" aria-hidden="true"></i>
    </button>
  `,
  styleUrl: './back-to-top.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackToTopComponent {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  visible = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.isBrowser) return;
    this.visible.set(window.scrollY > SHOW_AFTER);
  }

  toTop(): void {
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
  }
}
