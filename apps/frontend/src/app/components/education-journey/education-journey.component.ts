import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  afterNextRender,
  computed,
  inject,
  signal
} from '@angular/core';
import { I18nService } from '../../shared/i18n/i18n.service';

interface JourneyStep {
  node: string;
  title: string;
  text: string;
  stage: string;
  institution: string;
  program: string;
  place: string;
  status?: string;
  crest?: string;
  graduation?: string;
  refrendation?: string;
}

// Recorrido académico: se activa el paso que cruza la línea central de la ventana
// y el cometa del panel viaja de un lugar al siguiente. Se calcula en cada scroll
// sobre el DOM actual, así no depende de nodos observados que Angular pueda recrear.
@Component({
  selector: 'app-education-journey',
  standalone: true,
  templateUrl: './education-journey.component.html',
  styleUrl: './education-journey.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EducationJourneyComponent {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  active = signal(0);

  readonly i18n = inject(I18nService);

  // Datos fijos de cada paso; los textos traducibles vienen de copy.ts (education.steps), en el mismo orden
  private readonly fixed = [
    { institution: 'Unidad Educativa 17 de Abril', crest: '/img/escudo-17-de-abril.jpg', refrendation: 'ME-REF-06303245' },
    { institution: 'Universidad Técnica de Ambato', crest: '/img/logo-uta.png' }
  ];

  readonly steps = computed<JourneyStep[]>(() =>
    this.i18n.copy().education.steps.map((step, i) => ({
      ...step,
      ...this.fixed[i],
      status: step.status || undefined
    }))
  );

  constructor() {
    // afterNextRender solo corre en el navegador y ya con los pasos hidratados en el DOM
    afterNextRender(() => this.updateActive());
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  updateActive(): void {
    const steps = this.host.nativeElement.querySelectorAll<HTMLElement>('.journey-step');
    const mid = window.innerHeight / 2;
    let current = 0;
    steps.forEach((el, i) => {
      if (el.getBoundingClientRect().top <= mid) current = i;
    });
    this.active.set(current);
  }
}
