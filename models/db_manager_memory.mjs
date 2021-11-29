import UsersStorageMemory from "./users_storage_memory.mjs";
import PostsStorageMemory from "./posts_storage_memory.mjs";

export default class DbManagerMemory {

    static async createDbManager() {
        return new DbManagerMemory();
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