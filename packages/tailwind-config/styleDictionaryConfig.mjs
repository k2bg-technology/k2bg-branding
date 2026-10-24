import StyleDictionary from 'style-dictionary';
import { fileHeader } from 'style-dictionary/utils';

/**
 * @see https://amzn.github.io/style-dictionary/#/README
 */

/* -------------------------- custom transform -------------------------- */

// The source dimensions are pixels. v4+ applies size/rem by token type,
// before our px-to-rem transform, whereas v3 only applied it to category size.
StyleDictionary.registerTransformGroup({
  name: 'css',
  transforms: StyleDictionary.hooks.transformGroups.css.filter(
    (transform) => transform !== 'size/rem'
  ),
});

StyleDictionary.registerTransform({
  name: 'transform/typography/pxToRem',
  type: 'value',
  filter(token) {
    const necessaryTypographyType = ['fontSize', 'lineHeight'];

    return (
      token.attributes.category === 'typography' &&
      necessaryTypographyType.includes(token.path.slice(-1)[0])
    );
  },
  transform(token) {
    return typeof token.value === 'number'
      ? `${token.value / 16}rem`
      : token.value;
  },
});

StyleDictionary.registerTransformGroup({
  name: 'transformGroup/css/typography',
  transforms: [
    ...StyleDictionary.hooks.transformGroups.css,
    'transform/typography/pxToRem',
  ],
});

StyleDictionary.registerTransform({
  name: 'transform/spacing/pxToRem',
  type: 'value',
  filter(token) {
    return token.attributes.category === 'spacing';
  },
  transform(token) {
    return typeof token.value === 'number'
      ? `${token.value / 16}rem`
      : token.value;
  },
});

StyleDictionary.registerTransformGroup({
  name: 'transformGroup/css/spacing',
  transforms: [
    ...StyleDictionary.hooks.transformGroups.css,
    'transform/spacing/pxToRem',
  ],
});

/* -------------------------- custom format -------------------------- */

StyleDictionary.registerFormat({
  name: 'format/css/index',
  async format({ file }) {
    return `${await fileHeader({
      file,
    })}\n@import './color.css';\n@import './typography.css';\n@import './spacing.css';\n@import './tailwind-theme-color.css';\n@import './tailwind-theme-typography.css';\n`;
  },
});

StyleDictionary.registerFormat({
  name: 'format/css/description/color',
  async format({ dictionary, file }) {
    return `${await fileHeader({
      file,
    })}:root {\n${dictionary.allTokens
      .map((token) => {
        const description = token.description
          ? ` /* ${token.description} */`
          : '';

        return `  --${token.name}: ${token.value};${description}`;
      })
      .join('\n')}\n}`;
  },
});

StyleDictionary.registerFormat({
  name: 'format/css/description/tailwind-theme-color',
  async format({ dictionary, file }) {
    return `${await fileHeader({
      file,
    })}@theme {\n${dictionary.allTokens
      .map((token) => {
        const description = token.description
          ? ` /* ${token.description} */`
          : '';

        return `  --${token.name}: ${token.value};${description}`;
      })
      .join('\n')}\n}`;
  },
});

StyleDictionary.registerFormat({
  name: 'format/css/description/rem',
  async format({ dictionary, file }) {
    return `${await fileHeader({
      file,
    })}:root {\n${dictionary.allTokens
      .map((token) => {
        const description = token.value.includes?.('rem')
          ? ` /* original -> ${token.original.value}px */`
          : '';

        return `  --${token.name}: ${token.value};${description}`;
      })
      .join('\n')}\n}`;
  },
});

StyleDictionary.registerFormat({
  name: 'format/css/description/tailwind-theme-typography',
  async format({ dictionary, file }) {
    return `${await fileHeader({
      file,
    })}@theme {\n${dictionary.allTokens
      .flatMap((token) => {
        const description = token.value.includes?.('rem')
          ? ` /* original -> ${token.original.value}px */`
          : '';

        const semanticToken = token.path.slice(2, -1).join('-');

        switch (token.path.slice(-1)[0]) {
          case 'fontSize':
            return [`  --text-${semanticToken}: ${token.value};${description}`];

          case 'lineHeight':
            return [
              `  --leading-${semanticToken}: ${token.value};${description}`,
            ];

          case 'fontWeight':
            return [
              `  --font-weight-${semanticToken}: ${token.value};${description}`,
            ];

          default:
            return [];
        }
      })
      .join('\n')}\n}`;
  },
});

