import { v4 as uuidv4 } from 'uuid';

class User {
    constructor(id, email, password_hash) {
        this.id = id;
        this.email = email;
        this.password_hash = password_hash;
        Object.freeze(this);
    }
}

export default class UsersStorageMemory {

    constructor(db) {
        this.db = db;
        Object.freeze(this);
    }

    static prepare_db() {
        return "create table users (uuid text, email text, password_hash text)";
    }

    async storeUser(email, password_hash) {
        const id = uuidv4();
        const cmd = "insert into users (uuid, email, password_hash) values (?, ?, ?);";

        const result = await this.db.run(cmd, [id, email, password_hash]);
        return new User(id, email, password_hash);
    }

    async getUser(email) {
        const cmd = "select * from users where email = ?";
        const row = await this.db.get(cmd, [email]);
        if (row) {
            return new User(row.uuid, row.email, row.password_hash);
        } else {
            return null;
        }
    }

    async getUserById(id) {
        const cmd = "select * from users where uuid = ?";
        const row = await this.db.get(cmd, [id]);
        return new User(row.uuid, row.email, row.password_hash);
    }
}