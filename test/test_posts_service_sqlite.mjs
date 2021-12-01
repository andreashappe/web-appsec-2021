import DbManagerSqlite from './../models/db_manager_sqlite.mjs';
import PostsService from './../services/posts_service.mjs';
import UsersService from './../services/users_service.mjs';
import assert from "assert";

describe("the PostsService (sqlite) should", async function() {

    let mgr = null;
    let posts = null;
    let users = null;
    let author = null;

    const title = "the title";
    const email = "andreas@offensive.one";
    const content = "the content";

    this.beforeEach(async function() {
        mgr = await DbManagerSqlite.createDbManager();
        posts = new PostsService(mgr.getPostsStorage());
        users = await UsersService.createUsersService(await mgr.getUsersStorage());
        author = await users.registerUser(email, "trustno1");
    });

    it("should be able to add a post and the post should be returned", async function() {
        const added = await posts.addPost(title, author, content);
        assert(added.title === title);
        assert(added.content === content);
        assert(added.author.email === email);
    });

    it("should be able to add a post and the post should be able to be retrieved", async function() {
        const tmp = await posts.addPost(title, author, content);
        const added = await posts.getPost(tmp.id);
        assert(added.id === tmp.id);
        assert(added.title === title);
        assert(added.content === content);
        assert(added.author.email === email);
    });

    it("should be able to add a post and the list should contain the post", async function() {
        const beforeInsert = await posts.listPosts();
        assert(beforeInsert.length === 0);
        const tmp = await posts.addPost(title, author, content);
        const all = await posts.listPosts();

        assert(all.length===1);
        const added = all[0];
        assert(added.title === title);
        assert(added.content === content);
        assert(added.author.email === author.email);
    });
});