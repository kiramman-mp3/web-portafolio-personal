import { Component, EventEmitter, Output, inject } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'app-connection-error',
  standalone: true,
  templateUrl: './connection-error.component.html',
  styleUrl: './connection-error.component.scss'
})
export class ConnectionErrorComponent {
  readonly i18n = inject(I18nService);
  @Output() retry = new EventEmitter<void>();
}
