"use client";

import { getAuthToken } from './book-review-utils';

// Funciones para interactuar con la API en el cliente
export async function getTopReviewedBooks(limit: number = 10): Promise<string[]> {
  if (typeof window === 'undefined') return [];
  
  try {
    const token = getAuthToken();
    if (!token) {
      console.log('❌ No auth token available for stats request');
      return [];
    }

    const response = await fetch('/api/reviews/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Error fetching top books:', response.statusText);
      return [];
    }

    const data = await response.json();
    if (data.success && data.data.topBooks) {
      return data.data.topBooks.slice(0, limit).map((book: any) => book.bookId);
    }
    
    return [];
  } catch (error) {
    console.error('Error getting top reviewed books:', error);
    return [];
  }
}

// Cache en memoria para libros (solo durante la sesión)
const bookCache = new Map<string, any>();

export function getCachedBook(bookId: string) {
  return bookCache.get(bookId) || null;
}

export function setCachedBook(bookId: string, bookData: any) {
  bookCache.set(bookId, bookData);
}
