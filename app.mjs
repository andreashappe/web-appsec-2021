import express from "express"
import dotenv from "dotenv";
import PostsService from "./services/posts_service.mjs";
import PostsStorageMemory from "./models/posts_storage_memory.mjs";
import UsersService from "./services/users_service.mjs";
import UsersStorageMemory from "./models/users_storage_memory.mjs";
import expressLayouts from "express-ejs-layouts";
import helmet from "helmet";
import expressSession from "express-session";
import { flash } from 'express-flash-message';
import rateLimit from "express-rate-limit";

export default function setupApp(postsService, usersService, sessionSecret) {
  const app = express();

  app.use(expressSession({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'Strict'
    }
  }));

  /* setup flash messages */
  app.use(flash());

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

  /* add a rate limit for sessions */
  app.use("/session", rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100
  }));

  /* perform authentication */
  app.use(function(req, res, next) {
    const allowList = [
      "/favicon.ico",
      "/public/js/bootstrap.bundled.min.js",
      "/public/css/bootstrap.min.js",
      "/session"
    ];

    const target = req.url;
    if (allowList.includes(target)) {
      next();
    } else {
      if(req.session.user_id === null || req.session.user_id === undefined) {
        res.redirect("/session");
      } else {
        const theUser = usersService.getUser(req.session.user_id);
        if (theUser) {
          req.session.current_user = theUser;
          next();
        } else {
          res.redirect("/session");
        }
      }
    }
  });

  /* prepare flash for views */
  app.use(async function(req, res, next) {
    global.info = await req.consumeFlash("info");
    global.error = await req.consumeFlash("error");
    next();
  });  

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

  app.get('/session', function(req, res) {
    res.render('session/show.ejs');
  });
  
  app.post('/session', async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const user = await usersService.loginUser(email, password);

    if (user) {
      req.session.user_id = user.id;
      req.flash("info", "welcome user " + user.email);
      res.redirect("/posts");
    } else {
      req.flash("error", "email or password unknown");
      res.render("session/show.ejs");
    }
  });

  return app;  
}

// load potential config data from .env file
dotenv.config()

const usersStorage = new UsersStorageMemory();
const usersService = await UsersService.createUsersService(usersStorage);

const postStorage = new PostsStorageMemory();
const postsService = new PostsService(postStorage);

const user1 = await usersService.registerUser("andreas@offensive.one", "trustno1");
  
postsService.addPost(1, "first post", user1, "first content");
postsService.addPost(2, "second post", user1, "second content");
  
const port = process.env.PORT;
const sessionSecret = process.env.SESSION_SECRET;

const app = setupApp(postsService, usersService, sessionSecret);

app.listen(port, function() {
  console.log(`Blog system listening on port ${port}!`)
});