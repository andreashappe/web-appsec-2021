import bcrypt from "bcrypt";

export default class UsersService {
    constructor(userStorage) {
        this.userStorage = userStorage;
        Object.freeze(this);
    }

    async addUser(email, password) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        return this.userStorage.addUser(email, hash);
    }

    async loginUser(email, password) {
        const user = this.userStorage.getUserByEmail(email)
        if (user) {
            const checkPassword = await bcrypt.compare(password, user.password_hash);
            if(checkPassword) {
                return user;
            }
        }
        return null;
    }

    getUser(id) {
        return this.userStorage.getUser(id);
    }
}