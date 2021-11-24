import express from "express"
import dotenv from "dotenv";
import PostsService from "./services/posts_service.mjs";
import UsersService from "./services/users_service.mjs";
import expressLayouts from "express-ejs-layouts";
import helmet from "helmet";
import expressSession from "express-session";
import { flash } from 'express-flash-message';
import expressRateLimit from 'express-rate-limit';
import { authentication_check, setup_routes_session } from "./controllers/session_controller.mjs";
import setup_routes_posts from "./controllers/posts_controller.mjs";
import setup_routes_admin_posts from "./controllers/admin_posts_controller.mjs";
import DbManager from './models/db_manager_memory.mjs';
import csurf from "csurf";

export default function setupApp(postsService, usersService, sessionSecret) {
  const app = express();

  /* configure session */
  app.use(expressSession({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'Strict'
    }
  }));

  /* configure flash */
  app.use(flash());

  /* configure rate limits */
  const limiter = expressRateLimit({
    windowsMs: 1 * 60 * 1000, /* 1 minute */
    max: 100
  });
  app.use("/session", limiter);

  /* configure template engine */
  app.set('view engine', 'ejs');
  app.use(expressLayouts);
  app.set('layout', 'layouts/default');
  
  /* setup csrf middleware */
  const csrfProtection = csurf();

  /* allow express to parse http bodies */
  app.use(express.urlencoded());

  /* enable helmet */
  app.use(helmet());
  
  /* allow download of bootstrap file */
  app.use('/public', express.static('./node_modules/bootstrap/dist'));

  /* authentication check */
  const allowList = [
    "/favicon.ico",
    "/public/js/bootstrap.bundled.min.js",
    "/public/css/bootstrap.min.js",
    "/session",
    "/posts",
    "/"
  ];

  /* setup authentication check */
  app.use(authentication_check(usersService, allowList));

  /* middleware that prepares infos/errors */
  app.use(async function(req, res, next) {
    global.infos = await req.consumeFlash("info");
    global.errors = await req.consumeFlash("error");
    next();
  });

  /* default redirects */
  app.get('/', (req, res) => { res.redirect("/posts") });
  app.get('/admin', (req, res) => { res.redirect("/admin/posts") });

  /* setup resources */  
  app.use("/posts", setup_routes_posts(postsService));
  app.use("/admin/posts", setup_routes_admin_posts(postsService, csrfProtection));
  app.use("/session", setup_routes_session(usersService));

  return app;  
}

// load potential config data from .env file
dotenv.config()

const dbManager = await DbManager.createDbManager();
const usersService = await UsersService.createUsersService(dbManager.getUsersStorage());
const postsService = new PostsService(dbManager.getPostsStorage());

/* prepare fake data for testing */
const user1 = await usersService.registerUser("andreas@offensive.one", "trustno1");
  
postsService.addPost("first post", user1, "first content");
postsService.addPost("second post", user1, "second content");
const port = process.env.PORT;
const sessionSecret = process.env.SESSION_SECRET;

/* wire everything up */
const app = setupApp(postsService, usersService, sessionSecret);

/* start listening port (BUG: we will also do this during test cases) */
app.listen(port, function() {
  console.log(`Blog system listening on port ${port}!`)
});
