import bcrypt from 'bcrypt';

export default class UsersService {

    static async createUsersService(storage) {
        const roundNumber = 10;
        const fakeSalt = await bcrypt.genSalt(roundNumber);
        const fakeHash = await bcrypt.hash("toomanysecrets", fakeSalt);
        
        return new UsersService(storage, roundNumber, fakeHash);
    }

    constructor(usersStorage, roundNumber, fakeHash) {
        this.storage = usersStorage;
        this.roundNumber = roundNumber;
        this.fakeHash = fakeHash;
        Object.freeze(this);
    }

    async registerUser(email, password) {
        const salt = await bcrypt.genSalt(this.roundNumber);
        const password_hash = await bcrypt.hash(password, salt);

        return this.storage.storeUser(email, password_hash);
    }

    async loginUser(email, password) {
        const theUser = await this.storage.getUser(email);

        if (theUser) {
            if (await bcrypt.compare(password, theUser.password_hash)) {
                return theUser;
            }
        } else {
            // to have the same runtime in both cases
            await bcrypt.compare(password, this.fakeHash);
        }
        return null;
    }

    async getUser(id) {
        return this.storage.getUserById(id);
    }
}