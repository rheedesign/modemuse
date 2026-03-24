export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const aiEnabled = process.env.AI_ENABLED ?? process.env.VITE_AI_ENABLED;
  if (String(aiEnabled) === "false") {
    return res.status(503).json({ error: { message: "AI recommendations are temporarily paused." } });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  try {
    // Log the body to find http:// URLs
    const bodyStr = JSON.stringify(req.body);
    const httpMatches = bodyStr.match(/http:\/\/[^"]+/g);
    if (httpMatches) {
      console.error("[PROXY] Found http:// URLs:", httpMatches);
    }

    // Force all http:// to https:// in the body
    const sanitizedBody = JSON.parse(bodyStr.replace(/http:\/\//g, 'https://'));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(sanitizedBody),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
