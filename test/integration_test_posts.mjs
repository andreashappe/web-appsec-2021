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

const user1 = await usersService.registerUser("andreas@offensive.one", "trustno1");

const post1 = postsService.addPost("first post", user1, "first content");
const post2 = postsService.addPost("second post", user1, "second content");

const app = setupApp(postsService, usersService, sessionSecret);

describe("the website", async function() {
    it("should redirect / to /posts", async function() {
        await chai.request(app)
            .get("/")
            .redirects(0)
            .then( (res) => {
                chai.expect(res).to.redirectTo("/posts");
            })
    });

    it("should show a list of posts on /posts", async function() {
        await chai.request(app)
            .get("/posts")
            .then( (res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.text).to.contain(post1.title);
                chai.expect(res.text).to.contain(post1.author.email);
                chai.expect(res.text).to.contain(post2.title);
                chai.expect(res.text).to.contain(post2.author.email);
            });
    });

    it("should show a post on /posts/" + post1.id, async function() {
        await chai.request(app)
            .get("/posts/" + post1.id)
            .then( (res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.text).to.contain(post1.title);
                chai.expect(res.text).to.contain(post1.author.email);
                chai.expect(res.text).to.contain(post1.content);
            });
    });
});