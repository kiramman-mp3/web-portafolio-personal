import { Injectable, signal } from '@angular/core';
import type { ValleyMode } from '../valley/valley-world';

/**
 * Estado compartido del valle 3D de fondo. La página de inicio lo usa en modo recorrido
 * (la cámara sigue el scroll); el resto del sitio lo deja en modo ambiente.
 */
@Injectable({ providedIn: 'root' })
export class ValleyService {
  readonly mode = signal<ValleyMode>('ambient');
  /** Posición continua en el recorrido, en capítulos (ver KEYFRAMES). */
  readonly journey = signal(0);
  /** Parada resaltada: sus edificios y luces se encienden. */
  readonly active = signal<string | null>(null);
}
