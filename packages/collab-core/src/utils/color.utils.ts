export const COLLAB_PALETTE_COLORS = [
  '#4285f4', // Google Blue
  '#ea4335', // Google Red
  '#34a853', // Google Green
  '#fbbc05', // Google Yellow
  '#ff6d01', // Vivid Orange
  '#9c27b0', // Purple
  '#0097a7', // Cyan
  '#e91e63', // Pink
  '#3f51b5', // Indigo
  '#00897b', // Teal
  '#8e24aa', // Deep Purple
  '#d81b60', // Rose
] as const;

export const getRandomUserColor = (seed?: string): string => {
  if (!seed) {
    const randomIndex = Math.floor(Math.random() * COLLAB_PALETTE_COLORS.length);
    return COLLAB_PALETTE_COLORS[randomIndex] ?? '#4285f4';
  }

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % COLLAB_PALETTE_COLORS.length;
  return COLLAB_PALETTE_COLORS[index] ?? '#4285f4';
};

export const getInitials = (name: string): string => {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const firstWord = parts[0] ?? '';
    return firstWord.slice(0, 2).toUpperCase();
  }
  const first = parts[0] ?? '';
  const last = parts[parts.length - 1] ?? '';
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
};
