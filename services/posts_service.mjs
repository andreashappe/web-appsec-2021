export default class PostsService {
    constructor(dataStorage) {
        this.posts = dataStorage;
        Object.freeze(this);
    }

    addPost(id, title, name, content) {
        return this.posts.addPost(id, title, name, content);
    }

    listPosts() {
        return this.posts.listPosts();
    }

    getPost(id) {
        return this.posts.getPost(id);
    }
}