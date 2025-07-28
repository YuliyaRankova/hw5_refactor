import {createServer} from "node:http";
import {PORT} from "./config/userServerConfig.ts";
import {userRouters} from "./routers/userRoutes.ts";
import {UserController} from "./controllers/UserController.ts";
import {UserServiceEmbeddedImpl} from "./service/UserServiceEmbeddedImpl.ts";
import {myLogger} from "./utils/logger.ts";

export const launchServer = async () => {
    const userService = new UserServiceEmbeddedImpl();
    await userService.restoreDataFromFile();
    const userController: UserController = new UserController(userService);

    createServer(async (req, res) => {
        await userRouters(req, res, userController);
    }).listen(PORT, () => {
        console.log(`UserServer runs at http://localhost:${PORT}`)
    })

    process.on('SIGINT', async () => {
        await userService.saveDataToFile();

        myLogger.log("Saving data......");
        myLogger.saveToFile("Server shutdown by Ctrl+C");
        process.exit();
    })
}