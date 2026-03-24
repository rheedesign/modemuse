export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: "Missing url field" });

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      redirect: "follow",
    });

    const contentType = response.headers.get("content-type") || "";

    // If the URL points directly to an image, return it as-is
    if (contentType.startsWith("image/")) {
      return res.status(200).json({ imageUrl: url, title: null, price: null, brand: null });
    }

    const html = await response.text();

    // Extract meta tags
    function getMeta(property) {
      const patterns = [
        new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, "i"),
      ];
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) return match[1];
      }
      return null;
    }

    // Strategy 1: og:image
    let imageUrl = getMeta("og:image");

    // Strategy 2: twitter:image
    if (!imageUrl) imageUrl = getMeta("twitter:image");
    if (!imageUrl) imageUrl = getMeta("twitter:image:src");

    // Strategy 3: first large img tag
    if (!imageUrl) {
      const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
      for (const m of imgMatches) {
        const tag = m[0];
        const src = m[1];
        const widthMatch = tag.match(/width=["']?(\d+)/i);
        if (widthMatch && parseInt(widthMatch[1]) > 400) {
          imageUrl = src;
          break;
        }
      }
    }

    // Resolve relative URLs
    if (imageUrl && !imageUrl.startsWith("http")) {
      try {
        imageUrl = new URL(imageUrl, url).href;
      } catch {}
    }

    const title = getMeta("og:title") || getMeta("title") || null;
    const price = getMeta("og:price:amount") || getMeta("product:price:amount") || getMeta("price") || null;
    const brand = getMeta("og:brand") || getMeta("product:brand") || getMeta("og:site_name") || null;

    if (!imageUrl) {
      return res.status(200).json({ error: "Could not extract product image" });
    }

    return res.status(200).json({ imageUrl, title, price, brand });
  } catch (err) {
    return res.status(200).json({ error: "Could not extract product image" });
  }
}
