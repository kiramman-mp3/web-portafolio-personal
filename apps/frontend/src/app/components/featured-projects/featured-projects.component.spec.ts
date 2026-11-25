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

// Desordenado y mezclado a propósito: la portada solo muestra los destacados, en su orden
const MOCK_PROJECTS: Project[] = [
  base(8, 'WikiCraft'),
  base(21, 'Sistema de Rastreo de Buses UTA'),
  base(7, 'TunguMarket'),
  base(17, 'Ecosistema Karen'),
  base(16, 'Junta de Agua y Riego "La Jones"'),
];

describe('FeaturedProjectsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedProjectsComponent],
      providers: [
        provideRouter([]),
        { provide: ProjectsService, useValue: { getProjects: () => of(MOCK_PROJECTS) } },
      ],
    }).compileComponents();
  });

  it('shows only featured projects, in editorial order, with curated titles', () => {
    const fixture = TestBed.createComponent(FeaturedProjectsComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    expect(comp.featuredProjects.map(p => p.id)).toEqual([16, 17, 21]);
    expect(comp.totalProjects).toBe(5);

    const titles = [...fixture.nativeElement.querySelectorAll('.project-title')].map((el: Element) => el.textContent?.trim());
    expect(titles).toEqual(['Junta de Agua y Riego La Jones', 'Ecosistema Karen', 'Rastreo de Buses UTA']);
    expect(fixture.nativeElement.querySelector('.btn-view-all').textContent).toContain('(5)');
  });
});
