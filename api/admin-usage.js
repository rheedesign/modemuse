import { createClient } from "@supabase/supabase-js";

function parseEmailList(rawValue) {
  return String(rawValue || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function getAdminEmails() {
  return Array.from(new Set([
    ...parseEmailList(process.env.ADMIN_EMAILS),
    ...parseEmailList(process.env.ADMIN_EMAIL),
    ...parseEmailList(process.env.VITE_ADMIN_EMAILS),
    ...parseEmailList(process.env.VITE_ADMIN_EMAIL),
  ]));
}

function isAllowedAdmin(email) {
  if (!email) return false;
  return getAdminEmails().includes(String(email).trim().toLowerCase());
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: "Admin usage is not configured" });
  }

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: userData, error: userError } = await adminSupabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = userData.user;
  if (!isAllowedAdmin(user.email)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startIso = startOfDay.toISOString();

  const [
    { count: totalCount, error: totalError },
    { count: dailyCount, error: dailyError },
    { count: errorCount, error: errorCountError },
  ] = await Promise.all([
    adminSupabase
      .from("ai_usage_events")
      .select("id", { count: "exact", head: true }),
    adminSupabase
      .from("ai_usage_events")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startIso),
    adminSupabase
      .from("ai_usage_events")
      .select("id", { count: "exact", head: true })
      .eq("success", false),
  ]);

  if (totalError) return res.status(500).json({ error: totalError.message });
  if (dailyError) return res.status(500).json({ error: dailyError.message });
  if (errorCountError) return res.status(500).json({ error: errorCountError.message });

  const { data: events, error: eventsError } = await adminSupabase
    .from("ai_usage_events")
    .select("id, user_id, user_email, feature, success, error_message, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (eventsError) {
    return res.status(500).json({ error: eventsError.message });
  }

  const rows = Array.isArray(events) ? events : [];
  const featureMap = new Map();
  const userMap = new Map();
  const uniqueUsers = new Set();

  for (const event of rows) {
    const featureKey = event.feature || "unknown";
    const featureEntry = featureMap.get(featureKey) || {
      feature: featureKey,
      totalCount: 0,
      successCount: 0,
      errorCount: 0,
    };
    featureEntry.totalCount += 1;
    featureEntry.successCount += event.success ? 1 : 0;
    featureEntry.errorCount += event.success ? 0 : 1;
    featureMap.set(featureKey, featureEntry);

    const userKey = event.user_id || event.user_email || "unknown";
    const userEntry = userMap.get(userKey) || {
      userId: event.user_id || "",
      userEmail: event.user_email || "",
      totalCount: 0,
      successCount: 0,
      errorCount: 0,
    };
    userEntry.totalCount += 1;
    userEntry.successCount += event.success ? 1 : 0;
    userEntry.errorCount += event.success ? 0 : 1;
    userMap.set(userKey, userEntry);

    if (event.user_id) uniqueUsers.add(event.user_id);
    else if (event.user_email) uniqueUsers.add(event.user_email);
  }

  const featureBreakdown = Array.from(featureMap.values()).sort((a, b) => {
    if (b.totalCount !== a.totalCount) return b.totalCount - a.totalCount;
    return a.feature.localeCompare(b.feature);
  });
  const userBreakdown = Array.from(userMap.values()).sort((a, b) => {
    if (b.totalCount !== a.totalCount) return b.totalCount - a.totalCount;
    const aKey = a.userEmail || a.userId || "";
    const bKey = b.userEmail || b.userId || "";
    return aKey.localeCompare(bKey);
  }).slice(0, 25);

  return res.status(200).json({
    stats: {
      dailyCount: dailyCount || 0,
      totalCount: totalCount || 0,
      errorCount: errorCount || 0,
      userCount: uniqueUsers.size,
    },
    featureBreakdown,
    userBreakdown,
    recentEvents: rows.slice(0, 25),
  });
}
