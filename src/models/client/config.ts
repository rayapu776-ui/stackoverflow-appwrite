import env from "@/env";
import { Account, Avatars, Client, Databases, Storage } from "appwrite";

const client = new Client();

const endpoint = env.appwrite.endpoint.trim();
const projectId = env.appwrite.projectId.trim();

if (endpoint && endpoint !== "undefined") {
    client.setEndpoint(endpoint);
}
if (projectId && projectId !== "undefined") {
    client.setProject(projectId);
}

const account = new Account(client);
const databases = new Databases(client);
const avatars = new Avatars(client);
const storage = new Storage(client);

export { client, account, databases, avatars, storage };
