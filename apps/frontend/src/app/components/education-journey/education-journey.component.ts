import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  afterNextRender,
  inject,
  signal
} from '@angular/core';

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

  steps: JourneyStep[] = [
    {
      node: 'Colegio',
      title: 'Empecé en el colegio',
      text: 'Cursé el Bachillerato General Unificado en la Unidad Educativa 17 de Abril, en el cantón donde vivo.',
      stage: 'Colegio',
      institution: 'Unidad Educativa 17 de Abril',
      program: 'Bachillerato General Unificado · Especialidad en Ciencias',
      place: 'Tungurahua, Ecuador',
      crest: '/img/escudo-17-de-abril.jpg',
      graduation: '20 de junio de 2022',
      refrendation: 'ME-REF-06303245'
    },
    {
      node: 'Universidad',
      title: 'Sigo en Ambato',
      text: 'Hoy estudio Ingeniería en Software en la Universidad Técnica de Ambato, en la capital de la provincia.',
      stage: 'Universidad',
      institution: 'Universidad Técnica de Ambato',
      program: 'Ingeniería en Software',
      place: 'Ambato, Tungurahua, Ecuador',
      crest: '/img/logo-uta.png',
      graduation: '2027 (previsto)',
      status: 'En curso'
    }
  ];

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
