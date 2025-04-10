import { DBAdapter } from './db-adapter.mjs';

export class D1Adapter extends DBAdapter {
    constructor(d1) {
        super();
        this.d1 = d1;
    }

    async createSpace(spaceName, spaceKeyHash) {
        const result = await this.d1.prepare(
            "INSERT INTO spaces (name, key_hash) VALUES (?, ?)"
        )
            .bind(spaceName, spaceKeyHash)
            .run();
        return result.lastRowId;
    }

    async listSpaces() {
        const { results } = await this.d1.prepare(
            "SELECT id, name, key_hash FROM spaces"
        ).all();
        return results;
    }

    async getSpaceContent(spaceId) {
        const { results } = await this.d1.prepare(
            "SELECT content FROM space_contents WHERE space_id = ?"
        )
            .bind(spaceId)
            .all();
        return results;
    }

    async addContent(spaceId, content) {
        await this.d1.prepare(
            "INSERT INTO space_contents (space_id, content) VALUES (?, ?)"
        )
            .bind(spaceId, content)
            .run();
    }

    async getSpace(spaceId) {
        const result = await this.d1.prepare(
            "SELECT id, name, key_hash FROM spaces WHERE id = ?"
        )
            .bind(spaceId)
            .first();
        return result;
    }
}
