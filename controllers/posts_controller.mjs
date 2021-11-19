import express from "express";

export default function setup_posts_routes(postsService) {
    const router = express.Router();

    router.get('/', function(req, res) {
        res.render("posts/index.ejs", { posts: postsService.listPosts() } );
    });
      
    router.get('/:id', function(req, res) {
        let post = postsService.getPost(req.params.id);
    
        if (post) {
        res.render("posts/show.ejs", { post: post});
        } else {
        res.status(404).send("not found");
        }
    });

    return router;
}