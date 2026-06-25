import type { Plugin } from "vite";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export function cursosDevPublish(): Plugin {
  return {
    name: "cursos-dev-publish",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        const match = url.match(/^\/api\/admin\/courses\/publish\/([^/]+)$/);
        if (!match) return next();

        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey");
          res.end();
          return;
        }

        if (req.method !== "POST") return next();

        req.on("data", () => {});
        req.on("end", () => {
          try {
            execSync("node tools/courses/publish-from-supabase.mjs", {
              cwd: ROOT,
              stdio: "pipe",
              encoding: "utf8",
            });
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(
              JSON.stringify({
                ok: true,
                message: "Curso publicado: config, site e D1 atualizados (npm run build para dist/).",
              }),
            );
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Erro ao publicar curso";
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: msg }));
          }
        });
      });
    },
  };
}
