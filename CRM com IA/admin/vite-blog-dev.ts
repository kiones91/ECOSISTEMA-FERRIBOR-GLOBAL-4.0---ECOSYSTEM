import type { Plugin } from "vite";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Em dev, dispara `npm run blog:publish` ao publicar artigo no admin. */
export function blogDevPublish(): Plugin {
  return {
    name: "blog-dev-publish",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        const match = url.match(/^\/api\/admin\/blog\/publish\/([^/]+)$/);
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
            execSync("node tools/blog/publish-from-supabase.mjs", {
              cwd: ROOT,
              stdio: "pipe",
              encoding: "utf8",
            });
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(
              JSON.stringify({
                ok: true,
                message: "HTML gerado em site/blog/artigos/. Rode npm run build para atualizar dist/.",
              }),
            );
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Erro ao publicar";
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: msg }));
          }
        });
      });
    },
  };
}
