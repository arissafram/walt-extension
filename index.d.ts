export interface WaltBox {
  id: string;
  name: string;
}

/** Every box design, in the popup's order. */
export const WALT_BOXES: readonly WaltBox[];
export const DEFAULT_BOX_ID: string;
/** The box with this id, or the default box. */
export function waltBox(id: string): WaltBox;
/** The box's PNG path inside the extension, e.g. "boxes/walt-original.png". */
export function waltBoxPath(id: string): string;
/** The box's PNG as a URL a page can load. */
export function waltBoxUrl(id: string): string;

/** Speed in CSS pixels per second, in a full browser window. */
export const WALT_SPEED: { readonly x: number; readonly y: number };
/** The Size slider's range and starting value: the box's width in pixels. */
export const WALT_SIZE: { readonly min: number; readonly max: number; readonly initial: number };
/** The popup preview's box: its speed (px/s) and the width range Size maps onto. */
export const WALT_PREVIEW: {
  readonly speed: { readonly x: number; readonly y: number };
  readonly minW: number;
  readonly maxW: number;
};

export interface WaltBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
}
/** Moves `box` for `dt` seconds inside W×H, bouncing off the edges. `speed` scales the velocity. */
export function waltStep(box: WaltBody, dt: number, W: number, H: number, w: number, h: number, speed?: number): void;
/** The popup preview box's width for a Size value. */
export function waltPreviewWidth(size: number): number;
