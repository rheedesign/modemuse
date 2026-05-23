import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or key. Run with: node --env-file=.env scripts/backfill-cutouts-v2.js");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const NEW_TRANSFORM = "e_background_removal,c_pad,b_transparent,w_1000,h_1000,f_png";
const BATCH_SIZE = 50;

function buildCutoutUrl(imageUrl) {
  if (!imageUrl || !imageUrl.includes("/upload/")) return null;
  return imageUrl.replace("/upload/", `/upload/${NEW_TRANSFORM}/`);
}

async function main() {
  // Step 1: Baseline — count items with cutout_url set
  const { count: totalWithCutout } = await supabase
    .from("clothing_items")
    .select("id", { count: "exact", head: true })
    .not("cutout_url", "is", null);
  console.log(`[Baseline] Items with cutout_url set: ${totalWithCutout}`);

  // Step 2: Sample 3 current cutout_url values
  const { data: samples } = await supabase
    .from("clothing_items")
    .select("id, cutout_url")
    .not("cutout_url", "is", null)
    .limit(3);
  console.log("[Baseline] Sample current cutout_url values:");
  for (const s of samples || []) {
    console.log(`  id=${s.id}: ${s.cutout_url}`);
  }

  // Step 3: Find items that need updating (have cutout_url but don't contain c_pad)
  // Also include items with null cutout_url that have a valid image_url
  const { data: needsUpdate, error: queryError } = await supabase
    .from("clothing_items")
    .select("id, image_url, cutout_url");

  if (queryError) {
    console.error("Query failed:", queryError.message);
    process.exit(1);
  }

  const toUpdate = (needsUpdate || []).filter((row) => {
    // Skip if already has the new transform
    if (row.cutout_url && row.cutout_url.includes("c_pad")) return false;
    // Skip if image_url can't produce a cutout
    if (!row.image_url || !row.image_url.includes("/upload/")) return false;
    return true;
  });

  console.log(`\n[Plan] ${toUpdate.length} items need updating (out of ${needsUpdate.length} total)`);
  if (toUpdate.length === 0) {
    console.log("Nothing to update. All items already have the new transform.");
    return;
  }

  // Step 4: Update in batches
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
    const batch = toUpdate.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(toUpdate.length / BATCH_SIZE);

    for (const row of batch) {
      const newCutoutUrl = buildCutoutUrl(row.image_url);
      if (!newCutoutUrl) {
        console.warn(`  [skip] id=${row.id} — malformed image_url: ${row.image_url}`);
        errors++;
        continue;
      }

      const { error: updateError } = await supabase
        .from("clothing_items")
        .update({ cutout_url: newCutoutUrl })
        .eq("id", row.id);

      if (updateError) {
        console.warn(`  [error] id=${row.id} — ${updateError.message}`);
        errors++;
        continue;
      }

      updated++;
    }

    console.log(`  Batch ${batchNum}/${totalBatches} complete (${updated} updated so far)`);
  }

  // Step 5: Verify — sample 3 updated cutout_url values
  console.log(`\n[Result] Updated: ${updated}, Errors: ${errors}`);

  const { data: verifysamples } = await supabase
    .from("clothing_items")
    .select("id, cutout_url")
    .not("cutout_url", "is", null)
    .like("cutout_url", "%c_pad%")
    .limit(3);
  console.log("[Verify] Sample updated cutout_url values:");
  for (const s of verifysamples || []) {
    console.log(`  id=${s.id}: ${s.cutout_url}`);
  }

  const { count: finalCount } = await supabase
    .from("clothing_items")
    .select("id", { count: "exact", head: true })
    .like("cutout_url", "%c_pad%");
  console.log(`[Verify] Total items with new transform: ${finalCount}`);
}

main();
