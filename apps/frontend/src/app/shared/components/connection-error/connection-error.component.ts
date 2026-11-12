import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-connection-error',
  standalone: true,
  templateUrl: './connection-error.component.html',
  styleUrl: './connection-error.component.scss'
})
export class ConnectionErrorComponent {
  @Output() retry = new EventEmitter<void>();
}
