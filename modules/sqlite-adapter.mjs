import { DBAdapter } from './db-adapter.mjs';
import Database from 'better-sqlite3';

export class SQLiteAdapter extends DBAdapter {
    constructor(dbPath = './db.sqlite') {
        super();
        this.db = new Database(dbPath);
        this.db.prepare(`CREATE TABLE IF NOT EXISTS spaces (
                                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                               spaceId TEXT NOT NULL UNIQUE,
                                                               spaceKeyHash TEXT NOT NULL
                         )`).run();

        this.db.prepare(`CREATE TABLE IF NOT EXISTS content (
                                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                spaceId TEXT NOT NULL,
                                                                name TEXT NOT NULL,
                                                                type TEXT NOT NULL,
                                                                encryptedValue TEXT NOT NULL,
                                                                FOREIGN KEY (spaceId) REFERENCES spaces(spaceId)
            )`).run();
    }

    async createSpace(spaceName, spaceKeyHash) {
        const stmt = this.db.prepare("INSERT INTO spaces (spaceId, spaceKeyHash) VALUES (?, ?)");
        stmt.run(spaceName, spaceKeyHash);
    }

    async listSpaces() {
        const stmt = this.db.prepare("SELECT * FROM spaces");
        return stmt.all();
    }

    async getSpaceContent(spaceId) {
        const stmt = this.db.prepare("SELECT * FROM content WHERE spaceId = ?");
        return stmt.all(spaceId);
    }

    async getSpace(spaceId) {
        const stmt = this.db.prepare("SELECT * FROM spaces WHERE spaceId = ?");
        const space = stmt.get(spaceId);
        if (!space) {
            return null;
        }
        const contentStmt = this.db.prepare("SELECT * FROM content WHERE spaceId = ?");
        const content = contentStmt.all(spaceId);
        return { ...space, content };
    }
    async addContent(spaceId, content) {
        const stmt = this.db.prepare("INSERT INTO content (spaceId, name, type, encryptedValue) VALUES (?, ?, ?, ?)");
        stmt.run(spaceId, content.name, content.type, content.encryptedValue);
    }
}
