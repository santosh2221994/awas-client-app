export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString();
}
