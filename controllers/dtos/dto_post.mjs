export default class DtoPost {
    constructor(user) {
        this.id = user.id;
        this.author = user.author.email;
        this.title = user.title;
        this.content = user.content;
        Object.freeze(this);
    }
}