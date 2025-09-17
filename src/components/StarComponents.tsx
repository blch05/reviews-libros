// SVGs de estrella
const StarEmpty = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="black" className="inline-block">
    <polygon points="10,1 12.59,7.36 19.51,7.36 13.97,11.64 16.56,18 10,13.72 3.44,18 6.03,11.64 0.49,7.36 7.41,7.36" />
  </svg>
);

const StarFull = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="black" stroke="black" className="inline-block">
    <polygon points="10,1 12.59,7.36 19.51,7.36 13.97,11.64 16.56,18 10,13.72 3.44,18 6.03,11.64 0.49,7.36 7.41,7.36" />
  </svg>
);

export function StarDisplay(props: { stars: number }) {
  const { stars } = props;
  const fullStars = Math.round(stars); // Redondear al entero más cercano
  const emptyStars = 5 - fullStars;
  return (
    <span className="flex items-center">
      {[...Array(fullStars)].map((_, i) => <StarFull key={"full"+i} />)}
      {[...Array(emptyStars)].map((_, i) => <StarEmpty key={"empty"+i} />)}
    </span>
  );
}

// Componente para seleccionar estrellas (solo enteras)
export function StarSelector(props: { stars: number, setStars: (n: number) => void, hoverStars: number | null, setHoverStars: (n: number | null) => void }) {
  const { stars, setStars, hoverStars, setHoverStars } = props;
  const handleClick = (val: number) => setStars(val);
  const handleMouseOver = (val: number) => setHoverStars(val);
  const handleMouseOut = () => setHoverStars(null);
  const displayStars = hoverStars !== null ? hoverStars : stars;
  return (
    <span className="flex items-center gap-1">
      {[1,2,3,4,5].map((n, i) => {
        // Solo mostrar estrellas enteras
        const starType = displayStars >= n ? <StarFull /> : <StarEmpty />;
        return (
          <span
            key={n}
            onClick={() => handleClick(n)}
            onMouseOver={() => handleMouseOver(n)}
            onMouseOut={handleMouseOut}
            className="cursor-pointer"
          >
            {starType}
          </span>
        );
      })}
    </span>
  );
}
