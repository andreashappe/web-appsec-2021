import PostsService from './../services/posts_service.mjs';
import DatabaseManagerMemory from "../models/database_manager_memory.mjs";
import assert from "assert";

describe("the PostsService should", async function() {
    it("should be able to add a post and the post should be returned", async function() {
        const dbManager = await DatabaseManagerMemory.createDatabaseManager();
        let storage = dbManager.getPostsStorage();
        let posts = new PostsService(storage);

        const title = "the title";
        const author = "andy";
        const content = "the content";

        let added = posts.addPost(title, author, content);
        assert(added.title === title);
        assert(added.content === content);
        assert(added.author === author);
    });

    it("should be able to add a post and the post should be able to be retrieved", async function() {
        const dbManager = await DatabaseManagerMemory.createDatabaseManager();
        let storage = dbManager.getPostsStorage();
        let posts = new PostsService(storage);

        const title = "the title";
        const author = "andy";
        const content = "the content";

        const newPost = posts.addPost(title, author, content);

        let added = posts.getPost(newPost.id);
        assert(added.title === title);
        assert(added.content === content);
        assert(added.author === author);
    });

    it("should be able to add a post and the list should contain the post", async function() {
        const dbManager = await DatabaseManagerMemory.createDatabaseManager();
        let storage = dbManager.getPostsStorage();
        let posts = new PostsService(storage);

        const title = "the title";
        const author = "andy";
        const content = "the content";

        assert(posts.listPosts().length === 0);
        posts.addPost(title, author, content);
        let all = posts.listPosts();

        assert(all.length===1);

        let added = all[0];
        assert(added.title === title);
        assert(added.content === content);
        assert(added.author === author);
    });
});