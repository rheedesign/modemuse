import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or key. Run with: node --env-file=.env scripts/backfill-cutouts.js");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function buildCutoutUrl(imageUrl) {
  if (!imageUrl || !imageUrl.includes("/upload/")) return null;
  return imageUrl.replace("/upload/", "/upload/e_background_removal/");
}

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--user-id" && args[i + 1]) flags.userId = args[++i];
    if (args[i] === "--limit" && args[i + 1]) flags.limit = parseInt(args[++i], 10);
  }
  return flags;
}

async function main() {
  const { userId, limit } = parseArgs();

  let query = supabase
    .from("clothing_items")
    .select("id, image_url")
    .is("cutout_url", null);

  if (userId) query = query.eq("user_id", userId);
  if (limit) query = query.limit(limit);

  const { data: rows, error } = await query;
  if (error) {
    console.error("Query failed:", error.message);
    process.exit(1);
  }

  console.log(`Found ${rows.length} rows to backfill${userId ? ` (user: ${userId})` : ""}`);
  if (rows.length === 0) return;

  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cutoutUrl = buildCutoutUrl(row.image_url);

    if (!cutoutUrl) {
      console.warn(`  [skip] id=${row.id} — malformed image_url: ${row.image_url}`);
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from("clothing_items")
      .update({ cutout_url: cutoutUrl })
      .eq("id", row.id);

    if (updateError) {
      console.warn(`  [error] id=${row.id} — ${updateError.message}`);
      skipped++;
      continue;
    }

    updated++;
    if (updated % 10 === 0) console.log(`  ...${updated} rows updated`);
  }

  console.log(`Done. Updated: ${updated}, Skipped: ${skipped}`);
}

main();
