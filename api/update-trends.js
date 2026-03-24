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
    // 1. Fetch trend content
    const trendResponse = await fetch("https://www.whowhatwear.com/fashion/trends", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Styliner/1.0)" },
    });

    if (!trendResponse.ok) {
      return res.status(502).json({ error: `Failed to fetch trends: ${trendResponse.status}` });
    }

    const html = await trendResponse.text();
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 8000);

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
            content: `You are a fashion trend analyst. Based on this scraped content from Who What Wear, extract the latest fashion trends.\n\nContent:\n${text}\n\nReturn ONLY a JSON object with these keys:\n- womens_trends: 6 bullet points of current women's fashion trends\n- mens_trends: 6 bullet points of current men's fashion trends\n- fluid_trends: 6 bullet points of current gender-fluid/unisex fashion trends\n\nEach bullet must start with "•" and be one punchy, specific sentence about a trend happening right now. Be specific about colors, silhouettes, brands, or pieces. No preamble, no markdown code fences, just the raw JSON object.`,
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

    return res.status(200).json({ success: true, trends });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
