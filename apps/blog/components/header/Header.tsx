import Link from 'next/link';
import { Button, Drawer, DropdownMenu, DropdownMenuItem, Icon } from 'ui';
import { Category } from '../../modules/domain/post/types';
import { CompanyLogo } from '../company-logo/CompanyLogo';
import Search from '../search/Search';
import Sidebar from '../sidebar/Sidebar';

import MotionHeader from './MotionHeader';

export default function Header() {
  return (
    <MotionHeader>
      <div className="col-start-2 -col-end-2 flex place-items-center h-full">
        <div className="mx-auto w-full md:w-[45rem] xl:w-[80rem]">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" data-gtm="header_click_home">
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
                        data-gtm="header_click_engineering"
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
                        data-gtm="header_click_design"
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
                        data-gtm="header_click_data_science"
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
                        data-gtm="header_click_life_style"
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
                <Button
                  className="!font-normal"
                  color="dark"
                  variant="ghost"
                  data-gtm="header_click_concept"
                >
                  Concept
                </Button>
              </Link>
              <Link href="/contact" passHref>
                <Button
                  className="!font-normal"
                  color="dark"
                  variant="ghost"
                  data-gtm="header_click_contact"
                >
                  Contact
                </Button>
              </Link>
              <DropdownMenu
                trigger={
                  <Button
                    color="dark"
                    variant="ghost"
                    className="pointer-events-auto"
                    data-gtm="header_click_search"
                  >
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
                  <Button
                    color="dark"
                    size="icon"
                    variant="ghost"
                    className="pointer-events-auto"
                    data-gtm="header_click_menu"
                  >
                    <Icon name="inbox-stack" />
                  </Button>
                }
              >
                <DropdownMenuItem>
                  <Link
                    href={`/category/${Category.ENGINEERING}`}
                    passHref
                    data-gtm="header_click_engineering"
                  >
                    Engineering
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href={`/category/${Category.DESIGN}`}
                    passHref
                    data-gtm="header_click_design"
                  >
                    Design
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href={`/category/${Category.DATA_SCIENCE}`}
                    passHref
                    data-gtm="header_click_data_science"
                  >
                    Data Science
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href={`/category/${Category.LIFE_STYLE}`}
                    passHref
                    data-gtm="header_click_life_style"
                  >
                    Life Style
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href="/concept"
                    passHref
                    data-gtm="header_click_concept"
                  >
                    Concept
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href="/contact"
                    passHref
                    data-gtm="header_click_contact"
                  >
                    Contact
                  </Link>
                </DropdownMenuItem>
              </DropdownMenu>
              <Drawer
                trigger={
                  <Button
                    color="dark"
                    size="icon"
                    variant="ghost"
                    data-gtm="header_click_sidebar"
                  >
                    <Icon name="bars-3" />
                  </Button>
                }
                mainContent={<Sidebar />}
              />
            </div>
          </div>
        </div>
      </div>
    </MotionHeader>
  );
}
