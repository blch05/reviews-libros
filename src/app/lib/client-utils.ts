"use client";

// Funciones para interactuar con localStorage en el cliente
export function getTopReviewedBooks(limit: number = 10): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("reviews-"));
    const bookReviewCounts: { [id: string]: number } = {};
    
    keys.forEach(k => {
      try {
        const reviews = JSON.parse(localStorage.getItem(k) || "[]");
        if (reviews.length > 0) {
          const bookId = k.replace("reviews-", "");
          bookReviewCounts[bookId] = reviews.length;
        }
      } catch {
        // Ignorar entradas con JSON inválido
      }
    });
    
    return Object.entries(bookReviewCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)
      .slice(0, limit);
  } catch {
    return [];
  }
}

export function getCachedBook(bookId: string) {
  if (typeof window === 'undefined') return null;
  
  try {
    const bookKey = `bookdesc-${bookId}`;
    const cached = localStorage.getItem(bookKey);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

export function setCachedBook(bookId: string, bookData: any) {
  if (typeof window === 'undefined') return;
  
  const bookKey = `bookdesc-${bookId}`;
  localStorage.setItem(bookKey, JSON.stringify(bookData));
}
