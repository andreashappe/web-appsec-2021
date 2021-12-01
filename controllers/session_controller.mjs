import express from "express";
import { body, validationResult} from "express-validator";
import passport from "passport";
import passportLocal from "passport-local";

export function setup_passport_authentication(app, usersService) {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new passportLocal.Strategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async function(email, password, done) {
        const theUser = await usersService.loginUser(email, password);
        if (theUser) {
          return done(null, theUser);
        } else {
          return done(null, false, "Email/Password invalid");
        }
      }
    ));

    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });

    passport.deserializeUser(async function(id, done) {
        const theUser = await usersService.getUser(id);
        if (theUser) {
          return done(null, theUser);
        } else {
          // TODO: check if this works
          return done(null, false);
        }
    });
}

export function setup_routes_session(usersService, csrfProtection) {
    const router = express.Router();

    /* display login form */
    router.get('/', function(req, res) {
        res.render('session/show.ejs');
    });

    /* login user */
    router.post('/', passport.authenticate('local'), async function(req, res) {
      await req.flash("info", `Welcome back, ${req.user.email}`);
      const redirect_to = req.session.redirect_to;
            
      if (redirect_to) {
          res.redirect(redirect_to);
      } else {
          res.redirect("/admin/posts");
      }
    });
    
    router.post("/destroy", csrfProtection, async function(req, res) {
        req.session.user_id = null;
        req.logout();
        res.redirect("/session");
    });

    return router;
}

export async function passport_authentication_check(req, res, next) {
  // req.user <- der aktuelle user falls der user eingeloggt wurde
  if (req.user !== null && req.user !== undefined) {
    next();
  } else {
    req.session.redirect_to = req.base_url;
    res.redirect("/session");
  }
}