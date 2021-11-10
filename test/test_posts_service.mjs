import PostsService from './../services/posts_service.mjs';
import PostsStorageMemory from './../models/posts_storage_memory.mjs';
import assert from "assert";

describe("the PostsService should", function() {
    it("should be able to add a post and the post should be returned", function() {
        let storage = new PostsStorageMemory();
        let posts = new PostsService(storage);

        const id = 1;
        const title = "the title";
        const author = "andy";
        const content = "the content";

        let added = posts.addPost(id, title, author, content);
        assert(added.id === id);
        assert(added.title === title);
        assert(added.content === content);
        assert(added.author === author);
    });

    it("should be able to add a post and the post should be able to be retrieved", function() {
        let storage = new PostsStorageMemory();
        let posts = new PostsService(storage);

        const id = 1;
        const title = "the title";
        const author = "andy";
        const content = "the content";

        posts.addPost(id, title, author, content);

        let added = posts.getPost(id);
        assert(added.id === id);
        assert(added.title === title);
        assert(added.content === content);
        assert(added.author === author);
    });

    it("should be able to add a post and the list should contain the post", function() {
        let storage = new PostsStorageMemory();
        let posts = new PostsService(storage);

        const id = 1;
        const title = "the title";
        const author = "andy";
        const content = "the content";

        assert(posts.listPosts().length === 0);
        posts.addPost(id, title, author, content);
        let all = posts.listPosts();

        assert(all.length===1);

        let added = all[0];
        assert(added.id === id);
        assert(added.title === title);
        assert(added.content === content);
        assert(added.author === author);
    });
});