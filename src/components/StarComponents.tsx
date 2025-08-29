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

const StarHalf = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="inline-block">
    <defs>
      <linearGradient id="half-black">
        <stop offset="50%" stopColor="black"/>
        <stop offset="50%" stopColor="white"/>
      </linearGradient>
    </defs>
    <polygon points="10,1 12.59,7.36 19.51,7.36 13.97,11.64 16.56,18 10,13.72 3.44,18 6.03,11.64 0.49,7.36 7.41,7.36" fill="url(#half-black)" stroke="black"/>
  </svg>
);

export function StarDisplay(props: { stars: number }) {
  const { stars } = props;
  const fullStars = Math.floor(stars);
  const halfStar = stars - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <span className="flex items-center">
      {[...Array(fullStars)].map((_, i) => <StarFull key={"full"+i} />)}
      {halfStar && <StarHalf />}
      {[...Array(emptyStars)].map((_, i) => <StarEmpty key={"empty"+i} />)}
    </span>
  );
}

// Componente para seleccionar estrellas con medias estrellas
export function StarSelector(props: { stars: number, setStars: (n: number) => void, hoverStars: number | null, setHoverStars: (n: number | null) => void }) {
  const { stars, setStars, hoverStars, setHoverStars } = props;
  const handleClick = (val: number) => setStars(val);
  const handleMouseOver = (val: number) => setHoverStars(val);
  const handleMouseOut = () => setHoverStars(null);
  const displayStars = hoverStars !== null ? hoverStars : stars;
  return (
    <span className="flex items-center gap-1">
      {[1,2,3,4,5].map((n, i) => {
        // Determinar qué SVG mostrar
        let starType: any;
        if (displayStars >= n) {
          starType = <StarFull />;
        } else if (displayStars >= n - 0.5) {
          starType = <StarHalf />;
        } else {
          starType = <StarEmpty />;
        }
        return (
          <span key={n} className="relative flex">
            <span
              onClick={() => handleClick(n - 0.5)}
              onMouseOver={() => handleMouseOver(n - 0.5)}
              onMouseOut={handleMouseOut}
              className="cursor-pointer absolute left-0 top-0 w-1/2 h-full"
              style={{ zIndex: 2 }}
            />
            <span
              onClick={() => handleClick(n)}
              onMouseOver={() => handleMouseOver(n)}
              onMouseOut={handleMouseOut}
              className="cursor-pointer w-full h-full"
              style={{ zIndex: 1 }}
            >
              {starType}
            </span>
          </span>
        );
      })}
    </span>
  );
}
