import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import { D1Adapter } from './modules/d1-adapter.mjs';
import { handleRequest } from './modules/handler.mjs';

export default {
    async fetch(request, env, ctx) {
        try {
            // Try to serve static files first
            if (request.method === 'GET') {
                try {
                    return await getAssetFromKV({
                        request,
                        waitUntil: ctx.waitUntil.bind(ctx),
                        env
                    }, {
                        ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
                        ASSET_NAMESPACE: env.__STATIC_CONTENT
                    });
                } catch (e) {
                    // If static file not found, continue to API handling
                }
            }

            // Handle API requests
            const db = new D1Adapter(env.DB);
            return await handleRequest(request, db, env);
        } catch (error) {
            return new Response('Internal Server Error', { status: 500 });
        }
    }
}
