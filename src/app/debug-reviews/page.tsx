"use client";

import React, { useState } from 'react';
import { StarSelector } from '../../components/StarComponents';

export default function DebugReviewsPage() {
  const [stars, setStars] = useState(5);
  const [hoverStars, setHoverStars] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("Esta es una reseña de prueba para verificar que el sistema funciona correctamente.");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string>('');

  // Función para hacer login mock
  const loginMock = async () => {
    try {
      const response = await fetch('/api/auth/login-mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(true);
        setAuthToken(data.token);
        console.log('✅ Mock login successful:', data);
      } else {
        console.error('❌ Mock login failed:', data);
      }
    } catch (error) {
      console.error('❌ Error during mock login:', error);
    }
  };

  const testCreateReview = async () => {
    setLoading(true);
    setResponse(null);

    console.log('🧪 Test: Creating review with rating:', {
      rating: stars,
      type: typeof stars,
      isValid: stars >= 1 && stars <= 5 && (stars * 2) % 1 === 0
    });

    try {
      // Simular datos de prueba
      const testData = {
        bookId: 'test-book-123',
        content: reviewText,
        rating: stars,
        title: 'Mi reseña de prueba',
        bookTitle: 'Libro de Prueba',
        bookAuthor: ['Autor de Prueba'],
        bookThumbnail: 'https://via.placeholder.com/150'
      };

      console.log('📋 Sending test data:', JSON.stringify(testData, null, 2));

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(testData),
      });

      const data = await response.json();
      
      setResponse({
        status: response.status,
        statusText: response.statusText,
        data: data,
        success: response.ok
      });

      console.log('📥 Response received:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });

    } catch (error) {
      console.error('❌ Error testing review creation:', error);
      setResponse({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  const ratingValidation = {
    isValidRange: stars >= 1 && stars <= 5,
    isValidIncrement: Number.isInteger(stars),
    get isValid() { return this.isValidRange && this.isValidIncrement; }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          🧪 Debug: Sistema de Reviews
        </h1>

        {/* Panel de Debug */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">🔧 Panel de Debug</h2>
          
          {/* Authentication Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">🔐 Estado de Autenticación</h3>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isAuthenticated 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isAuthenticated ? '✅ Autenticado' : '❌ No autenticado'}
              </span>
              {!isAuthenticated && (
                <button
                  onClick={loginMock}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                >
                  🔓 Login Mock
                </button>
              )}
              {authToken && (
                <span className="text-xs text-gray-500 font-mono">
                  Token: {authToken.substring(0, 20)}...
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rating Selector */}
            <div>
              <h3 className="text-lg font-medium mb-3">⭐ Selector de Rating</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-semibold">Rating:</span>
                  <StarSelector 
                    stars={stars} 
                    setStars={setStars} 
                    hoverStars={hoverStars} 
                    setHoverStars={setHoverStars} 
                  />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Valor actual:</span>
                    <span className="font-mono">{stars}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tipo:</span>
                    <span className="font-mono">{typeof stars}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Rango válido (1-5):</span>
                    <span className={ratingValidation.isValidRange ? 'text-green-600' : 'text-red-600'}>
                      {ratingValidation.isValidRange ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Número entero:</span>
                    <span className={ratingValidation.isValidIncrement ? 'text-green-600' : 'text-red-600'}>
                      {ratingValidation.isValidIncrement ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Estado general:</span>
                    <span className={ratingValidation.isValid ? 'text-green-600' : 'text-red-600'}>
                      {ratingValidation.isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Text */}
            <div>
              <h3 className="text-lg font-medium mb-3">📝 Contenido de Review</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Escribe tu reseña de prueba..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows={4}
                />
                <div className="mt-2 text-xs text-gray-500">
                  Caracteres: {reviewText.length} (mínimo 20)
                </div>
              </div>
            </div>
          </div>

          {/* Test Button */}
          <div className="mt-6 text-center">
            <button
              onClick={testCreateReview}
              disabled={loading || !ratingValidation.isValid || reviewText.length < 20 || !isAuthenticated}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                loading || !ratingValidation.isValid || reviewText.length < 20 || !isAuthenticated
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? '🔄 Probando...' : '🧪 Probar Creación de Review'}
            </button>
            {!isAuthenticated && (
              <p className="mt-2 text-sm text-red-600">
                ⚠️ Debes autenticarte primero usando el botón &quot;Login Mock&quot;
              </p>
            )}
          </div>
        </div>

        {/* Response Panel */}
        {response && (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">📥 Respuesta del Servidor</h2>
            
            <div className={`p-4 rounded-lg mb-4 ${
              response.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-lg ${response.success ? 'text-green-600' : 'text-red-600'}`}>
                  {response.success ? '✅' : '❌'}
                </span>
                <span className="font-semibold">
                  {response.success ? 'Éxito' : 'Error'}
                </span>
                {response.status && (
                  <span className="text-sm text-gray-600">
                    (HTTP {response.status} - {response.statusText})
                  </span>
                )}
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Respuesta completa:</h3>
              <pre className="text-xs overflow-auto max-h-96 bg-white p-3 rounded border">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition mr-4"
          >
            🏠 Volver al Home
          </button>
          <button
            onClick={() => console.clear()}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
          >
            🧹 Limpiar Console
          </button>
        </div>
      </div>
    </div>
  );
}