import { Controls, useOf } from '@storybook/addon-docs/blocks';

export default function API() {
  const { story } = useOf('story', ['story']);
  const argTypes = story?.argTypes ?? {};
  const controlsDisabled = story?.parameters?.controls?.disable === true;
  const hasControls =
    !controlsDisabled &&
    Object.values(argTypes).some((argType) => {
      if (!argType) {
        return false;
      }
      if (argType.control === false) {
        return false;
      }
      if (argType.table?.disable) {
        return false;
      }
      return true;
    });

  if (!hasControls) {
    return null;
  }

  return (
    <section className="flex flex-col gap-spacious">
      <h2>API/Props</h2>
      <Controls />
    </section>
  );
}
