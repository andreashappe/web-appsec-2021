import express from "express";
import { body, validationResult} from "express-validator";
import passport from "passport";
import passportLocal from "passport-local";

export function setup_passport(app, usersService) {

  /* initialize passport */
  app.use(passport.initialize());
  app.use(passport.session());

  /* setup passport local authentication */
  passport.use(new passportLocal.Strategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    async function(email, password, done) {
      const user = await usersService.loginUser(email, password);

      if (user) {
        return done(null, user);
      } else {
        return done(null, false, "user or password invalid");
      }
    }
  ));

  /* how to store user into the session */
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  /* how to identify session-user in the program, user will be accessible through req.user */
  passport.deserializeUser(async function(id, done) {
    const user = await usersService.getUser(id);
    done(null, user);
  });
}

export function setup_routes_session(usersService, csrfProtection) {
    const router = express.Router();

    /* display login form */
    router.get('/', csrfProtection, function(req, res) {
        res.render('session/show.ejs', {csrf: req.csrfToken()});
    });
    
    /* login user */
    router.post('/', passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: "/session",
      }), function(req, res) {
        if (req.session.redirect_to) {
          res.redirect(req.session.redirect_to);
        } else {
          res.redirect("/admin/posts");
        }
      }
    );

    router.post("/destroy", csrfProtection, async function(req, res) {
      req.logout();
      res.redirect("/");
    });

    return router;
}

export function authentication_check(req, res, done) {
  if (req.user !== null && req.user !== undefined) {
    return done();
  } else {
    req.session.redirect_to = req.originalUrl;
    res.redirect("/session");
  }
}