import { useState, useRef, useCallback } from "react";

interface BeforeAfterSliderProps {
  image: string;
  alt: string;
}

const BeforeAfterSlider = ({ image, alt }: BeforeAfterSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  }, []);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    updatePosition(e.touches[0].clientX);
  }, [updatePosition]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-80 md:h-96 overflow-hidden rounded-lg cursor-col-resize select-none shadow-lg"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
    >
      <img
        src={image}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={image}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%', maxWidth: 'none' }}
          draggable={false}
        />
        <span className="absolute top-3 left-3 bg-background/80 text-foreground text-xs font-display uppercase tracking-wider px-2 py-1 rounded">
          Antes
        </span>
      </div>

      <span className="absolute top-3 right-3 bg-primary/80 text-primary-foreground text-xs font-display uppercase tracking-wider px-2 py-1 rounded">
        Depois
      </span>

      <div
        className="absolute top-0 bottom-0 w-1 bg-primary cursor-col-resize z-10"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-primary-foreground">
            <path d="M6 10L3 7M3 7L6 4M3 7H9M14 10L17 7M17 7L14 4M17 7H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="translate(0,3)" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
