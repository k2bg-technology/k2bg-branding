import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { Form } from '.';

const meta = {
  component: Form.Control,
  args: {
    children: (
      <div className="flex flex-col gap-normal">
        <Form.Label htmlFor="default-input">ラベル</Form.Label>
        <Form.Input id="default-input" />
        <Form.HelperText>補足テキスト</Form.HelperText>
      </div>
    ),
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['dark', 'light'],
    },
    error: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    required: {
      control: 'boolean',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'components.form.description',
      },
      overview: 'components.form.overview',
      usage: 'components.form.usage',
      accessibility: 'components.form.accessibility',
      doList: 'components.form.doList',
      dontList: 'components.form.dontList',
      relatedComponents: 'components.form.relatedComponents',
      dependencies: 'components.form.dependencies',
      references: 'components.form.references',
    },
  },
} satisfies Meta<typeof Form.Control>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Error: Story = {
  args: {
    error: true,
    children: (
      <div className="flex flex-col gap-normal">
        <Form.Label htmlFor="error-input">ラベル</Form.Label>
        <Form.Input id="error-input" />
        <Form.HelperText>補足テキスト</Form.HelperText>
      </div>
    ),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: (
      <div className="flex flex-col gap-normal">
        <Form.Label htmlFor="disabled-input">ラベル</Form.Label>
        <Form.Input id="disabled-input" />
        <Form.HelperText>補足テキスト</Form.HelperText>
      </div>
    ),
  },
};

export const Light: Story = {
  args: {
    color: 'light',
    children: (
      <div className="flex flex-col gap-normal">
        <Form.Label htmlFor="light-input">ラベル</Form.Label>
        <Form.Input id="light-input" />
        <Form.HelperText>補足テキスト</Form.HelperText>
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <div className="bg-base-black p-6">
        <Story />
      </div>
    ),
  ],
};

export const WithTextarea: Story = {
  args: {
    children: (
      <div className="flex flex-col gap-normal">
        <Form.Label htmlFor="message-textarea">メッセージ</Form.Label>
        <Form.Textarea id="message-textarea" placeholder="メッセージを入力" />
        <Form.HelperText>最大500文字まで入力できます</Form.HelperText>
      </div>
    ),
  },
};

export const Required: Story = {
  args: {
    required: true,
    children: (
      <div className="flex flex-col gap-normal">
        <Form.Label
          htmlFor="required-input"
          className="inline-flex items-baseline gap-condensed"
        >
          必須項目 <span className="text-error">*</span>
        </Form.Label>
        <Form.Input id="required-input" placeholder="必須入力" />
        <Form.HelperText>この項目は必須です</Form.HelperText>
      </div>
    ),
  },
};
