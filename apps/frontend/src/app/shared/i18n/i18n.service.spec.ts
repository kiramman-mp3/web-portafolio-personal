import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { I18nService } from './i18n.service';

@Component({ template: '' })
class Blank {}

const pages = [{ path: '', component: Blank }, { path: 'proyectos/:id', component: Blank }];

describe('I18nService', () => {
  let router: Router;
  let i18n: I18nService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'en', children: pages }, ...pages])]
    });
    router = TestBed.inject(Router);
    i18n = TestBed.inject(I18nService);
  });

  it('serves Spanish at the root and builds unprefixed links', async () => {
    await router.navigateByUrl('/proyectos/16');
    expect(i18n.lang()).toBe('es');
    expect(i18n.link('/proyectos')).toBe('/proyectos');
    expect(i18n.switchUrl()).toBe('/en/proyectos/16');
    expect(document.documentElement.lang).toBe('es');
  });

  it('serves English under /en and keeps the page when switching back', async () => {
    await router.navigateByUrl('/en/proyectos/16');
    expect(i18n.lang()).toBe('en');
    expect(i18n.link('/')).toBe('/en');
    expect(i18n.link('/contacto')).toBe('/en/contacto');
    expect(i18n.switchUrl()).toBe('/proyectos/16');
    expect(i18n.copy().nav.projects).toBe('Projects');
  });

  it('switches the home page between / and /en', async () => {
    await router.navigateByUrl('/en');
    expect(i18n.switchUrl()).toBe('/');
    await router.navigateByUrl('/');
    expect(i18n.switchUrl()).toBe('/en');
  });
});
