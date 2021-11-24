import PostsService from './../services/posts_service.mjs';
import UsersService from './../services/users_service.mjs';
import DbManagerSqlite from './../models/db_manager_sqlite.mjs';
import assert from "assert";

describe("the PostsService should", async function() {

    it("should be able to add a post and the post should be returned", async function() {

        const mgr = await DbManagerSqlite.createDbManager();
        const storage = mgr.getPostsStorage();
        let posts = new PostsService(storage);

        const title = "the title";
        const author = "andy";
        const content = "the content";

        const added = await posts.addPost(title, author, content);
        assert(added.title === title);
        assert(added.content === content);
        assert(added.author === author);
    });

    it("should be able to add a post and the post should be able to be retrieved", async function() {

        const mgr = await DbManagerSqlite.createDbManager();
        const storage = mgr.getPostsStorage();
        let posts = new PostsService(storage);
        let users = new UsersService(mgr.getUsersStorage());

        const title = "the title";
        const email = "andreas@offensive.one";
        const author = await users.registerUser(email, "somepassword");
        const content = "the content";

        const tmp = await posts.addPost(title, author, content);
        const added = await posts.getPost(tmp.id);

        assert(added.id === tmp.id);
        assert(added.title === title);
        assert(added.content === content);
        assert(added.author.email === email);
    });

    it("should be able to add a post and the list should contain the post", async function() {
        const mgr = await DbManagerSqlite.createDbManager();
        const storage = mgr.getPostsStorage();
        let posts = new PostsService(storage);
        let users = new UsersService(mgr.getUsersStorage());

        const title = "the title";
        const email = "andreas@offensive.one";
        const author = await users.registerUser(email, "somepassword");
        const content = "the content";

        assert((await posts.listPosts()).length === 0);

        const newPost = await posts.addPost(title, author, content);
        const all = await posts.listPosts();

        assert(all.length===1);

        const added = all[0];
        assert(added.title === title);
        assert(added.content === content);
        assert(added.author.email === email);
    });
});