import { DBAdapter } from './db-adapter.mjs';

export class D1Adapter extends DBAdapter {
    constructor(d1) {
        super();
        this.d1 = d1;
    }

    async createSpace(spaceName, spaceKeyHash) {
        const result = await this.d1.prepare(
            "INSERT INTO spaces (spaceId, spaceKeyHash) VALUES (?, ?)"
        )
            .bind(spaceName, spaceKeyHash)
            .run();
        return result.lastRowId;
    }

    async listSpaces() {
        const { results } = await this.d1.prepare(
            "SELECT * FROM spaces"
        ).all();
        return results;
    }

    async getSpaceContent(spaceId) {
        const { results } = await this.d1.prepare(
            "SELECT * FROM content WHERE spaceId = ?"
        )
            .bind(spaceId)
            .all();
        return results;
    }

    async getSpace(spaceId) {
        const space = await this.d1.prepare(
            "SELECT * FROM spaces WHERE spaceId = ?"
        )
            .bind(spaceId)
            .first();

        if (!space) {
            return null;
        }

        const content = await this.getSpaceContent(spaceId);
        return { ...space, content };
    }

    async addContent(spaceId, content) {
        await this.d1.prepare(
            "INSERT INTO content (spaceId, name, type, encryptedValue) VALUES (?, ?, ?, ?)"
        )
            .bind(spaceId, content.name, content.type, content.encryptedValue)
            .run();
    }
}
