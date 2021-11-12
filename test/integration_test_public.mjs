import chai from "chai";
import chaiHttp from "chai-http";
import create_app from "./../app.mjs";
import PostsStorageMemory from "./../models/posts_storage_memory.mjs";
import PostsService from "./../services/posts_service.mjs";

chai.use(chaiHttp);

const postStorage = new PostsStorageMemory();
const postsService = new PostsService(postStorage);

const user1 = postsService.addPost("first post", "andy", "first content");
const user2 = postsService.addPost("second post", "andy", "second content");

const app = create_app(postsService);

describe("the public website", async function() {
    it("/ should redirect to /posts", async function() {
        await chai.request(app)
            .get("/")
            .redirects(0)
            .then(function(res) {
                chai.expect(res).to.redirectTo("/posts")
            })
    });

    it("/posts should provide a lists of posts", async function() {
        await chai.request(app)
            .get("/posts")
            .then(function(res) {
                chai.expect(res).to.have.status(200);
                chai.expect(res.text).to.contain(user1.title);
                chai.expect(res.text).to.contain(user2.title);
            })
    });

    it("/posts/:id should show a user post", async function() {
        await chai.request(app)
            .get("/posts/" + user1.id)
            .then(function(res) {
                chai.expect(res).to.have.status(200);
                chai.expect(res.text).to.contain(user1.title);
                chai.expect(res.text).to.contain(user1.content);
            })
    });
});