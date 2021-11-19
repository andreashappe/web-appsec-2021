import PostsService from './../services/posts_service.mjs';
import UsersService from './../services/users_service.mjs';
import DatabaseManagerMemory from "../models/database_manager_sqlite.mjs";
import assert from "assert";

describe("the PostsService should", async function() {
    it("should be able to add a post and the post should be returned", async function() {
        const dbManager = await DatabaseManagerMemory.createDatabaseManager();
        let storage = dbManager.getPostsStorage();
        let posts = new PostsService(storage);

        const title = "the title";
        const author = "andy";
        const content = "the content";

        let added = await posts.addPost(title, author, content);
        assert(added.title === title);
        assert(added.content === content);
        assert(added.author === author);
    });

    it("should be able to add a post and the post should be able to be retrieved", async function() {
        const dbManager = await DatabaseManagerMemory.createDatabaseManager();
        let storage = dbManager.getPostsStorage();
        let posts = new PostsService(storage);
        let users = await UsersService.createUsersService(dbManager.getUsersStorage());

        const email = "andy@snikt.net";
        const title = "the title";
        const author = await users.registerUser(email, "trustno1");
        const content = "the content";

        const newPost = await posts.addPost(title, author, content);

        let added = await posts.getPost(newPost.id);

        assert(added.title === title);
        assert(added.content === content);
        assert(added.author.email === email);
    });

    it("should be able to add a post and the list should contain the post", async function() {
        const dbManager = await DatabaseManagerMemory.createDatabaseManager();
        let storage = dbManager.getPostsStorage();
        let posts = new PostsService(storage);
        let users = await UsersService.createUsersService(dbManager.getUsersStorage());

        const title = "the title";
        const email = "andy@snikt.net";
        const author = await users.registerUser(email, "trustno1");
        const content = "the content";

        assert((await posts.listPosts()).length === 0);
        let added2 = await posts.addPost(title, author, content);
        let all = await posts.listPosts();
        assert(all.length===1);
        
        let added = all[0];
        assert(added.title === title);
        assert(added.content === content);
        assert(added.author.email === email);
    });
});