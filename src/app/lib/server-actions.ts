"use server";

import { exec } from 'child_process';
import { promisify } from 'util';
import { revalidatePath } from 'next/cache';

const execAsync = promisify(exec);

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

// Server Action para buildear la aplicación
export async function buildearApp() {
  try {
    console.log('Iniciando build de la aplicación...');
    
    // Ejecutar el comando de build
    const { stdout, stderr } = await execAsync('npm run build', {
      cwd: process.cwd(),
      timeout: 300000 // 5 minutos timeout
    });
    
    // Revalidar todas las rutas principales
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/book/[id]', 'page');
    
    console.log('Build completado exitosamente');
    
    return {
      success: true,
      message: 'Build completado exitosamente',
      output: stdout,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error durante el build:', error);
    
    return {
      success: false,
      message: 'Build falló',
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    };
  }
}

// Server Action para limpiar caché y revalidar rutas
export async function revalidarApp() {
  try {
    // Revalidar todas las rutas principales
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/book/[id]', 'page');
    
    return {
      success: true,
      message: 'Caché revalidado exitosamente',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error al revalidar caché',
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    };
  }
}
