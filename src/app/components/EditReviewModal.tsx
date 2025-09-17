'use client';

import React, { useState, useEffect } from 'react';
import { Review } from '../../types';
import { StarSelector } from '../../components/StarComponents';

interface EditReviewModalProps {
  review: Review;
  isOpen: boolean;
  onClose: () => void;
  onSave: (reviewId: string, content: string, rating: number) => Promise<void>;
}

const EditReviewModal: React.FC<EditReviewModalProps> = ({
  review,
  isOpen,
  onClose,
  onSave
}) => {
  const [content, setContent] = useState(review.content);
  const [rating, setRating] = useState(review.rating);
  const [hoverStars, setHoverStars] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setContent(review.content);
      setRating(review.rating);
    }
  }, [isOpen, review]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (content.trim().length < 20) {
      alert('La reseña debe tener al menos 20 caracteres');
      return;
    }

    if (content.trim().length > 2000) {
      alert('La reseña no puede exceder los 2000 caracteres');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(review._id, content.trim(), rating);
      onClose();
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Error actualizando la reseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent(review.content);
    setRating(review.rating);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#faf8f6] rounded-lg p-6 w-full max-w-md border border-gray-200 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#616f55] font-serif">Editar Reseña</h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
              Contenido de la reseña
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#616f55] focus:border-transparent min-h-[120px] text-sm font-sans"
              placeholder="Escribe tu reseña..."
              required
              minLength={20}
              maxLength={2000}
              disabled={isSubmitting}
            />
            <div className="flex justify-between mt-1">
              <span className={`text-xs font-medium ${
                content.trim().length === 0 
                  ? 'text-gray-400' 
                  : content.trim().length < 20 
                  ? 'text-red-500' 
                  : 'text-green-600'
              }`}>
                {content.trim().length === 0 
                  ? 'Mínimo 20 caracteres requeridos'
                  : content.trim().length < 20 
                  ? `⚠️ Faltan ${20 - content.trim().length} caracteres` 
                  : '✓ Suficiente contenido'
                }
              </span>
              <span className={`text-xs ${content.length > 1800 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                {content.length}/2000
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
              Calificación
            </label>
            <div className="flex items-center gap-2">
              <StarSelector 
                stars={rating} 
                setStars={setRating} 
                hoverStars={hoverStars} 
                setHoverStars={setHoverStars}
              />
              <span className="text-sm text-gray-600 font-sans">({rating}/5)</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium font-sans"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 rounded-lg font-medium font-sans transition-colors ${
                isSubmitting || content.trim().length < 20
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#616f55] text-white hover:bg-[#4a5643]'
              }`}
              disabled={isSubmitting || content.trim().length < 20}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditReviewModal;