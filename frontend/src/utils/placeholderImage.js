const PLACEHOLDERS = {
  laptops: '/placeholders/laptop.svg',
  desktops: '/placeholders/desktop.svg',
  accessories: '/placeholders/accessories.svg',
  cameras: '/placeholders/cameras.svg',
  storage: '/placeholders/storage.svg',
  batteries: '/placeholders/batteries.svg',
};

export function getPlaceholderImage(categorySlug) {
  return PLACEHOLDERS[categorySlug] || PLACEHOLDERS.laptops;
}
