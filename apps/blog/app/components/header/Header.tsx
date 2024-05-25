import React from 'react';
import Link from 'next/link';
import { Button, Drawer, DropdownMenu, DropdownMenuItem, Icon } from 'ui';

import { CompanyLogo } from '../company-logo/CompanyLogo';
import Sidebar from '../sidebar/Sidebar';
import Search from '../search/Search';

export default function Header() {
  return (
    <header>
      <div className="flex place-items-center bg-base-white/50 h-full">
        <div className="mx-auto w-full md:w-[72rem] xl:w-[114rem] px-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/">
                <span className="sr-only">Home</span>
                <CompanyLogo className="text-base-black hover:opacity-90" />
              </Link>
            </div>
            <div className="hidden xl:block">
              <nav>
                <ul className="flex items-center gap-x-4">
                  <li>
                    <Link href="/category/engineering" passHref>
                      <Button
                        className="!font-normal"
                        color="dark"
                        variant="text"
                      >
                        Engineering
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="/category/design" passHref>
                      <Button
                        className="!font-normal"
                        color="dark"
                        variant="text"
                      >
                        Design
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="/category/data-science" passHref>
                      <Button
                        className="!font-normal"
                        color="dark"
                        variant="text"
                      >
                        Data Science
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="/category/life-style" passHref>
                      <Button
                        className="!font-normal"
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
            <div className="hidden xl:flex items-center gap-x-4">
              <Link href="/concept" passHref>
                <Button className="!font-normal" color="dark" variant="text">
                  Concept
                </Button>
              </Link>
              <Link href="/contact" passHref>
                <Button className="!font-normal" color="dark" variant="text">
                  Contact
                </Button>
              </Link>
              <DropdownMenu
                trigger={
                  <Button color="dark" variant="text" className="!p-2">
                    <Icon name="magnifying-glass" width={20} height={20} />
                  </Button>
                }
              >
                <DropdownMenuItem>
                  <Search placeholder="検索" />
                </DropdownMenuItem>
              </DropdownMenu>
            </div>
            <div className="flex xl:hidden items-center gap-x-8">
              <DropdownMenu
                trigger={
                  <Button color="dark" variant="text" className="!p-2">
                    <Icon name="inbox-stack" />
                  </Button>
                }
              >
                <DropdownMenuItem>
                  <Link href="/category/engineering" passHref>
                    Engineering
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/category/design" passHref>
                    Design
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/category/data-science" passHref>
                    Data Science
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/category/life-style" passHref>
                    Life Style
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/concept" passHref>
                    Concept
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/contact" passHref>
                    Contact
                  </Link>
                </DropdownMenuItem>
              </DropdownMenu>
              <Drawer
                trigger={
                  <Button color="dark" variant="text" className="!p-2">
                    <Icon name="bars-3" />
                  </Button>
                }
                mainContent={<Sidebar />}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
