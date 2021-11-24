import PostsService from './../services/posts_service.mjs';
import UsersService from './../services/users_service.mjs';
import PostsStorageMemory from './../models/posts_storage_memory.mjs';
import UsersStorageMemory from './../models/users_storage_memory.mjs';
import assert from "assert";

describe("the PostsService should", async function() {
    it("should be able to add a post and the post should be returned", async function() {
        let storage = new PostsStorageMemory();
        let posts = new PostsService(storage);
        let users = new UsersService(new UsersStorageMemory());

        const title = "the title";
        const email = "andy@snikt.net";
        const author = await users.registerUser(email, "password");
        const content = "the content";

        const added = posts.addPost(title, author, content);
        assert(added.title === title);
        assert(added.content === content);
        assert(added.author.email === email);
    });

    it("should be able to add a post and the post should be able to be retrieved", async function() {
        let storage = new PostsStorageMemory();
        let posts = new PostsService(storage);
        let users = new UsersService(new UsersStorageMemory());

        const title = "the title";
        const email = "andy@snikt.net";
        const author = await users.registerUser(email, "password");
        const content = "the content";

        const tmp = posts.addPost(title, author, content);

        const added = posts.getPost(tmp.id);
        assert(added.id === tmp.id);
        assert(added.title === title);
        assert(added.content === content);
        assert(added.author.email === email);
    });

    it("should be able to add a post and the list should contain the post", async function() {
        let storage = new PostsStorageMemory();
        let posts = new PostsService(storage);
        let users = new UsersService(new UsersStorageMemory());

        const title = "the title";
        const email = "andy@snikt.net";
        const author = await users.registerUser(email, "password");
        const content = "the content";

        assert(posts.listPosts().length === 0);
        posts.addPost(title, author, content);
        const all = posts.listPosts();

        assert(all.length===1);

        const added = all[0];
        assert(added.title === title);
        assert(added.content === content);
        assert(added.author.email === author.email);
    });
});