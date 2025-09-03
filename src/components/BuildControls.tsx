"use client";

import { useState } from 'react';
import { buildearApp, revalidarApp } from '../app/lib/server-actions';

export default function BuildControls() {
  const [buildStatus, setBuildStatus] = useState<{
    loading: boolean;
    message: string;
    success: boolean | null;
  }>({
    loading: false,
    message: '',
    success: null
  });

  const handleBuild = async () => {
    setBuildStatus({ loading: true, message: 'Iniciando build...', success: null });
    
    try {
      const result = await buildearApp();
      
      setBuildStatus({
        loading: false,
        message: result.message,
        success: result.success
      });
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        setBuildStatus(prev => ({ ...prev, message: '', success: null }));
      }, 5000);
      
    } catch (error) {
      setBuildStatus({
        loading: false,
        message: 'Error al ejecutar build',
        success: false
      });
      
      setTimeout(() => {
        setBuildStatus(prev => ({ ...prev, message: '', success: null }));
      }, 5000);
    }
  };

  const handleRevalidate = async () => {
    setBuildStatus({ loading: true, message: 'Revalidando caché...', success: null });
    
    try {
      const result = await revalidarApp();
      
      setBuildStatus({
        loading: false,
        message: result.message,
        success: result.success
      });
      
      setTimeout(() => {
        setBuildStatus(prev => ({ ...prev, message: '', success: null }));
      }, 3000);
      
    } catch (error) {
      setBuildStatus({
        loading: false,
        message: 'Error al revalidar caché',
        success: false
      });
      
      setTimeout(() => {
        setBuildStatus(prev => ({ ...prev, message: '', success: null }));
      }, 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Controles de Build</h3>
      
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <button
          onClick={handleBuild}
          disabled={buildStatus.loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {buildStatus.loading ? '🔄 Buildeando...' : '🚀 Buildear App'}
        </button>
        
        <button
          onClick={handleRevalidate}
          disabled={buildStatus.loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {buildStatus.loading ? '🔄 Revalidando...' : '♻️ Revalidar Caché'}
        </button>
      </div>
      
      {buildStatus.message && (
        <div className={`p-3 rounded-md text-sm ${
          buildStatus.success === true 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : buildStatus.success === false
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {buildStatus.message}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Build:</strong> Compila toda la aplicación y regenera páginas estáticas</p>
        <p><strong>Revalidar:</strong> Limpia el caché y actualiza las rutas sin rebuild completo</p>
      </div>
    </div>
  );
}
