export function capitalizeWords(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export const capitalizeFirst = (str) => {
  if (!str || typeof str !== 'string') return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
