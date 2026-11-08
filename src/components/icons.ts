/**
 * The NIL icon set, "Cut": drawn for this kit on a 24 unit grid. Nothing here is copied from an
 * icon library, and there are no curves. Every shape is a straight line, and what would be a
 * curve is cut into 45 degree facets.
 *
 * Rules every drawing follows (they are the reason the set looks like one hand):
 * - Square line ends and mitre joins, set in core.css, not here.
 * - Stroke comes from the border tokens, set per size in core.css: the border width at 16 px,
 *   the thick border width at 20 and 24 px.
 * - A gap between two strokes is never thinner than the stroke beside it, checked at 16 px.
 *   In drawing units that means two separate strokes sit at least 4.5 units apart, centre to
 *   centre. An icon that cannot keep that at 16 px gets a simpler `small` drawing for that size.
 *
 * `lines` are stroked outlines. `solid` shapes are filled with the current colour as well
 * (the eye's pupil, the settings knobs, the share nodes). `slash` is a line that is cut out of
 * the drawing with a mask and then drawn, so a struck-through icon keeps a clear channel on
 * both sides of the slash.
 */
export interface IconShape {
  readonly lines: readonly string[];
  readonly solid?: readonly string[];
  readonly slash?: string;
}

export interface IconDef extends IconShape {
  /** A simpler drawing for 16 px, only where the full one breaks the gap rule at that size. */
  readonly small?: IconShape;
}

const EYE: IconShape = {
  lines: ['M1 12l5-5 4-2h4l4 2 5 5-5 5-4 2h-4l-4-2z'],
  solid: ['M10.8 9h2.4l1.8 1.8v2.4L13.2 15h-2.4L9 13.2v-2.4z'],
};

/** 16 px: a smaller pupil, so it keeps a full stroke of clear space from the outline. */
const EYE_SMALL: IconShape = {
  lines: EYE.lines,
  solid: ['M11.25 10.5h1.5l.75.75v1.5l-.75.75h-1.5l-.75-.75v-1.5z'],
};

const OCTAGON = 'M8 1.5h8L22.5 8v8L16 22.5H8L1.5 16V8z';
const SPEAKER = 'M3 9h3l4-4h2v14h-2l-4-4H3z';

