'use client';

import { Trans } from 'react-i18next';

import { useTranslation } from '../../i18n/client';
import { Language } from '../../i18n/settings';

export function Footer({ lng }: { lng: Language }) {
  useTranslation(lng);

  return (
    <footer>
      <p className="text-body-r-sm leading-body-r-sm text-right">
        <Trans i18nKey="footer.copyright">
          <a
            href="https://html5up.net"
            className="text-body-r-sm leading-body-r-sm"
            target="_blank"
            rel="noreferrer"
            data-gtm="footer_click_html5up"
          />
        </Trans>
      </p>
    </footer>
  );
}
