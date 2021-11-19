import { v4 as uuidv4 } from 'uuid';

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

    addPost(title, user, content) {
        const post = new Post(uuidv4(), title, user, content);
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