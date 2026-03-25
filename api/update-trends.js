const RSS_FEEDS = [
  "https://www.whowhatwear.com/rss",
  "https://www.refinery29.com/rss.xml",
  "https://www.instyle.com/rss/all.xml",
];

function extractRssText(xml) {
  const items = [];
  const itemRegex = /<item[\s>][\s\S]*?<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[0];
    const title = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "";
    const desc = block.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] || "";
    const clean = (title + " " + desc)
      .replace(/<!\[CDATA\[/g, "")
      .replace(/\]\]>/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
    if (clean) items.push(clean);
  }
  return items.join("\n");
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-cron-secret");

  if (req.method === "OPTIONS") return res.status(200).end();

  // Auth check — skip for GET in development
  const isDev = process.env.NODE_ENV === "development";
  if (!(req.method === "GET" && isDev)) {
    const secret = req.headers["x-cron-secret"];
    if (!secret || secret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Supabase credentials not configured" });
  }

  try {
    // 1. Fetch trend content from multiple RSS feeds in parallel
    const feedResults = await Promise.allSettled(
      RSS_FEEDS.map((url) =>
        fetch(url, {
          headers: { "User-Agent": "Styliner/1.0 RSS Reader" },
        }).then((r) => {
          if (!r.ok) throw new Error(`${url} returned ${r.status}`);
          return r.text();
        })
      )
    );

    const feedTexts = feedResults
      .filter((r) => r.status === "fulfilled")
      .map((r) => extractRssText(r.value));

    const successCount = feedTexts.length;
    const failedFeeds = feedResults
      .map((r, i) => (r.status === "rejected" ? RSS_FEEDS[i] : null))
      .filter(Boolean);

    if (successCount === 0) {
      return res.status(502).json({ error: "All RSS feeds failed", failedFeeds });
    }

    const text = feedTexts.join("\n\n").slice(0, 8000);

    // 2. Ask Anthropic to summarize trends
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `You are a fashion trend analyst. Based on this content scraped from fashion RSS feeds (Who What Wear, Refinery29, InStyle), extract the latest fashion trends.\n\nContent:\n${text}\n\nReturn ONLY a JSON object with these keys:\n- womens_trends: 6 bullet points of current women's fashion trends\n- mens_trends: 6 bullet points of current men's fashion trends\n- fluid_trends: 6 bullet points of current gender-fluid/unisex fashion trends\n\nEach bullet must start with "•" and be one punchy, specific sentence about a trend happening right now. Be specific about colors, silhouettes, brands, or pieces. No preamble, no markdown code fences, just the raw JSON object.`,
          },
        ],
      }),
    });

    const anthropicText = await anthropicResponse.text();
    let anthropicData;
    try {
      anthropicData = JSON.parse(anthropicText);
    } catch {
      return res.status(502).json({ error: `Anthropic returned invalid JSON: ${anthropicText.slice(0, 200)}` });
    }

    if (!anthropicResponse.ok) {
      return res.status(502).json({ error: `Anthropic API error: ${anthropicData?.error?.message || anthropicResponse.status}` });
    }

    const aiText = anthropicData.content?.[0]?.text || "";

    // 3. Parse the JSON from AI response
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "Could not parse trends JSON from AI response", raw: aiText.slice(0, 500) });
    }

    let trends;
    try {
      trends = JSON.parse(jsonMatch[0]);
    } catch {
      return res.status(500).json({ error: "Invalid JSON in AI response", raw: jsonMatch[0].slice(0, 500) });
    }

    // 4. Save to Supabase
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/trend_updates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        womens_trends: trends.womens_trends || "",
        mens_trends: trends.mens_trends || "",
        fluid_trends: trends.fluid_trends || "",
        source_summary: text.slice(0, 500),
      }),
    });

    if (!insertResponse.ok) {
      const errText = await insertResponse.text();
      return res.status(500).json({ error: `Supabase insert failed: ${errText.slice(0, 200)}` });
    }

    return res.status(200).json({ success: true, trends, feedsUsed: successCount, feedsFailed: failedFeeds });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
