export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ error: "Cloudinary credentials not configured" });
  }

  // Verify the request comes from an authenticated user via Supabase JWT
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  try {
    // Verify the JWT with Supabase
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: authHeader,
        apikey: supabaseAnonKey,
      },
    });
    if (!userRes.ok) {
      return res.status(401).json({ error: "Invalid authorization token" });
    }
  } catch {
    return res.status(401).json({ error: "Token verification failed" });
  }

  const { publicIds } = req.body || {};

  if (!Array.isArray(publicIds) || publicIds.length === 0) {
    return res.status(400).json({ error: "publicIds array is required" });
  }

  // Cap at 100 to prevent abuse
  const ids = publicIds.slice(0, 100).filter((id) => typeof id === "string" && id.length > 0);

  if (ids.length === 0) {
    return res.status(400).json({ error: "No valid public IDs provided" });
  }

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const results = { deleted: 0, failed: 0, errors: [] };

  // Cloudinary supports bulk delete of up to 100 resources
  try {
    const deleteRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ public_ids: ids }),
      }
    );

    const deleteData = await deleteRes.json();

    if (deleteRes.ok && deleteData.deleted) {
      for (const [id, status] of Object.entries(deleteData.deleted)) {
        if (status === "deleted") {
          results.deleted++;
        } else {
          results.failed++;
          results.errors.push({ id, status });
        }
      }
    } else {
      // Fallback: if bulk delete fails, the images may not exist or
      // the response format differs — treat as partial success
      console.error("[delete-cloudinary-images] Bulk delete response:", deleteData);
      results.failed = ids.length;
      results.errors.push({ message: deleteData.error?.message || "Bulk delete failed" });
    }
  } catch (err) {
    console.error("[delete-cloudinary-images] Error:", err);
    results.failed = ids.length;
    results.errors.push({ message: err.message });
  }

  return res.status(200).json(results);
}
