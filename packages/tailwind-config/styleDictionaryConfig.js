// eslint-disable-next-line import/no-extraneous-dependencies, @typescript-eslint/no-var-requires
const StyleDictionary = require('style-dictionary');

/**
 * @see https://amzn.github.io/style-dictionary/#/README
 */

/* -------------------------- custom transform -------------------------- */

StyleDictionary.registerTransform({
  name: 'transform/typography/pxToRem',
  type: 'value',
  matcher(token) {
    const necessaryTypographyType = ['fontSize', 'lineHeight'];

    return (
      token.attributes.category === 'typography' &&
      necessaryTypographyType.includes(token.path.slice(-1)[0])
    );
  },
  transformer(token) {
    return typeof token.value === 'number'
      ? `${token.value / 10}rem`
      : token.value;
  },
});

StyleDictionary.registerTransformGroup({
  name: 'transformGroup/css/typography',
  transforms: [
    ...StyleDictionary.transformGroup.css,
    'transform/typography/pxToRem',
  ],
});

StyleDictionary.registerTransform({
  name: 'transform/spacing/pxToRem',
  type: 'value',
  matcher(token) {
    return token.attributes.category === 'spacing';
  },
  transformer(token) {
    return typeof token.value === 'number'
      ? `${token.value / 10}rem`
      : token.value;
  },
});

StyleDictionary.registerTransformGroup({
  name: 'transformGroup/css/spacing',
  transforms: [
    ...StyleDictionary.transformGroup.css,
    'transform/spacing/pxToRem',
  ],
});

/* -------------------------- custom format -------------------------- */

StyleDictionary.registerFormat({
  name: 'format/css/index',
  formatter(_, file) {
    return `${StyleDictionary.formatHelpers.fileHeader({
      file,
    })}\n@import './color.css';\n@import './typography.css';\n@import './spacing.css';\n`;
  },
});

StyleDictionary.registerFormat({
  name: 'format/css/description/color',
  formatter(dictionary, file) {
    return `${StyleDictionary.formatHelpers.fileHeader({
      file,
    })}:root {\n${dictionary.allProperties
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
  formatter(dictionary, file) {
    return `${StyleDictionary.formatHelpers.fileHeader({
      file,
    })}:root {\n${dictionary.allProperties
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
  name: 'format/json/color',
  formatter(dictionary) {
    return `{\n${dictionary.allProperties
      .map(
        (token, index) =>
          `  "${token.path
            .slice(1, 3)
            .join('-')}": {\n    "customVariable": "var(--${
            token.name
          })",\n    "value": "${token.value}",\n    "description": "${
            token.description
          }"\n  }${dictionary.allProperties.length - 1 === index ? '' : ','}`
      )
      .join('\n')}\n}`;
  },
});

StyleDictionary.registerFormat({
  name: 'format/json/typography',
  formatter(dictionary) {
    return `{\n${dictionary.allProperties
      .map(
        (token, index) =>
          `  "${token.name}": {\n    "customVariable": "var(--${
            token.name
          })",\n    "value": "${token.value}",\n    "lang": "${
            token.attributes.type
          }",\n    "group": "${token.path
            .slice(1, -1)
            .join('-')}",\n    "property": "${token.path.slice(-1)[0]}"\n  }${
            dictionary.allProperties.length - 1 === index ? '' : ','
          }`
      )
      .join('\n')}\n}`;
  },
});

StyleDictionary.extend({
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
    spacingCssVariables: {
      transformGroup: 'transformGroup/css/spacing',
      buildPath: 'design-token/',
      files: [
        {
          destination: 'spacing.css',
          format: 'format/css/description/rem',
          filter: (token) => token.attributes?.category === 'spacing',
        },
      ],
    },
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
}).buildAllPlatforms();
