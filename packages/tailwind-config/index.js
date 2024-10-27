/** @type {import('tailwindcss').Config} */

/* eslint-disable @typescript-eslint/no-var-requires, import/no-unresolved, import/no-extraneous-dependencies */
const colors = require('tailwindcss/colors');

const typography = require('./design-token/typography.json');
const color = require('./design-token/color.json');
/* eslint-enable @typescript-eslint/no-var-requires, import/no-unresolved, import/no-extraneous-dependencies */

const colorVariables = Object.keys(color).reduce(
  (prev, cur) => ({
    ...prev,
    [cur]: `rgb(from ${color[cur].customVariable} r g b / <alpha-value>)`,
  }),
  {}
);

const typographyVariables = Object.values(typography).reduce(
  (prev, cur) =>
    cur.lang === 'ja'
      ? {
          ...prev,
          [cur.property]: {
            ...prev[cur.property],
            [cur.group.replace('ja-', '')]: cur.customVariable,
          },
        }
      : prev,
  {}
);

module.exports = {
  content: [],
  theme: {
    extend: {
      fontFamily: {
        original: [
          'Menlo',
          '"Hiragino Kaku Gothic ProN"',
          '"Hiragino Sans"',
          'Meiryo',
          'ui-monospace',
          'SFMono-Regular',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      fontSize: typographyVariables.fontSize,
      textColor: {
        'base-black': `rgb(from var(--color-base-black) r g b / <alpha-value>)`,
      },
      lineHeight: typographyVariables.lineHeight,
      colors: {
        ...colorVariables,
        error: colors.red[500],
        'error-light': colors.red[400],
        'error-dark': colors.red[600],
        warning: colors.amber[500],
        'warning-light': colors.amber[400],
        'warning-dark': colors.amber[500],
        info: colors.sky[500],
        'info-light': colors.sky[400],
        'info-dark': colors.sky[600],
        success: colors.green[500],
        'success-light': colors.green[400],
        'success-dark': colors.green[600],
        'brand-amazon': 'rgb(255 153 0)',
        'brand-rakuten': 'rgb(191 0 0)',
      },
      spacing: {
        condensed: '0.25rem',
        normal: '0.5rem',
        spacious: '1rem',
      },
      animation: {
        slide: 'slide 0.8s ease-in 1',
        scrollHelp: 'scrollHelp 5s ease-in-out infinite both',
      },
      keyframes: {
        slide: {
          from: {
            transform: 'translate(-8rem, -50%)',
            opacity: 0,
          },
          to: {
            transform: 'translate(0, -50%)',
            opacity: 1,
          },
        },
        scrollHelp: {
          '0%, 100%': {
            transform: 'translateX(0)',
          },
          '10%, 30%, 50%, 70%': {
            transform: 'translateX(-10px)',
          },
          '20%, 40%, 60%': {
            transform: 'translateX(10px)',
          },
          '80%': {
            transform: 'translateX(8px)',
          },
          '90%': {
            transform: 'translateX(-8px)',
          },
        },
      },
    },
  },
  plugins: [],
  mode: 'jit',
};
