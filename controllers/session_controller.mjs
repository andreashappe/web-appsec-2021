import express from "express";
import { body, validationResult} from "express-validator";

export function setup_routes_session(usersService) {
    const router = express.Router();

    /* display login form */
    router.get('/', function(req, res) {
        res.render('session/show.ejs');
    });
    
    /* login user */
    router.post('/', body("email").isEmail().normalizeEmail(),
                async function(req, res) {
        const email = req.body.email;
        const password = req.body.password;

        const errors = validationResult(req);
        if(!errors.isEmpty()) {
          redirect_to("/session");
          flash("error", "please supply correct email");
          return;
        }

        const user = await usersService.loginUser(email, password);

        if (user) {
            const redirect_to = req.session.redirect_to;

            /* regenerate session id (force it) */
            req.session.regenerate(async function(err) {

            /* session id has been regenerated */
            req.session.user_id = user.id;
            await req.flash("info", `Welcome back, ${user.email}`);
            
            if (redirect_to) {
                res.redirect(redirect_to);
            } else {
                res.redirect("/admin/posts");
            }
        });  
        } else {
            await req.flash("error", "user/password invalid");
            res.redirect("/session");
        }
    });

    return router;
}

export function authentication_check(usersService, allowList) {

    return function(req, res, next) {    
        const target = req.url;
        if (allowList.includes(target) || req.url.match("^/posts/[0-9a-zA-Z-]+$")) {
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