import { describe, expect, it } from 'vitest';
import { COLLAB_PALETTE_COLORS, getInitials, getRandomUserColor } from '../utils/color.utils';

describe('color.utils', () => {
  it('should return valid hex color from palette', () => {
    const color = getRandomUserColor();
    expect(COLLAB_PALETTE_COLORS).toContain(color);
  });

  it('should return consistent color for the same seed', () => {
    const colorA = getRandomUserColor('user-123');
    const colorB = getRandomUserColor('user-123');
    expect(colorA).toBe(colorB);
  });

  it('should extract correct initials', () => {
    expect(getInitials('Duc Nguyen')).toBe('DN');
    expect(getInitials('John')).toBe('JO');
    expect(getInitials('A')).toBe('A');
    expect(getInitials('')).toBe('U');
  });
});
