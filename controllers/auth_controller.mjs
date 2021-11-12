import express from "express";

export function session_setup_routes(usersService) {
    const router = express.Router();

    router.get('/', async function(req, res) {
        let msgs = {
          infos: await req.consumeFlash("info"),
          errors: await req.consumeFlash("error")
        }
    
        res.render('session/show', {msgs: msgs });
      });

      router.post('/destroy', async function(req, res) {
        req.session.user_id = null;
        req.session.current_user = null;
        req.session.regenerate(function(error) {
          res.redirect("/");
        });
      });
    
      router.post('/', async function(req, res) {
          const email = req.body.email;
          const password = req.body.password;
    
          let user = await usersService.loginUser(email, password);
          if (user) {
            const url = req.session.redirect_to;
            req.session.regenerate( async function(err) {
              req.session.user_id = user.id;
              req.flash("info", `Hello ${user.email}`);
    
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

    return router;
}

export function check_authentication(usersService) {
    return function(req, res, next) {
        const allowList = [
        "/session",
        "/static/js/bootstrap.bundle.min.js",
        "/static/css/bootstrap.min.css",
        "/favicon.ico",
        "/",
        "/posts"
        ]

        console.log("now checking: "+ req.url);

        if(allowList.includes(req.url) || req.url.match("^/posts/[0-9]+$")) {
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
    };
}