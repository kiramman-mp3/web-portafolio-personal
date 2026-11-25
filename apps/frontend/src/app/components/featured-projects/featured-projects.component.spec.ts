import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { FeaturedProjectsComponent } from './featured-projects.component';
import { Project, ProjectsService } from '../../shared/services/projects.service';

const base = (id: number, title: string): Project => ({
  id,
  title,
  shortDescription: `Descripción de ${title}.`,
  description: `# ${title}`,
  technologies: ['TypeScript'],
  status: 'completado',
  image: `https://example.com/${id}-1.jpg`,
  images: [`https://example.com/${id}-1.jpg`, `https://example.com/${id}-2.jpg`],
});

// Viene desordenado y mezclado a propósito: la portada solo muestra los destacados, en su orden
const MOCK_PROJECTS: Project[] = [
  base(8, 'WikiCraft'),               // primeros proyectos: no va en la portada
  base(21, 'Sistema de Rastreo de Buses UTA'),
  base(7, 'TunguMarket'),             // "más proyectos": no va en la portada
  base(17, 'Ecosistema Karen'),
  base(16, 'Junta de Agua y Riego "La Jones"'),
];

describe('FeaturedProjectsComponent', () => {
  beforeEach(async () => {
    window.history.replaceState({}, '', '/');

    await TestBed.configureTestingModule({
      imports: [FeaturedProjectsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProjectsService,
          useValue: {
            getProjects: () => of(MOCK_PROJECTS),
          },
        },
      ],
    }).compileComponents();
  });

  it('shows only featured projects, in editorial order, with curated titles', () => {
    const fixture = TestBed.createComponent(FeaturedProjectsComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    expect(comp.featuredProjects.map(p => p.id)).toEqual([16, 17, 21]);
    expect(comp.totalProjects).toBe(5);
    expect(comp.activeProject?.title).toBe('Junta de Agua y Riego La Jones');
    expect(comp.isWebGLUnavailable).toBe(true);

    const cards = fixture.nativeElement.querySelectorAll('.project-card');
    expect(cards.length).toBe(3);
  });

  it('navigates projects with controls, keyboard arrows, and reset', () => {
    const fixture = TestBed.createComponent(FeaturedProjectsComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    comp.nextProject();
    expect(comp.selectedIndex).toBe(1);
    expect(comp.activeProject?.title).toBe('Ecosistema Karen');

    comp.onCarouselKeyDown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(comp.selectedIndex).toBe(2);
    expect(comp.activeProject?.title).toBe('Rastreo de Buses UTA');

    comp.onCarouselKeyDown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(comp.selectedIndex).toBe(1);

    comp.resetCarousel();
    expect(comp.selectedIndex).toBe(0);
  });

  it('honors initial ?project=<id> deep-link query param and pause toggle', () => {
    window.history.replaceState({}, '', '/?project=21');
    const fixture = TestBed.createComponent(FeaturedProjectsComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    expect(comp.selectedIndex).toBe(2);
    expect(comp.activeProject?.id).toBe(21);

    expect(comp.isPaused).toBe(false);
    comp.togglePause();
    expect(comp.isPaused).toBe(true);
  });
});
