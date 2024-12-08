import React from 'react';
import Link from 'next/link';
import { Button, Drawer, DropdownMenu, DropdownMenuItem, Icon } from 'ui';

import { CompanyLogo } from '../company-logo/CompanyLogo';
import Sidebar from '../sidebar/Sidebar';
import Search from '../search/Search';
import { Category } from '../../modules/domain/post/types';

export default function Header() {
  return (
    <header className="col-span-full grid grid-cols-[subgrid] bg-base-white/50">
      <div className="col-start-2 -col-end-2 flex place-items-center h-full">
        <div className="mx-auto w-full md:w-[45rem] xl:w-[80rem]">
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
                    <Link href={`/category/${Category.ENGINEERING}`} passHref>
                      <Button
                        className="!font-normal"
                        color="dark"
                        variant="ghost"
                      >
                        Engineering
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href={`/category/${Category.DESIGN}`} passHref>
                      <Button
                        className="!font-normal"
                        color="dark"
                        variant="ghost"
                      >
                        Design
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href={`/category/${Category.DATA_SCIENCE}`} passHref>
                      <Button
                        className="!font-normal"
                        color="dark"
                        variant="ghost"
                      >
                        Data Science
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href={`/category/${Category.LIFE_STYLE}`} passHref>
                      <Button
                        className="!font-normal"
                        color="dark"
                        variant="ghost"
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
                <Button className="!font-normal" color="dark" variant="ghost">
                  Concept
                </Button>
              </Link>
              <Link href="/contact" passHref>
                <Button className="!font-normal" color="dark" variant="ghost">
                  Contact
                </Button>
              </Link>
              <DropdownMenu
                trigger={
                  <Button color="dark" variant="ghost">
                    <Icon name="magnifying-glass" width={20} height={20} />
                  </Button>
                }
              >
                <DropdownMenuItem>
                  <Search placeholder="検索" />
                </DropdownMenuItem>
              </DropdownMenu>
            </div>
            <div className="flex xl:hidden items-center gap-x-spacious">
              <DropdownMenu
                trigger={
                  <Button color="dark" size="icon" variant="ghost">
                    <Icon name="inbox-stack" />
                  </Button>
                }
              >
                <DropdownMenuItem>
                  <Link href={`/category/${Category.ENGINEERING}`} passHref>
                    Engineering
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={`/category/${Category.DESIGN}`} passHref>
                    Design
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={`/category/${Category.DATA_SCIENCE}`} passHref>
                    Data Science
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={`/category/${Category.LIFE_STYLE}`} passHref>
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
                  <Button color="dark" size="icon" variant="ghost">
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
