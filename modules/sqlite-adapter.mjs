import { DBAdapter } from './db-adapter.mjs';
import Database from 'better-sqlite3';

export class SQLiteAdapter extends DBAdapter {
    constructor(dbPath = './db.sqlite') {
        super();
        this.db = new Database(dbPath);
        this.db.prepare(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT
    )`).run();
    }

    async addMessage(text) {
        this.db.prepare("INSERT INTO messages (text) VALUES (?)").run(text);
    }

    async listMessages() {
        return this.db.prepare("SELECT * FROM messages").all();
    }
}
