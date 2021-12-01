import express from "express";
import { body, validationResult} from "express-validator";
import {generateJWT} from './api_posts_controller.mjs';

export default function setup_routes_admin_posts(postsService, csrfProtection) {

    const router = express.Router();

    router.get('/', csrfProtection, async function(req, res) {
        res.render("admin/posts/index.ejs", { posts: await postsService.listPosts(), csrf: req.csrfToken(), jwtToken: generateJWT(req.user) } );
    });
      
    router.get('/:id', async function(req, res) {
        let post = await postsService.getPost(req.params.id);
    
        if (post) {
        res.render("admin/posts/show.ejs", { post: post});
        } else {
        res.status(404).send("not found");
        }
    });

    router.post('/', csrfProtection,
                     body("title").isLength({min: 5}).trim().escape(),
                     body("content").isLength({min: 5}).trim().escape(),
     async function(req, res) {

        const errors = validationResult(req);

        if(errors.isEmpty()) {
            const title = req.body.title;
            const content = req.body.content;
    
            const thePost = await postsService.addPost(title, req.user, content);
            if (thePost) {
                res.redirect("/admin/posts/" + thePost.id);
            } else {
                req.flash("error", "error while creating a new post");
                res.redirect("/admin/posts");
            }    
        } else {
            for(let e of errors.errors) {
                req.flash("error", `Fehler in Feld ${e["param"]}: ${e["msg"]}`);
            } 
            res.redirect("/admin/posts")
        }
    });

    router.post('/:id/destroy', csrfProtection, async function(req, res) {
        const thePost = await postsService.getPost(req.params.id);

        if (thePost && thePost.author.id === req.user.id) {
            req.flash("info", "Post wurde gelöscht");
            await postsService.destroyPost(thePost);
        } else {
            req.flash("error", "post gehörte anderem user");
        }
        res.redirect("/admin/posts");
    });

    return router;
}