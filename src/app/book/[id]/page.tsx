"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { StarDisplay, StarSelector } from "../../../components/StarComponents";

export default function BookDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [book, setBook] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [stars, setStars] = useState(5);
  const [hoverStars, setHoverStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchBook() {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
      const data = await res.json();
      setBook(data);
      setLoading(false);
    }
    // Cargar reseñas de localStorage
    function fetchReviewsLocal() {
      const key = `reviews-${id}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        setReviews(JSON.parse(stored));
      } else {
        setReviews([]);
      }
    }
    fetchBook();
    fetchReviewsLocal();
  }, [id]);

  function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    const key = `reviews-${id}`;
    const newReview = { text: reviewText, stars, votes: 0 };
    const updatedReviews = [...reviews, newReview];
    setReviews(updatedReviews);
    localStorage.setItem(key, JSON.stringify(updatedReviews));
    setReviewText("");
    setStars(5);
  }

  function handleVote(index: number, vote: number) {
    const key = `reviews-${id}`;
    const updatedReviews = reviews.map((r, i) =>
      i === index ? { ...r, votes: (r.votes || 0) + vote } : r
    );
    setReviews(updatedReviews);
    localStorage.setItem(key, JSON.stringify(updatedReviews));
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
  const portada = info.imageLinks?.extraLarge || info.imageLinks?.large || info.imageLinks?.medium || info.imageLinks?.thumbnail || "";

  // Calculos para el promedio y reviews destacadas
  const avgStars = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.stars, 0) / reviews.length) : null;
  const maxReview = reviews.length > 0 ? reviews.reduce((max, r) => r.stars > max.stars ? r : max, reviews[0]) : null;
  const minReview = reviews.length > 0 ? reviews.reduce((min, r) => r.stars < min.stars ? r : min, reviews[0]) : null;

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
                  {portada && <img src={portada} alt={info.title} className="w-48 h-auto rounded-md object-cover shadow-lg mx-auto md:mx-0" />}
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
                    
                    {info.categories && (
                      <div>
                        <span className="font-bold text-gray-700 text-sm">Categorías:</span>
                        <span className="ml-2 text-gray-900 text-sm">{info.categories.join(", ")}</span>
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
                          <StarDisplay stars={maxReview.stars} />
                        </div>
                        <p className="text-gray-700 italic text-sm leading-relaxed">"{maxReview.text}"</p>
                        {maxReview.votes !== 0 && (
                          <p className="text-xs text-gray-500 mt-2">{maxReview.votes} votos</p>
                        )}
                      </div>
                    )}
                    
                    {minReview && maxReview?.stars !== minReview?.stars && (
                      <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-lg p-4 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[#251711] font-bold">Reseña Más Crítica</span>
                          <StarDisplay stars={minReview.stars} />
                        </div>
                        <p className="text-gray-700 italic text-sm leading-relaxed">"{minReview.text}"</p>
                        {minReview.votes !== 0 && (
                          <p className="text-xs text-gray-500 mt-2">{minReview.votes} votos</p>
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
              <section className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="flex justify-center items-center items-baseline gap-1 mb-4">
                  <p className="text-2xl underline font-serif text-black font-bold">¿Y qué opinás</p>
                  <p className="text-2xl underline font-serif text-black italic font-bold">vos?</p>
                </div>
                <form onSubmit={handleAddReview} className="flex flex-col gap-4">
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Escribe tu reseña..."
                    className="p-3 border text-gray-400 font-serif border-gray-300 rounded-md w-full min-h-[120px] focus:outline-none focus:ring-2 focus:ring-white-500 text-sm bg-white/95"
                    required
                  />
                  <div className="flex items-center gap-2">
                    <span className="font-semibold font-serif text-black text-sm">Calificá este libro:</span>
                    <StarSelector stars={stars} setStars={setStars} hoverStars={hoverStars} setHoverStars={setHoverStars} />
                  </div>
                  <button type="submit" className="p-3 bg-black text-white font-serif rounded-md font-semibold hover:bg-white hover:text-black transition text-sm">
                    Agregar reseña
                  </button>
                </form>
              </section>

              {/* Lista de todas las reseñas */}
              <section>
                <h2 className="text-xl font-bold mb-4 font-serif underline text-white drop-shadow-lg">Todas las Reseñas ({reviews.length})</h2>
                <div className="space-y-4">
                  {reviews.length > 0 ? reviews.map((r, i) => (
                    <div key={i} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <StarDisplay stars={r.stars} />
                          <span className="text-gray-500 text-xs">({r.votes} votos)</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="px-2 py-1 bg-white text-green-700 border border-black rounded text-xs font-medium hover:bg-gray-100 transition" 
                            onClick={() => handleVote(i, 1)}
                          >
                            👍 Útil
                          </button>
                          <button 
                            className="px-2 py-1 bg-black text-white border border-white rounded text-xs font-medium hover:bg-gray-800 transition" 
                            onClick={() => handleVote(i, -1)}
                          >
                            👎
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm">{r.text}</p>
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
    </div>
  );
}
