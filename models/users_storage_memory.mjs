class User{
    constructor(id, email, password_hash) {
        this.id = id;
        this.email = email;
        this.password_hash = password_hash;
        Object.freeze(this);
    }
}

export default class UsersStorageMemory {
    constructor() {
        this.storage = new Map();
        this.lastId = 1;
        Object.freeze();
    }

    addUser(email, password_hash) {
        let user = new User(this.lastId, email, password_hash);
        this.lastId++;
        this.storage.set(user.id, user);
        return user;
    }

    getUser(id) {
        return this.storage.get(id);
    }

    getUserByEmail(email) {
        for(let i of this.storage.values()) {
            if (i.email === email) {
                return i;
            }
        }
        return null;
    }
}