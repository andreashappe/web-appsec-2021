import { v4 as uuidv4 } from 'uuid';

class User {
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
        Object.freeze(this);
    }

    storeUser(email, password_hash) {
        const user = new User(uuidv4(), email, password_hash);
        this.storage.set(email, user);
        return user;
    }

    getUser(email) {
        return this.storage.get(email);
    }

    getUserById(id) {
        for(let user of this.storage.values()) {
            if (user.id === id) {
                return user;
            }
        }
        return null;
    }
}