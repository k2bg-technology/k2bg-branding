// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
