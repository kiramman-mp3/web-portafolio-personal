import { Component, inject } from '@angular/core';
import { I18nService } from '../../shared/i18n/i18n.service';

/** Sección "Sobre mí" de la portada; los textos están en shared/i18n/copy.ts. */
@Component({
  selector: 'app-corporate-about',
  standalone: true,
  templateUrl: './corporate-about.component.html',
  styleUrl: './corporate-about.component.scss',
})
export class CorporateAboutComponent {
  readonly i18n = inject(I18nService);
}
