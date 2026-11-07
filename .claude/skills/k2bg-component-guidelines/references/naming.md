# Naming

Component, hook, and prop naming rules. All examples are invented identifiers for illustration, independent of repository components and files.

## Ownership

[General naming](../../../rules/code-style.md) belongs to the coding standards; [Props type names and `xxxVariants`](api-design.md) belong to API design; [File & Directory Naming](../../../../AGENTS.md#file--directory-naming) owns casing; [Scene Studio primitives](../../../rules/remotion-template-guidelines.md) retain their own naming rules.

## Component Names

**N1. The suffix expresses the role; implementation mechanisms are prefix modifiers.** The final noun describes what the component is to the user. `*Button` applies only to the button role; navigation uses `*Link` even when styled as a button. `*Player` requires playback; `*Viewer` requires zoom or switching; `*Selector` requires choosing among options; `*Slider` requires dragging a value. Mechanisms such as iframe embedding appear as prefixes; native elements are the default and need no modifier. Names exclude properties the component does not implement. Element suffixes describe parts with one interactive element; parts grouping multiple controls take the name of the group's operation.

Avoid → use: `ExternalLinkButton` rendering `<a>` → `ExternalLink`; `VideoStreamingPlayer` rendering only an iframe → `EmbeddedVideoPlayer`; `VideoFilePlayer` rendering `<video>` → `VideoPlayer`. A language switcher made of links is `LanguageSelector`.

**N2. Animation-only wrappers are not separate components.** When a wrapper has no state or behavior and only animates children, the consumer applies CSS animation classes, or `motion.<element>` props where Motion is in use. An effect-plus-subject name applies only when the effect itself is the component's main role. Ordinary components whose animation is a display implementation detail, such as drawers, keep their semantic or library names.

Avoid → use: `Slider` that only slides children into view → an animation class such as `animate-slide-in` at the call site.

**N3. The contract and contents determine the name's scope.** Caller count does not determine scope; wording, accepted data, and handled cases reveal whether the name is too broad or too narrow.

Avoid → use: `DatabaseUnavailable` on a catalog screen that also handles non-database failures → `CatalogUnavailable`.

**N4. Presentation names do not hide behavior.** Processing that continues when the presentation disappears belongs in a hook named for its effect (H2).

Avoid → use: `ScrollHelper` that shows a hint and keeps a wheel listener registered → `useWheelToHorizontalScroll` plus `HorizontalScrollHint`.

**N5. Compound part names preserve established vocabulary or clearly express their element or role.** Parts ported from established vocabulary keep their original names. Parts designed in this repository use names that identify the rendered element or role without conflicting with the vocabulary of Base UI, the headless library wrapped by `packages/ui`.

Avoid → use: `Form.Control` wrapping an entire field, while Base UI's `Field.Control` denotes the input itself → `Form.Field`. A table ported from shadcn keeps `Table.Head` / `Table.Header`.

**N6. Context and Provider names describe the scope sharing their value.** The filename matches the main export and follows the casing in [File & Directory Naming](../../../../AGENTS.md#file--directory-naming).

Avoid → use: `FormContext` mounted per field in a file named Context.tsx → `FieldContext` / `FieldProvider` / `useFieldContext` in a file named FieldProvider.tsx.

**N7. Component names avoid DOM, global, and framework default names.**

Avoid → use: `Document`, or `Image` alongside `next/image` → `ProjectCard`, `ArticleImage`.

**N8. One concept has one spelling throughout the repository.** Names for the same concept use consistent spelling.

Avoid → use: `SideBarAd` alongside `Sidebar` → `SidebarAd` alongside `Sidebar`.

## Hook Names

**H1. Only functions that call hooks use `use*` names.** Other functions follow the verb meanings in [General naming](../../../rules/code-style.md).

Avoid → use: `usePagination` that computes a list without calling hooks → `getPaginationItems`.

**H2. The name after `use` describes the returned value or the specific target of the side effect.** It does not name the consuming component, and a side-effect target names the concrete resource rather than a category.

Avoid → use: `useTimeline(): void` that only loads the X widgets script → `useXWidgetsScript`, not the category name `useEmbedScript`.

**H3. Parameter names match their role in the React API.** The name reflects how React uses the value.

Avoid → use: `initialState` for the value supplied to `getServerSnapshot` → `serverSnapshot`.

## Prop Names

**P1. Framework-supplied props retain their contract names.** The installed version's type definitions determine the names. Distinct operations are not treated as aliases.

Avoid → use: a custom `onRetry` for a callback supplied by an error boundary → the name defined by the framework's types, such as `reset` or `retry`.

**P2. Every declared prop has an effect.** Components do not extend `ComponentProps<'x'>` for an element they do not render or retain discarded props in their types.

Avoid → use: discarding `required` as `required: _required`, or extending `ComponentProps<'div'>` without rendering that element → implementing the prop or removing it from the type.

**P3. HTML, next/image, and Base UI prop names retain their original meaning, type, and unit.** Different meanings take domain names. Components emit no `data-*` attributes without a reader.

Avoid → use: emitting `id` as `data-id`, or using `name` as alt text → `mediaId`, `alt`.

**P4. `*Index` is zero-based; `*Page` and `*Number` are one-based.** Render-prop parameter names follow the same rule.

Avoid → use: `currentIndex` for a one-based page number → `currentPage`, `renderItem(page)`.

**P5. Visible text and text exclusively for assistive technology have distinct names.** Plain `label` means visible text. Every component uses `aria-label` for a name exclusively for assistive technology. `<part>Label` is valid for a child control's name. Components inheriting native or Base UI props expose `aria-label` unchanged.

Avoid → use: a chart's `label` used only as its accessible name → `aria-label`. An icon button's name is `previousLabel`.

**P6. Visible-label prop names identify where the text appears.** The name identifies the display location.

Avoid → use: `xLabel` shown only in a tooltip → `xValueLabel`.

**P7. Appearance props do not determine semantics.** Explicit props determine roles, header cells, and announcements.

Avoid → use: `stickyFirstColumn` toggling `th scope="row"` → `rowHeader` in the column definition.

**P8. Sibling components use the same name for the same role.** A shared name has the same meaning and targets the same element.

Avoid → use: `content` for a dialog and `mainContent` for a drawer → `content` for both, with rest props forwarded to the same element.

**P9. Prop names describe their contents.** Collections mixing different kinds use an umbrella term.

Avoid → use: `siteLink` that also contains repository links → `links`.

**P10. Boolean props follow HTML naming.** States use adjectives (`disabled`, `open`, `stacked`); rendering switches use `show*`; visual-only hiding uses `visuallyHidden*`. `is*` / `has*` are limited to variables, internal parameters, and data fields.

Avoid → use: `isTitleHidden`, `hideLegend` → `visuallyHiddenTitle`, `showLegend`.

**P11. Public API token names and resolved values have distinct names.** The name distinguishes a token from its resolved value.

Avoid → use: `color` for both a token name and a CSS color → `color` for the token, `cssColor` for the resolved value.
