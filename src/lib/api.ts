const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export async function callFunction<T>(name: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publishableKey}`,
        apikey: publishableKey,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Network error. Please check your connection and try again.');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || 'Something went wrong. Please try again.');
  }
  if (!data || typeof data !== 'object') {
    throw new Error('Unexpected response from the server. Please try again.');
  }
  return data as T;
}
