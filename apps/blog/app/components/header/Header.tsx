import React from 'react';
import Link from 'next/link';
import { Button } from 'ui';

import { CompanyLogo } from '../company-logo/CompanyLogo';

export default function Header() {
  return (
    <header>
      <div className="flex place-items-center bg-base-white/50 h-full">
        <div className="mx-auto w-[1140px] px-4 sm:px-6 lg:px-15">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/">
                <span className="sr-only">Home</span>
                <CompanyLogo className="text-base-black hover:opacity-90" />
              </Link>
            </div>
            <div>
              <nav aria-label="Global">
                <ul className="flex items-center gap-x-4">
                  <li>
                    <Link href="/" passHref>
                      <Button
                        className="font-normal"
                        color="dark"
                        variant="text"
                      >
                        Engineering
                      </Button>
                    </Link>
                  </li>

                  <li>
                    <Link href="/" passHref>
                      <Button
                        className="font-normal"
                        color="dark"
                        variant="text"
                      >
                        Design
                      </Button>
                    </Link>
                  </li>

                  <li>
                    <Link href="/" passHref>
                      <Button
                        className="font-normal"
                        color="dark"
                        variant="text"
                      >
                        Data Science
                      </Button>
                    </Link>
                  </li>

                  <li>
                    <Link href="/" passHref>
                      <Button
                        className="font-normal"
                        color="dark"
                        variant="text"
                      >
                        Life Style
                      </Button>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            <div className="flex items-center gap-x-4">
              <Link href="/" passHref>
                <Button className="font-normal" color="dark" variant="text">
                  Concept
                </Button>
              </Link>

              <Link href="/" passHref>
                <Button className="font-normal" color="dark" variant="text">
                  Contact
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
