export class ApiError extends Error {}

export async function apiFetch<T>(
  path: string,
  init?: Omit<RequestInit, "body"> & { body?: unknown }
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json", ...init.headers } : init?.headers,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(json?.error ?? `Request to ${path} failed with status ${res.status}.`);
  }
  return json as T;
}

// "17:00:00" -> "5:00 PM"
export function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${period}`;
}
