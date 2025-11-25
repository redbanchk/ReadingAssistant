const toIsbn10 = (isbn13: string): string | null => {
  if (!isbn13 || isbn13.length !== 13) return null;
  if (!isbn13.startsWith('978')) return null;
  const core = isbn13.slice(3, 12);
  if (!/^[0-9]{9}$/.test(core)) return null;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(core[i], 10) * (10 - (i + 1));
  const check = (11 - (sum % 11)) % 11;
  const d = check === 10 ? 'X' : String(check);
  return core + d;
};

export const getCoverFromISBN = async (isbn: string): Promise<string | null> => {
  try {
    const cleanIsbn = isbn.replace(/-/g, '').trim().toUpperCase();
    if (cleanIsbn.length < 10) return null;

    try {
      const resp = await fetch('https://yqyosawsesrjhfvfdcws.functions.supabase.co/douban-isbn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' && (process.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY)) || '')}`,
        },
        body: JSON.stringify({ isbn: cleanIsbn }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (typeof data?.cover_url === 'string' && data.cover_url) return data.cover_url;
      }
    } catch {}

    const candidates: string[] = [];
    candidates.push(`https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg?default=false`);
    if (cleanIsbn.length === 13) {
      const i10 = toIsbn10(cleanIsbn);
      if (i10) candidates.push(`https://covers.openlibrary.org/b/isbn/${i10}-L.jpg?default=false`);
    }

    for (const url of candidates) {
      const res = await fetch(url);
      if (res.ok && res.status === 200) return res.url;
    }

    const meta1 = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
    if (meta1.ok) {
      const data = await meta1.json();
      const key = `ISBN:${cleanIsbn}`;
      const cover = data?.[key]?.cover;
      const url = cover?.large || cover?.medium || cover?.small;
      if (typeof url === 'string' && url) return url;
    }

    if (cleanIsbn.length === 13) {
      const i10 = toIsbn10(cleanIsbn);
      if (i10) {
        const meta2 = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${i10}&format=json&jscmd=data`);
        if (meta2.ok) {
          const data = await meta2.json();
          const key = `ISBN:${i10}`;
          const cover = data?.[key]?.cover;
          const url = cover?.large || cover?.medium || cover?.small;
          if (typeof url === 'string' && url) return url;
        }
      }
    }

    const gb = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`);
    if (gb.ok) {
      const data = await gb.json();
      const links = data?.items?.[0]?.volumeInfo?.imageLinks;
      let url: string | undefined = links?.thumbnail || links?.smallThumbnail || links?.medium || links?.large;
      if (typeof url === 'string' && url) {
        if (url.startsWith('http:')) url = url.replace('http:', 'https:');
        return url;
      }
    }

    if (cleanIsbn.length === 13) {
      const i10 = toIsbn10(cleanIsbn);
      if (i10) {
        const gb2 = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${i10}`);
        if (gb2.ok) {
          const data = await gb2.json();
          const links = data?.items?.[0]?.volumeInfo?.imageLinks;
          let url: string | undefined = links?.thumbnail || links?.smallThumbnail || links?.medium || links?.large;
          if (typeof url === 'string' && url) {
            if (url.startsWith('http:')) url = url.replace('http:', 'https:');
            return url;
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching cover:", error);
    return null;
  }
};

export const getPagesFromISBN = async (isbn: string): Promise<number | null> => {
  try {
    const cleanIsbn = isbn.replace(/-/g, '').trim();
    if (cleanIsbn.length < 10) return null;

    try {
      const resp = await fetch('https://yqyosawsesrjhfvfdcws.functions.supabase.co/douban-isbn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' && (process.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY)) || '')}`,
        },
        body: JSON.stringify({ isbn: cleanIsbn }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (typeof data?.total_pages === 'number') return data.total_pages;
      }
    } catch {}

    // Try OpenLibrary work endpoint
    const meta1 = await fetch(`https://openlibrary.org/isbn/${cleanIsbn}.json`);
    if (meta1.ok) {
      const data = await meta1.json();
      if (typeof data?.number_of_pages === 'number') return data.number_of_pages;
    }

    // Fallback API
    const meta2 = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
    if (meta2.ok) {
      const data = await meta2.json();
      const key = `ISBN:${cleanIsbn}`;
      const pages = data?.[key]?.number_of_pages;
      if (typeof pages === 'number') return pages;
    }

    // Final fallback: Google Books (no key required)
    const meta3 = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`);
    if (meta3.ok) {
      const data = await meta3.json();
      const pages = data?.items?.[0]?.volumeInfo?.pageCount;
      if (typeof pages === 'number') return pages;
    }

    return null;
  } catch (error) {
    console.error("Error fetching pages:", error);
    return null;
  }
};
