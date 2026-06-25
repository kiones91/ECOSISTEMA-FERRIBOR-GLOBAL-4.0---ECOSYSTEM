import type { Env } from './types';
import { serveAssets } from './assets';
import { handleApi } from './routes/api';

export type { Env };

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, env, ctx);
    }

    return serveAssets(request, env);
  },
} satisfies ExportedHandler<Env>;
