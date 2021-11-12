import express from "express";

export default function setup_routes(postsService) {
    const router = express.Router();

    router.get('/', async function(req, res) {
        let msgs = {
          infos: await req.consumeFlash("info"),
          errors: await req.consumeFlash("error")
        }
    
        res.render("posts/index.ejs", {posts: postsService.listPosts(), msgs: msgs });
    });
      
    router.get('/:id', async function(req, res) {
          let post = postsService.getPost(parseInt(req.params.id));
          
          let msgs = {
            infos: await req.consumeFlash("info"),
            errors: await req.consumeFlash("error")
          }
    
          if (post) {
              res.render("posts/show.ejs", {post: post, msgs: msgs });
          } else {
              res.status(404).send("not found");
          }
      });

    return router;
}