import { inject, Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoMarkComponent } from '../logo-mark/logo-mark.component';
import { RouterModule } from '@angular/router';
import { LINKEDIN_URL } from '../../shared/constants/profile';
import { I18nService } from '../../shared/i18n/i18n.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoMarkComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  readonly linkedinUrl = LINKEDIN_URL;
  readonly i18n = inject(I18nService);
}


