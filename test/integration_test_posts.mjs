import dotenv from "dotenv";
import PostsService from "../services/posts_service.mjs";
import PostsStorageMemory from "../models/posts_storage_memory.mjs";
import chai from "chai";
import chaiHttp from "chai-http";
import setupApp from "./../app.mjs";

chai.use(chaiHttp);

// load potential config data from .env file
dotenv.config()

/* setup test data */
const postStorage = new PostsStorageMemory();
const postsService = new PostsService(postStorage);

const post1 = postsService.addPost(1, "first post", "andy", "first content");
const post2 = postsService.addPost(2, "second post", "andy", "second content");

const app = setupApp(postsService);

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
                chai.expect(res.text).to.contain(post1.author);
                chai.expect(res.text).to.contain(post2.title);
                chai.expect(res.text).to.contain(post2.author);
            });
    });

    it("should show a post on /posts/1", async function() {
        await chai.request(app)
            .get("/posts/" + post1.id)
            .then( (res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.text).to.contain(post1.title);
                chai.expect(res.text).to.contain(post1.author);
                chai.expect(res.text).to.contain(post1.content);
            });
    });
});