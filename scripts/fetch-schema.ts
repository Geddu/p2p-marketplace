import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fetchSchema() {
  try {
    // Create schema directory if it doesn't exist
    const schemaDir = path.join(process.cwd(), ".supabase-schema");
    if (!fs.existsSync(schemaDir)) {
      fs.mkdirSync(schemaDir);
    }

    // Get all tables in the public schema
    const tables = await Promise.all(
      ["items", "messages"].map(async (table) => {
        try {
          const { data, error } = await supabase
            .from(table)
            .select("*")
            .limit(1);

          if (error) {
            console.error(`Error fetching schema for ${table}:`, error);
            return null;
          }

          // Get the structure from the first row
          const structure =
            data && data[0]
              ? Object.keys(data[0]).map((key) => ({
                  column: key,
                  type: typeof data[0][key],
                }))
              : [];

          return {
            name: table,
            columns: structure,
          };
        } catch (error) {
          console.error(`Error processing table ${table}:`, error);
          return null;
        }
      })
    );

    const schema = tables.filter(Boolean).reduce((acc, table) => {
      if (table) {
        acc[table.name] = {
          columns: table.columns,
        };
      }
      return acc;
    }, {} as Record<string, any>);

    // Fetch storage buckets
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) throw bucketsError;

    const storage: Record<string, any> = {};
    for (const bucket of buckets || []) {
      storage[bucket.name] = {
        id: bucket.id,
        public: bucket.public,
      };
    }

    // Save the schemas with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // Save database schema
    fs.writeFileSync(
      path.join(schemaDir, `db-schema-${timestamp}.json`),
      JSON.stringify({ tables: schema }, null, 2)
    );
    fs.writeFileSync(
      path.join(schemaDir, "db-schema-latest.json"),
      JSON.stringify({ tables: schema }, null, 2)
    );

    // Save storage schema
    fs.writeFileSync(
      path.join(schemaDir, `storage-schema-${timestamp}.json`),
      JSON.stringify({ storage }, null, 2)
    );
    fs.writeFileSync(
      path.join(schemaDir, "storage-schema-latest.json"),
      JSON.stringify({ storage }, null, 2)
    );

    console.log("Schema files have been saved to .supabase-schema/");
  } catch (error) {
    console.error("Error fetching schema:", error);
  }
}

fetchSchema();
