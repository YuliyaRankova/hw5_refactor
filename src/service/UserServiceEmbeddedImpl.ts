import {UserService} from "./UserService.ts";
import {User} from "../model/userTypes.ts";
import {UserFilePersistenceService} from "./UserFilePersistenceService.ts";
import fs from "fs";
import {myLogger} from "../utils/logger.ts";

export  class UserServiceEmbeddedImpl implements UserService, UserFilePersistenceService{
    private users: User[] = [];
    private rs = fs.createReadStream("src/data.txt", {encoding: "utf-8", highWaterMark:24});

    addUser(user: User): boolean {
        if(this.users.findIndex((u:User) => u.id === user.id) === -1)
        {
            this.users.push(user);
            return true;
        }
        return false;
    }

    getAllUsers(): User[] {
        return [...this.users];
    }

    getUserById(id: number): User {
       const user = this.users.find(item => item.id === id);
       if(!user) throw "404";
        return user;
    }

    removeUser(id: number): User {
        const index = this.users.findIndex(item => item.id === id);
        if(index === -1) throw "404";
        const removed = this.users[index];
        this.users.splice(index, 1);
        return removed;
    }

    updateUser(newUser: User): void {
        const index = this.users.findIndex(item => item.id === newUser.id);
        if(index === -1) throw "404";
        this.users[index] = newUser;
    }

    async restoreDataFromFile(): Promise<void> {
        try {
            const data: string = await new Promise((resolve, reject) => {
                let content = "";

                this.rs.on("data", chunk => {
                    content += chunk;
                });

                this.rs.on("end", () => {
                    resolve(content);
                });

                this.rs.on("error", err => {
                    myLogger.log("Read error: " + err.message);
                    this.rs.destroy();
                    reject(err);
                });
            });

            myLogger.log("File content: " + data);

            try {
                this.users = JSON.parse(data);
                myLogger.log("Data was restored from file");
                myLogger.save("Data was restored from file");
            } catch (err: any) {
                myLogger.log("JSON parse failed");
                myLogger.log("Parse error: " + err.message);
                this.users = [{ id: 2, userName: "Bender" }];
            }
        } catch (err) {
            myLogger.log("Restore failed: " + (err as Error).message);
            this.users = [{ id: 2, userName: "Bender" }];
        }
    };

    async saveDataToFile(): Promise<void> {
        try {
            const ws = fs.createWriteStream("src/data.txt");
            myLogger.log("WS created");

            const data = JSON.stringify(this.users);
            myLogger.log(data);

            await new Promise<void>((resolve, reject) => {
                ws.write(data, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        ws.end();
                    }
                });
                ws.on("error", reject);
                ws.on("finish", resolve);
                myLogger.log("Data was saved to file");
                myLogger.save("Data was saved to file");
            });
        } catch (err: any) {
            myLogger.log("Error: data not saved! " + err.message);
        }
    };
};