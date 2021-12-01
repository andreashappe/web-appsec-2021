export default class DtoPost {
    constructor(post) {
        this.title = post.title;
        this.content = post.content;
        this.author = post.author.email;
    }
}