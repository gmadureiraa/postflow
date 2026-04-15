export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return Response.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Strategy 1: Serper.dev Google Image Search
    const serperKey = process.env.SERPER_API_KEY;
    if (serperKey) {
      try {
        const resp = await fetch("https://google.serper.dev/images", {
          method: "POST",
          headers: {
            "X-API-KEY": serperKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ q: query, num: 5 }),
          signal: AbortSignal.timeout(10_000),
        });

        if (resp.ok) {
          const data = await resp.json();
          const images = (data.images || [])
            .slice(0, 5)
            .map(
              (img: {
                imageUrl?: string;
                title?: string;
                source?: string;
              }) => ({
                url: img.imageUrl || "",
                title: img.title || "",
                source: img.source || "",
              })
            );

          return Response.json({ images });
        }
      } catch (err) {
        console.error("Serper API error:", err);
      }
    }

    // Strategy 2: Fallback — return placeholder images using Unsplash
    const encodedQuery = encodeURIComponent(query);
    const fallbackImages = Array.from({ length: 5 }, (_, i) => ({
      url: `https://source.unsplash.com/800x600/?${encodedQuery}&sig=${i}`,
      title: `${query} - Image ${i + 1}`,
      source: "Unsplash",
    }));

    return Response.json({ images: fallbackImages });
  } catch (error) {
    console.error("Images API error:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
