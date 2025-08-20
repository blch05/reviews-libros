"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buscarLibros } from "../lib/server-actions";
import { BookCard } from "./BookCard";

export function SearchSection() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  async function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);
    setBooks([]); // Limpiar los libros al iniciar nueva búsqueda
    try {
      const resultados = await buscarLibros(query);
      setBooks(resultados);
    } catch (error) {
      console.error("Error buscando libros:", error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectBook(id: string) {
    router.push(`/book/${id}`);
  }

  return (
    <main className="min-h-screen bg-white py-8 px-4 md:px-16 font-sans text-gray-900">
      <header className="w-screen fixed left-0 top-0 z-10 flex flex-row items-center bg-[#faf8f6] shadow-md py-3 mb-8 border-b border-gray-200 px-8">
        <button
          className="mr-4 text-3xl hover:scale-110 transition cursor-pointer"
          onClick={() => router.push("/")}
          aria-label="Ir a Home"
        >
          🧉
        </button>
        <div className="flex flex-col flex-1">
          <h1 className="text-2xl font-bold text-[#616f55] tracking-wide">Rate & Mate</h1>
        </div>
        <form onSubmit={handleBuscar} className="flex items-center gap-0 bg-white border border-gray-300 rounded-md mt-2 w-full max-w-lg overflow-hidden justify-center h-8">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar libro..."
            className="bg-transparent outline-none px-2 py-0 w-full text-sm font-serif placeholder-gray-400 border-none h-full"
          />
          <button type="submit" className="h-full px-2 py-0 bg-white text-black rounded-none text-sm hover:bg-gray-200 transition flex items-center justify-center border-l border-gray-300" aria-label="Buscar" style={{ minHeight: '32px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block align-middle">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </form>
      </header>
      <div className="flex justify-center">
        <p className="mb-2 text-gray-700 text-center max-w-xl">Buscar por nombre, por ISBN, o por autor.</p>
      </div>
      <div className="max-w-3xl mx-auto flex justify-center">
        {loading && <p className="text-black mb-4">Buscando...</p>}
        <div>
          {books.length > 0 ? (
            books.map(book => <BookCard key={book.id} book={book} onSelect={handleSelectBook} />)
          ) : hasSearched && !loading ? (
            <p className="text-gray-500">No hay resultados.</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
