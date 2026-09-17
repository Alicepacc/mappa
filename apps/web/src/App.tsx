import { PLACE_CATEGORIES } from '@mappa/shared';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { APP_NAME, API_BASE, MILESTONE } from './config';
import { UI_LANGUAGES, type UiLanguage, rememberLanguage } from './i18n';
import { parseUrlState } from './lib/url-state';

type Probe = 'checking' | 'ok' | 'down';

interface GatewayState {
  health: Probe;
  coverageExact: boolean | null;
}

/**
 * M0 shell.
 *
 * Deliberately not a map: M0 is the scaffold milestone (SPEC §8). What this
 * screen does prove is that the pieces M2 will build on are wired — i18n with
 * the Italian default, the token-driven theme in light and dark, the URL state
 * codec, and a live connection to the gateway.
 */
export default function App(): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const [gateway, setGateway] = useState<GatewayState>({ health: 'checking', coverageExact: null });

  // Read the shareable URL contract (SPEC §1.4) so a link opens where it should.
  const urlState = parseUrlState(window.location.search);

  useEffect(() => {
    const controller = new AbortController();

    async function probe(): Promise<void> {
      try {
        const [health, coverage] = await Promise.all([
          fetch(`${API_BASE}/api/health`, { signal: controller.signal }),
          fetch(`${API_BASE}/api/coverage`, { signal: controller.signal }),
        ]);
        const coverageBody = (await coverage.json()) as { properties?: { exact?: boolean } };
        setGateway({
          health: health.ok ? 'ok' : 'down',
          coverageExact: coverageBody.properties?.exact ?? null,
        });
      } catch {
        if (!controller.signal.aborted) {
          setGateway({ health: 'down', coverageExact: null });
        }
      }
    }

    void probe();
    return () => {
      controller.abort();
    };
  }, []);

  // Keep <html lang> in step with the active UI language, for screen readers
  // and for correct hyphenation (SPEC §5 accessibility).
  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage ?? 'it';
  }, [i18n.resolvedLanguage]);

  const changeLanguage = (lang: UiLanguage): void => {
    void i18n.changeLanguage(lang);
    rememberLanguage(lang);
  };

  return (
    <>
      <a className="skip-link" href="#main">
        {t('app.skipToContent')}
      </a>

      <div className="shell">
        <header className="shell__header">
          <div>
            <h1 className="shell__title">{APP_NAME}</h1>
            <p className="shell__tagline">{t('app.tagline')}</p>
          </div>

          <div className="lang-switch" role="group" aria-label={t('language.label')}>
            {UI_LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                className="lang-switch__button"
                aria-pressed={i18n.resolvedLanguage === lang}
                onClick={() => {
                  changeLanguage(lang);
                }}
              >
                {t(`language.${lang}`)}
              </button>
            ))}
          </div>
        </header>

        <main id="main" className="panel">
          <h2 className="panel__title">{t('status.scaffold')}</h2>
          <p className="panel__body">{t('status.scaffoldBody')}</p>

          <ul className="status-list" aria-live="polite">
            <li className="status-list__item">
              <span
                className={`dot ${gateway.health === 'ok' ? 'dot--ok' : gateway.health === 'down' ? 'dot--down' : ''}`}
                aria-hidden="true"
              />
              <span>
                {gateway.health === 'checking'
                  ? t('status.checking')
                  : gateway.health === 'ok'
                    ? t('status.gatewayOk')
                    : t('status.gatewayDown')}
              </span>
            </li>

            {gateway.coverageExact !== null && (
              <li className="status-list__item">
                <span
                  className={`dot ${gateway.coverageExact ? 'dot--ok' : ''}`}
                  aria-hidden="true"
                />
                <span>
                  {gateway.coverageExact ? t('status.coverageExact') : t('status.coverageFallback')}
                </span>
              </li>
            )}
          </ul>

          <ul className="chips">
            {PLACE_CATEGORIES.map((category) => (
              <li key={category} className="chip">
                {t(`categories.${category}`)}
              </li>
            ))}
          </ul>
        </main>

        <footer className="shell__footer">
          <p>
            {MILESTONE} · {t('attribution.osm')}
          </p>
          <p>
            <code>
              x={urlState.view.lon} y={urlState.view.lat} z={urlState.view.zoom} l=
              {urlState.layer}
            </code>
          </p>
        </footer>
      </div>
    </>
  );
}
