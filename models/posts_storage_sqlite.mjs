import { v4 as uuidv4 } from 'uuid';

class Post {
    constructor(id, title, author, content) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.content = content;
        Object.freeze(this);
    }
}

/*
 * In-memory Storage für Posts
 */
export default class PostsStorageMemory {
    constructor(db, usersStorage) {
        this.db = db;
        this.usersStorage = usersStorage;
        Object.freeze(this);
    }

    static prepare_db() {
        return "create table posts (uuid text, title text, author text, content text);";
    }

    async addPost(title, user, content) {
        const uuid = uuidv4();
        const cmd = "insert into posts (uuid, title, author, content) values (?, ?, ?, ?);";

        const result = await this.db.run(cmd, [uuid, title, user.email, content]);
        return new Post(uuid, title, user, content);
    }

    async listPosts() {
        const cmd = "select uuid from posts";
        const results = []

        const uuids = await this.db.all(cmd, []);
        for(let uuid of uuids) {
            results.push(await this.getPost(uuid["uuid"]));
        }
        return results;
    }

    async getPost(id) {
        const cmd = "select * from posts where uuid = ?";
        const row = await this.db.get(cmd, [id]);
        if (row) {
            const author = await this.usersStorage.getUser(row.author);
            return new Post(row.uuid, row.title, author, row.content);
        } else {
            return null;
        }
   }
}