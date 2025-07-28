import {IncomingMessage, ServerResponse} from "node:http";
import {UserController} from "../controllers/UserController.ts";
import {myLogger} from "../utils/logger.ts";
import {baseUrl} from "../config/userServerConfig.ts";

//http://localhost:3005/api/users/:id
//http://localhost:3005/api/users?id=6&age=21
export const userRouters=
    async (req:IncomingMessage, res:ServerResponse, controller:UserController) => {
    const {url, method} = req;
    const parsedUrl = new URL( url!, baseUrl);

    myLogger.log(`I got request ${url} ${method}`)
    switch (parsedUrl.pathname + method) {
        case "/api/users" + "POST":{
            await controller.addUser(req, res);
            break;
        }
        case "/api/users" + "GET":{
            controller.getAllUsers(req, res);
            break;
        }
        case "/api/users" + "PUT":{
            await controller.updateUser(req, res);
            break;
        }
        case "/api/user" + "GET":{
             controller.getUserById(req, res);
            break;
        }
        case "/api/users" + "DELETE":{
            controller.removeUser(req, res);
            break;
        }
        case "/api/logger" + "GET":{
           const result = myLogger.getLogArray();
           res.writeHead(200, {"Content-Type":"application/json"});
           res.end(JSON.stringify(result))
            break;
        }

        default: {
            res.writeHead(404, {"Content-Type":"text/plain"})
            res.end("Page not found")
            break;
        }
    }
}