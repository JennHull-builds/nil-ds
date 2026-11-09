import { useId } from 'react';
import type { SVGAttributes } from 'react';
import { ICONS } from './icons';
import type { IconDef, IconName } from './icons';

export type IconSize = 'sm' | 'md' | 'lg';

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, 'children' | 'name'> {
  name: IconName;
  /** `sm`, `md` and `lg` are `--nil-size-icon-sm|md|lg` (16, 20 and 24 px). Default `md`. */
  size?: IconSize;
  /**
   * An accessible name. Leave it out and the icon is decorative: `aria-hidden`, which is right
   * whenever the icon sits beside text or inside a Button that already has a name. Give it a
   * label only for an icon that stands alone and says something.
   */
  label?: string;
}

/**
 * The kit's icon set, "Cut", drawn for NIL (see `icons.ts` for the drawing rules). One SVG on a
 * 24 unit grid. The stroke comes from the border tokens in core.css: `--nil-border-width` at the
 * small size, `--nil-border-width-thick` at the other two, and it stays that many screen pixels
 * wide at every size. Colour is `currentColor`.
 */
export function Icon({ name, size = 'md', label, className, ...rest }: IconProps) {
  // React ids contain colons, which are awkward inside url(#...). Strip them.
  const maskId = `nil-icon-mask-${useId().replace(/:/g, '')}`;
  const def: IconDef = ICONS[name];
  // At 16 px a few drawings have a simpler form, so no gap is thinner than the stroke beside it.
  const shape = size === 'sm' && def.small ? def.small : def;
  const lines = shape.lines.map((d) => <path key={d} d={d} />);
  const solid = (shape.solid ?? []).map((d) => <path key={d} d={d} className="nil-icon__solid" />);

  return (
    <svg
      {...rest}
      viewBox="0 0 24 24"
      className={['nil-icon', `nil-icon--${size}`, className].filter(Boolean).join(' ')}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
    >
      {shape.slash ? (
        <>
          {/* A mask cuts a clear channel either side of the slash. Mask colours are mechanics, not
              design colours: white shows, black hides. */}
          <mask id={maskId} maskUnits="userSpaceOnUse" x={-2} y={-2} width={28} height={28}>
            <rect x={-2} y={-2} width={28} height={28} fill="white" stroke="none" />
            <path d={shape.slash} stroke="black" className="nil-icon__cut" />
          </mask>
          <g mask={`url(#${maskId})`}>
            {lines}
            {solid}
          </g>
          <path d={shape.slash} />
        </>
      ) : (
        <>
          {lines}
          {solid}
        </>
      )}
    </svg>
  );
}
