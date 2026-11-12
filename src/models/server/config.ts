import env from "@/env";
import { Avatars, Client, Databases, Storage, Users } from "node-appwrite";

const client = new Client();

const endpoint = env.appwrite.endpoint.trim();
const projectId = env.appwrite.projectId.trim();
const apikey = env.appwrite.apikey.trim();

if (endpoint && endpoint !== "undefined") {
    client.setEndpoint(endpoint);
}
if (projectId && projectId !== "undefined") {
    client.setProject(projectId);
}
if (apikey && apikey !== "undefined") {
    client.setKey(apikey);
}

const users = new Users(client);
const databases = new Databases(client);
const avatars = new Avatars(client);
const storage = new Storage(client);

export { client, users, databases, avatars, storage };
 