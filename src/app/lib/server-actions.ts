"use server";

// Función para buscar libros en la API de Google Books
export async function buscarLibros(query: string) {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  return data.items || [];
}

// Función para obtener datos de un libro específico
export async function obtenerLibro(id: string) {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
  const data = await res.json();
  return data;
}

// Función para obtener múltiples libros por IDs
export async function obtenerLibrosPorIds(ids: string[]) {
  const libros = await Promise.all(
    ids.map(async (id) => {
      try {
        return await obtenerLibro(id);
      } catch (error) {
        console.error(`Error fetching book ${id}:`, error);
        return null;
      }
    })
  );
  return libros.filter(libro => libro !== null);
}
