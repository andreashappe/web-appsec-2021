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
        this.lastId = 1;
        Object.seal(this);
    }

    addPost(title, name, content) {
        const post = new Post(this.lastId++, title, name, content);
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