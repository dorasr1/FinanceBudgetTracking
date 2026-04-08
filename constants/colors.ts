// Design tokens — dark theme with lime-green accent, inspired by reference app
export const Colors = {
  // Backgrounds
  background: '#0A0A0A',
  surface: '#161616',
  surfaceElevated: '#222222',
  surfaceHigh: '#2C2C2C',
  border: '#2A2A2A',

  // Accent (lime green from the reference image)
  accent: '#C9FF2F',
  accentDark: '#8AB020',
  accentMuted: 'rgba(201, 255, 47, 0.12)',

  // Text
  text: '#FFFFFF',
  textSecondary: '#9E9E9E',
  textMuted: '#555555',

  // Semantic
  income: '#2ED573',
  expense: '#FF4757',
  warning: '#FFA502',
  info: '#4A9EFF',

  // Tab bar
  tabActive: '#C9FF2F',
  tabInactive: '#555555',

  // Category palette (matches reference image donut + list)
  categoryColors: {
    shopping: '#FF6B6B',
    travel: '#4A9EFF',
    grocery: '#2ED573',
    entertainment: '#A78BFA',
    food: '#FF8C42',
    health: '#FF4785',
    utilities: '#00C9B1',
    salary: '#C9FF2F',
    freelance: '#FFC048',
    investment: '#38BDF8',
    other: '#8E8E93',
  } as Record<string, string>,

  // Donut chart segment colors (4-segment palette matching reference)
  chartPalette: ['#4A9EFF', '#555555', '#2ED573', '#00C9B1', '#A78BFA', '#FF6B6B', '#FF8C42'],
};
