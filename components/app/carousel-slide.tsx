"use client";

import { forwardRef } from "react";

export interface SlideProps {
  heading: string;
  body: string;
  imageUrl?: string;
  slideNumber: number;
  totalSlides: number;
  profile: { name: string; handle: string; photoUrl: string };
  style: "white" | "dark";
  isLastSlide?: boolean;
}

const CarouselSlide = forwardRef<HTMLDivElement, SlideProps>(
  function CarouselSlide(
    {
      heading,
      body,
      imageUrl,
      slideNumber,
      totalSlides,
      profile,
      style,
      isLastSlide,
    },
    ref
  ) {
    const isDark = style === "dark";
    const bg = isDark ? "#0f0f0f" : "#ffffff";
    const fg = isDark ? "#f5f5f5" : "#111111";
    const muted = isDark ? "#9ca3af" : "#6b7280";
    const subtle = isDark ? "#1a1a1a" : "#f4f4f5";
    const accent = "#7C3AED";
    const borderColor = isDark ? "#2a2a2a" : "#e5e7eb";

    return (
      <div
        ref={ref}
        className="flex-shrink-0"
        style={{
          width: 360,
          height: 450,
          aspectRatio: "1080 / 1350",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: bg,
            color: fg,
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            padding: "24px 28px",
            fontFamily: "var(--font-sans), Inter, system-ui, sans-serif",
            position: "relative",
            overflow: "hidden",
            border: `1px solid ${borderColor}`,
            boxShadow: isDark
              ? "0 4px 24px rgba(0,0,0,0.3)"
              : "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          {/* Header -- tweet-style profile */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${accent}, #a78bfa)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {profile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  letterSpacing: "-0.01em",
                }}
              >
                {profile.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: muted,
                  lineHeight: 1.3,
                }}
              >
                {profile.handle}
              </div>
            </div>
            {/* Verified-style indicator for slide number */}
            <div
              style={{
                fontSize: 11,
                color: muted,
                background: subtle,
                padding: "3px 8px",
                borderRadius: 6,
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              {slideNumber}/{totalSlides}
            </div>
          </div>

          {/* Main content */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: isLastSlide ? "center" : "flex-start",
              alignItems: isLastSlide ? "center" : "flex-start",
              gap: 14,
              overflow: "hidden",
            }}
          >
            {isLastSlide ? (
              /* CTA slide */
              <>
                {/* Accent line */}
                <div
                  style={{
                    width: 48,
                    height: 4,
                    borderRadius: 2,
                    background: accent,
                    marginBottom: 8,
                  }}
                />
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    textAlign: "center",
                    fontFamily:
                      "var(--font-serif), 'DM Serif Display', Georgia, serif",
                  }}
                >
                  {heading}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: muted,
                    textAlign: "center",
                    whiteSpace: "pre-line",
                  }}
                >
                  {body}
                </div>
                <div
                  style={{
                    marginTop: 16,
                    padding: "12px 28px",
                    background: accent,
                    color: "#fff",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Follow {profile.handle}
                </div>
              </>
            ) : (
              /* Normal slide */
              <>
                <h2
                  style={{
                    fontSize: slideNumber === 1 ? 24 : 21,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    margin: 0,
                    fontFamily:
                      "var(--font-serif), 'DM Serif Display', Georgia, serif",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {heading}
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: isDark ? "#d1d5db" : "#4b5563",
                    margin: 0,
                    whiteSpace: "pre-line",
                  }}
                >
                  {body}
                </p>

                {imageUrl && (
                  <div
                    style={{
                      width: "100%",
                      maxHeight: "45%",
                      borderRadius: 10,
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={heading}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer -- slide indicator dots */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              marginTop: 16,
              flexShrink: 0,
            }}
          >
            {Array.from({ length: totalSlides }, (_, i) => (
              <div
                key={i}
                style={{
                  width: i + 1 === slideNumber ? 18 : 5,
                  height: 5,
                  borderRadius: 3,
                  background:
                    i + 1 === slideNumber
                      ? accent
                      : isDark
                        ? "#2a2a2a"
                        : "#e5e7eb",
                  transition: "all 0.3s ease",
                  opacity: i + 1 === slideNumber ? 1 : 0.5,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

export default CarouselSlide;
