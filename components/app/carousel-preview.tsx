"use client";

import { useRef, useState, useEffect } from "react";
import CarouselSlide from "./carousel-slide";

interface Slide {
  heading: string;
  body: string;
  imageUrl?: string;
  imageQuery: string;
}

interface CarouselPreviewProps {
  slides: Slide[];
  profile: { name: string; handle: string; photoUrl: string };
  style: "white" | "dark";
  slideRefs?: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

export default function CarouselPreview({
  slides,
  profile,
  style,
  slideRefs,
}: CarouselPreviewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const scrollTo = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 384;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const scrollToSlide = (index: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: index * 384,
      behavior: "smooth",
    });
  };

  // Track active slide on scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const idx = Math.round(el.scrollLeft / 384);
      setActiveSlide(idx);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative">
      {/* Scroll buttons */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => scrollTo("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 rounded-full bg-white border border-[var(--border)] shadow-md flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all"
            aria-label="Previous slide"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() => scrollTo("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-full bg-white border border-[var(--border)] shadow-md flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all"
            aria-label="Next slide"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory preview-scroll"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#d1d5db transparent",
        }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="snap-start">
            <CarouselSlide
              ref={(el) => {
                if (slideRefs) {
                  slideRefs.current[index] = el;
                }
              }}
              heading={slide.heading}
              body={slide.body}
              imageUrl={slide.imageUrl}
              slideNumber={index + 1}
              totalSlides={slides.length}
              profile={profile}
              style={style}
              isLastSlide={index === slides.length - 1}
            />
          </div>
        ))}
      </div>

      {/* Slide indicator dots */}
      {slides.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToSlide(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeSlide
                  ? "w-6 h-2 bg-[var(--accent)]"
                  : "w-2 h-2 bg-zinc-200 hover:bg-zinc-300"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
