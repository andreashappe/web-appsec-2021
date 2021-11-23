import nJWT from "njwt";

export function generateJWT(user) {
    const claims = {
        "sub": user.id,
        "scope": {
            "posts": ["index"]
        },
        "iss": "http://myweppapp",
        "aud": "someapp"
    }

    return nJWT.create(claims, "secret").compact();
}