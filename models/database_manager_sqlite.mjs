import UsersStorageSqlite from './users_storage_sqlite.mjs';
import PostsStorageSqlite from './posts_storage_sqlite.mjs';
import sqlite from 'sqlite-async';

export default class DatabaseManagerSqlite {
    static async createDatabaseManager() {
        const db = await sqlite.open(':memory:');

        await db.run(UsersStorageSqlite.prepare_db());
        await db.run(PostsStorageSqlite.prepare_db());
        
        return new DatabaseManagerSqlite(db);
    }

    constructor(db) {
        this.usersStorage = new UsersStorageSqlite(db);
        this.postsStorage = new PostsStorageSqlite(db, this.usersStorage);
        Object.freeze(this);
    }

    getUsersStorage() {
        return this.usersStorage;
    }

    getPostsStorage() {
        return this.postsStorage;
    }
}