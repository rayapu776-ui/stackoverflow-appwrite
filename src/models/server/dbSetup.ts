import { db } from "../name";
import createAnswerCollection from "./answer.collection";
import createCommentCollection from "./comment.collection";
import { databases } from "./config";
import createQuestionCollection from "./question.collection";
import createVoteCollection from "./vote.collection";

export default async function getOrCreateDB() {
    try {
        await databases.get(db);
        console.log("Database connected");
    } catch {
        try {
            await databases.create(db, db);
            console.log("Database created");

            // create collections
            await Promise.all([
                createQuestionCollection(),
                createAnswerCollection(),
                createCommentCollection(),
                createVoteCollection(),
            ]);
            console.log("Collections created");
            console.log("Database connected");
        } catch (error) {
            console.error("Error creating database or collection:", error);
        }
    }

    return databases;
}

