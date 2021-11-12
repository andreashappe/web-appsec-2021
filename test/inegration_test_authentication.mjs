import chai from "chai";
import chaiHttp from "chai-http";
import create_app from "./../app.mjs";
import PostsStorageMemory from "./../models/posts_storage_memory.mjs";
import PostsService from "./../services/posts_service.mjs";
import UsersStorageMemory from "./../models/users_storage_memory.mjs";
import UsersService from "./../services/users_service.mjs";

chai.use(chaiHttp);

const usersStorage = new UsersStorageMemory();
const usersService = new UsersService(usersStorage);
const andy = await usersService.addUser("andreas@offensive.one", "trustno1");

const postStorage = new PostsStorageMemory();
const postsService = new PostsService(postStorage);

const user1 = postsService.addPost("first post", andy, "first content");
const user2 = postsService.addPost("second post", andy, "second content");

const app = create_app(postsService);

describe("the authentication system", async function() {
    it("/ should redirect /admin to /session", async function() {
        await chai.request(app)
            .get("/admin")
            .redirects(0)
            .then(function(res) {
                chai.expect(res).to.redirectTo("/session")
            })
    });

    it("/ should redirect /admin/posts to /session", async function() {
        await chai.request(app)
            .get("/admin/posts")
            .redirects(0)
            .then(function(res) {
                chai.expect(res).to.redirectTo("/session")
            })
    });

    it("/ should allow valid users", async function() {
        await chai.request(app)
            .post("/session")
            .redirects(0)
            .type('form')
            .send({
                "email": "andreas@offensive.one",
                "password": "trustno1"
            })
            .then(function(res) {
                chai.expect(res).to.redirectTo("/posts")
            })
    });

    it("/ should redirect valid users", async function() {
        await chai.request(app)
            .post("/session")
            .redirects(0)
            .type('form')
            .send({
                "email": "andreas@offensive.one",
                "password": "xxx"
            })
            .then(function(res) {
                chai.expect(res).to.redirectTo("/session")
            })
    });

});