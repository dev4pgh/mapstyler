export const rgbaToHex = (rgba: string | undefined): string => {
  if (!rgba) return '#ffffff';
  const match = rgba.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
  if (!match) return '#ffffff';
  const [r, g, b] = match.slice(1, 4).map(Number);
  if ([r, g, b].some((v) => v < 0 || v > 255)) return '#ffffff';
  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
};
  
  export const hexToRgba = (hex: string, alpha: number = 1): string => {
    const match = hex.match(/^#([A-Fa-f0-9]{6})$/);
    if (!match) return `rgba(0, 0, 0, ${alpha})`;
    const int = parseInt(match[1], 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `rgba(${r}, ${g}, ${b}, ${Math.min(Math.max(alpha, 0), 1)})`;
  };
  