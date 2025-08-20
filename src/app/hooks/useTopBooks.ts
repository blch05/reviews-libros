"use client";

import { useState, useEffect } from "react";
import { getTopReviewedBooks, getCachedBook, setCachedBook } from "../lib/client-utils";
import { obtenerLibro } from "../lib/server-actions";

export function useTopBooks() {
  const [topBooks, setTopBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTopBooks() {
      try {
        setLoading(true);
        const topBookIds = getTopReviewedBooks(10);
        
        if (topBookIds.length === 0) {
          setTopBooks([]);
          return;
        }

        // Buscar datos de los libros, usando localStorage como cache
        const booksData = await Promise.all(
          topBookIds.map(async (id) => {
            const cached = getCachedBook(id);
            if (cached) {
              return cached;
            } else {
              try {
                const data = await obtenerLibro(id);
                setCachedBook(id, data);
                return data;
              } catch (error) {
                console.error(`Error fetching book ${id}:`, error);
                return null;
              }
            }
          })
        );

        const validBooks = booksData.filter(book => book !== null);
        setTopBooks(validBooks);
      } catch (error) {
        console.error("Error loading top books:", error);
        setTopBooks([]);
      } finally {
        setLoading(false);
      }
    }

    loadTopBooks();
  }, []);

  return { topBooks, loading };
}
