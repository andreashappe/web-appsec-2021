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
  
  app.get('/', function(req, res) {
    res.redirect("/posts")
  });
  
  app.get("/admin", function(req, res) {
    res.send("hello!");
  });

  app.use("/posts", posts_setup_routes(postsService));
  app.use("/session", session_setup_routes(usersService));

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