import { v4 as uuidv4 } from 'uuid';

class User {
    constructor(id, email, password_hash) {
        this.id = id;
        this.email = email;
        this.password_hash = password_hash;
        Object.freeze(this);
    }
}

export default class UsersStorageSqlite {
    
    static getDbSetup() {
        return "create table users (uuid text, email text, password_hash text);";
    }

    constructor(db) {
        this.db = db;
        Object.freeze(this);
    }

    async storeUser(email, password_hash) {
        const cmd = "insert into users (uuid, email, password_hash) values (?, ?, ?);";
        const uuid = uuidv4();
        const row = await this.db.run(cmd, [uuid, email, password_hash]);
        
        if (row) {
            return new User(uuid, email, password_hash);
        } else {
            return null;
        }
    }

    async getUser(email) {
        const cmd  = "select uuid, email, password_hash from users where email = ? limit 1";

        const row = await this.db.get(cmd, [email]);
        if (row) {
            return new User(row.uuid, row.email, row.password_hash);
        } else {
            return null;
        }
    }

    async getUserById(id) {
        const cmd  = "select uuid, email, password_hash from users where uuid = ? limit 1";

        const row = await this.db.get(cmd, [id]);
        if (row) {
            return new User(row.uuid, row.email, row.password_hash);
        } else {
            return null;
        }
    }
}