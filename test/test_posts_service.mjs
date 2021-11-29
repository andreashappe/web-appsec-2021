import PostsService from './../services/posts_service.mjs';
import UsersService from './../services/users_service.mjs';
import DbManagerMemory from './../models/db_manager_memory.mjs';
import assert from "assert";

describe("the PostsService should", async function() {

    let mgr = null;
    let storage = null;
    let posts = null;
    let users = null;
    let author = null;

    const title = "the title";
    const content = "the content";
    const email = "andreas@offensive.one";

    this.beforeEach(async function() {
        mgr = await DbManagerMemory.createDbManager();
        storage = mgr.getPostsStorage();
        posts = new PostsService(storage);
        users = new UsersService(mgr.getUsersStorage());
        author = await users.registerUser(email, "somepassword");
    });

    it("should be able to add a post and the post should be returned", async function() {
        const added = posts.addPost(title, author, content);
        assert(added.title === title);
        assert(added.content === content);
        assert(added.author.email === email);
    });

    it("should be able to add a post and the post should be able to be retrieved", async function() {
        const tmp = posts.addPost(title, author, content);

        const added = posts.getPost(tmp.id);
        assert(added.id === tmp.id);
        assert(added.title === title);
        assert(added.content === content);
        assert(added.author.email === email);
    });

    it("should be able to add a post and the list should contain the post", async function() {
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