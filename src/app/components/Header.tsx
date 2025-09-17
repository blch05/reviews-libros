'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { buscarLibros } from '../lib/server-actions';

export default function Header() {
  const { user, logoutUser } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    setShowUserMenu(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setShowResults(true);
    try {
      const resultados = await buscarLibros(query);
      setSearchResults(resultados);
    } catch (error) {
      console.error('Error buscando libros:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBook = (id: string) => {
    router.push(`/book/${id}`);
    setShowResults(false);
    setQuery('');
  };

  const handleLogin = () => {
    // Esta función se puede usar si necesitas navegar a login desde otra parte
    router.push('/');
  };

  return (
    <>
      <header className="w-full fixed left-0 top-0 z-50 bg-[#faf8f6] shadow-md border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo y nombre */}
          <div className="flex items-center">
            <button
              className="mr-4 text-3xl hover:scale-110 transition cursor-pointer"
              onClick={() => router.push('/')}
              aria-label="Ir a Home"
            >
              🧉
            </button>
            <h1 className="text-2xl font-bold text-[#616f55] tracking-wide">
              Rate & Mate
            </h1>
          </div>

          {/* Barra de búsqueda central */}
          <div className="flex-1 max-w-lg mx-8 relative">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar libros, autores, ISBN..."
                  className="flex-1 px-4 py-2 text-sm outline-none placeholder-gray-400 text-black"
                />
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-300"
                  aria-label="Buscar"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <circle cx="11" cy="11" r="7" strokeWidth="2"/>
                    <line x1="16.5" y1="16.5" x2="21" y2="21" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </form>

            {/* Resultados de búsqueda */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto z-50">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="inline-flex items-center text-black">
                      <svg className="animate-spin h-4 w-4 mr-2 text-black" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      <span className="text-black">Buscando...</span>
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {searchResults.map((book) => (
                      <div
                        key={book.id}
                        onClick={() => handleSelectBook(book.id)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          {book.volumeInfo?.imageLinks?.thumbnail && (
                            <img 
                              src={book.volumeInfo.imageLinks.thumbnail} 
                              alt={book.volumeInfo.title || 'Libro'}
                              className="w-10 h-14 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium truncate text-black">
                              {book.volumeInfo?.title || 'Título no disponible'}
                            </h3>
                            {book.volumeInfo?.authors && (
                              <p className="text-xs text-black truncate">
                                {book.volumeInfo.authors.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-black text-sm">
                    No se encontraron resultados para &quot;{query}&quot;
                  </div>
                )}
                <div className="p-2 border-t border-gray-100">
                  <button
                    onClick={() => setShowResults(false)}
                    className="w-full text-xs text-black hover:text-gray-700 transition-colors"
                  >
                    Cerrar resultados
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Área de usuario */}
          <div className="flex items-center">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                >
                  <span className="text-sm text-gray-700">
                    Hola, <span className="font-medium">{user.name}</span>
                  </span>
                  <div className="w-8 h-8 bg-[#616f55] rounded-full flex items-center justify-center text-white">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                </button>

                {/* Menú desplegable */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => {
                        router.push('/profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      <span>Mi perfil</span>
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-[#616f55] text-white px-4 py-2 rounded-lg hover:bg-[#4a5643] transition-colors text-sm font-medium"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Overlay para cerrar menús al hacer clic fuera */}
      {(showUserMenu || showResults) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowUserMenu(false);
            setShowResults(false);
          }}
        />
      )}

      {/* Espaciador para compensar el header fijo */}
      <div className="h-20" />
    </>
  );
}
