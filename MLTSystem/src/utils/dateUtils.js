// Utility functions to format dates/times in Malaysia timezone (Asia/Kuala_Lumpur)
export function formatMalaysiaDate(input, options = {}) {
  if (!input) return '';
  const date = input instanceof Date ? input : new Date(input);
  return date.toLocaleDateString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', ...options });
}

export function formatMalaysiaTime(input, options = {}) {
  if (!input) return '';
  // Handle simple time strings like "09:00" or "09:00:00"
  if (typeof input === 'string') {
    const t = input.trim();
    const hmMatch = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (hmMatch) {
      const h = hmMatch[1].padStart(2, '0');
      const m = hmMatch[2];
      const s = hmMatch[3] || '00';
      const context = options && options.dateContext ? new Date(options.dateContext) : new Date();
      context.setHours(parseInt(h, 10), parseInt(m, 10), parseInt(s, 10), 0);
      const defaultOpts = { hour: '2-digit', minute: '2-digit', hour12: false };
      return context.toLocaleTimeString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', ...defaultOpts, ...options });
    }
  }

  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) {
    // Fallback: if parsing fails, return the original input string
    return typeof input === 'string' ? input : '';
  }

  const defaultOpts = { hour: '2-digit', minute: '2-digit', hour12: false };
  return date.toLocaleTimeString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', ...defaultOpts, ...options });
}

export function formatMalaysiaDateTime(input, options = {}) {
  if (!input) return '';
  const date = input instanceof Date ? input : new Date(input);
  return date.toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', ...options });
}

export default {
  formatMalaysiaDate,
  formatMalaysiaTime,
  formatMalaysiaDateTime,
};
