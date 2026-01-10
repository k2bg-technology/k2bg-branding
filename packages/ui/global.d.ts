declare module '*.svg' {
  /**
   * Use `any` to avoid conflicts with
   * `@svgr/webpack` plugin or
   * `babel-plugin-inline-react-svg` plugin.
   */
  // biome-ignore lint/suspicious/noExplicitAny: --- IGNORE ---
  const content: any;

  export default content;
}

declare module '*.jpg' {
  // biome-ignore lint/suspicious/noExplicitAny: --- IGNORE ---
  const content: any;

  export default content;
}
