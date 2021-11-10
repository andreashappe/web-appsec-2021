class Post {
    constructor(id, title, author, content) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.content = content;
        Object.freeze(this);
    }
}

/*
 * In-memory Storage für Posts
 */
export default class PostsStorageMemory {
    constructor() {
        this.posts = [];
        Object.freeze(this);
    }

    addPost(id, title, name, content) {
        const post = new Post(id, title, name, content);
        this.posts.push(post);
        return post;
    }

    listPosts() {
        return this.posts;
    }

    getPost(id) {
        for(let i of this.posts) {
            if (i.id === id) {
                return i;
            }
        }
        return null;
    }
}