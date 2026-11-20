import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, PLATFORM_ID, ViewChild, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CV_URL, GITHUB_URL, LINKEDIN_URL } from '../../shared/constants/profile';

/** Frases que se escriben solas después de «que construye». */
const PHRASES = ['sistemas para Tungurahua.', 'apps web de punta a punta.', 'interfaces con React y Angular.', 'APIs con Node y NestJS.'];

/**
 * Portada del inicio: noche andina con estrellas, el nombre entrando letra por letra y los
 * contactos. Al hacer scroll se desvanece y deja paso al valle 3D.
 */
@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home-hero.component.html',
  styleUrl: './home-hero.component.sass',
})
export class HomeHeroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sky', { static: true }) sky!: ElementRef<HTMLCanvasElement>;

  readonly cvUrl = CV_URL;
  readonly githubUrl = GITHUB_URL;
  readonly linkedinUrl = LINKEDIN_URL;
  readonly firstName = [...'Johan'];
  readonly lastName = [...'Rodríguez'];
  readonly typed = signal('');

  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private timer = 0;
  private frame = 0;

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      this.typed.set(PHRASES[0]);
    } else {
      // Arranca cuando el nombre ya terminó de entrar
      this.timer = window.setTimeout(() => this.type(0, 0, false), 1500);
    }
    this.zone.runOutsideAngular(() => this.drawStars(reduce));
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
    cancelAnimationFrame(this.frame);
  }

  /** Máquina de escribir: escribe la frase, espera, la borra y pasa a la siguiente. */
  private type(index: number, length: number, deleting: boolean): void {
    const phrase = PHRASES[index];
    const next = length + (deleting ? -1 : 1);
    this.typed.set(phrase.slice(0, next));
    if (!deleting && next === phrase.length) {
      this.timer = window.setTimeout(() => this.type(index, next, true), 2200);
    } else if (deleting && next === 0) {
      this.timer = window.setTimeout(() => this.type((index + 1) % PHRASES.length, 0, false), 350);
    } else {
      this.timer = window.setTimeout(() => this.type(index, next, deleting), deleting ? 28 : 55);
    }
  }

  /** Cielo estrellado con titileo suave. */
  private drawStars(still: boolean): void {
    const canvas = this.sky.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const ratio = Math.min(window.devicePixelRatio, 2);
    const stars = Array.from({ length: 260 }, () => ({
      x: Math.random(), y: Math.random() * 0.85, r: Math.random() * 1.2 + 0.3,
      phase: Math.random() * Math.PI * 2, speed: 0.6 + Math.random() * 1.6,
    }));

    const paint = (time: number) => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== w * ratio || canvas.height !== h * ratio) {
        canvas.width = w * ratio;
        canvas.height = h * ratio;
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const alpha = still ? 0.7 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time / 1000 * s.speed + s.phase));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#eaf2ff';
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!still) this.frame = requestAnimationFrame(paint);
    };
    this.frame = requestAnimationFrame(paint);
  }
}
