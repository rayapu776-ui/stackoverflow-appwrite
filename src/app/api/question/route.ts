import {
    answerCollection,
    commentCollection,
    db,
    questionAttachmentBucket,
    questionCollection,
    voteCollection,
} from "@/models";
import { databases, storage } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";

export async function DELETE(request: NextRequest) {
    try {
        const { questionId } = await request.json();

        if (!questionId) {
            return NextResponse.json({ error: "questionId is required" }, { status: 400 });
        }

        const question = await databases.getDocument(db, questionCollection, questionId);

        if (question.attachmentId) {
            try {
                await storage.deleteFile(questionAttachmentBucket, question.attachmentId);
            } catch {
                // Ignore if attachment was already deleted
            }
        }

        // Clean up associated answers, comments, and votes on this question
        const [answers, comments, votes] = await Promise.all([
            databases.listDocuments(db, answerCollection, [
                Query.equal("questionId", questionId),
                Query.limit(100),
            ]),
            databases.listDocuments(db, commentCollection, [
                Query.equal("type", "question"),
                Query.equal("typeId", questionId),
                Query.limit(100),
            ]),
            databases.listDocuments(db, voteCollection, [
                Query.equal("type", "question"),
                Query.equal("typeId", questionId),
                Query.limit(100),
            ]),
        ]);

        await Promise.all([
            ...answers.documents.map((doc) => databases.deleteDocument(db, answerCollection, doc.$id)),
            ...comments.documents.map((doc) => databases.deleteDocument(db, commentCollection, doc.$id)),
            ...votes.documents.map((doc) => databases.deleteDocument(db, voteCollection, doc.$id)),
        ]);

        const response = await databases.deleteDocument(db, questionCollection, questionId);

        return NextResponse.json(
            { data: response, message: "Question deleted successfully" },
            { status: 200 }
        );
    } catch (error: unknown) {
        const err = error as { message?: string; status?: number; code?: number };
        return NextResponse.json(
            { error: err?.message || "Error deleting question" },
            {
                status: typeof err?.status === "number" ? err.status : typeof err?.code === "number" ? err.code : 500,
            }
        );
    }
}