export const ICONS = {
  // Capture and voice
  mic: {
    lines: ['M10.5 1.5h3l2 2v8l-2 2h-3l-2-2v-8z', 'M5 10v2.5L9.5 17h5l4.5-4.5V10', 'M12 17v4', 'M8.5 21.5h7'],
    // The cradle sits too close to the capsule at 16 px, so it moves out and the capsule narrows.
    small: { lines: ['M10.5 1.5h3l1.5 1.5v7l-1.5 1.5h-3L9 10V3z', 'M4.5 9v3.5L8.5 16.5h7l4-4V9', 'M12 16.5v5', 'M8.5 21.5h7'] },
  },
  stop: { lines: ['M5 5h14v14H5z'] },
  'arrow-up': { lines: ['M12 20V4', 'M5 11l7-7 7 7'] },

  // Navigation
  capture: { lines: ['M3 13L6 4h12l3 9v8H3z', 'M3 13h4.5l3 3h3l3-3H21'] },
  review: { lines: ['M7 2h10l3 3v14l-3 3H7l-3-3V5z', 'M9 12l2.5 2.5 4-5'] },
  patterns: { lines: ['M6 17V11', 'M12 17V5', 'M18 17V9', 'M3 22h18'] },
  settings: { lines: ['M3 5h18', 'M3 12h18', 'M3 19h18'], solid: ['M6 3h4v4H6z', 'M14 10h4v4h-4z', 'M4 17h4v4H4z'] },

  // Review actions
  check: { lines: ['M4 12.5l5 5L20 6.5'] },
  clock: { lines: ['M8.5 2h7L22 8.5v7L15.5 22h-7L2 15.5v-7z', 'M12 6.5V12l3.5 3.5'] },
  close: { lines: ['M5 5l14 14', 'M19 5L5 19'] },
  trash: {
    lines: ['M3 7h18', 'M9 7V2h6v5', 'M5 7v12l2.5 2.5h9L19 19V7', 'M9.5 12v5', 'M14.5 12v5'],
    // Two inner lines cannot keep a full stroke of space from each other and the sides at 16 px. One can.
    small: { lines: ['M3 7h18', 'M9 7V2h6v5', 'M5 7v12l2.5 2.5h9L19 19V7', 'M12 12v5'] },
  },
  help: { lines: [OCTAGON, 'M9 9l2-2h2l2 2v1.5l-3 3', 'M12 18h.01'] },
  plus: { lines: ['M12 4v16', 'M4 12h16'] },
  'arrow-right': { lines: ['M4 12h16', 'M13 5l7 7-7 7'] },

  // Sharing and files
  copy: { lines: ['M3 9h12v12H3z', 'M7 9V3h14v12h-6'] },
  download: { lines: ['M12 3v13', 'M6 10l6 6 6-6', 'M4 21h16'] },
  upload: { lines: ['M12 16V3', 'M6 9l6-6 6 6', 'M4 21h16'] },
  share: { lines: ['M6 12l12-7', 'M6 12l12 7'], solid: ['M16 3h4v4h-4z', 'M4 10h4v4H4z', 'M16 17h4v4h-4z'] },
  mail: { lines: ['M3 5h18v14H3z', 'M3 5l7.5 7.5h3L21 5'] },
  printer: { lines: ['M7 9V3h10v6', 'M7 17H2V9h20v8h-5', 'M7 14h10v7H7z'] },
  'external-link': { lines: ['M9 5H4v15h15v-5', 'M14 3h7v7', 'M21 3L11 13'] },

  // Settings and state
  eye: { ...EYE, small: EYE_SMALL },
  'eye-off': { ...EYE, slash: 'M3 3l18 18', small: { ...EYE_SMALL, slash: 'M3 3l18 18' } },
  key: { lines: ['M5 6h4l3 3v6l-3 3H5l-3-3V9z', 'M12 12h10.5', 'M15.5 12v3.5', 'M20.5 12v3.5'] },
  bell: { lines: ['M4 20l2-2V11l4-4h4l4 4v7l2 2z', 'M12 7V3.5'] },
  volume: { lines: [SPEAKER, 'M17 9l3 3-3 3'] },
  'volume-off': { lines: [SPEAKER, 'M17 9.5l5 5', 'M22 9.5l-5 5'] },
  sun: {
    lines: ['M10.5 8.5h3l2 2v3l-2 2h-3l-2-2v-3z', 'M12 1.5V4', 'M12 20v2.5', 'M1.5 12H4', 'M20 12h2.5', 'M4.7 4.7l1.8 1.8', 'M17.5 17.5l1.8 1.8', 'M4.7 19.3l1.8-1.8', 'M17.5 6.5l1.8-1.8'],
    // A smaller centre, so the rays keep a full stroke of space from it at 16 px.
    small: {
      lines: ['M11 9.5h2l1.5 1.5v2L13 14.5h-2L9.5 13v-2z', 'M12 1.5V4', 'M12 20v2.5', 'M1.5 12H4', 'M20 12h2.5', 'M4.7 4.7l1.8 1.8', 'M17.5 17.5l1.8 1.8', 'M4.7 19.3l1.8-1.8', 'M17.5 6.5l1.8-1.8'],
    },
  },
  moon: { lines: ['M17 3H9L3 9v6l6 6h6l6-6h-4l-4-4V7z'] },

  // Kit furniture
  'chevron-down': { lines: ['M6 9l6 6 6-6'] },
  'chevron-right': { lines: ['M9 6l6 6-6 6'] },
  'chevron-left': { lines: ['M15 6l-6 6 6 6'] },
  menu: { lines: ['M3 6h18', 'M3 12h18', 'M3 18h18'] },
  info: { lines: [OCTAGON, 'M12 11.5v6', 'M12 6.5h.01'] },
  warning: { lines: ['M12 1.5L22.5 12 12 22.5 1.5 12z', 'M12 8v3.5', 'M12 16h.01'] },
  error: { lines: [OCTAGON, 'M9 9l6 6', 'M15 9l-6 6'] },
} as const satisfies Record<string, IconDef>;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];
