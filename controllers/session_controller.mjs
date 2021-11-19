import express from "express";

export default function setup_session_routes(usersService) {
    const router = express.Router();

    router.post('/', async function(req, res) {
        const email = req.body.email;
        const password = req.body.password;
    
        const user = await usersService.loginUser(email, password);
        const redirect_to = req.session.redirect_to;
    
        if (user) {
          req.session.regenerate(function(err) {
            req.session.user_id = user.id;
            req.flash("info", "welcome user " + user.email);
            if (redirect_to) {
              res.redirect(redirect_to)
            } else {
              res.redirect("/posts");  
            }
          });
        } else {
          req.flash("error", "email or password unknown");
          res.render("session/show.ejs");
        }
    });

    router.get('/', function(req, res) {
        res.render('session/show.ejs');
    });

    return router;
}

export function check_authentication(usersService, allowList) {
    return function(req, res, next) {
        const target = req.url;
        if (allowList.includes(target) || req.url.match("^/posts/[0-9a-f\-]+$")) {
          next();
        } else {
          if(req.session.user_id === null || req.session.user_id === undefined) {
            req.session.redirect_to = req.url;
            res.redirect("/session");
          } else {
            const theUser = usersService.getUser(req.session.user_id);
            if (theUser) {
              req.session.current_user = theUser;
              next();
            } else {
              req.session.redirect_to = req.url;
              res.redirect("/session");
            }
          }
        }
      }
}