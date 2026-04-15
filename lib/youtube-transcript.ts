/**
 * Extracts transcript from a YouTube video.
 * Uses the innertube API (no API key needed).
 */

const VIDEO_ID_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function extractVideoId(url: string): string | null {
  const match = url.match(VIDEO_ID_REGEX);
  return match ? match[1] : null;
}

export async function getYouTubeTranscript(url: string): Promise<string> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  // Strategy 1: Try fetching the video page and extracting captions data
  try {
    const transcript = await fetchTranscriptViaPage(videoId);
    if (transcript) return transcript;
  } catch {
    // Fall through to strategy 2
  }

  // Strategy 2: Try the timedtext API directly with common languages
  const languages = ["en", "pt", "es", "fr", "de"];
  for (const lang of languages) {
    try {
      const transcript = await fetchTimedText(videoId, lang);
      if (transcript) return transcript;
    } catch {
      continue;
    }
  }

  throw new Error(
    "Could not extract transcript. The video may not have captions available."
  );
}

async function fetchTimedText(
  videoId: string,
  lang: string
): Promise<string | null> {
  const url = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=json3`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) return null;

  const data = await response.json();

  if (!data.events || data.events.length === 0) return null;

  const lines: string[] = [];
  for (const event of data.events) {
    if (event.segs) {
      const text = event.segs
        .map((seg: { utf8?: string }) => seg.utf8 || "")
        .join("")
        .trim();
      if (text && text !== "\n") {
        lines.push(text);
      }
    }
  }

  return lines.length > 0 ? lines.join(" ") : null;
}

async function fetchTranscriptViaPage(videoId: string): Promise<string | null> {
  const pageUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const response = await fetch(pageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) return null;

  const html = await response.text();

  // Extract video title
  const titleMatch = html.match(
    /"title":"((?:[^"\\]|\\.)*)"/
  );
  const title = titleMatch ? titleMatch[1].replace(/\\"/g, '"') : "";

  // Try to find caption track URL in the page data
  const captionMatch = html.match(
    /"captionTracks":\[(\{.*?\})\]/
  );

  if (!captionMatch) return null;

  // Parse the caption tracks to find the base URL
  try {
    const tracksJson = `[${captionMatch[1]}]`;
    const tracks = JSON.parse(tracksJson);

    if (tracks.length === 0) return null;

    // Prefer English, then any available
    const track =
      tracks.find(
        (t: { languageCode?: string }) =>
          t.languageCode === "en" || t.languageCode === "pt"
      ) || tracks[0];

    if (!track.baseUrl) return null;

    // Fetch the actual transcript
    const captionUrl = track.baseUrl + "&fmt=json3";
    const captionResp = await fetch(captionUrl, {
      signal: AbortSignal.timeout(10_000),
    });

    if (!captionResp.ok) return null;

    const data = await captionResp.json();
    const lines: string[] = [];

    for (const event of data.events || []) {
      if (event.segs) {
        const text = event.segs
          .map((seg: { utf8?: string }) => seg.utf8 || "")
          .join("")
          .trim();
        if (text && text !== "\n") {
          lines.push(text);
        }
      }
    }

    const transcript = lines.join(" ");
    if (!transcript) return null;

    // Limit transcript length
    const truncated =
      transcript.length > 4000 ? transcript.slice(0, 4000) + "..." : transcript;

    return `Video: ${title}\n\nTranscript:\n${truncated}`;
  } catch {
    return null;
  }
}
