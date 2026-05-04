import Link from 'next/link';
import { Button, buttonVariants, Drawer, DropdownMenu, Icon } from 'ui';
import { Category } from '../../modules/post/domain';
import { CompanyLogo } from '../company-logo/CompanyLogo';
import { Search } from '../search/Search';
import { Sidebar } from '../sidebar/Sidebar';

import { MotionHeader } from './MotionHeader';

export function Header() {
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
                    <Link
                      href={`/category/${Category.ENGINEERING}`}
                      className={buttonVariants({
                        color: 'dark',
                        variant: 'ghost',
                        className: '!font-normal',
                      })}
                      data-gtm="header_click_engineering"
                    >
                      Engineering
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/category/${Category.DESIGN}`}
                      className={buttonVariants({
                        color: 'dark',
                        variant: 'ghost',
                        className: '!font-normal',
                      })}
                      data-gtm="header_click_design"
                    >
                      Design
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/category/${Category.DATA_SCIENCE}`}
                      className={buttonVariants({
                        color: 'dark',
                        variant: 'ghost',
                        className: '!font-normal',
                      })}
                      data-gtm="header_click_data_science"
                    >
                      Data Science
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/category/${Category.LIFE_STYLE}`}
                      className={buttonVariants({
                        color: 'dark',
                        variant: 'ghost',
                        className: '!font-normal',
                      })}
                      data-gtm="header_click_life_style"
                    >
                      Life Style
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
            <div className="hidden xl:flex items-center gap-x-4">
              <Link
                href="/concept"
                className={buttonVariants({
                  color: 'dark',
                  variant: 'ghost',
                  className: '!font-normal',
                })}
                data-gtm="header_click_concept"
              >
                Concept
              </Link>
              <Link
                href="/contact"
                className={buttonVariants({
                  color: 'dark',
                  variant: 'ghost',
                  className: '!font-normal',
                })}
                data-gtm="header_click_contact"
              >
                Contact
              </Link>
              <DropdownMenu>
                <DropdownMenu.Trigger>
                  <Button
                    color="dark"
                    variant="ghost"
                    className="pointer-events-auto"
                    data-gtm="header_click_search"
                  >
                    <Icon name="magnifying-glass" width={20} height={20} />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  <DropdownMenu.Item>
                    <Search placeholder="検索" />
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu>
            </div>
            <div className="flex xl:hidden items-center gap-x-spacious">
              <DropdownMenu>
                <DropdownMenu.Trigger>
                  <Button
                    color="dark"
                    size="icon"
                    variant="ghost"
                    className="pointer-events-auto"
                    data-gtm="header_click_menu"
                  >
                    <Icon name="inbox-stack" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item>
                    <Link
                      href={`/category/${Category.ENGINEERING}`}
                      data-gtm="header_click_engineering"
                    >
                      Engineering
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item>
                    <Link
                      href={`/category/${Category.DESIGN}`}
                      data-gtm="header_click_design"
                    >
                      Design
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item>
                    <Link
                      href={`/category/${Category.DATA_SCIENCE}`}
                      data-gtm="header_click_data_science"
                    >
                      Data Science
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item>
                    <Link
                      href={`/category/${Category.LIFE_STYLE}`}
                      data-gtm="header_click_life_style"
                    >
                      Life Style
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item>
                    <Link href="/concept" data-gtm="header_click_concept">
                      Concept
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item>
                    <Link href="/contact" data-gtm="header_click_contact">
                      Contact
                    </Link>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
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
