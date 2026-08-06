import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase env");
  }

  const db = createClient(url, key, {
    auth: { persistSession: false },
  });

  const { data, error } = await db
    .from("courses")
    .select("id, slug")
    .limit(1);

  console.log("DATA:", data);
  console.log("ERROR:", error);
}

main().catch((error) => {
  console.error("FATAL:", error);
  process.exit(1);
});