import express from "express"
import dotenv from "dotenv";
import PostsService from "./services/posts_service.mjs";
import UsersService from "./services/users_service.mjs";
import expressLayouts from "express-ejs-layouts";
import helmet from "helmet";
import expressSession from "express-session";
import { flash } from 'express-flash-message';
import rateLimit from "express-rate-limit";
import setup_posts_routes from "./controllers/posts_controller.mjs";
import setup_session_routes from "./controllers/session_controller.mjs";
import setup_admin_posts_routes from "./controllers/admin_posts_controller.mjs";
import { check_authentication } from "./controllers/session_controller.mjs";
import DatabaseManagerMemory from "./models/database_manager_sqlite.mjs";

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
  const allowList = [
    "/favicon.ico",
    "/public/js/bootstrap.bundled.min.js",
    "/public/css/bootstrap.min.js",
    "/session",
    "/",
    "/posts"
  ];

  app.use(check_authentication(usersService, allowList));

  /* prepare flash for views */
  app.use(async function(req, res, next) {
    global.info = await req.consumeFlash("info");
    global.error = await req.consumeFlash("error");
    next();
  });  

  app.get('/', function(req, res) {
    res.redirect("/posts")
  });

  app.get('/admin', function(req, res) {
    res.redirect("/admin/posts")
  });
  
  app.use("/admin/posts", setup_admin_posts_routes(postsService));
  app.use("/posts", setup_posts_routes(postsService));
  app.use("/session", setup_session_routes(usersService));

  return app;  
}

// load potential config data from .env file
dotenv.config()

// setup database
const dbManager = await DatabaseManagerMemory.createDatabaseManager();
const usersService = await UsersService.createUsersService(dbManager.getUsersStorage());
const postsService = new PostsService(dbManager.getPostsStorage());

const user1 = await usersService.registerUser("andreas@offensive.one", "trustno1");
  
await postsService.addPost("first post", user1, "first content");
await postsService.addPost("second post", user1, "second content");
  
const port = process.env.PORT;
const sessionSecret = process.env.SESSION_SECRET;

const app = setupApp(postsService, usersService, sessionSecret);

app.listen(port, function() {
  console.log(`Blog system listening on port ${port}!`)
});