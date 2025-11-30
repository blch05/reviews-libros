"use client";

import React, { useState, useEffect } from 'react';
import ProxyAwareBookImage from '../components/ProxyAwareBookImage';
import { StarSelector, StarDisplay } from '../../components/StarComponents';

export default function TestFullFlowPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stars, setStars] = useState(5);
  const [hoverStars, setHoverStars] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Datos del libro de prueba
  const testBook = {
    id: 'test-book-123',
    title: 'The Great Gatsby',
    authors: ['F. Scott Fitzgerald'],
    description: 'A classic American novel about the Jazz Age.',
    coverUrl: 'https://books.google.com/books/content/images/frontcover/buc0AAAAMAAJ'
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const loginMock = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(true);
        setAuthToken(data.token);
        setUser(data.user);
        setMessage({ type: 'success', text: '✅ Autenticación exitosa' });
        console.log('✅ Mock login successful:', data);
      } else {
        setMessage({ type: 'error', text: '❌ Error en autenticación mock' });
        console.error('❌ Mock login failed:', data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Error durante login mock' });
      console.error('❌ Error during mock login:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?bookId=${testBook.id}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data.reviews || []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const createReview = async () => {
    if (!isAuthenticated) {
      setMessage({ type: 'error', text: '❌ Debes autenticarte primero' });
      return;
    }

    if (reviewText.trim().length < 20) {
      setMessage({ type: 'error', text: '❌ La reseña debe tener al menos 20 caracteres' });
      return;
    }

    try {
      setLoading(true);
      
      const reviewData = {
        bookId: testBook.id,
        content: reviewText.trim(),
        rating: stars,
        title: `Mi opinión sobre ${testBook.title}`,
        bookTitle: testBook.title,
        bookAuthor: testBook.authors,
        bookThumbnail: testBook.coverUrl
      };

      console.log('📊 Creating review with data:', reviewData);

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();
      console.log('📥 Review creation response:', data);

      if (data.success) {
        setMessage({ type: 'success', text: '✅ Reseña creada exitosamente' });
        setReviewText('');
        setStars(5);
        await loadReviews(); // Recargar reseñas
      } else {
        setMessage({ type: 'error', text: `❌ Error: ${data.message}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Error creando reseña' });
      console.error('Error creating review:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAuthToken('');
    setUser(null);
    setMessage({ type: 'success', text: '👋 Sesión cerrada' });
  };

  // Limpiar mensaje después de 5 segundos
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const ratingValidation = {
    isValidRange: stars >= 1 && stars <= 5,
    isValidIncrement: (stars * 2) % 1 === 0,
    get isValid() { return this.isValidRange && this.isValidIncrement; }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header con estilo similar a la app */}
      <header className="w-full bg-[#faf8f6] shadow-md py-3 mb-8 border-b border-gray-200 px-8">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className="text-3xl hover:scale-110 transition cursor-pointer"
              aria-label="Ir a Home"
            >
              🧉
            </button>
            <h1 className="text-2xl font-bold text-[#616f55] tracking-wide">
              🧪 Test: Flujo Completo de Reviews
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">👤 {user?.name}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <button
                onClick={loginMock}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm disabled:opacity-50"
              >
                {loading ? '⏳' : '🔓'} Login Mock
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="px-8 max-w-6xl mx-auto">
        {/* Mensaje de estado */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Información del libro */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">{testBook.title}</h2>
              
              <div className="flex gap-6 mb-4">
                <ProxyAwareBookImage
                  src={testBook.coverUrl}
                  alt={testBook.title}
                  size="lg"
                  showRetry={true}
                  showAttempts={true}
                />
                
                <div className="flex-1">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-bold text-gray-700">Autor(es):</span>
                      <span className="ml-2">{testBook.authors.join(', ')}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-700">ID del libro:</span>
                      <span className="ml-2 font-mono text-xs">{testBook.id}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-700">Total de reseñas:</span>
                      <span className="ml-2">{reviews.length}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm">{testBook.description}</p>
            </div>
          </div>

          {/* Formulario de reseña */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">📝 Crear Reseña</h3>
              
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ⭐ Calificación
                    </label>
                    <div className="flex items-center gap-3">
                      <StarSelector 
                        stars={stars} 
                        setStars={setStars} 
                        hoverStars={hoverStars} 
                        setHoverStars={setHoverStars} 
                      />
                      <span className="text-sm text-gray-600">
                        {stars} estrella{stars !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Validación: {ratingValidation.isValid ? '✅ Válido' : '❌ Inválido'} 
                      (Rango: {ratingValidation.isValidRange ? '✅' : '❌'}, 
                      Incremento: {ratingValidation.isValidIncrement ? '✅' : '❌'})
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📄 Contenido de la reseña
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Escribe tu reseña aquí... (mínimo 20 caracteres)"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      rows={4}
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      {reviewText.length} caracteres 
                      {reviewText.length < 20 && ` (faltan ${20 - reviewText.length})`}
                    </div>
                  </div>

                  <button
                    onClick={createReview}
                    disabled={loading || !ratingValidation.isValid || reviewText.length < 20}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      loading || !ratingValidation.isValid || reviewText.length < 20
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {loading ? '⏳ Creando...' : '📝 Crear Reseña'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">🔒 Debes autenticarte para crear una reseña</p>
                  <button
                    onClick={loginMock}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? '⏳ Autenticando...' : '🔓 Login Mock'}
                  </button>
                </div>
              )}
            </div>

            {/* Lista de reseñas */}
            <div className="bg-white rounded-lg p-6 shadow-lg mt-6">
              <h3 className="text-xl font-bold mb-4">💬 Reseñas ({reviews.length})</h3>
              
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <StarDisplay stars={review.rating} />
                        <span className="text-sm text-gray-600">por {review.userName}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{review.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  📭 No hay reseñas aún. ¡Sé el primero en escribir una!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}