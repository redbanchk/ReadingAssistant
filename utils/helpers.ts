export const getCoverFromISBN = async (isbn: string): Promise<string | null> => {
  try {
    const cleanIsbn = isbn.replace(/-/g, '').trim();
    if (cleanIsbn.length < 10) return null;
    const response = await fetch(`https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg?default=false`);
    if (response.ok && response.status === 200) {
      return response.url;
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

    return null;
  } catch (error) {
    console.error("Error fetching pages:", error);
    return null;
  }
};
