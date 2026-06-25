import type { Plugin } from "vite";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { handleEvolutionAdmin } from "../worker/src/routes/evolution";
import type { Env } from "../worker/src/types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadCrmEnv(): Record<string, string> {
  const path = join(ROOT, "config", "crm.env");
  if (!existsSync(path)) return {};
  const map: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    map[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return map;
}

function devEnv(): Env {
  const crm = loadCrmEnv();
  return {
    ASSETS: null as unknown as Env["ASSETS"],
    SUPABASE_URL: crm.VITE_SUPABASE_URL || crm.SUPABASE_URL,
    SUPABASE_ANON_KEY: crm.VITE_SUPABASE_ANON_KEY || crm.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: crm.SUPABASE_SERVICE_ROLE_KEY,
  };
}

/** Proxy Evolution no Vite (dev) — evita depender de Edge Function ou wrangler dev. */
export function evolutionDevProxy(): Plugin {
  return {
    name: "evolution-dev-proxy",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0];
        if (url !== "/api/admin/evolution") return next();

        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey");
          res.end();
          return;
        }

        if (req.method !== "POST") return next();

        const chunks: Buffer[] = [];
        req.on("data", (c) => chunks.push(c));
        req.on("end", async () => {
          try {
            const body = Buffer.concat(chunks).toString("utf8");
            const headers = new Headers();
            for (const [k, v] of Object.entries(req.headers)) {
              if (typeof v === "string") headers.set(k, v);
              else if (Array.isArray(v)) headers.set(k, v.join(", "));
            }
            const request = new Request(`http://localhost${url}`, {
              method: "POST",
              headers,
              body: body || undefined,
            });
            const response = await handleEvolutionAdmin(request, devEnv());
            res.statusCode = response.status;
            response.headers.forEach((v, k) => res.setHeader(k, v));
            res.end(Buffer.from(await response.arrayBuffer()));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error: err instanceof Error ? err.message : "Erro no proxy Evolution",
              }),
            );
          }
        });
      });
    },
  };
}
