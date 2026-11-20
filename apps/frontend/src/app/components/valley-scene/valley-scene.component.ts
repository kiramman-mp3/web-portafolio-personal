import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, PLATFORM_ID, ViewChild, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { ValleyWorld } from '../../shared/valley/valley-world';
import { ValleyService } from '../../shared/services/valley.service';

/**
 * Lienzo fijo detrás de todo el sitio con el valle de Tungurahua.
 * Three.js se carga aparte y solo en el navegador, así no pesa en el render del servidor.
 */
@Component({
  selector: 'app-valley-scene',
  standalone: true,
  template: `
    <canvas #canvas class="valley-canvas" aria-hidden="true"></canvas>
    <div class="valley-veil" [class.is-ambient]="valley.mode() === 'ambient'" aria-hidden="true"></div>
    @if (failed()) {
      <div class="valley-fallback" aria-hidden="true"></div>
    }
  `,
  styleUrl: './valley-scene.component.sass',
})
export class ValleySceneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  protected readonly valley = inject(ValleyService);
  protected readonly failed = signal(false);
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private world?: ValleyWorld;
  private readonly onResize = () => this.world?.resize();

  constructor() {
    effect(() => {
      const mode = this.valley.mode(), journey = this.valley.journey(), active = this.valley.active();
      this.world?.setMode(mode);
      this.world?.setJourney(journey);
      this.world?.setActive(active);
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) return;
    try {
      const { ValleyWorld } = await import('../../shared/valley/valley-world');
      // El bucle de animación corre fuera de Angular para no disparar detección de cambios
      this.zone.runOutsideAngular(() => {
        this.world = new ValleyWorld(this.canvas.nativeElement);
        this.world.setMode(this.valley.mode());
        this.world.setJourney(this.valley.journey());
        this.world.setActive(this.valley.active());
        window.addEventListener('resize', this.onResize);
      });
    } catch {
      // Sin WebGL: queda un degradado con los colores del valle
      this.failed.set(true);
    }
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    window.removeEventListener('resize', this.onResize);
    this.world?.dispose();
  }
}
