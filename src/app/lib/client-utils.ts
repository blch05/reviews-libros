"use client";

// Funciones para interactuar con localStorage en el cliente
export function getTopReviewedBooks(limit: number = 10): string[] {
  if (typeof window === 'undefined') return [];
  
  const keys = Object.keys(localStorage).filter(k => k.startsWith("reviews-"));
  const bookReviewCounts: { [id: string]: number } = {};
  
  keys.forEach(k => {
    const reviews = JSON.parse(localStorage.getItem(k) || "[]");
    if (reviews.length > 0) {
      const bookId = k.replace("reviews-", "");
      bookReviewCounts[bookId] = reviews.length;
    }
  });
  
  return Object.entries(bookReviewCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, limit);
}

export function getCachedBook(bookId: string) {
  if (typeof window === 'undefined') return null;
  
  const bookKey = `bookdesc-${bookId}`;
  const cached = localStorage.getItem(bookKey);
  return cached ? JSON.parse(cached) : null;
}

export function setCachedBook(bookId: string, bookData: any) {
  if (typeof window === 'undefined') return;
  
  const bookKey = `bookdesc-${bookId}`;
  localStorage.setItem(bookKey, JSON.stringify(bookData));
}
