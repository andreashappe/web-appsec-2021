import njwt from "njwt";
import express from "express";
import DtoPost from "./dtos/dto_post.mjs";
import passportJWT from "passport-jwt";
import passport from "passport";

export function setup_jwt_auth(signingKey, usersService) {
    passport.use(new passportJWT.Strategy(
        {
            jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: signingKey,
            issuer: "https://webappsec2021",
            audience: "my-client"
        },
        async function(jwt_payload, done) {
            const id = jwt_payload.sub;
            const scope = jwt_payload.scope;
            const user = await usersService.getUser(id);

            if (user && scope["posts"] && scope["posts"].includes("index")) {
                done(null, user);
            } else {
                done(null, false);
            }
        }
    ))
}

export function generateJWT(signingKey, user) {
    var claims = {
        iss: "https://webappsec2021",
        sub: user.id,
        aud: "my-client",
        scope: {
            posts: [
                "index"
            ]
        }
    };
    return njwt.create(claims, signingKey);
}

export function setup_api_paths(postsService) {
    const router = express.Router();

    router.get("/", passport.authenticate("jwt", { session: false }), async function(req, res) {
        const tmp = await postsService.listPosts();
        const posts = tmp.map((x) => new DtoPost(x) );
        res.json(posts);
    });

    return router;
}