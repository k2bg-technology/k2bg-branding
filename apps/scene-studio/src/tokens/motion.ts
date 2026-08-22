export const SCENE_FPS = 30;

export const durationsInFrames = {
  fast: 10,
  enter: 20,
  slow: 30,
  transition: 15,
  titleHold: 90,
  outro: 75,
} as const;

export const easings = {
  standard: [0.4, 0, 0.2, 1],
  emphasized: [0.2, 0, 0, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>;

export const springs = {
  gentle: { damping: 200 },
  pop: { damping: 14, mass: 0.9 },
} as const;
