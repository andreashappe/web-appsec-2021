import express from "express"
import dotenv from "dotenv";
import PostsService from "./services/posts_service.mjs";
import PostsStorageMemory from "./models/posts_storage_memory.mjs";
import UsersStorageMemory from "./models/users_storage_memory.mjs";
import UsersService from "./services/users_service.mjs";
import expressEjsLayouts from "express-ejs-layouts";
import helmet from "helmet";
import session from "express-session";
import { flash } from "express-flash-message";
import rateLimit from "express-rate-limit";
import posts_setup_routes from "./controllers/posts_controller.mjs";
import {check_authentication, session_setup_routes} from "./controllers/auth_controller.mjs";
import {body, validationResult} from "express-validator";
import csrf from "csurf";

// load potential config data from .env file
dotenv.config()

export default function create_app(postsService) {
  const app = express();

  /* setup ejs as view engine */
  app.set('view engine', 'ejs');
  app.use(expressEjsLayouts);
  app.set('layout', 'layouts/default');
  
  app.use(helmet());
  app.use(express.urlencoded());

  app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'Lax'
    }
  }));

  app.use(flash({
    sessionKeyName: "flashMessage"
  }));

  app.use("/session", rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100
  }));

  app.use(check_authentication(usersService));
  
  // included bootstrap css and javascript
  app.use('/static', express.static('./node_modules/bootstrap/dist'));
  
  // setup csrf protection
  const csrfProtection = csrf();

  app.get('/', (req, res) => res.redirect("/posts"));
  app.get("/admin", (req, res) => res.redirect("/admin/posts"));
  
  app.get("/admin/posts", csrfProtection, async function(req, res) {
    let msgs = {
      infos: await req.consumeFlash("info"),
      errors: await req.consumeFlash("error")
    }

    let csrfToken = req.csrfToken();

    res.render("admin/posts/index.ejs", {posts: postsService.listPosts(), msgs: msgs, csrfToken: csrfToken });
  });

  app.get("/admin/posts/:id", async function(req, res) {
    let post = postsService.getPost(parseInt(req.params.id));
          
    let msgs = {
      infos: await req.consumeFlash("info"),
      errors: await req.consumeFlash("error")
    }

    if (post) {
        res.render("admin/posts/show.ejs", {post: post, msgs: msgs });
    } else {
        res.status(404).send("not found");
    }
  });

  app.post("/admin/posts", csrfProtection, body('title').notEmpty(), body('content').trim().escape(), async function(req, res) {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      const title = req.body.title;
      const content = req.body.content;
  
      postsService.addPost(title, req.session.current_user, content);
      res.redirect("/admin/posts");  
    } else {
      const msgs = {
        infos: [],
        errors: errors.array().map( (x) => `${x.param}: ${x.msg}`)
      };

      res.render("admin/posts/index.ejs", {posts: postsService.listPosts(), msgs: msgs });
    }
  });

  /* setup routes */
  app.use("/posts", posts_setup_routes(postsService));
  app.use("/session", session_setup_routes(usersService));

  return app;
}

const usersStorage = new UsersStorageMemory();
const usersService = new UsersService(usersStorage);
const user1 = await usersService.addUser("andreas@offensive.one", "trustno1");

const postStorage = new PostsStorageMemory();
const postsService = new PostsService(postStorage);

postsService.addPost("first post", user1, "first content");
postsService.addPost("second post", user1, "second content");

const app = create_app(postsService);

const port = process.env.PORT;
app.listen(port, function() {
  console.log(`Blog system listening on port ${port}!`)
});