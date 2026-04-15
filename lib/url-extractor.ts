/**
 * Extracts main content from a URL for AI processing.
 * Uses a simple fetch + regex approach (no heavy HTML parser dependency).
 */
export async function extractContentFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; PostFlow/1.0; +https://postflow.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? decodeEntities(titleMatch[1].trim()) : "";

    // Extract meta description
    const metaDescMatch = html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i
    );
    const metaDesc = metaDescMatch ? decodeEntities(metaDescMatch[1]) : "";

    // Extract og:image
    const ogImageMatch = html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([\s\S]*?)["']/i
    );
    const ogImage = ogImageMatch ? ogImageMatch[1] : "";

    // Extract og:title
    const ogTitleMatch = html.match(
      /<meta[^>]*property=["']og:title["'][^>]*content=["']([\s\S]*?)["']/i
    );
    const ogTitle = ogTitleMatch ? decodeEntities(ogTitleMatch[1]) : "";

    // Remove script, style, nav, footer, header tags
    let cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<aside[\s\S]*?<\/aside>/gi, "");

    // Try to find article or main content
    const articleMatch = cleaned.match(
      /<article[\s\S]*?>([\s\S]*?)<\/article>/i
    );
    const mainMatch = cleaned.match(/<main[\s\S]*?>([\s\S]*?)<\/main>/i);

    const contentHtml = articleMatch?.[1] || mainMatch?.[1] || cleaned;

    // Strip HTML tags, decode entities, clean whitespace
    const text = decodeEntities(contentHtml.replace(/<[^>]+>/g, " "))
      .replace(/\s+/g, " ")
      .trim();

    // Limit to ~3000 chars to avoid overly long prompts
    const truncated = text.length > 3000 ? text.slice(0, 3000) + "..." : text;

    const parts = [
      `URL: ${url}`,
      title && `Title: ${title}`,
      ogTitle && ogTitle !== title && `OG Title: ${ogTitle}`,
      metaDesc && `Description: ${metaDesc}`,
      ogImage && `Image: ${ogImage}`,
      "",
      `Content:\n${truncated}`,
    ].filter(Boolean);

    return parts.join("\n");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to extract content from URL: ${message}`);
  }
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)));
}
