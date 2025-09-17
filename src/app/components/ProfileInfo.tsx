"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { ProfileUtils, UserProfileStats } from "../lib/profile-utils";
import { Review } from "../../types";
import { getAuthToken } from "../lib/book-review-utils";

interface User {
  id: string;
  name: string;
  email: string;
}

interface ProfileInfoProps {
  user: User;
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name,
    email: user.email
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [userStats, setUserStats] = useState<UserProfileStats | null>(null);
  const { setUser } = useAuthStore();

  // Cargar estadísticas del usuario
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          console.error('No auth token available for user stats');
          return;
        }
        
        const response = await fetch('/api/reviews/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const stats = ProfileUtils.calculateUserStats(data.reviews || []);
          setUserStats(stats);
        } else {
          console.error('Error fetching user stats:', await response.json());
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    fetchUserStats();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: user.name,
      email: user.email
    });
    setMessage(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: user.name,
      email: user.email
    });
    setMessage(null);
  };

  const handleSave = async () => {
    const validation = ProfileUtils.validateProfileData(editData);
    
    if (!validation.isValid) {
      setMessage({ type: 'error', text: validation.errors[0] });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const token = getAuthToken();
      if (!token) {
        setMessage({ type: 'error', text: 'Error de autenticación. Intenta recargar la página.' });
        return;
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Actualizar el usuario en el store
        setUser({
          id: user.id,
          name: editData.name,
          email: editData.email
        });
        
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al actualizar el perfil' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Error de conexión. Intenta nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Información Personal */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-serif text-gray-900">Información Personal</h2>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="px-3 py-1 bg-[#616f55] text-white font-serif rounded-md text-sm font-semibold hover:bg-white hover:text-[#616f55] border border-[#616f55] transition"
            >
              ✏️ Editar
            </button>
          )}
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-serif">
              Nombre completo
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#616f55] focus:border-transparent font-serif"
                placeholder="Tu nombre completo"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 font-serif text-gray-900">
                {user.name}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-serif">
              Correo electrónico
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#616f55] focus:border-transparent font-serif"
                placeholder="tu@email.com"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 font-serif text-gray-900">
                {user.email}
              </div>
            )}
          </div>

          {/* Botones de edición */}
          {isEditing && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#616f55] text-white font-serif rounded-md font-semibold hover:bg-white hover:text-[#616f55] border border-[#616f55] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Guardando...' : '💾 Guardar'}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-500 text-white font-serif rounded-md font-semibold hover:bg-white hover:text-gray-500 border border-gray-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ❌ Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas del usuario */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold font-serif text-gray-900 mb-4">Mi Actividad</h3>
        
        {userStats ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-[#616f55]/10 rounded-lg">
              <div className="text-2xl font-bold text-[#616f55] font-serif">{userStats.totalReviews}</div>
              <div className="text-sm text-gray-600 font-serif">Reseñas escritas</div>
            </div>
            <div className="text-center p-4 bg-[#616f55]/10 rounded-lg">
              <div className="text-2xl font-bold text-[#616f55] font-serif">{userStats.booksReviewed}</div>
              <div className="text-sm text-gray-600 font-serif">Libros reseñados</div>
            </div>
            <div className="text-center p-4 bg-[#616f55]/10 rounded-lg">
              <div className="text-2xl font-bold text-[#616f55] font-serif">⭐ {userStats.averageRating}</div>
              <div className="text-sm text-gray-600 font-serif">Promedio de rating</div>
            </div>
            <div className="text-center p-4 bg-[#616f55]/10 rounded-lg">
              <div className="text-2xl font-bold text-[#616f55] font-serif">👍 {userStats.helpfulVotes}</div>
              <div className="text-sm text-gray-600 font-serif">Votos útiles recibidos</div>
            </div>
            {userStats.reviewsThisYear > 0 && (
              <div className="col-span-2 text-center p-4 bg-orange-100 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 font-serif">📚 {userStats.reviewsThisYear}</div>
                <div className="text-sm text-gray-600 font-serif">Reseñas este año</div>
              </div>
            )}
            {userStats.mostProductiveMonth && (
              <div className="col-span-2 text-center p-4 bg-blue-100 rounded-lg">
                <div className="text-lg font-bold text-blue-600 font-serif">🏆 {userStats.mostProductiveMonth}</div>
                <div className="text-sm text-gray-600 font-serif">Tu mes más productivo</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#616f55] mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600 font-serif">Cargando estadísticas...</p>
          </div>
        )}
      </div>
    </div>
  );
}