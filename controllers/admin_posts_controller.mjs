import express from "express";

export default function setup_admin_posts_routes(postsService) {
    const router = new express.Router();

    router.get('/', function(req, res) {
        res.render("admin/posts/index.ejs", { posts: postsService.listPosts() } );
    });
      
    router.get('/:id', function(req, res) {
        let post = postsService.getPost(req.params.id);
    
        if (post) {
        res.render("admin/posts/show.ejs", { post: post});
        } else {
        res.status(404).send("not found");
        }
    });

    return router;
}