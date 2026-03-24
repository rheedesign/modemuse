export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  try {
    const bodyStr = JSON.stringify(req.body);
    const allUrls = bodyStr.match(/https?:\/\/[^"\\]+/g) || [];
    console.log("[PROXY] URLs:", allUrls);
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
    if (!response.ok) console.error("[PROXY] Error:", JSON.stringify(data));
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("[PROXY] Catch:", err.message);
    return res.status(500).json({ error: err.message });
  }
}