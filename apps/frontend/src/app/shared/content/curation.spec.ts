import { CURATION, byTier, localize } from './curation';

const p = (id: number) => ({ id, title: `T${id}`, shortDescription: `S${id}` });

describe('curation', () => {
  it('groups by tier in editorial order, and treats unknown projects as "principal"', () => {
    const items = [p(8), p(25), p(16), p(999), p(7), p(21)];
    expect(byTier(items, 'destacado').map(x => x.id)).toEqual([16, 21, 25]);
    expect(byTier(items, 'principal').map(x => x.id)).toEqual([7, 999]);
    expect(byTier(items, 'temprano').map(x => x.id)).toEqual([8]);
  });

  it('uses the curated title and summary in each language, falling back to the API text', () => {
    expect(localize(p(16), 'en').title).toBe('La Jones Water & Irrigation Board');
    expect(localize(p(16), 'es').title).toBe('Junta de Agua y Riego La Jones');
    expect(localize(p(999), 'en')).toEqual(p(999));
  });

  it('gives every featured project a role and a full case study in both languages', () => {
    const featured = Object.values(CURATION).filter(c => c.tier === 'destacado');
    expect(featured.length).toBe(6);
    for (const c of featured) {
      expect(c.role?.es && c.role?.en).toBeTruthy();
      const cs = c.caseStudy!;
      for (const text of [cs.problem, cs.solution, cs.result, ...cs.decisions]) {
        expect(text.es.length).toBeGreaterThan(0);
        expect(text.en.length).toBeGreaterThan(0);
      }
    }
  });
});
