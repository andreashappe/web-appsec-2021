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

  app.use(function(req, res, next) {
    const allowList = [
      "/session",
      "/static/js/bootstrap.bundle.min.js",
      "/static/css/bootstrap.min.css",
      "/favicon.ico"
    ]

    console.log("now checking: "+ req.url);

    if(allowList.includes(req.url)) {
      next();
    } else {
      if(req.session.user_id != undefined && req.session.user_id != null) {
        const user = usersService.getUser(req.session.user_id);
        req.session.current_user = user;
        next();
      } else {
        if (req.url !== "/session") {
          req.session.redirect_to = req.url;
        }
        res.redirect("/session");
      }
    }
  });

  // included bootstrap css and javascript
  app.use('/static', express.static('./node_modules/bootstrap/dist'));
  
  app.get('/', function(req, res) {
    res.redirect("/posts")
  });
  
  app.get('/posts', async function(req, res) {
    let msgs = {
      infos: await req.consumeFlash("info"),
      errors: await req.consumeFlash("error")
    }

    res.render("posts/index.ejs", {posts: postsService.listPosts(), msgs: msgs });
  });
  
  app.get('/posts/:id', async function(req, res) {
      let post = postsService.getPost(parseInt(req.params.id));
      
      let msgs = {
        infos: await req.consumeFlash("info"),
        errors: await req.consumeFlash("error")
      }

      if (post) {
          res.render("posts/show.ejs", {post: post, msgs: msgs });
      } else {
          res.status(404).send("not found");
      }
  });

  app.get('/session', async function(req, res) {
    let msgs = {
      infos: await req.consumeFlash("info"),
      errors: await req.consumeFlash("error")
    }

    res.render('session/show', {msgs: msgs });
  });

  app.post('/session', async function(req, res) {
      const email = req.body.email;
      const password = req.body.password;

      let user = await usersService.loginUser(email, password);
      if (user) {
        req.session.regenerate( async function(err) {
          req.session.user_id = user.id;
          req.flash("info", `Hello ${user.email}`);

          const url = req.session.redirect_to;
          if (url) {
            req.session.redirect_to = null;
            res.redirect(url);
          } else {
            res.redirect("/posts");  
          }
        });
      } else {
        req.flash("error", "username/password wrong");
        res.redirect("/session");
      }
  });

  return app;
}

const usersStorage = new UsersStorageMemory();
const usersService = new UsersService(usersStorage);
const user1 = await usersService.addUser("andreas@offensive.one", "trustno1");

const postStorage = new PostsStorageMemory();
const postsService = new PostsService(postStorage);

postsService.addPost(1, "first post", user1, "first content");
postsService.addPost(2, "second post", user1, "second content");

const app = create_app(postsService);

const port = process.env.PORT;
app.listen(port, function() {
  console.log(`Blog system listening on port ${port}!`)
});