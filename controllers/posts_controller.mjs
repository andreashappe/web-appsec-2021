import express from "express";

export default function setup_posts_routes(postsService) {
    const router = express.Router();

    router.get('/', async function(req, res) {
        res.render("posts/index.ejs", { posts: await postsService.listPosts() } );
    });
      
    router.get('/:id', async function(req, res) {
        let post = await postsService.getPost(req.params.id);
    
        if (post) {
        res.render("posts/show.ejs", { post: post});
        } else {
        res.status(404).send("not found");
        }
    });

    return router;
}