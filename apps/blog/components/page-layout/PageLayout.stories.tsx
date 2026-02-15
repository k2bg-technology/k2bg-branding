import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { PageLayout } from '.';

const meta: Meta<typeof PageLayout> = {
  title: 'PageLayout',
  component: PageLayout,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ContentWithSidebar: Story = {
  render: () => (
    <PageLayout>
      <PageLayout.Row>
        <PageLayout.Content className="xl:col-start-2 xl:col-end-9">
          <div className="bg-slate-100 p-8 rounded">
            <h2 className="text-heading-2 font-bold">Content Area</h2>
            <p className="mt-4">
              Main content goes here. On xl screens, this occupies columns 2-8
              while the sidebar takes columns 9-11.
            </p>
          </div>
        </PageLayout.Content>
        <PageLayout.Aside colStart={9} colEnd={12}>
          <div className="bg-slate-200 p-4 rounded w-full">
            <p className="font-bold">Sidebar</p>
            <p className="mt-2 text-sm">Visible only on xl screens.</p>
          </div>
        </PageLayout.Aside>
      </PageLayout.Row>
    </PageLayout>
  ),
};

export const ContentWithSidebarNonResponsive: Story = {
  render: () => (
    <PageLayout>
      <PageLayout.Row>
        <PageLayout.Content colStart={1} colEnd={10}>
          <div className="bg-slate-100 p-8 rounded">
            <h2 className="text-heading-2 font-bold">Content Area</h2>
            <p className="mt-4">
              This content area uses colStart/colEnd props for non-responsive
              column placement (same columns at all breakpoints).
            </p>
          </div>
        </PageLayout.Content>
        <PageLayout.Aside colStart={10} colEnd={13}>
          <div className="bg-slate-200 p-4 rounded w-full">
            <p className="font-bold">Sidebar</p>
          </div>
        </PageLayout.Aside>
      </PageLayout.Row>
    </PageLayout>
  ),
};

export const MultipleSections: Story = {
  render: () => (
    <PageLayout>
      <PageLayout.Row>
        <div className="col-start-1 col-end-8">
          <div className="bg-blue-50 p-8 rounded">
            <h2 className="text-heading-2 font-bold">Featured Section</h2>
            <p className="mt-4">Hero content area spanning columns 1-7.</p>
          </div>
        </div>
        <div className="col-start-8 col-end-13 hidden xl:block">
          <div className="bg-blue-100 p-4 rounded">
            <p className="font-bold">Recently</p>
            <p className="mt-2 text-sm">
              Additional content visible on xl screens.
            </p>
          </div>
        </div>
      </PageLayout.Row>
      <PageLayout.Divider />
      <PageLayout.Row>
        <PageLayout.Content colStart={1} colEnd={10}>
          <div className="bg-slate-100 p-8 rounded">
            <h2 className="text-heading-2 font-bold">Articles Grid</h2>
            <p className="mt-4">Main articles content area.</p>
          </div>
        </PageLayout.Content>
        <PageLayout.Aside colStart={10} colEnd={13}>
          <div className="bg-slate-200 p-4 rounded w-full">
            <p className="font-bold">Sidebar</p>
          </div>
        </PageLayout.Aside>
      </PageLayout.Row>
    </PageLayout>
  ),
};

export const ContentOnly: Story = {
  render: () => (
    <PageLayout>
      <PageLayout.Row>
        <PageLayout.Content>
          <div className="bg-slate-100 p-8 rounded">
            <h2 className="text-heading-2 font-bold">Full Width Content</h2>
            <p className="mt-4">Content spans full width without a sidebar.</p>
          </div>
        </PageLayout.Content>
      </PageLayout.Row>
    </PageLayout>
  ),
};

export const WithFab: Story = {
  render: () => (
    <PageLayout
      fab={
        <PageLayout.Fab>
          <button
            type="button"
            className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg"
          >
            Top
          </button>
          <button
            type="button"
            className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg"
          >
            Index
          </button>
        </PageLayout.Fab>
      }
    >
      <PageLayout.Row>
        <PageLayout.Content>
          <div className="bg-slate-100 p-8 rounded">
            <h2 className="text-heading-2 font-bold">Page with FAB</h2>
            <p className="mt-4">
              A floating action button is rendered via the fab prop.
            </p>
          </div>
        </PageLayout.Content>
      </PageLayout.Row>
    </PageLayout>
  ),
};
