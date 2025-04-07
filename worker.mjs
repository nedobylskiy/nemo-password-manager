import { D1Adapter } from './modules/d1-adapter.mjs';
import { handleRequest } from './modules/handler.mjs';

export default {
    async fetch(request, env, ctx) {
        const db = new D1Adapter(env.DB);
        return await handleRequest(request, db, env);
    }
}
