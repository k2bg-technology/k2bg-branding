# K2BG Storybook Documentation Generator

A project-specific skill for generating and updating Storybook CSF3 stories and i18n translation files.

## Overview

This skill assists with creating and updating Storybook documentation for the `packages/ui` package in the K2BG Branding project. It provides the following capabilities:

- **New Components**: Generate story files and translation files from scratch
- **Existing Components**: Add or update missing documentation sections
- **Bilingual Support**: Generate English and Japanese translation files simultaneously
- **Best Practices Compliance**: Fully conform to existing project patterns

## Project-Specific Requirements

### Storybook Configuration

- **Version**: Storybook 10.0.6
- **Format**: CSF3 (Component Story Format 3)
- **Framework**: `@storybook/react-webpack5`
- **Compiler**: SWC with React 19

### i18n Configuration

- **Library**: react-i18next
- **Supported Languages**: English (en), Japanese (ja)
- **Translation File Paths**:
  - `/packages/ui/public/locales/en/translation.json`
  - `/packages/ui/public/locales/ja/translation.json`

### Documentation Structure

All stories use a comprehensive documentation template with the following sections:

1. **Description** - Brief component overview (1-2 sentences)
2. **Overview** - Detailed description, structure, and key features
3. **Usage** - Usage guidelines and best practices
4. **Accessibility** - Accessibility requirements (WCAG 2.1 AA compliance)
5. **Do/Don't Lists** - Recommended and discouraged practices
6. **Related Components** - Links to related components
7. **Dependencies** - Package dependency table
8. **References** - Links to external resources

## Usage Instructions

### Step 1: Gather Component Information

```markdown
Verify the following for the target component:

1. Component path (e.g., `packages/ui/src/components/Button/`)
2. Main component props (variant, color, size, etc.)
3. External libraries used (@radix-ui, clsx, etc.)
4. Presence of sub-components (e.g., Avatar.Image, Avatar.Fallback)
```

### Step 2: Generate or Update Story File

**IMPORTANT**: Story files should contain minimal or no inline comments. Do not add explanatory comments within the `parameters.docs` section or above story exports. Documentation should be provided through i18n translation files, not inline comments.

**IMPORTANT**: Do not include the `title` property in the meta object. Storybook will automatically generate the title from the directory structure (e.g., `src/components/Avatar/Avatar.stories.tsx` becomes `Components/Avatar`).

**IMPORTANT**: In the meta object's `args`, do not include optional props that have default values in the component. Only include required props or props that need to override the component's default values. Components should define their own default values, not in Storybook's args.

**For New Components:**

```typescript
// packages/ui/src/components/[ComponentName]/[ComponentName].stories.tsx

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import ComponentName from '.';

const meta = {
  component: ComponentName,
  args: {
    // Default args
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'ghost'],
    },
    color: {
      control: 'select',
      options: [
        'main',
        'accent',
        'inherit',
        'success',
        'info',
        'error',
        'warning',
        'dark',
        'light',
      ],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    // Other argTypes
  },
  parameters: {
    docs: {
      description: {
        component: 'components.[componentName].description',
      },
      overview: 'components.[componentName].overview',
      usage: 'components.[componentName].usage',
      accessibility: 'components.[componentName].accessibility',
      doList: 'components.[componentName].doList',
      dontList: 'components.[componentName].dontList',
      relatedComponents: 'components.[componentName].relatedComponents',
      dependencies: 'components.[componentName].dependencies',
      references: 'components.[componentName].references',
    },
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Component Name',
  },
};

// Additional stories
```

**For Existing Updates:**

1. Read the existing story file
2. Identify missing `parameters.docs` sections
3. Add only the necessary sections

### Step 3: Generate or Update Translation Files

**CRITICAL REQUIREMENT - TRANSLATION FILE FORMAT**:

❌ **ABSOLUTELY FORBIDDEN IN TRANSLATION FILES**:

