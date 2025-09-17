"use client";

import React, { useState } from 'react';
import ProxyAwareBookImage from '../components/ProxyAwareBookImage';

export default function TestImagesPage() {
  const [testUrl, setTestUrl] = useState('https://books.google.com/books/content/images/frontcover/buc0AAAAMAAJ');
  
  const sampleImages = [
    {
      title: "Test Image 1",
      url: "https://books.google.com/books/content/images/frontcover/buc0AAAAMAAJ",
      description: "Imagen de prueba desde Google Books API"
    },
    {
      title: "Test Image 2", 
      url: "https://books.google.com/books/content?id=buc0AAAAMAAJ&printsec=frontcover&img=1&zoom=1",
      description: "Imagen con parámetros adicionales"
    },
    {
      title: "Test Image 3",
      url: "https://books.google.com/books/content/images/frontcover/example123.jpg",
      description: "URL de prueba (puede no existir)"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          🧪 Prueba de Carga de Imágenes con Proxy
        </h1>

        {/* Input para probar URLs personalizadas */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">🔧 Prueba URL Personalizada</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="Ingresa una URL de imagen de Google Books..."
              className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <ProxyAwareBookImage
              src={testUrl}
              alt="Test Image"
              size="lg"
              className="mx-auto"
              showRetry={true}
              showAttempts={true}
              onLoad={() => console.log('✅ Custom URL loaded:', testUrl)}
              onError={(error) => console.warn('❌ Custom URL failed:', testUrl, error)}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 break-all">
            URL actual: {testUrl}
          </div>
        </div>

        {/* Grid de imágenes de prueba */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleImages.map((img, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                {img.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {img.description}
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                <ProxyAwareBookImage
                  src={img.url}
                  alt={img.title}
                  size="md"
                  className="mx-auto"
                  showRetry={true}
                  showAttempts={true}
                  onLoad={() => console.log(`✅ ${img.title} loaded`)}
                  onError={(error) => console.warn(`❌ ${img.title} failed:`, error)}
                />
              </div>
              
              <div className="mt-3 p-2 bg-gray-100 rounded text-xs break-all">
                <strong>URL:</strong> {img.url}
              </div>
            </div>
          ))}
        </div>

        {/* Información técnica */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3 text-blue-800">
            ℹ️ Información Técnica
          </h2>
          <div className="space-y-2 text-sm text-blue-700">
            <p><strong>Puerto del servidor:</strong> {typeof window !== 'undefined' ? window.location.port : 'N/A'}</p>
            <p><strong>Hostname:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</p>
            <p><strong>Proxy activo:</strong> {typeof window !== 'undefined' && window.location.hostname === 'localhost' ? '✅ Sí' : '❌ No'}</p>
            <p><strong>Endpoint del proxy:</strong> <code>/api/proxy-image</code></p>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mr-4"
          >
            🏠 Volver al Home
          </button>
          <button
            onClick={() => console.clear()}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            🧹 Limpiar Console
          </button>
        </div>
      </div>
    </div>
  );
}