---
name: k2bg-principles
description: |
  The k2bg brand principles — eleven aphorisms that state how K2.B.G. Technology decides
  what to build, how to build it, and how to speak. They are the assumptions to fall back
  on when resolving ambiguity.

  Use when: (1) deciding whether to add, change, or cut a feature or proposal; (2) the
  scope or design direction is ambiguous and no explicit rule settles it, including
  judging scope creep in reviews; (3) weighing engineering trade-offs such as speed vs.
  quality or generalization vs. focus; (4) writing blog or portfolio copy, or any other
  public-facing text, and a tone or content decision is needed.
---

# The k2bg Principles

The decision-making principles of K2.B.G. Technology ("KK Bit Growth Technology" — slogan:
_Scale up your business with the power of IT_). These are not aspirations; they are the
defaults that agents and humans fall back on when a decision is ambiguous. When a request
conflicts with a principle, surface the conflict instead of silently following either.

## Principles

1. **Scale up small businesses.**
   The mission, and the top filter. Before building anything, ask whether it solves real
   pain for small businesses — or strengthens the brand that serves them.

2. **Freedom is a structure.**
   Freedom is not whim; it is never losing options. Prefer choices that keep us able to
   move: portable, replaceable, not locked in.

3. **Technology is a means to freedom.**
   A technology is valuable for the options it creates, not for itself. Judge a stack by
   the doors it opens and keeps open.

4. **Subtraction defines the shape.**
   What we refuse to build defines the product more than what we add. Anything added
   dilutes everything else; when in doubt, cut.

5. **Turn chaos into structure.**
   The core of the work: complex UIs, scattered rules, and ambiguous standards become
   structures anyone can work with. Fix the structure, not the symptom.

6. **Turn pain into design.**
   Failures, friction, and burnout are design input. Convert each into a mechanism that
   prevents recurrence instead of relying on vigilance.

7. **Plans are exoskeletons, not cages.**
   A plan exists to enable movement. Keep the roadmap, leave deliberate room for the
   unplanned, and treat deviations as material rather than failure.

8. **Don't guess. Verify.**
   Flags, props, behavior, facts: confirm before using, confirm before claiming.
   Documentation and actual behavior outrank plausible memory.

9. **Shipped isn't done. Measured is done.**
   Value is confirmed by outcomes — retention, adoption, task success — not by merged
   pull requests. Close the loop.

10. **Cross domains, multiply value.**
    Uniqueness comes from combinations, not from depth in one silo alone.

11. **Don't hurry. Don't force.**
    Decisions are judged on a decades-long axis. A sustainable pace beats a heroic
    sprint; what can only be done by forcing it is not worth doing.

## Applying the principles

### Selecting features

Filter proposals in this order: mission fit first, then subtraction. Things k2bg
deliberately does not do:

- Adopt a technology because it is trending.
- Engineer for imaginary scale — users or load we do not have.
- Publish for volume — output quantity is not a goal.

### Designing, implementing, and reviewing

- **Quality by layer**: foundations (shared `packages/`, domain layers, infrastructure)
  default to quality and long-term maintainability; experiments and spikes default to
  speed — and are promoted to foundation quality before anything depends on them.
- Verify before proposing; never present a guess as a fact.
- Prefer the structural fix over the local patch; reducing future chaos outweighs saving
  effort today.
- In reviews, judge scope creep with subtraction: an addition must justify what it
  dilutes.

### Writing and publishing

- Voice: human words — calm, structural, concrete. No hype, no exaggeration, no
  decorative title suffixes such as year tags.
- Ground claims in first-hand experience, experiments, or verified sources.
- One substantive article outweighs many thin ones.
