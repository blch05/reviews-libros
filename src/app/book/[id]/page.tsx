"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { StarDisplay, StarSelector } from "../../../components/StarComponents";
import { Review } from "../../../types";
import { BookReviewUtils } from "../../lib/book-review-utils";
import { useAuthStatus } from "../../hooks/useAuthStatus";
import EditReviewModal from "../../components/EditReviewModal";
import ProxyAwareBookImage from "../../components/ProxyAwareBookImage";

export default function BookDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [book, setBook] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [stars, setStars] = useState(5);
  const [hoverStars, setHoverStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuthStatus();

  useEffect(() => {
    async function fetchBook() {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
      const data = await res.json();
      setBook(data);
    }
    
    async function fetchReviews() {
      const reviewsData = await BookReviewUtils.getBookReviews(id);
      setReviews(reviewsData);
      
      // Solo verificar reseñas del usuario si la autenticación ya está completamente cargada
      if (!authLoading) {
        if (isAuthenticated && user?.id) {
          console.log('🔍 Checking for user review:', { userId: user.id, reviewCount: reviewsData.length, authLoading });
          
          // Buscar reseña del usuario actual usando comparación de string para mayor robustez
          const userReview = reviewsData.find((review: Review) => 
            review.userId.toString() === user.id.toString()
          ) || null;
          
          console.log('🔍 User review found:', userReview ? `Review ID: ${userReview._id}` : 'No review found');
          console.log('🔍 All review user IDs:', reviewsData.map(r => ({ id: r.userId, name: r.userName })));
          
          setUserHasReviewed(!!userReview);
          setUserReview(userReview);
        } else {
          console.log('🔍 User not authenticated, clearing review state');
          setUserHasReviewed(false);
          setUserReview(null);
        }
      } else {
        console.log('🔍 Auth still loading, skipping user review check');
      }
    }
    
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBook(), fetchReviews()]);
      setLoading(false);
    };
    
    loadData();
  }, [id, isAuthenticated, user?.id, authLoading]); // Incluir authLoading para re-verificar cuando termine la carga

  // useEffect adicional para re-verificar reseñas cuando termine la carga de auth
  useEffect(() => {
    if (!authLoading && reviews.length > 0) {
      console.log('🔄 Auth loading finished, re-checking user reviews');
      console.log('🔄 Current state:', { 
        isAuthenticated, 
        userId: user?.id, 
        reviewCount: reviews.length,
        authLoading 
      });
      
      if (isAuthenticated && user?.id) {
        const userReview = reviews.find((review: Review) => 
          review.userId.toString() === user.id.toString()
        ) || null;
        
        console.log('🔍 Re-check result:', userReview ? `Found review ${userReview._id}` : 'No review found');
        console.log('🔍 Review details:', userReview ? { 
          id: userReview._id, 
          userId: userReview.userId, 
          content: userReview.content.substring(0, 50) 
        } : null);
        
        setUserHasReviewed(!!userReview);
        setUserReview(userReview);
        
        // Persistir estado en localStorage para próximas cargas
        if (userReview) {
          localStorage.setItem(`userReview_${id}`, JSON.stringify({
            hasReviewed: true,
            reviewId: userReview._id,
            userId: user.id
          }));
        } else {
          localStorage.removeItem(`userReview_${id}`);
        }
      } else {
        console.log('🔍 User not authenticated in re-check');
        setUserHasReviewed(false);
        setUserReview(null);
        localStorage.removeItem(`userReview_${id}`);
      }
    }
  }, [authLoading, isAuthenticated, user?.id, reviews, id]);

  // useEffect para cargar estado persistido al inicio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const persistedState = localStorage.getItem(`userReview_${id}`);
      if (persistedState && persistedState.trim() !== '') {
        try {
          const { hasReviewed, reviewId, userId } = JSON.parse(persistedState);
          console.log('📦 Loading persisted review state:', { hasReviewed, reviewId, userId });
          
          // Solo aplicar estado persistido si coincide con el usuario actual
          if (isAuthenticated && user?.id === userId) {
            setUserHasReviewed(hasReviewed);
            console.log('📦 Applied persisted state - user has reviewed:', hasReviewed);
          }
        } catch (error) {
          console.error('Error parsing persisted review state:', error);
          console.log('Corrupted localStorage data:', persistedState);
          localStorage.removeItem(`userReview_${id}`);
        }
      }
    }
  }, [id, isAuthenticated, user?.id]);

  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    
    console.log('📝 Attempting to add review:', { 
      isAuthenticated, 
      userHasReviewed, 
      userReviewId: userReview?._id,
      userId: user?.id 
    });
    
    if (!isAuthenticated) {
      alert('Debes estar autenticado para agregar una reseña');
      return;
    }
    
    if (userHasReviewed) {
      alert('Ya has reseñado este libro. Solo puedes hacer una reseña por libro.');
      return;
    }
    
    if (reviewText.trim().length < 20) {
      alert('La reseña debe tener al menos 20 caracteres');
      return;
    }
    
    try {
      const newReview = await BookReviewUtils.createReview(
        id,
        reviewText.trim(),
        stars,
        book.volumeInfo.title,
        book.volumeInfo.authors || ['Autor desconocido'],
        BookReviewUtils.getBookCoverUrl(book)
      );
      
      if (newReview) {
        console.log('✅ Review created successfully:', newReview._id);
        setReviews(prev => [newReview, ...prev]);
        setReviewText("");
        setStars(5);
        setUserHasReviewed(true); // Actualizar estado
        setUserReview(newReview); // Guardar la reseña del usuario
        
        // Persistir nuevo estado
        localStorage.setItem(`userReview_${id}`, JSON.stringify({
          hasReviewed: true,
          reviewId: newReview._id,
          userId: user?.id
        }));
        
        alert('Reseña agregada exitosamente');
      }
    } catch (error) {
      console.error('Error creating review:', error);
      alert(error instanceof Error ? error.message : 'Error creando la reseña');
    }
  }

  async function handleEditReview(review: Review) {
    setEditingReview(review);
    setIsModalOpen(true);
  }

  async function handleSaveEdit(reviewId: string, content: string, rating: number) {
    console.log('✏️ Updating review:', reviewId);
    const updatedReview = await BookReviewUtils.updateReview(reviewId, content, rating);
    if (updatedReview) {
      console.log('✅ Review updated successfully');
      setReviews(prev => prev.map(r => r._id === reviewId ? updatedReview : r));
      setUserReview(updatedReview); // Actualizar la reseña del usuario
      
      // Actualizar estado persistido
      if (user?.id) {
        localStorage.setItem(`userReview_${id}`, JSON.stringify({
          hasReviewed: true,
          reviewId: updatedReview._id,
          userId: user.id
        }));
      }
      
      setIsModalOpen(false);
      setEditingReview(null);
      alert('Reseña actualizada exitosamente');
    } else {
      alert('Error al actualizar la reseña');
    }
  }

  async function handleDeleteReview(reviewId: string) {
    if (confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      console.log('🗑️ Deleting review:', reviewId);
      const success = await BookReviewUtils.deleteReview(reviewId);
      if (success) {
        console.log('✅ Review deleted successfully');
        setReviews(prev => prev.filter(r => r._id !== reviewId));
        setUserHasReviewed(false); // Permitir agregar nueva reseña después de eliminar
        setUserReview(null);
        
        // Limpiar estado persistido
        localStorage.removeItem(`userReview_${id}`);
        
        alert('Reseña eliminada exitosamente');
      } else {
        alert('Error al eliminar la reseña');
      }
    }
  }

  async function handleVote(reviewId: string, reviewAuthorId: string) {
    if (!isAuthenticated) {
      alert('Debes estar autenticado para votar');
      return;
    }
    
    const success = await BookReviewUtils.voteReview(reviewId, reviewAuthorId, id);
    if (success) {
      // Recargar las reviews para mostrar el nuevo conteo de votos
      const updatedReviews = await BookReviewUtils.getBookReviews(id);
      setReviews(updatedReviews);
    }
  }

  if (loading) return (
    <div className="min-h-screen">
      <div className="fixed inset-0 flex">
        <div className="w-1/2 bg-[#251711]"></div>
        <div className="w-1/2 bg-[#616f55]"></div>
      </div>
      <main className="relative z-10 py-8 px-4 md:px-16 font-sans flex items-center justify-center min-h-screen">
        <p className="text-white text-lg drop-shadow-lg">Cargando...</p>
      </main>
    </div>
  );
  if (!book) return (
    <div className="min-h-screen">
      <div className="fixed inset-0 flex">
        <div className="w-1/2 bg-[#251711]"></div>
        <div className="w-1/2 bg-[#616f55]"></div>
      </div>
      <main className="relative z-10 py-8 px-4 md:px-16 font-sans flex items-center justify-center min-h-screen">
        <p className="text-white text-lg drop-shadow-lg">No se encontró el libro.</p>
      </main>
    </div>
  );

  const info = book.volumeInfo;
  const coverUrl = BookReviewUtils.getBookCoverUrl(book);

  // Procesar categorías para eliminar duplicados
  const uniqueCategories = info.categories ? 
    [...new Set(
      info.categories
        .flatMap((cat: string) => cat.split('/').map(c => c.trim()))
        .filter((cat: string) => cat.length > 0)
    )] : [];

  // Calculos para el promedio y reviews destacadas
  const avgStars = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) : null;
  const maxReview = reviews.length > 0 ? reviews.reduce((max, r) => r.rating > max.rating ? r : max, reviews[0]) : null;
  const minReview = reviews.length > 0 ? reviews.reduce((min, r) => r.rating < min.rating ? r : min, reviews[0]) : null;

  return (
    <div className="min-h-screen">
      {/* Fondo dividido en dos colores */}
      <div className="fixed inset-0 flex">
        <div className="w-1/2 bg-[#251711]"></div>
        <div className="w-1/2 bg-[#616f55]"></div>
      </div>
      
      <main className="relative z-10 py-8 px-4 md:px-16 font-sans">
        <header className="w-screen fixed left-0 top-0 z-20 flex flex-row items-center bg-[#faf8f6] shadow-md py-3 mb-8 border-b border-gray-200 px-8">
          <button
            className="mr-4 text-3xl hover:scale-110 transition cursor-pointer"
            onClick={() => router.push("/")}
            aria-label="Ir a Home"
          >
            🧉
          </button>
          <div className="flex flex-col items-center flex-1">
            <h1 className="text-2xl font-bold text-[#616f55] tracking-wide">Rate & Mate</h1>
          </div>
        </header>
        <div className="pt-20 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Columna izquierda: Información del libro */}
            <div className="lg:w-1/2 space-y-6">
              {/* Portada + Datos del libro */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* Portada */}
                <div className="flex-shrink-0">
                  <ProxyAwareBookImage 
                    src={coverUrl} 
                    alt={info.title} 
                    size="xl" 
                    className="mx-auto md:mx-0"
                    showRetry={true}
                    showAttempts={true}
                    onLoad={() => console.log(`✅ Book cover loaded: ${info.title}`)}
                    onError={(error) => console.warn(`❌ Book cover failed: ${info.title} - ${error}`)}
                  />
                </div>
                
                {/* Datos del libro */}
                <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200 shadow-lg">
                  <div className="space-y-3">
                    {info.authors && (
                      <div>
                        <span className="font-bold text-gray-700 text-sm">Autor(es):</span>
                        <span className="ml-2 text-gray-900 text-sm">{info.authors.join(", ")}</span>
                      </div>
                    )}
                    
                    {info.publishedDate && (
                      <div>
                        <span className="font-bold text-gray-700 text-sm">Fecha de publicación:</span>
                        <span className="ml-2 text-gray-900 text-sm">{info.publishedDate}</span>
                      </div>
                    )}
                    
                    {info.publisher && (
                      <div>
                        <span className="font-bold text-gray-700 text-sm">Editorial:</span>
                        <span className="ml-2 text-gray-900 text-sm">{info.publisher}</span>
                      </div>
                    )}
                    
                    {info.pageCount && (
                      <div>
                        <span className="font-bold text-gray-700 text-sm">Páginas:</span>
                        <span className="ml-2 text-gray-900 text-sm">{info.pageCount}</span>
                      </div>
                    )}
                    
                    {uniqueCategories.length > 0 && (
                      <div>
                        <span className="font-bold text-gray-700 text-sm">Categorías:</span>
                        <span className="ml-2 text-gray-900 text-sm">{uniqueCategories.join(", ")}</span>
                      </div>
                    )}
                    
                    {/* Promedio de estrellas */}
                    <div className="border-t pt-3">
                      <span className="font-bold text-gray-700 text-sm">Promedio de estrellas:</span>
                      <div className="flex items-center gap-2 mt-1">
                        {avgStars !== null ? (
                          <>
                            <StarDisplay stars={avgStars} />
                            <span className="text-gray-600 font-serif font-semibold text-sm">({avgStars.toFixed(1)}/5.0)</span>
                            <span className="text-xs text-gray-500">({reviews.length} reseña{reviews.length !== 1 ? 's' : ''})</span>
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">Sin reseñas</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Título y descripción */}
              <div>
                <h1 className="text-3xl font-bold mb-4 text-white drop-shadow-lg">{info.title}</h1>
                {info.description && (
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow-lg">
                    <h2 className="text-lg font-semibold mb-3 text-gray-800">Descripción</h2>
                    <div 
                      className="text-gray-700 leading-relaxed text-sm prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: info.description }}
                    />
                  </div>
                )}
              </div>

              {/* Mejores y peores reseñas */}
              {(maxReview || minReview) && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-white drop-shadow-lg">Reseñas destacadas</h2>
                  <div className="space-y-4">
                    {maxReview && (
                      <div className="bg-white border border-green-100 rounded-lg p-4 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[#616f55] font-bold">Mejor Reseña</span>
                          <StarDisplay stars={maxReview.rating} />
                        </div>
                        <p className="text-gray-700 italic text-sm leading-relaxed">&ldquo;{maxReview.content}&rdquo;</p>
                        {maxReview.helpfulVotes !== 0 && (
                          <p className="text-xs text-gray-500 mt-2">{maxReview.helpfulVotes} votos</p>
                        )}
                      </div>
                    )}
                    
                    {minReview && maxReview?.rating !== minReview?.rating && (
                      <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-lg p-4 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[#251711] font-bold">Reseña Más Crítica</span>
                          <StarDisplay stars={minReview.rating} />
                        </div>
                        <p className="text-gray-700 italic text-sm leading-relaxed">&ldquo;{minReview.content}&rdquo;</p>
                        {minReview.helpfulVotes !== 0 && (
                          <p className="text-xs text-gray-500 mt-2">{minReview.helpfulVotes} votos</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Columna derecha: Reseñas y formulario */}
            <div className="lg:w-1/2 space-y-6">
              {/* Formulario de nueva reseña */}
              {isAuthenticated ? (
                userHasReviewed ? (
                  <section className="bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-300">
                    <div className="text-center">
                      <p className="text-lg font-serif text-gray-600 mb-2">✓ Ya has reseñado este libro</p>
                      <p className="text-sm text-gray-500">Solo puedes hacer una reseña por libro. Puedes editarla o eliminarla desde la lista de reseñas.</p>
                    </div>
                  </section>
                ) : (
                  <section className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-200">
                    <div className="flex justify-center items-center items-baseline gap-1 mb-4">
                      <p className="text-2xl underline font-serif text-black font-bold">¿Y qué opinás</p>
                      <p className="text-2xl underline font-serif text-black italic font-bold">vos?</p>
                    </div>
                    <form onSubmit={handleAddReview} className="flex flex-col gap-4">
                      <textarea
                        value={reviewText}
                        onChange={e => setReviewText(e.target.value)}
                        placeholder="Escribe tu reseña... (mínimo 20 caracteres)"
                        className="p-3 border text-gray-400 font-serif border-gray-300 rounded-md w-full min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#616f55] text-sm bg-white/95"
                        required
                        minLength={20}
                      />
                      <div className="flex justify-between">
                        <span className={`text-xs font-medium ${
                          reviewText.trim().length === 0 
                            ? 'text-gray-400' 
                            : reviewText.trim().length < 20 
                            ? 'text-red-500' 
                            : 'text-green-600'
                        }`}>
                          {reviewText.trim().length === 0 
                            ? 'Mínimo 20 caracteres requeridos'
                            : reviewText.trim().length < 20 
                            ? `⚠️ Faltan ${20 - reviewText.trim().length} caracteres` 
                            : '✓ Suficiente contenido'
                          }
                        </span>
                        <span className="text-xs text-gray-400">{reviewText.length} caracteres</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold font-serif text-black text-sm">Calificá este libro:</span>
                        <StarSelector stars={stars} setStars={setStars} hoverStars={hoverStars} setHoverStars={setHoverStars} />
                      </div>
                      <button 
                        type="submit" 
                        className="p-3 bg-[#616f55] text-white font-serif rounded-md font-semibold hover:bg-white hover:text-[#616f55] border border-[#616f55] transition text-sm"
                        disabled={reviewText.trim().length < 20}
                      >
                        Agregar reseña
                      </button>
                    </form>
                  </section>
                )
              ) : (
                <section className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-200 text-center">
                  <h3 className="text-lg font-bold text-gray-800 font-serif mb-2">¿Querés dejar tu reseña?</h3>
                  <p className="text-gray-600 text-sm mb-4">Iniciá sesión para compartir tu opinión sobre este libro</p>
                  <button 
                    onClick={() => router.push('/')}
                    className="px-6 py-2 bg-[#616f55] text-white font-serif rounded-md font-semibold hover:bg-white hover:text-[#616f55] border border-[#616f55] transition text-sm"
                  >
                    Iniciar Sesión
                  </button>
                </section>
              )}

              {/* Lista de todas las reseñas */}
              <section>
                <h2 className="text-xl font-bold mb-4 font-serif underline text-white drop-shadow-lg">Todas las Reseñas ({reviews.length})</h2>
                <div className="space-y-4">
                  {reviews.length > 0 ? reviews.map((r) => (
                    <div key={r._id} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <StarDisplay stars={r.rating} />
                          <span className="text-gray-500 text-xs">({r.helpfulVotes} votos)</span>
                          <span className="text-gray-400 text-xs">por {r.userName}</span>
                        </div>
                        <div className="flex gap-2">
                          {isAuthenticated && userReview && userReview._id === r._id && (
                            <>
                              <button 
                                className="px-3 py-1 bg-[#616f55] text-white font-serif rounded-md text-xs font-semibold hover:bg-white hover:text-[#616f55] border border-[#616f55] transition"
                                onClick={() => handleEditReview(r)}
                              >
                                ✏️ Editar
                              </button>
                              <button 
                                className="px-3 py-1 bg-[#251711] text-white font-serif rounded-md text-xs font-semibold hover:bg-white hover:text-[#251711] border border-[#251711] transition"
                                onClick={() => handleDeleteReview(r._id)}
                              >
                                �️ Eliminar
                              </button>
                            </>
                          )}
                          {isAuthenticated && (!userReview || userReview._id !== r._id) && (
                            <button 
                              className="px-3 py-1 bg-white text-[#616f55] border border-[#616f55] rounded-md text-xs font-serif font-semibold hover:bg-[#616f55] hover:text-white transition"
                              onClick={() => handleVote(r._id, r.userId)}
                            >
                              � Útil
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm">{r.content}</p>
                    </div>
                  )) : (
                    <div className="bg-gray-50/90 backdrop-blur-sm rounded-lg p-6 text-center border border-gray-200 shadow-lg">
                      <p className="text-gray-500">No hay reseñas aún.</p>
                      <p className="text-gray-400 text-sm mt-1">¡Sé el primero en escribir una reseña!</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      {/* Modal de edición */}
      {editingReview && (
        <EditReviewModal
          review={editingReview}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingReview(null);
          }}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
