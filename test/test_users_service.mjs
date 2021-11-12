import UsersStorageMemory from "./../models/users_storage_memory.mjs";
import UsersService from "./../services/users_service.mjs";
import assert from "assert";

describe("the user service", async function() {
    it("should allow to create and return an user", async function() {
        const userStorage = new UsersStorageMemory();
        const userService = new UsersService(userStorage);

        const email = "andy@offensive.one";
        const password = "trustno1";

        let user = await userService.addUser(email, password);
        assert(user.email === email);
        // this should be hashed
        assert(user.password_hash != null && user.password_hash != password);
        assert(user.id != null && user.id != undefined);
    });

    it("should prevent login users with invalid password", async function() {
        const userStorage = new UsersStorageMemory();
        const userService = new UsersService(userStorage);

        const email = "andy@offensive.one";
        const password = "trustno1";

        await userService.addUser(email, password);
        let userLogin = await userService.loginUser(email, password + "fubar");

        assert(userLogin === null);
    });

    it("should prevent login users with invalid email", async function() {
        const userStorage = new UsersStorageMemory();
        const userService = new UsersService(userStorage);

        const email = "andy@offensive.one";
        const password = "trustno1";

        await userService.addUser(email, password);
        let userLogin = await userService.loginUser(email + "fubar", password);

        assert(userLogin === null);
    });

    it("should allow login of created users", async function() {
        const userStorage = new UsersStorageMemory();
        const userService = new UsersService(userStorage);

        const email = "andy@offensive.one";
        const password = "trustno1";

        let userCreated = await userService.addUser(email, password);
        let userLogin = await userService.loginUser(email, password);

        assert(userLogin.email === email);
        assert(userLogin.id === userCreated.id)
    });

    it("should allow retrieveal of users through their id", async function() {
        const userStorage = new UsersStorageMemory();
        const userService = new UsersService(userStorage);

        const email = "andy@offensive.one";
        const password = "trustno1";

        let userCreated = await userService.addUser(email, password);
        let userLogin = await userService.getUser(userCreated.id);

        assert(userLogin.email === email);
        assert(userLogin.id === userCreated.id)
    });
});