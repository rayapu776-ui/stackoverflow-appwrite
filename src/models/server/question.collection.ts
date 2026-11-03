import { Permission } from "node-appwrite";
import { db, questionCollection } from "../name";
import { databases } from "./config";

export default async function createQuestionCollection() {
    // 1. Create collection
    await databases.createCollection(db, questionCollection, questionCollection, [
        Permission.read("any"),
        Permission.read("users"), 
        Permission.create("users"),
        Permission.update("users"),
        Permission.delete("users"),
    ]);
    console.log("Question collection created");

    // 2. Create attributes and indexes

    await Promise.all([
        databases.createStringAttribute(db, questionCollection, "title", 100, true),
        databases.createStringAttribute(db, questionCollection, "content", 10000, true),
        databases.createStringAttribute(db, questionCollection, "authorId", 50, true),
        databases.createStringAttribute(db, questionCollection, "tags", 50, true, undefined, true),
        databases.createStringAttribute(db, questionCollection, "attachmentId", 50, false),
    ]);
    console.log("Question attributes created");

    // 3. Create indexes (optional: attributes must be available in Appwrite before indexing)
    /*
    await Promise.all([
        databases.createIndex(
            db,
            questionCollection,
            "title",
            "fulltext",
            ["title"],
            ["asc"]
        ),
        databases.createIndex(
            db,
            questionCollection,
            "content",
            "fulltext",
            ["content"],
            ["asc"]
        ),
    ]);
    console.log("Question indexes created");
    */
}
