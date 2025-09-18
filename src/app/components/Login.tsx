'use client';

import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export default function Login({ onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { loginUser, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    const success = await loginUser(email, password);
    if (!success) {
      setError('Email o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo dividido como en el carrusel */}
      <div className="fixed inset-0 flex">
        <div className="w-1/2 bg-[#251711]"></div>
        <div className="w-1/2 bg-[#616f55]"></div>
      </div>
      
      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#faf8f6] rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-200">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🧉</div>
            <h1 className="text-3xl font-bold text-[#616f55] mb-2 font-serif">
              Rate & Mate
            </h1>
            <p className="text-gray-600 font-sans text-sm">
              Inicia sesión para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-sans text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#616f55] focus:border-transparent transition-all duration-200 font-sans"
                placeholder="tu@ejemplo.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#616f55] focus:border-transparent transition-all duration-200 font-sans"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#616f55] text-white py-3 px-4 rounded-lg hover:bg-[#4a5643] focus:ring-2 focus:ring-[#616f55] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium font-sans"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 font-sans text-sm">
              ¿No tienes cuenta?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-[#616f55] hover:text-[#4a5643] font-medium transition-colors duration-200"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
