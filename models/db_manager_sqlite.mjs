import UsersStorageSqlite from "./users_storage_sqlite.mjs";
import PostsStorageSqlite from "./posts_storage_sqlite.mjs";
import sqlite from "sqlite-async";

export default class DbManagerSqlite {

    static async createDbManager() {
        const db = await sqlite.open(":memory:");

        /* create all tables that are needed for our data mangers */
        await db.run(UsersStorageSqlite.getDbSetup());
        await db.run(PostsStorageSqlite.getDbSetup());

        return new DbManagerSqlite(db);
    }

    constructor(db) {
        this.db = db;
        this.usersStorage = new UsersStorageSqlite(this.db);
        this.postsStorage = new PostsStorageSqlite(this.db, this.usersStorage);
        Object.freeze(this);
    }

    getUsersStorage() {
        return this.usersStorage;
    }

    getPostsStorage() {
        return this.postsStorage;
    }
}