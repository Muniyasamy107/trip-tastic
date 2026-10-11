const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.message || payload?.error || 'Something went wrong. Please try again.');
    error.apiUnavailable = response.status >= 500;
    throw error;
  }
  return payload;
}

export function getDestinations(search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return request(`/api/destinations${query}`);
}

export function createBooking(booking) {
  return request('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(booking),
  });
}
