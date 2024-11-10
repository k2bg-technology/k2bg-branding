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
          {/* eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content */}
          <a
            href="https://html5up.net"
            className="text-body-r-sm leading-body-r-sm"
            target="_blank"
            rel="noreferrer"
          />
        </Trans>
      </p>
    </footer>
  );
}
