import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { FeaturedProjectsComponent } from './featured-projects.component';
import { Project, ProjectsService } from '../../shared/services/projects.service';

const MOCK_PROJECTS: Project[] = [
  {
    id: 7,
    title: 'TunguMarket',
    shortDescription: 'Marketplace local para Tungurahua.',
    description: '# TunguMarket',
    technologies: ['React', 'Node.js', 'PostgreSQL'],
    status: 'completado',
    image: 'https://example.com/tungu-1.jpg',
    images: ['https://example.com/tungu-1.jpg', 'https://example.com/tungu-2.jpg'],
    githubUrl: 'https://github.com/kiramman-mp3/sistema-ecommerce-local',
    webUrl: 'https://tungumarket.madebyjohan.xyz/',
  },
  {
    id: 8,
    title: 'WikiCraft',
    shortDescription: 'Enciclopedia interactiva de Minecraft.',
    description: '# WikiCraft',
    technologies: ['HTML5', 'CSS3', 'JavaScript'],
    status: 'completado',
    image: 'https://example.com/wiki-1.jpg',
    images: ['https://example.com/wiki-1.jpg'],
  },
  {
    id: 21,
    title: 'Sistema de Rastreo de Buses UTA',
    shortDescription: 'Rastreo GPS en vivo para buses universitarios.',
    description: '# Buses UTA',
    technologies: ['Odoo', 'Python', 'Traccar'],
    status: 'completado',
    image: 'https://example.com/buses-1.jpg',
    images: ['https://example.com/buses-1.jpg', 'https://example.com/buses-2.jpg'],
  },
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

  it('loads real projects and falls back cleanly when WebGL is unavailable', () => {
    const fixture = TestBed.createComponent(FeaturedProjectsComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    expect(comp.featuredProjects.length).toBe(3);
    expect(comp.activeProject?.title).toBe('TunguMarket');
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
    expect(comp.activeProject?.title).toBe('WikiCraft');

    comp.onCarouselKeyDown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(comp.selectedIndex).toBe(2);
    expect(comp.activeProject?.title).toBe('Sistema de Rastreo de Buses UTA');

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
