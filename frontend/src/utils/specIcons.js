export const SPEC_ICONS = {
  cpu: '🧠',
  ram: '🧮',
  storage: '💾',
  storageType: '💾',
  screen: '🖥️',
  gpu: '🎮',
  battery: '🔋',
  wifi: '📶',
  ruler: '📏',
  weight: '⚖️',
  os: '🪟',
  camera: '📷',
  info: 'ℹ️',
};

export function getSpecIcon(key) {
  return SPEC_ICONS[key] || 'ℹ️';
}
