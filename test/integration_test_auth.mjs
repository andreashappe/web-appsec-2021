import dotenv from "dotenv";
import DatabaseManagerMemory from "../models/database_manager_memory.mjs";
import PostsService from "../services/posts_service.mjs";
import UsersService from "../services/users_service.mjs";
import chai from "chai";
import chaiHttp from "chai-http";
import setupApp from "./../app.mjs";

chai.use(chaiHttp);

// load potential config data from .env file
dotenv.config()

const sessionSecret = process.env.SESSION_SECRET;

/* setup test data */
const dbManager = await DatabaseManagerMemory.createDatabaseManager();
const usersService = await UsersService.createUsersService(dbManager.getUsersStorage());
const postsService = new PostsService(dbManager.getPostsStorage());

const user_email = "andreas@offensive.one";
const user_password = "trustno1";
const user1 = await usersService.registerUser(user_email, user_password);

const post1 = postsService.addPost("first post", user1, "first content");
const post2 = postsService.addPost("second post", user1, "second content");

const app = setupApp(postsService, usersService, sessionSecret);

describe("the website", async function() {
    it("should redirect unauthenticated user that try to access /admin/posts to /session", async function() {
        await chai.request(app)
            .get("/admin/posts")
            .redirects(0)
            .then( (res) => {
                chai.expect(res).to.redirectTo("/session");
            })
    });

    it("should redirect unauthenticated user that try to access /admin to /session", async function() {
        await chai.request(app)
            .get("/admin")
            .redirects(0)
            .then( (res) => {
                chai.expect(res).to.redirectTo("/session");
            })
    });

    it("should redirect unauthenticated user that try to access /admin/posts/:id to /session", async function() {
        await chai.request(app)
            .get("/admin/posts/" + post1.id)
            .redirects(0)
            .then( (res) => {
                chai.expect(res).to.redirectTo("/session");
            })
    });

    it("should allow valid users to login", async function() {
        await chai.request(app)
            .post("/session")
            .redirects(0)
            .type("form")
            .send({
                'email': user_email,
                'password': user_password
            })
            .then( (res) => {
                chai.expect(res).to.redirectTo("/posts");
            });
    });

    it("should not allow valid users (email) to login", async function() {
        await chai.request(app)
            .post("/session")
            .type("form")
            .send({
                'email': "xxx" + user_email,
                'password': user_password
            })
            .then( (res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.text).to.contain("Login User");
            });
    });

    it("should not allow valid users (password) to login", async function() {
        await chai.request(app)
            .post("/session")
            .type("form")
            .send({
                'email': user_email,
                'password': user_password + "XXX"
            })
            .then( (res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.text).to.contain("Login User");
            });
    });

});