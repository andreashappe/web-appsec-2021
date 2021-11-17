import express from "express"
import dotenv from "dotenv";
import PostsService from "./services/posts_service.mjs";
import PostsStorageMemory from "./models/posts_storage_memory.mjs";
import expressLayouts from "express-ejs-layouts";
import helmet from "helmet";

export default function setupApp(postsService) {
  const app = express();

  /* configure template engine */
  app.set('view engine', 'ejs');
  app.use(expressLayouts);
  app.set('layout', 'layouts/default');
  
  /* allow express to parse http bodies */
  app.use(express.urlencoded());

  /* enable helmet */
  app.use(helmet());
  
  /* allow download of bootstrap file */
  app.use('/public', express.static('./node_modules/bootstrap/dist'));

  app.get('/', function(req, res) {
    res.redirect("/posts")
  });
  
  app.get('/posts', function(req, res) {
    res.render("posts/index.ejs", { posts: postsService.listPosts() } );
  });
  
  app.get('/posts/:id', function(req, res) {
      let post = postsService.getPost(parseInt(req.params.id));
  
      if (post) {
        res.render("posts/show.ejs", { post: post});
      } else {
        res.status(404).send("not found");
      }
  });
  return app;  
}

// load potential config data from .env file
dotenv.config()

const postStorage = new PostsStorageMemory();
const postsService = new PostsService(postStorage);
  
postsService.addPost(1, "first post", "andy", "first content");
postsService.addPost(2, "second post", "andy", "second content");
  
const app = setupApp(postsService);

const port = process.env.PORT;
app.listen(port, function() {
  console.log(`Blog system listening on port ${port}!`)
});