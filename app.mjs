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
import setup_admin_posts_routes from "./controllers/admin_posts_controller.mjs";
import DatabaseManagerMemory from "./models/database_manager_sqlite.mjs";
import passport from "passport";
import passportLocal from "passport-local";

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

  /* setup passport */
  app.use(passport.initialize());

  passport.use(new passportLocal.Strategy({
    usernameField: "email",
    passwordField: "password"
  },
  async (username, password, done) => {
    const theUser = await usersService.loginUser(username, password);
    if (theUser) {
      return done(null, theUser);
    } else {
      return done(null, false, { errors: { 'email or password': 'is invalid'}});
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (user, done) => {
    const theUser = await usersService.getUser(user);
    if (theUser) {
      return done(null, theUser);
    } else {
      return done("user not found");
    }
  });

  /* enable helmet */
  app.use(helmet());
  
  /* allow download of bootstrap file */
  app.use('/public', express.static('./node_modules/bootstrap/dist'));

  /* add a rate limit for sessions */
  app.use("/session", rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100
  }));

  /* prepare flash for views */
  app.use(async function(req, res, next) {
    global.info = await req.consumeFlash("info");
    global.error = await req.consumeFlash("error");
    next();
  });

  const authenticateUser = function(req, res, done) {
    if (req.session && req.session.passport) {
      return done();
    } else {
      req.session.redirect_to = req.url;
      res.redirect("/session");
    }
  }

  app.use("/posts", setup_posts_routes(postsService));
  app.use("/admin", authenticateUser);
  app.use("/admin/posts", authenticateUser, setup_admin_posts_routes(postsService));

  app.get('/session', function(req, res) {
    res.render('session/show.ejs');
  });

  app.get('/', function(req, res) {
    res.redirect("/posts")
  });

  app.get('/admin', function(req, res) {
    res.redirect("/admin/posts")
  });

  app.post('/session', passport.authenticate('local', {
      failureRedirect: '/session',
      failureFlash: true
  }), function(req, res) {
    if (req.session.redirect_to) {
      res.redirect(req.session.redirect_to);
    } else {
      res.redirect('/posts')
    }
  });

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