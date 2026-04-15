import { extractContentFromUrl } from "@/lib/url-extractor";
import { getYouTubeTranscript } from "@/lib/youtube-transcript";

export const maxDuration = 60;

interface GenerateRequest {
  topic: string;
  sourceType: "idea" | "link" | "video" | "ai";
  sourceUrl?: string;
  niche: string;
  tone: string;
  language: string;
}

interface Slide {
  heading: string;
  body: string;
  imageQuery: string;
}

interface Variation {
  title: string;
  style: "data" | "story" | "provocative";
  slides: Slide[];
}

interface GenerateResponse {
  variations: Variation[];
}

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
    const { topic, sourceType, sourceUrl, niche, tone, language } = body;

    if (!topic && sourceType === "idea") {
      return Response.json({ error: "Topic is required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Return mock data for development without API key
      return Response.json(getMockResponse(topic || "Sample Topic"));
    }

    // 1. Gather source content
    let sourceContent = "";

    if (sourceType === "link" && sourceUrl) {
      try {
        sourceContent = await extractContentFromUrl(sourceUrl);
      } catch (err) {
        return Response.json(
          {
            error: `Failed to extract content from URL: ${err instanceof Error ? err.message : "Unknown error"}`,
          },
          { status: 400 }
        );
      }
    } else if (sourceType === "video" && sourceUrl) {
      try {
        sourceContent = await getYouTubeTranscript(sourceUrl);
      } catch (err) {
        return Response.json(
          {
            error: `Failed to extract YouTube transcript: ${err instanceof Error ? err.message : "Unknown error"}`,
          },
          { status: 400 }
        );
      }
    }

    // 2. Build the prompt
    const systemPrompt = `You are a viral content creator specializing in Instagram carousels and Twitter threads.
You generate content in ${language || "English"}.
Tone: ${tone || "professional"}.
Niche: ${niche || "general"}.

Given a topic or source content, create 3 DIFFERENT carousel variations.
Each carousel has 6-10 slides.
Each slide has: heading (max 8 words, bold, impactful), body (2-3 short lines, actionable), imageQuery (2-3 word search term for a relevant image).

Variation A: Data-driven — focus on statistics, numbers, comparisons, proof
Variation B: Story-driven — narrative arc, personal angle, relatable scenario, emotional hook
Variation C: Provocative — hot takes, challenges status quo, bold claims, contrarian view

First slide is always a HOOK that stops the scroll.
Last slide is always a CTA with the user's handle.

Return as JSON: { variations: [{ title, style: "data"|"story"|"provocative", slides: [{heading, body, imageQuery}] }] }

IMPORTANT: Return ONLY valid JSON, no markdown code blocks, no extra text.`;

    const userMessage = sourceContent
      ? `Create 3 carousel variations based on this content:\n\nTopic: ${topic}\n\nSource:\n${sourceContent}`
      : `Create 3 carousel variations about: ${topic}`;

    // 3. Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", errorText);
      return Response.json(
        { error: "AI generation failed. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const textBlock = data.content?.find(
      (block: { type: string }) => block.type === "text"
    );

    if (!textBlock?.text) {
      return Response.json(
        { error: "No response from AI" },
        { status: 502 }
      );
    }

    // 4. Parse the JSON response
    let result: GenerateResponse;
    try {
      // Try direct parse first
      result = JSON.parse(textBlock.text);
    } catch {
      // Try extracting JSON from potential markdown code block
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        return Response.json(
          { error: "Failed to parse AI response" },
          { status: 502 }
        );
      }
    }

    // 5. Validate structure
    if (!result.variations || !Array.isArray(result.variations)) {
      return Response.json(
        { error: "Invalid AI response structure" },
        { status: 502 }
      );
    }

    return Response.json(result);
  } catch (error) {
    console.error("Generate error:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

function getMockResponse(topic: string): GenerateResponse {
  const makeSlides = (style: string): Slide[] => [
    {
      heading: `${style === "data" ? "The Numbers Don't Lie" : style === "story" ? "I Was Wrong About This" : "Stop Doing This Now"}`,
      body: `Everything you thought about ${topic} is about to change.\nHere's what the top 1% know.\nSwipe to find out.`,
      imageQuery: `${topic} concept`,
    },
    {
      heading:
        style === "data"
          ? "78% Miss This Key Point"
          : style === "story"
            ? "It Started With a Problem"
            : "The Uncomfortable Truth",
      body: `Most people approach ${topic} the wrong way.\nThey focus on the surface level.\nBut the real impact is deeper.`,
      imageQuery: `${topic} insight`,
    },
    {
      heading:
        style === "data"
          ? "3x More Results With This"
          : style === "story"
            ? "Then Everything Changed"
            : "Nobody Talks About This",
      body: `Here's the strategy that changes everything.\nIt's simpler than you think.\nBut requires a shift in mindset.`,
      imageQuery: `${topic} strategy`,
    },
    {
      heading:
        style === "data"
          ? "The Framework That Works"
          : style === "story"
            ? "The Lesson I Learned"
            : "The Real Problem Is You",
      body: `Step 1: Understand the fundamentals.\nStep 2: Apply consistently.\nStep 3: Measure and iterate.`,
      imageQuery: `${topic} framework`,
    },
    {
      heading:
        style === "data"
          ? "Results: Before vs After"
          : style === "story"
            ? "What I Do Differently Now"
            : "Here's What Actually Works",
      body: `The difference is night and day.\nSmall changes compound over time.\nConsistency beats intensity.`,
      imageQuery: `${topic} results`,
    },
    {
      heading: "Follow For More",
      body: `If this was valuable, follow for more.\nSave this for later.\nShare with someone who needs this.`,
      imageQuery: `social media follow`,
    },
  ];

  return {
    variations: [
      {
        title: `${topic}: By The Numbers`,
        style: "data",
        slides: makeSlides("data"),
      },
      {
        title: `My ${topic} Journey`,
        style: "story",
        slides: makeSlides("story"),
      },
      {
        title: `${topic}: The Hard Truth`,
        style: "provocative",
        slides: makeSlides("provocative"),
      },
    ],
  };
}
