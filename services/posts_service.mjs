/*
 * Geschäftslogik für Posts
 */
export default class PostsService {
    constructor(dataStorage) {
        this.posts = dataStorage;
        /* freeze verhindert Veränderungen am Objekt */
        Object.freeze(this);
    }

    addPost(id, title, user, content) {
        return this.posts.addPost(id, title, user, content);
    }

    listPosts() {
        return this.posts.listPosts();
    }

    getPost(id) {
        return this.posts.getPost(id);
    }
}