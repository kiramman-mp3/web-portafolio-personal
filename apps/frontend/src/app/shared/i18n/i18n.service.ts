import { Injectable, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { COPY, Copy, Lang } from './copy';

/**
 * Idioma del sitio según la URL: español en "/", inglés bajo "/en".
 * Los componentes leen los textos de `copy()` y arman los enlaces con `link()`.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private router = inject(Router);
  private document = inject(DOCUMENT);
  private title = inject(Title);
  private meta = inject(Meta);

  readonly lang = signal<Lang>(langOf(this.router.url));
  readonly copy = computed<Copy>(() => COPY[this.lang()]);

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(e => {
      const lang = langOf((e as NavigationEnd).urlAfterRedirects);
      this.lang.set(lang);
      this.document.documentElement.lang = lang;
      const page = deepest(this.router.routerState.snapshot.root).data['page'] as keyof Copy['meta'] | undefined;
      if (page && page !== 'projectSuffix') {
        const m = this.copy().meta[page];
        this.setMeta(m.title, m.description);
      }
    });
  }

  /** Título, descripción y vista previa social de la página actual. */
  setMeta(title: string, description: string): void {
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:locale', content: this.lang() === 'es' ? 'es_EC' : 'en_US' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    // URL canónica y versiones en cada idioma, para que Google no las trate como duplicadas
    const path = this.router.url.split(/[?#]/)[0];
    const esPath = path.replace(/^\/en(?=\/|$)/, '') || '/';
    const enPath = esPath === '/' ? '/en' : `/en${esPath}`;
    const url = SITE + (path === '/' ? '/' : path);
    this.meta.updateTag({ property: 'og:url', content: url });
    this.setLink('canonical', url);
    this.setLink('alternate', SITE + (esPath === '/' ? '/' : esPath), 'es');
    this.setLink('alternate', SITE + enPath, 'en');
  }

  private setLink(rel: string, href: string, hreflang?: string): void {
    const head = this.document.head;
    const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
    let el = head.querySelector<HTMLLinkElement>(selector);
    if (!el) {
      el = this.document.createElement('link');
      el.rel = rel;
      if (hreflang) el.hreflang = hreflang;
      head.appendChild(el);
    }
    el.href = href;
  }

  /** Ruta interna en el idioma actual: link('/proyectos') -> '/en/proyectos' en inglés. */
  link(path: string): string {
    const clean = path.startsWith('/') ? path : `/${path}`;
    if (this.lang() === 'es') return clean;
    return clean === '/' ? '/en' : `/en${clean}`;
  }

  /** La misma página en el otro idioma, para el selector ES/EN. */
  switchUrl(): string {
    const [path, rest = ''] = this.router.url.split(/(?=[?#])/);
    const base = path.replace(/^\/en(?=\/|$)/, '') || '/';
    const target = this.lang() === 'es' ? (base === '/' ? '/en' : `/en${base}`) : base;
    return target + rest;
  }

  /** Elige el texto del idioma actual de un par { es, en }. */
  pick(text: { es: string; en: string } | undefined): string {
    return text ? text[this.lang()] : '';
  }
}

const SITE = 'https://madebyjohan.xyz';

function deepest(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  return route.firstChild ? deepest(route.firstChild) : route;
}

function langOf(url: string): Lang {
  return /^\/en(\/|$|\?|#)/.test(url) ? 'en' : 'es';
}