StyleDictionary.registerFormat({
  name: 'format/json/color',
  format({ dictionary }) {
    return `{\n${dictionary.allTokens
      .map(
        (token, index) =>
          `  "${token.path
            .slice(1, 3)
            .join('-')}": {\n    "customVariable": "var(--${
            token.name
          })",\n    "value": "${token.value}",\n    "description": "${
            token.description
          }"\n  }${dictionary.allTokens.length - 1 === index ? '' : ','}`
      )
      .join('\n')}\n}`;
  },
});

StyleDictionary.registerFormat({
  name: 'format/json/typography',
  format({ dictionary }) {
    return `{\n${dictionary.allTokens
      .map(
        (token, index) =>
          `  "${token.name}": {\n    "customVariable": "var(--${
            token.name
          })",\n    "value": "${token.value}",\n    "lang": "${
            token.attributes.type
          }",\n    "group": "${token.path
            .slice(1, -1)
            .join('-')}",\n    "property": "${token.path.slice(-1)[0]}"\n  }${
            dictionary.allTokens.length - 1 === index ? '' : ','
          }`
      )
      .join('\n')}\n}`;
  },
});

const dictionary = new StyleDictionary({
  source: ['design-token/**/*.json'],
  platforms: {
    indexCssVariables: {
      buildPath: 'design-token/',
      files: [
        {
          destination: 'variables.css',
          format: 'format/css/index',
        },
      ],
    },
    colorCssVariables: {
      transformGroup: 'css',
      buildPath: 'design-token/',
      files: [
        {
          destination: 'color.css',
          format: 'format/css/description/color',
          filter: (token) => token.attributes?.category === 'color',
        },
      ],
    },
    tailwindThemeColorCssVariables: {
      transformGroup: 'css',
      buildPath: 'design-token/',
      files: [
        {
          destination: 'tailwind-theme-color.css',
          format: 'format/css/description/tailwind-theme-color',
          filter: (token) => token.attributes?.category === 'color',
        },
      ],
    },
    typographyCssVariables: {
      transformGroup: 'transformGroup/css/typography',
      buildPath: 'design-token/',
      files: [
        {
          destination: 'typography.css',
          format: 'format/css/description/rem',
          filter: (token) => token.attributes?.category === 'typography',
        },
      ],
    },
    tailwindThemeTypographyCssVariables: {
      transformGroup: 'transformGroup/css/typography',
      buildPath: 'design-token/',
      files: [
        {
          destination: 'tailwind-theme-typography.css',
          format: 'format/css/description/tailwind-theme-typography',
          filter: (token) =>
            token?.attributes?.type === 'ja' &&
            token.attributes?.category === 'typography',
        },
      ],
    },
    // spacingCssVariables: {
    //   transformGroup: 'transformGroup/css/spacing',
    //   buildPath: 'design-token/',
    //   files: [
    //     {
    //       destination: 'spacing.css',
    //       format: 'format/css/description/rem',
    //       filter: (token) => token.attributes?.category === 'spacing',
    //     },
    //   ],
    // },
    colorJson: {
      transformGroup: 'css',
      buildPath: 'design-token/',
      files: [
        {
          format: 'format/json/color',
          destination: 'color.json',
          filter: (token) => token.attributes?.category === 'color',
        },
      ],
    },
    typographyJson: {
      transformGroup: 'css',
      buildPath: 'design-token/',
      files: [
        {
          format: 'format/json/typography',
          destination: 'typography.json',
          filter: (token) => token.attributes?.category === 'typography',
        },
      ],
    },
  },
});

await dictionary.buildAllPlatforms();
