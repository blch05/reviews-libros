"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Review } from "../../types";
import { StarDisplay } from "../../components/StarComponents";
import EditReviewModal from "./EditReviewModal";
import { getAuthToken } from "../lib/book-review-utils";

interface UserReviewHistoryProps {
  reviews: Review[];
  loading: boolean;
  onReviewUpdate: (updatedReview: Review) => void;
  onReviewDelete: (reviewId: string) => void;
}

export default function UserReviewHistory({ 
  reviews, 
  loading, 
  onReviewUpdate, 
  onReviewDelete 
}: UserReviewHistoryProps) {
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setIsModalOpen(true);
  };

  const handleSaveEdit = async (reviewId: string, editData: any) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No auth token available for edit review');
        alert('Error de autenticación. Intenta recargar la página.');
        return;
      }

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const data = await response.json();
        onReviewUpdate(data.data); // Nota: el endpoint devuelve data.data
        setIsModalOpen(false);
        setEditingReview(null);
      } else {
        const errorData = await response.json();
        console.error('Error updating review:', errorData);
        throw new Error(errorData.message || 'Error al actualizar la reseña');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Error al actualizar la reseña. Intenta nuevamente.');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reseña? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeleteLoading(reviewId);
      
      const token = getAuthToken();
      if (!token) {
        console.error('No auth token available for delete review');
        alert('Error de autenticación. Intenta recargar la página.');
        return;
      }
      
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        onReviewDelete(reviewId);
      } else {
        const errorData = await response.json();
        console.error('Error deleting review:', errorData);
        throw new Error(errorData.message || 'Error al eliminar la reseña');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error al eliminar la reseña. Intenta nuevamente.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleViewBook = (bookId: string) => {
    router.push(`/book/${bookId}`);
  };

  const sortedReviews = [...(reviews || [])].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'highest_rating':
        return b.rating - a.rating;
      case 'lowest_rating':
        return a.rating - b.rating;
      case 'most_helpful':
        return b.helpfulVotes - a.helpfulVotes;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-200">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#616f55] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-serif">Cargando tus reseñas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-serif text-gray-900">
            Mis Reseñas ({(reviews || []).length})
          </h2>
          
          {/* Filtros de ordenamiento */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#616f55] focus:border-transparent font-serif text-sm"
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguas</option>
            <option value="highest_rating">Mayor calificación</option>
            <option value="lowest_rating">Menor calificación</option>
            <option value="most_helpful">Más útiles</option>
          </select>
        </div>
      </div>

      {/* Lista de reseñas */}
      <div className="p-6">
        {sortedReviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-700 font-serif mb-2">
              Aún no has escrito reseñas
            </h3>
            <p className="text-gray-600 font-serif mb-6">
              Comienza explorando libros y comparte tu opinión con otros lectores
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-[#616f55] text-white font-serif rounded-md font-semibold hover:bg-white hover:text-[#616f55] border border-[#616f55] transition"
            >
              Explorar libros
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedReviews.map((review) => (
              <div 
                key={review._id} 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Header de la reseña */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => handleViewBook(review.bookId)}
                        className="text-lg font-bold text-[#616f55] hover:text-[#4a5a41] font-serif transition cursor-pointer"
                      >
                        {review.bookTitle}
                      </button>
                      <StarDisplay stars={review.rating} />
                    </div>
                    {review.bookAuthor && review.bookAuthor.length > 0 && (
                      <p className="text-sm text-gray-600 font-serif mb-2">
                        por {review.bookAuthor.join(', ')}
                      </p>
                    )}
                    <h3 className="font-semibold text-gray-900 font-serif">{review.title}</h3>
                  </div>
                  
                  {/* Thumbnail del libro */}
                  {review.bookThumbnail && (
                    <button
                      onClick={() => handleViewBook(review.bookId)}
                      className="ml-4 hover:opacity-80 transition"
                    >
                      <img 
                        src={review.bookThumbnail} 
                        alt={review.bookTitle}
                        className="w-16 h-20 object-cover rounded border border-gray-200 shadow-sm"
                      />
                    </button>
                  )}
                </div>

                {/* Contenido de la reseña */}
                <p className="text-gray-700 leading-relaxed mb-4 font-serif">
                  {review.content}
                </p>

                {/* Footer de la reseña */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-serif">
                      {new Date(review.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="font-serif">
                      👍 {review.helpfulVotes} votos útiles
                    </span>
                    {review.isEdited && (
                      <span className="font-serif text-orange-600">
                        ✏️ Editada
                      </span>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="px-3 py-1 bg-[#616f55] text-white font-serif rounded-md text-xs font-semibold hover:bg-white hover:text-[#616f55] border border-[#616f55] transition"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      disabled={deleteLoading === review._id}
                      className="px-3 py-1 bg-[#251711] text-white font-serif rounded-md text-xs font-semibold hover:bg-white hover:text-[#251711] border border-[#251711] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleteLoading === review._id ? '⏳' : '🗑️'} Eliminar
                    </button>
                    <button
                      onClick={() => handleViewBook(review.bookId)}
                      className="px-3 py-1 bg-white text-[#616f55] border border-[#616f55] rounded-md text-xs font-serif font-semibold hover:bg-[#616f55] hover:text-white transition"
                    >
                      📖 Ver libro
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de edición */}
      {editingReview && (
        <EditReviewModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingReview(null);
          }}
          onSave={(editData) => handleSaveEdit(editingReview._id, editData)}
          review={editingReview}
        />
      )}
    </div>
  );
}