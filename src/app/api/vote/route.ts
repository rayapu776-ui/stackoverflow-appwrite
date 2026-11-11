import { answerCollection, db, questionCollection, voteCollection } from "@/models";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

export async function POST(request: NextRequest) {
    try {
        // grab the data
        const { voteById, votedById, voteStatus, type, typeId } = await request.json();
        const vById = votedById || voteById;

        if (!vById || !voteStatus || !type || !typeId) {
            return NextResponse.json(
                { error: "Missing required fields: votedById, voteStatus, type, typeId" },
                { status: 400 }
            );
        }

        // list-document
        const response = await databases.listDocuments(
            db,
            voteCollection,
            [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("votedById", vById),
            ]
        );

        if (response.documents.length > 0) {
            await databases.deleteDocument(db, voteCollection, response.documents[0].$id);

            // decrease the reputation
            const QuestionOrAnswer = await databases.getDocument(
                db,
                type === "question" ? questionCollection : answerCollection,
                typeId
            );

            const authorPrefs = await users.getPrefs<UserPrefs>(QuestionOrAnswer.authorId);

            await users.updatePrefs(QuestionOrAnswer.authorId, {
                reputation:
                    response.documents[0].voteStatus === "upvoted"
                        ? Number(authorPrefs.reputation || 0) - 1
                        : Number(authorPrefs.reputation || 0) + 1,
            });
        }

        // That means prev vote does not exist or vote status changes
        let doc = null;
        if (response.documents[0]?.voteStatus !== voteStatus) {
                doc = await databases.createDocument(
                db,
                voteCollection,
                ID.unique(),
                {
                    type,
                    typeId,
                    voteStatus,
                    votedById: vById,
                }
            );

            const QuestionOrAnswer = await databases.getDocument(
                db,
                type === "question" ? questionCollection : answerCollection,
                typeId
            );

            const authorPrefs = await users.getPrefs<UserPrefs>(QuestionOrAnswer.authorId);

            // If vote was  present
            
            if (voteStatus === "upvoted") {
                await users.updatePrefs(QuestionOrAnswer.authorId, {
                    reputation: Number(authorPrefs.reputation || 0) + 1,
                });
            } else {
                await users.updatePrefs(QuestionOrAnswer.authorId, {
                    reputation: Number(authorPrefs.reputation || 0) - 1,
                });
            }
        }

        const [upvotes, downvotes] = await Promise.all([
            databases.listDocuments(db, voteCollection, [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "upvoted"),
                Query.limit(1),
            ]),
            databases.listDocuments(db, voteCollection, [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "downvoted"),
                Query.limit(1),
            ]),
        ]);

        return NextResponse.json(
            {
                data: {
                    document: doc,
                    voteResult: upvotes.total - downvotes.total,
                },
                message: "vote handled",
            },
            {
                status: 200,
            }
        );
    } catch (error: unknown) {
        const err = error as { message?: string; status?: number; code?: number };
        return NextResponse.json(
            {
                error: err?.message || "Error in voting",
            },
            {
                status: typeof err?.status === "number" ? err.status : typeof err?.code === "number" ? err.code : 500,
            }
        );
    }
}