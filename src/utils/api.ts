export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Offline Mock API implementation
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : null;

  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network latency

  // --- Records ---
  if (url === '/records') {
    let records = JSON.parse(localStorage.getItem('records') || '[]');
    if (method === 'GET') {
      return records.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    if (method === 'POST') {
      const newRecord = {
        id: Date.now(),
        ...body,
        created_at: new Date().toISOString()
      };
      records.push(newRecord);
      localStorage.setItem('records', JSON.stringify(records));
      return { id: newRecord.id };
    }
  }

  if (url.startsWith('/records/') && method === 'DELETE') {
    const id = parseInt(url.split('/')[2]);
    let records = JSON.parse(localStorage.getItem('records') || '[]');
    records = records.filter((r: any) => r.id !== id);
    localStorage.setItem('records', JSON.stringify(records));
    return { success: true };
  }

  throw new Error('Not found ' + url);
}
