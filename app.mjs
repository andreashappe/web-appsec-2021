import express from "express"
import dotenv from "dotenv";
import PostsService from "./services/posts_service.mjs";
import PostsStorageMemory from "./models/posts_storage_memory.mjs";
import expressEjsLayouts from "express-ejs-layouts";
import helmet from "helmet";

// load potential config data from .env file
dotenv.config()

const app = express();

/* setup ejs as view engine */
app.set('view engine', 'ejs');
app.use(expressEjsLayouts);
app.set('layout', 'layouts/default');

app.use(helmet());

const postStorage = new PostsStorageMemory();
const postsService = new PostsService(postStorage);

postsService.addPost(1, "first post", "andy", "first content");
postsService.addPost(2, "second post", "andy", "second content");

app.get('/', function(req, res) {
  res.redirect("/posts")
});

app.get('/posts', function(req, res) {
    res.render("posts/index.ejs", {posts: postsService.listPosts() });
});

app.get('/posts/:id', function(req, res) {
    let post = postsService.getPost(parseInt(req.params.id));

    if (post) {
        res.render("posts/show.ejs", {post: post });
    } else {
        res.status(404).send("not found");
    }
});

const port = process.env.PORT;
app.listen(port, function() {
  console.log(`Blog system listening on port ${port}!`)
});