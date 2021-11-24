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

    static getDbSetup() {
        return "create table posts (uuid text, title text, content text, author text);";
    }

    constructor(db, usersStorage) {
        this.db = db;
        this.usersStorage = usersStorage;
        Object.freeze(this);
    }

    async addPost(title, user, content) {
        const id = uuidv4();
        const cmd = "insert into posts (uuid, title, content, author) values (?, ?, ?, ?)";
        const row = await this.db.run(cmd, [id, title, content, user.email]);

        if (row) {
            return new Post(id, title, user, content);
        } else {
            return null;
        }
    }

    async listPosts() {
        const cmd = "select uuid from posts";
        const results = [];
        const uuids = await this.db.all(cmd, []);

        for(let uuid of uuids) {
            results.push(await this.getPost(uuid["uuid"]));
        }
        return results;
    }

    async getPost(id) {
        const cmd = "select uuid, title, content, author from posts where uuid =?";

        const row = await this.db.get(cmd, [id]);
        if (row) {
            const user = await this.usersStorage.getUser(row.author);
            return new Post(row.uuid, row.title, user, row.content);
        }
        return null;
    }
}