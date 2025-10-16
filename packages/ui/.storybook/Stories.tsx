import * as Blocks from '@storybook/addon-docs/blocks';

export default function Stories() {
  return (
    <section className="flex flex-col gap-spacious">
      <Blocks.Stories title={<h2>Stories</h2>} />
    </section>
  );
}
