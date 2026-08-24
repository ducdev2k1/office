export const DEFAULT_THEME_COLORS = [
  '#FFFFFF', // 0: Background 1 (Light 1)
  '#000000', // 1: Text 1 (Dark 1)
  '#E7E6E6', // 2: Background 2 (Light 2)
  '#44546A', // 3: Text 2 (Dark 2)
  '#4472C4', // 4: Accent 1 (Blue)
  '#ED7D31', // 5: Accent 2 (Orange)
  '#A5A5A5', // 6: Accent 3 (Gray)
  '#FFC000', // 7: Accent 4 (Gold/Yellow)
  '#5B9BD5', // 8: Accent 5 (Light Blue)
  '#70AD47', // 9: Accent 6 (Green)
  '#0563C1', // 10: Hyperlink
  '#954F72', // 11: Followed Hyperlink
];

export const DEFAULT_STATUS_STYLES: Record<string, { bg: string; cl: string; bl?: number }> = {
  'chờ fix': { bg: '#ffd5d5', cl: '#c00000', bl: 1 },
  done: { bg: '#ffeb9c', cl: '#9c6500', bl: 1 },
  doing: { bg: '#e1d5e7', cl: '#674ea7', bl: 1 },
  new: { bg: '#d5e8d4', cl: '#27500a', bl: 1 },
  retest: { bg: '#fce5cd', cl: '#a64d79', bl: 1 },
  'done testcase': { bg: '#deeaf1', cl: '#1f4e79', bl: 1 },
  confirmed: { bg: '#fce4d6', cl: '#791f1f', bl: 1 },
  fixing: { bg: '#fff2cc', cl: '#633806', bl: 1 },
  resolved: { bg: '#e1f5ee', cl: '#085041', bl: 1 },
  critical: { bg: '#ffd5d5', cl: '#c00000', bl: 1 },
  high: { bg: '#fff2cc', cl: '#c55a11', bl: 1 },
  medium: { bg: '#deeaf1', cl: '#1f4e79', bl: 1 },
  low: { bg: '#e2efda', cl: '#27500a', bl: 1 },
};
