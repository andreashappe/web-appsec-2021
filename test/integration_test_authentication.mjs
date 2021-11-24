import dotenv from "dotenv";
import PostsService from "../services/posts_service.mjs";
import PostsStorageMemory from "../models/posts_storage_memory.mjs";
import UsersService from "../services/users_service.mjs";
import UsersStorageMemory from "../models/users_storage_memory.mjs";
import chai from "chai";
import chaiHttp from "chai-http";
import setupApp from "./../app.mjs";

chai.use(chaiHttp);

// load potential config data from .env file
dotenv.config()

const sessionSecret = process.env.SESSION_SECRET;

/* setup test data */
const usersStorage = new UsersStorageMemory();
const usersService = await UsersService.createUsersService(usersStorage);

const postStorage = new PostsStorageMemory();
const postsService = new PostsService(postStorage);

const user1_email = "andreas@offensive.one";
const user1_password = "trustno1";
const user1 = await usersService.registerUser(user1_email, user1_password);

const post1 = postsService.addPost(1, "first post", user1, "first content");
const post2 = postsService.addPost(2, "second post", user1, "second content");

const app = setupApp(postsService, usersService, sessionSecret);

describe("the website", async function() {

    it("should redirect /admin to /session", async function() {
        await chai.request(app)
            .get("/admin")
            .redirects(0)
            .then( (res) => {
                chai.expect(res).to.redirectTo("/session");
            })
    });

    it("should redirect /admin/posts to /session", async function() {
        await chai.request(app)
            .get("/admin/posts")
            .redirects(0)
            .then( (res) => {
                chai.expect(res).to.redirectTo("/session");
            })
    });

    it("should redirect /admin/posts/" + post1.id + " to /session", async function() {
        await chai.request(app)
            .get("/admin/posts/" + post1.id)
            .redirects(0)
            .then( (res) => {
                chai.expect(res).to.redirectTo("/session");
            })
    });

    it("should allow login of valid users", async function() {
        await chai.request(app)
            .post("/session")
            .redirects(0)
            .type("form")
            .send({
                email: user1_email,
                password: user1_password
            })
            .then( (res) => {
                chai.expect(res).to.redirectTo("/admin/posts");
            });
    });

    it("should not allow login of users with invalid email", async function() {
        await chai.request(app)
            .post("/session")
            .redirects(0)
            .type("form")
            .send({
                email: "invalid_" + user1_email,
                password: user1_password
            })
            .then( (res) => {
                chai.expect(res).to.redirectTo("/session");
            });
    });

    it("should not allow login of users with invalid password", async function() {
        await chai.request(app)
            .post("/session")
            .redirects(0)
            .type("form")
            .send({
                email: user1_email,
                password: "invalid_password" + user1_password
            })
            .then( (res) => {
                chai.expect(res).to.redirectTo("/session");
            });
    });
});