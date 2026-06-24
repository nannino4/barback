declare module 'culori'
{
  type CuloriColor = Record<string, number | string | undefined> & {
    mode?: string;
    alpha?: number;
  };

  export function converter(mode: 'hex'): (value: string) => string | undefined;
  export function converter(mode: 'rgb'): (value: string) => CuloriColor | undefined;
  export function formatRgb(color: CuloriColor): string;
  export function formatHex(color: CuloriColor): string;
  export function parse(value: string): CuloriColor | undefined;
}
