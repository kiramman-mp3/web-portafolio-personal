import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { I18nService } from '../../shared/i18n/i18n.service';

/** Experiencia con clientes reales; los textos están en shared/i18n/copy.ts. */
@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperienceComponent {
  readonly i18n = inject(I18nService);

  /** Dominio del enlace, sin protocolo ni barra final, para mostrarlo como texto. */
  host(url: string): string {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
}
