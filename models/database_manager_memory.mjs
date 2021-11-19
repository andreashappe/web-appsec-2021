import UsersStorageMemory from './users_storage_memory.mjs';
import PostsStorageMemory from './posts_storage_memory.mjs';

export default class DatabaseManagerMemory {
    static async createDatabaseManager() {
        const db = new DatabaseManagerMemory();
        return db;
    }

    constructor() {
        this.usersStorage = new UsersStorageMemory();
        this.postsStorage = new PostsStorageMemory();
        Object.freeze(this);
    }

    getUsersStorage() {
        return this.usersStorage;
    }

    getPostsStorage() {
        return this.postsStorage;
    }
}