import express from "express"
import dotenv from "dotenv";
import PostsService from "./services/posts_service.mjs";
import PostsStorageMemory from "./models/posts_storage_memory.mjs";

const app = express();

// load potential config data from .env file
dotenv.config()

const postStorage = new PostsStorageMemory();
const postsService = new PostsService(postStorage);

postsService.addPost(1, "first post", "andy", "first content");
postsService.addPost(2, "second post", "andy", "second content");

app.get('/', function(req, res) {
  res.redirect("/posts")
});

app.get('/posts', function(req, res) {
    res.send(postsService.listPosts())
});

app.get('/posts/:id', function(req, res) {
    let post = postsService.getPost(parseInt(req.params.id));

    if (post) {
        res.send(post);
    } else {
        res.status(404).send("not found");
    }
});

const port = process.env.port;
app.listen(port, function() {
  console.log(`Blog system listening on port ${port}!`)
});