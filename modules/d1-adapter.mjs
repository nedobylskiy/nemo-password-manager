import { DBAdapter } from './db-adapter.mjs';

export class D1Adapter extends DBAdapter {
    constructor(d1) {
        super();
        this.d1 = d1;
    }

    async addMessage(text) {
        await this.d1.prepare("INSERT INTO messages (text) VALUES (?)")
            .bind(text)
            .run();
    }

    async listMessages() {
        const { results } = await this.d1.prepare("SELECT * FROM messages").all();
        return results;
    }
}