- Markdown syntax: No bullets (`-`, `*`), numbered lists (`1.`, `2.`), bold (`**text**`), code blocks (` ``` `), headings (`#`)
- Newline characters: No `\n` anywhere in translation values
- HTML tags: No `<br>`, `<p>`, or any HTML formatting
- Special formatting: No tabs, indentation, or line breaks

✅ **REQUIRED FORMAT**:

- Plain text only as continuous prose
- Use proper punctuation and sentence structure to separate ideas
- Use commas, periods, and conjunctions to connect thoughts
- Write everything as flowing paragraphs without formatting

**English Version** (`/packages/ui/public/locales/en/translation.json`):

**REMEMBER**: All text values must be continuous prose without any markdown, newlines, or formatting.

```json
{
  "components": {
    "[componentName]": {
      "description": "A brief 1-2 sentence description of the component's purpose and primary use case.",
      "overview": "Detailed explanation of the component including main purpose and use cases, component structure (Root, sub-components), key features and functionality. Supports responsive sizing via className props.",
      "usage": "Guidance on how to use the component. For basic usage, explain the simplest implementation. When using variants, show how to use different variants. Follow best practices by recommending when and how to use the component. Common patterns include typical use cases. For integration, explain how it works with other components.",
      "accessibility": "This component meets the following accessibility requirements. For screen reader support, [specific ARIA labels and semantic HTML usage]. Regarding contrast ratio, maintains minimum contrast ratio of 4.5:1 (WCAG 2.1 AA). Uses semantic HTML with appropriate HTML elements and proper ARIA attributes. For focus management, [keyboard navigation and focus indicators]. Additional considerations include [component-specific a11y features].",
      "doList": [
        "Provide meaningful alt text or ARIA labels",
        "Use appropriate sizing with className props",
        "Ensure sufficient color contrast (minimum 4.5:1)",
        "Follow component composition patterns",
        "Use consistent sizing across similar contexts"
      ],
      "dontList": [
        "Don't omit required accessibility attributes",
        "Don't use illegible colors or low contrast",
        "Don't forget to provide fallback content",
        "Don't break established design patterns",
        "Don't use without proper context"
      ],
      "relatedComponents": [
        {
          "name": "RelatedComponent1",
          "path": "/?path=/docs/components-relatedcomponent1--docs",
          "description": "Brief explanation of how this component relates"
        }
      ],
      "dependencies": [
        {
          "package": "react",
          "version": "^19.0.0",
          "reason": "Core React library for component functionality"
        },
        {
          "package": "@radix-ui/react-[component]",
          "version": "^1.0.0",
          "reason": "Provides accessible primitives and [specific features]"
        },
        {
          "package": "clsx",
          "version": "^2.0.0",
          "reason": "Utility for conditional className construction"
        }
      ],
      "references": [
        {
          "linkText": "WCAG Guidelines on [Topic]",
          "url": "https://www.w3.org/WAI/WCAG21/Understanding/[topic].html",
          "description": "Official WCAG documentation on accessibility requirements"
        },
        {
          "linkText": "Radix UI [Component] Documentation",
          "url": "https://www.radix-ui.com/primitives/docs/components/[component]",
          "description": "Official documentation for the underlying primitive component"
        }
      ]
    }
  }
}
```

**Japanese Version** (`/packages/ui/public/locales/ja/translation.json`):

**重要**: すべてのテキスト値は、マークダウン、改行、フォーマットなしの連続した文章である必要があります。

```json
{
  "components": {
    "[componentName]": {
      "description": "コンポーネントの目的と主な使用目的を1〜2文で説明します。",
      "overview": "コンポーネントの詳細な説明です。主な目的と使用例、コンポーネント構造（Root、サブコンポーネント）、主要な機能と特徴を含みます。classNameプロップによるレスポンシブサイズ対応をサポートします。",
      "usage": "コンポーネントの使用方法についてです。基本的な使用法では、最もシンプルな実装方法を説明します。バリアント使用時は、異なるバリアントの使用方法を示します。ベストプラクティスとして、いつ、どのように使用するかを推奨します。一般的なパターンには、典型的な使用例が含まれます。統合については、他のコンポーネントとの連携方法を説明します。",
      "accessibility": "このコンポーネントは以下のアクセシビリティ要件を満たします。スクリーンリーダー対応として、[具体的なARIAラベルとセマンティックHTML使用]を行います。コントラスト比については、最低コントラスト比4.5:1を維持します（WCAG 2.1 AA準拠）。セマンティックHTMLとして、適切なHTML要素と正しいARIA属性を使用します。フォーカス管理では、[キーボードナビゲーションとフォーカスインジケーター]に対応します。追加の考慮事項として、[コンポーネント固有のアクセシビリティ機能]があります。",
      "doList": [
        "意味のあるaltテキストまたはARIAラベルを提供します",
        "classNameプロップで適切なサイズを指定します",
        "十分なコントラスト比を確保します（最低4.5:1）",
        "コンポーネント構成パターンに従います",
        "類似するコンテキストで一貫したサイズを使用します"
      ],
      "dontList": [
        "必須のアクセシビリティ属性を省略しません",
        "読みにくい色や低コントラストを使用しません",
        "フォールバックコンテンツの提供を忘れません",
        "確立されたデザインパターンを壊しません",
        "適切なコンテキストなしで使用しません"
      ],
      "relatedComponents": [
        {
          "name": "関連コンポーネント1",
          "path": "/?path=/docs/components-relatedcomponent1--docs",
          "description": "このコンポーネントとの関連性の簡単な説明"
        }
      ],
      "dependencies": [
        {
          "package": "react",
          "version": "^19.0.0",
          "reason": "コンポーネント機能のためのコアReactライブラリ"
        },
        {
          "package": "@radix-ui/react-[component]",
          "version": "^1.0.0",
          "reason": "アクセシブルなプリミティブと[特定機能]を提供"
        },
        {
          "package": "clsx",
          "version": "^2.0.0",
          "reason": "条件付きclassName構築のためのユーティリティ"
        }
      ],
      "references": [
        {
          "linkText": "WCAG [トピック]ガイドライン",
          "url": "https://www.w3.org/WAI/WCAG21/Understanding/[topic].html",
          "description": "アクセシビリティ要件に関する公式WCAGドキュメント"
        },
        {
          "linkText": "Radix UI [Component]ドキュメント",
          "url": "https://www.radix-ui.com/primitives/docs/components/[component]",
          "description": "基礎となるプリミティブコンポーネントの公式ドキュメント"
        }
      ]
    }
  }
}
```

## Workflow

### Creating Documentation for New Components

1. **Component Analysis**

   - Read component file to understand props, type definitions, and dependencies
   - Check for sub-components
   - Identify external libraries being used

2. **Story File Generation**

   - Create story file in CSF3 format
   - Set up appropriate argTypes controls
   - Configure parameters with i18n keys
   - Create multiple story examples (Default, variants, edge cases, etc.)

3. **Translation File Generation**

   - Write all sections in English
   - Translate to Japanese (properly localize technical terms)
   - Merge into existing translation files (add `components.[componentName]` section)

4. **Validation**
   - Check story file syntax
   - Validate translation JSON format
   - Verify i18n key consistency

### Updating Existing Components

1. **Current State Analysis**

   - Read existing story file
   - Identify missing items in `parameters.docs` section
   - Check existing translation files

2. **Identify Missing Sections**

   ```typescript
   // Required sections
   const requiredSections = [
     'description',
     'overview',
     'usage',
     'accessibility',
     'doList',
     'dontList',
     'relatedComponents',
     'dependencies',
     'references',
   ];
   ```

3. **Add or Update**

   - Add missing parameters to story file
   - Add corresponding content to translation files
   - Preserve existing content (don't overwrite)

4. **Consistency Check**
   - Compare patterns with other stories in the project
   - Verify terminology consistency
   - Validate link path accuracy

## Component-Specific Guidelines

### argTypes Configuration Patterns

**Common color configuration:**

```typescript
color: {
  control: 'select',
  options: [
    'main',
    'accent',
    'inherit',
    'success',
    'info',
    'error',
    'warning',
    'dark',
    'light',
  ],
}
```

**Common size configuration:**

```typescript
size: {
  control: 'select',
  options: ['default', 'sm', 'lg', 'icon'],
}
```

**Variant configuration (component-dependent):**

```typescript
variant: {
  control: 'select',
  options: ['default', 'outline', 'ghost'], // Example for Button
}
```

### Accessibility Documentation Points

All `accessibility` sections must include:

1. **Screen reader support**: ARIA attributes, semantic HTML
2. **Contrast ratio**: WCAG 2.1 AA compliance (4.5:1)
3. **Semantic HTML**: Elements and attributes used
4. **Focus management**: Keyboard operation, focus indicators
5. **Additional considerations**: Component-specific features

### Dependency Documentation Rules

**Required dependencies:**

```json
{
  "package": "react",
  "version": "^19.0.0",
  "reason": "Core React library for component functionality"
}
```

**Radix UI packages:**

```json
{
  "package": "@radix-ui/react-[component]",
  "version": "^1.x.x", // Get exact version from package.json
  "reason": "Provides accessible [component] primitives and [specific features]"
}
```

**Utilities:**

```json
{
  "package": "clsx",
  "version": "^2.0.0",
  "reason": "Utility for conditional className construction"
}
```

## Writing Guidelines

All documentation content must follow these writing principles to ensure clarity, consistency, and accessibility.

**CRITICAL RULE FOR TRANSLATION FILES - MUST BE STRICTLY ENFORCED**:

🚫 **ABSOLUTELY FORBIDDEN** (WILL CAUSE ERRORS):

- Any markdown syntax: bullets (`-`, `*`), numbered lists (`1.`, `2.`), bold (`**`), italic (`_`, `*`), code blocks (` ``` `), inline code (`` ` ``), headings (`#`, `##`)
- Any newline characters: `\n` is strictly prohibited
- Any HTML tags: `<br>`, `<p>`, `<strong>`, `<em>`, etc.
- Any special formatting: tabs, indentation, line breaks

✅ **MANDATORY FORMAT** (ONLY ACCEPTABLE FORMAT):

- Plain text only as continuous, flowing prose
- Use periods (`.`), commas (`,`), semicolons (`;`), and conjunctions (`and`, `or`, `but`) to separate and connect ideas
- Write everything as natural paragraphs without any formatting
- Each JSON string value must be a single continuous line of text

**VERIFICATION BEFORE SUBMISSION**:
Before finalizing translation files, verify each value:

1. Contains NO markdown symbols (-, \*, #, \*\*, `, ```)
2. Contains NO newline characters (\n)
3. Contains NO HTML tags
4. Is written as continuous prose with proper punctuation

### Core Principles

**Clear, Concise, Consistent**

- Keep sentences short (target ~60 characters or less)
- One sentence should convey one idea only
- Avoid verbose phrases like "by doing X" or "it will become"
- Reduce cognitive load for busy developers and designers

**Universal Understanding**

- Avoid internal jargon, slang, and cultural references
- Use universally understood technical terms
- Define specialized terms on first use

**Library-Agnostic Component Descriptions**

- **CRITICAL**: Do NOT mention specific library names (Radix UI, Tailwind CSS, etc.) in `description` or `overview` sections
- Focus on what the component does, not what it's built with
- Describe functionality, behavior, and purpose in universal terms
- Examples of FORBIDDEN mentions in description/overview:
  - ❌ "Built on Radix UI primitives"
  - ❌ "Uses Tailwind CSS for styling"
  - ❌ "Powered by @radix-ui/react-avatar"
  - ❌ "Styled with Tailwind utility classes"
- Examples of CORRECT descriptions:
  - ✅ "Displays user profile images with fallback support"
  - ✅ "Provides accessible button variations for different contexts"
  - ✅ "Supports responsive sizing and theming"
- Library-specific details MUST only appear in:
  - `dependencies` section (with clear technical reasoning)
  - `references` section (linking to official documentation)

### Tone and Voice

**Neutral and Flat**

- Maintain a calm, professional tone
- Avoid overly friendly or casual expressions
- Focus on "what to do" rather than what not to do (positive framing)

**Third-Person Perspective**

- Use third-person or omit subjects entirely
- Avoid "we" and "you"
- Use "the component" or "this guide" as subjects

**Examples:**

- ❌ "You should use this component when..."
- ✅ "Use this component when..."
- ✅ "This component is used when..."

**Consistent Style**

- **English**: Use present tense, active voice
- **Japanese**: Use敬体（polite form: 〜します/〜ます）
- Use敬体consistently throughout all documentation

### Sentence Structure

**Short and Active**

- Target ~60 characters per sentence
- Split long sentences into two
- Use active voice whenever possible
  - ❌ "It is recommended that..."
  - ✅ "Recommend..."

**Present Tense**

- Guidelines are always valid rules, so use present tense
- Avoid future or past tense unless describing events

**Parallel Structure**

- In lists, use the same grammatical form for all items
- All items should end with the same verb form (e.g., all ending in "use", "set", "ensure")

### Terminology and Labels

**Label Formatting**

- **English**: Capitalize first word only (sentence case)
  - ✅ Save changes
  - ❌ Save Changes
- **Japanese**: Use nouns or concise verb phrases

**Action-Oriented**

- Start action buttons/menus with verbs
- Make the action immediately clear
- Examples: Create project, Delete account, Export data

**Consistency**

- Use the same term for the same concept throughout
- Maintain a glossary and stick to it
- Example: Don't mix "issue" and "ticket"

**Gender-Neutral and Culturally Independent**

- Avoid gendered pronouns (he/she)
- Avoid metaphors, jokes, and culture-specific references
- No anime, drama, or pop culture references

### Headings, Paragraphs, and Lists

**Headings**

- Use nouns or noun phrases
- Keep headings concise
- Don't add punctuation at the end
- Examples: Overview, Usage Guidelines, Accessibility, API

**Paragraphs**

- One paragraph = one topic
- Split long paragraphs using subheadings or lists
- Keep paragraphs scannable

**Lists**

- Use lists for requirements, steps, or comparisons
- All list items must follow the same grammatical structure
- Start all items with the same part of speech (all nouns or all verbs)

### Code Examples

**Minimal and Self-Contained**

- Keep examples as short as possible
- Make examples self-sufficient
- Avoid unnecessary utilities or complex logic

**Structure**

1. Brief explanation
2. Code block
3. Bullet points highlighting key aspects

**Naming**

- Match class/variable/component names to documented concepts
- Use descriptive, consistent names

### Accessibility Documentation

**Specifications with Context**

- Provide specific information: roles, aria-\* attributes, focus, contrast
- Don't just say "accessible" — explain how

**Specific Interaction Instructions**

- ❌ "Keyboard accessible"
- ✅ "Press Tab to move focus, Enter to activate"

**Avoid Color-Only Descriptions**

- ❌ "Click the red button"
- ✅ "Click the Delete button"

### Global and Localization Considerations

**Translation-Friendly Writing**

- Avoid complex metaphors and deeply nested sentences
- Write straightforward sentences that translate well

**Numbers and Units**

- Use consistent formatting (half-width numbers + half-width units)
- Examples: 16px, 200ms

**Dates and Times**

- Use ISO-like formats (e.g., 2025-12-06)
- Avoid ambiguous terms like "next month" or "recently"

### Prohibited Expressions

**Never Use:**

- Slang, internet memes, internal jokes
- Overly emotional or exaggerated language ("absolutely", "perfect", "super useful")
- Gendered language or stereotypes
- Vague link text like "click here"
- Unexplained technical jargon

### Documentation Checklist

Before finalizing any documentation, verify:

- ✅ **Style**: All text uses consistent style（敬体for Japanese, present tense for English）
- ✅ **Length**: Sentences are ~60 characters or less
- ✅ **Consistency**: Same concept uses same term throughout
- ✅ **Labels**: Button/menu text is consistent and action-oriented
- ✅ **Universal**: No jargon, slang, or internal references
- ✅ **Accessibility**: Specific instructions for operation, labels, and contrast included
- ✅ **Parallel Structure**: List items use the same grammatical form

## Quality Standards

### Story Files

- ✅ Conform to CSF3 format
- ✅ TypeScript type definitions are correct (`satisfies Meta<typeof Component>`)
- ✅ All argTypes include control and table information
- ✅ Provide at least 3 story examples (Default + variants + edge cases)
- ✅ Set i18n keys for all 9 sections in `parameters.docs`
- ✅ **No Inline Comments**: Do not add explanatory comments in parameters.docs or above story exports
- ✅ **No Title Property**: Do not include title in meta object, let Storybook auto-generate from directory structure
- ✅ **Minimal Args**: Only include required props or props overriding defaults in meta.args, not optional props with component defaults

### Translation Content

- ✅ **CRITICAL - No Markdown/Newlines**: Verify every translation value contains ZERO markdown symbols (-, \*, #, \*\*, `, ```), ZERO newline characters (\n), and ZERO HTML tags. This is non-negotiable.
- ✅ **Plain Text Only**: All content must be continuous prose without any formatting whatsoever
- ✅ **English**: Clear, concise, present tense, active voice
- ✅ **Japanese**: Natural敬体、consistent technical terms
- ✅ Follow all Writing Guidelines principles
- ✅ Sentences are ~60 characters or less
- ✅ Technical term consistency (e.g., "スクリーンリーダー" not "読み上げソフト")
- ✅ At least 5 items in doList/dontList each (all using parallel structure)
- ✅ At least 1 related component in relatedComponents
- ✅ All dependency packages listed in dependencies with clear, concise reasons
- ✅ Include WCAG and external library documentation in references
- ✅ No gendered language, slang, or cultural references
- ✅ Action buttons/labels start with verbs

### Code Quality

- ✅ No ESLint errors
- ✅ No TypeScript compilation errors
- ✅ No JSON syntax errors
- ✅ No unnecessary imports
- ✅ No unused variables

## Troubleshooting

### i18n Keys Not Found

**Problem**: Translations don't appear in Storybook

**Solution**:

1. Verify JSON key path in translation file is accurate
2. Ensure story file `parameters.docs` and translation file keys match
3. Reload i18n files (restart Storybook server)

### TypeScript Errors

**Problem**: `Type 'X' is not assignable to type 'Y'`

**Solution**:

1. Use `satisfies Meta<typeof Component>`
2. Check argTypes type definitions
3. Verify Story args match component props

### Storybook Build Errors

**Problem**: Error during `storybook build`

**Solution**:

```bash
# Navigate to UI package
cd packages/ui

# Clear cache
rm -rf node_modules/.cache

# Rebuild
pnpm build-storybook
```

## Reference Resources

### Project Internal References

- Example story: `packages/ui/src/components/Avatar/Avatar.stories.tsx`
- Documentation template: `packages/ui/.storybook/DocumentationTemplate.mdx`
- Translation files: `packages/ui/public/locales/{en,ja}/translation.json`

### External Resources

- [Storybook CSF3 Documentation](https://storybook.js.org/docs/react/api/csf)
- [Storybook Autodocs](https://storybook.js.org/docs/react/writing-docs/autodocs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Radix UI Documentation](https://www.radix-ui.com/primitives/docs/overview/introduction)

## Execution Commands

```bash
# Start Storybook development server
pnpm storybook

# Build Storybook
pnpm build-storybook

# Visual regression testing
pnpm chromatic
```

## Summary

Using this skill, you can efficiently create and update high-quality documentation that conforms to K2BG Branding project's Storybook standards. Use this when adding new components or improving documentation for existing components.
