export function Footer({ copyright }: { copyright: string }) {
  return (
    <footer>
      <p className="text-body-r-sm leading-body-r-sm text-right">
        {copyright}
        <a
          href="https://html5up.net"
          className="text-body-r-sm leading-body-r-sm"
          target="_blank"
          rel="noreferrer"
          data-gtm="footer_click_html5up"
        >
          HTML5 UP
        </a>
      </p>
    </footer>
  );
}
