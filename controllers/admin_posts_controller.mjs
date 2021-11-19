import express from "express";
import csrf from 'csurf';

export default function setup_admin_posts_routes(postsService) {
    const router = new express.Router();

    router.get('/', csrf(), function(req, res) {
        res.render("admin/posts/index.ejs", { posts: postsService.listPosts(), csrfToken: req.csrfToken() } );
    });
      
    router.get('/:id', function(req, res) {
        let post = postsService.getPost(req.params.id);
    
        if (post) {
            res.render("admin/posts/show.ejs", { post: post});
        } else {
            res.status(404).send("not found");
        }
    });

    router.post('/', csrf(), function(req, res) {
        const title = req.body.title;
        const content = req.body.content;

        const newPost = postsService.addPost(title, req.session.current_user, content);
        res.redirect("/admin/posts/" + newPost.id);
    });

    return router;
}