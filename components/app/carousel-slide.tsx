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
    const bg = isDark ? "#111111" : "#ffffff";
    const fg = isDark ? "#ffffff" : "#111111";
    const muted = isDark ? "#9ca3af" : "#6b7280";
    const accent = "#7C3AED";

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
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            padding: "24px 28px",
            fontFamily: "var(--font-sans), Inter, system-ui, sans-serif",
            position: "relative",
            overflow: "hidden",
            border: isDark ? "1px solid #222" : "1px solid #e5e7eb",
          }}
        >
          {/* Header — profile */}
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
                width: 32,
                height: 32,
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
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {profile.name}
              </div>
              <div
                style={{ fontSize: 11, color: muted, lineHeight: 1.2 }}
              >
                {profile.handle}
              </div>
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
              gap: 16,
              overflow: "hidden",
            }}
          >
            {isLastSlide ? (
              /* CTA slide */
              <>
                <div
                  style={{
                    fontSize: 28,
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
                    lineHeight: 1.6,
                    color: muted,
                    textAlign: "center",
                    whiteSpace: "pre-line",
                  }}
                >
                  {body}
                </div>
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 24px",
                    background: accent,
                    color: "#fff",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
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
                    fontSize: slideNumber === 1 ? 26 : 22,
                    fontWeight: 700,
                    lineHeight: 1.25,
                    margin: 0,
                    fontFamily:
                      "var(--font-serif), 'DM Serif Display', Georgia, serif",
                  }}
                >
                  {heading}
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: isDark ? "#d1d5db" : "#374151",
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
                      borderRadius: 8,
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

          {/* Footer — slide indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              marginTop: 16,
              flexShrink: 0,
            }}
          >
            {Array.from({ length: totalSlides }, (_, i) => (
              <div
                key={i}
                style={{
                  width: i + 1 === slideNumber ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background:
                    i + 1 === slideNumber
                      ? accent
                      : isDark
                        ? "#333"
                        : "#d1d5db",
                  transition: "all 0.2s",
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
