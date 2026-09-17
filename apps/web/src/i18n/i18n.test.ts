import { describe, expect, it } from 'vitest';
import { DEFAULT_LANGUAGE, UI_LANGUAGES } from './index';
import enLocale from './locales/en.json';
import itLocale from './locales/it.json';

/** Collect every leaf key path in a nested translation object. */
function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix === '' ? key : `${prefix}.${key}`),
  );
}

describe('i18n', () => {
  it('offers Italian and English', () => {
    expect(UI_LANGUAGES).toEqual(['it', 'en']);
  });

  it('defaults to Italian (SPEC §2.1)', () => {
    expect(DEFAULT_LANGUAGE).toBe('it');
  });

  it('has the same key set in both locales', () => {
    expect(keyPaths(enLocale).sort()).toEqual(keyPaths(itLocale).sort());
  });

  it('leaves no translation empty', () => {
    for (const [lang, bundle] of Object.entries({ it: itLocale, en: enLocale })) {
      for (const path of keyPaths(bundle)) {
        const value = path
          .split('.')
          .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)[key], bundle);
        expect(typeof value, `${lang}.${path}`).toBe('string');
        expect((value as string).length, `${lang}.${path}`).toBeGreaterThan(0);
      }
    }
  });

  it('covers every category shortcut from SPEC §1.1', () => {
    const categories = [
      'ristoranti',
      'alloggi',
      'rifugi',
      'punti_panoramici',
      'parcheggi',
      'fontane',
      'vie_ferrate',
      'gite',
    ];
    for (const category of categories) {
      expect(Object.keys(itLocale.categories)).toContain(category);
      expect(Object.keys(enLocale.categories)).toContain(category);
    }
  });
});
