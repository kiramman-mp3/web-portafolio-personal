import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  QueryList,
  ViewChildren,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HeroComponent } from '../../components/hero/hero.component';
import { CorporateAboutComponent } from '../../components/corporate-about/corporate-about.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ExperienceComponent } from '../../components/experience/experience.component';
import { FeaturedProjectsComponent } from '../../components/featured-projects/featured-projects.component';
import { I18nService } from '../../shared/i18n/i18n.service';

interface StoryChapter {
  id: string;
  num: string;
  label: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    CorporateAboutComponent,
    ExperienceComponent,
    FeaturedProjectsComponent,
    FooterComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.sass',
})
export class Home implements AfterViewInit, OnDestroy {
  @ViewChildren('storyChapter') chapterElements!: QueryList<ElementRef<HTMLElement>>;

  readonly i18n = inject(I18nService);
  readonly chapters = computed<StoryChapter[]>(() => {
    const c = this.i18n.copy().chapters;
    return [
      { id: 'capitulo-inicio', num: '01', label: c.hero },
      { id: 'capitulo-sobre-mi', num: '02', label: c.about },
      { id: 'capitulo-experiencia', num: '03', label: c.experience },
      { id: 'capitulo-proyectos', num: '04', label: c.projects },
    ];
  });

  activeChapterIndex = signal(0);
  scrollProgress = signal(0);

  private isBrowser = false;
  private reduceMotion = false;
  private rafId = 0;
  private boundScroll = () => this.scheduleScrollUpdate();

  constructor(
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.boundScroll, { passive: true });
      window.addEventListener('resize', this.boundScroll, { passive: true });
      this.updateScrollStory();
    });
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    window.removeEventListener('scroll', this.boundScroll);
    window.removeEventListener('resize', this.boundScroll);
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  scrollToChapter(chapterId: string): void {
    if (!this.isBrowser) return;
    const target = document.getElementById(chapterId);
    if (!target) return;
    target.scrollIntoView({
      behavior: this.reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  private scheduleScrollUpdate(): void {
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = 0;
      this.updateScrollStory();
    });
  }

  private updateScrollStory(): void {
    const doc = document.documentElement;
    const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const overall = Math.min(1, Math.max(0, window.scrollY / maxScroll));

    const elements = this.chapterElements?.toArray() ?? [];
    const vh = window.innerHeight || 800;
    let closestIdx = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    elements.forEach((ref, idx) => {
      const el = ref.nativeElement;
      const rect = el.getBoundingClientRect();
      // Reveal progress 0 -> 1 as chapter enters lower 88% of viewport toward upper third
      const enterProgress = this.reduceMotion
        ? 1
        : Math.min(1, Math.max(0, (vh * 0.92 - rect.top) / (vh * 0.52)));
      el.style.setProperty('--chapter-reveal', enterProgress.toFixed(4));

      const focusDist = Math.abs(rect.top - vh * 0.22);
      if (focusDist < bestDistance) {
        bestDistance = focusDist;
        closestIdx = idx;
      }
    });

    if (closestIdx !== this.activeChapterIndex() || Math.abs(overall - this.scrollProgress()) > 0.002) {
      this.ngZone.run(() => {
        this.activeChapterIndex.set(closestIdx);
        this.scrollProgress.set(overall);
      });
    }
  }
}
