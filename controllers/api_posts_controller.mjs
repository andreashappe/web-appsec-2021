import express from "express";
import DtoPost from './dtos/dto_post.mjs';
import nJWT from 'njwt';
import passport from "passport";
import passportJWT from "passport-jwt";

const myAppUrl = "https://oursuperduperapp.local";

export function setup_api_posts_routes(postsService) {
    let router = express.Router();

    router.get("/", passport.authenticate('jwt', { session: false }), async function(req, res) {
        const thePosts = await postsService.listPosts();
        const maskedPosts = thePosts.map( (x) => { return new DtoPost(x) });
        res.json(maskedPosts);
    });

    return router;
}

export function generateJWT(user) {
    const claims = {
        iss: myAppUrl,
        sub: user.id,
        aud: myAppUrl,
        scope: {
            posts: ["index"]
        }
    };
    return nJWT.create(claims, process.env.SESSION_SECRET);
}

export function setup_passport_authentication_jwt(app, usersService) {
    const opts = {
        jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.SESSION_SECRET,
        issuer: myAppUrl,
        audience: myAppUrl
    };

    passport.use(new passportJWT.Strategy(opts, async function(payload, done) {
        const theUser = await usersService.getUser(payload.sub);
        if (theUser) {
            if (payload.scope["posts"] && payload.scope["posts"].includes("index")) {
                return done(null, theUser);
            } else {
                return done("user is not allowed to access posts#index", false);
            }
        } else {
            return done(null, false);
        }
    }));
}