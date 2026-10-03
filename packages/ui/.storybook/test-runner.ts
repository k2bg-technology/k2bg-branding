import type { TestRunnerConfig } from '@storybook/test-runner';
import { checkA11y, injectAxe } from 'axe-playwright';

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page) {
    await checkA11y(page, 'body', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
      axeOptions: {
        // Isolated component fragments render without page landmarks, so the region rule is a false positive here.
        rules: {
          region: { enabled: false },
        },
      },
    });
  },
};

export default config;
