"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { Review } from "../../types";
import ProfileInfo from "../components/ProfileInfo";
import UserReviewHistory from "../components/UserReviewHistory";
import { getAuthToken } from "../lib/book-review-utils";

export default function Profile() {
  const { isAuthenticated, user, isLoading } = useAuthStatus();
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  // Cargar las reseñas del usuario
  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!isAuthenticated || !user?.id) return;
      
      try {
        setLoading(true);
        const token = getAuthToken();
        
        if (!token) {
          console.error('No auth token available for user reviews');
          return;
        }
        
        const response = await fetch('/api/reviews/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserReviews(data.reviews || []);
        } else {
          const errorData = await response.json();
          console.error('Error fetching user reviews:', errorData);
        }
      } catch (error) {
        console.error('Error fetching user reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserReviews();
  }, [isAuthenticated, user?.id]);

  // Función para actualizar la lista después de editar/eliminar
  const handleReviewUpdate = (updatedReview: Review) => {
    setUserReviews(prev => prev.map(review => 
      review._id === updatedReview._id ? updatedReview : review
    ));
  };

  const handleReviewDelete = (reviewId: string) => {
    setUserReviews(prev => prev.filter(review => review._id !== reviewId));
  };

  // Mostrar loading si está cargando la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen">
        {/* Fondo dividido en dos colores */}
        <div className="fixed inset-0 flex">
          <div className="w-1/2 bg-[#251711]"></div>
          <div className="w-1/2 bg-[#616f55]"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white font-serif drop-shadow-lg">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  // No mostrar nada si no está autenticado (se redirigirá)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Fondo dividido en dos colores */}
      <div className="fixed inset-0 flex">
        <div className="w-1/2 bg-[#251711]"></div>
        <div className="w-1/2 bg-[#616f55]"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-20 w-full bg-[#faf8f6] shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="text-3xl hover:scale-110 transition cursor-pointer"
                onClick={() => router.push("/")}
                aria-label="Ir a Home"
              >
                🧉
              </button>
              <div>
                <h1 className="text-3xl font-bold text-[#616f55] font-serif tracking-wide">Mi Perfil</h1>
                <p className="text-gray-600 mt-1 font-serif">Gestiona tu información y revisa tu actividad</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-[#616f55] text-white font-serif rounded-md font-semibold hover:bg-white hover:text-[#616f55] border border-[#616f55] transition"
            >
              ← Volver al inicio
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="relative z-10 py-8 px-4 md:px-16 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna izquierda - Información del perfil */}
            <div className="lg:col-span-1">
              <ProfileInfo user={user} />
            </div>

            {/* Columna derecha - Historial de reseñas */}
            <div className="lg:col-span-2">
              <UserReviewHistory 
                reviews={userReviews}
                loading={loading}
                onReviewUpdate={handleReviewUpdate}
                onReviewDelete={handleReviewDelete}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}