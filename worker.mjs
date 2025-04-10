import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import { D1Adapter } from './modules/d1-adapter.mjs';
import { handleRequest } from './modules/handler.mjs';

export default {
    async fetch(request, env, ctx) {
        const clonedRequest = request.clone();

        try {
            let result = await env.ASSETS.fetch(clonedRequest);
            if (result.status === 200) {
                return result;
            }
        } catch (err) {}

        try {
            const db = new D1Adapter(env.DB);
            return await handleRequest(request, db, env);
        } catch (error) {
            console.error('Error handling request:', error);
            return new Response('Internal Server Error', { status: 500 });
        }
    }
}
