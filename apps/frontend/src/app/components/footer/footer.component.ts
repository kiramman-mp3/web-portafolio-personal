import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoMarkComponent } from '../logo-mark/logo-mark.component';
import { RouterModule } from '@angular/router';
import { CV_URL, LINKEDIN_URL } from '../../shared/constants/profile';

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
  readonly cvUrl = CV_URL;
}


