import { answerCollection, db, questionCollection, voteCollection } from "@/models";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

export async function POST(request: NextRequest) {
    try {
        const { voteById, votedById, voteStatus, type, typeId } = await request.json();
        const vById = votedById || voteById;

        if (!vById || !voteStatus || !type || !typeId) {
            return NextResponse.json(
                { error: "Missing required fields: votedById, voteStatus, type, typeId" },
                { status: 400 }
            );
        }

        if (!["question", "answer"].includes(type)) {
            return NextResponse.json(
                { error: "Invalid vote type; expected 'question' or 'answer'" },
                { status: 400 }
            );
        }

        if (!["upvoted", "downvoted"].includes(voteStatus)) {
            return NextResponse.json(
                { error: "Invalid voteStatus; expected 'upvoted' or 'downvoted'" },
                { status: 400 }
            );
        }

        const response = await databases.listDocuments(db, voteCollection, [
            Query.equal("type", type),
            Query.equal("typeId", typeId),
            Query.equal("votedById", vById),
        ]);

        let reputationDelta = 0;

        if (response.documents.length > 0) {
            const prevVote = response.documents[0];
            await databases.deleteDocument(db, voteCollection, prevVote.$id);
            reputationDelta += prevVote.voteStatus === "upvoted" ? -1 : 1;
        }

        // Create new vote if no previous vote existed or vote status changed
        let doc = null;
        if (response.documents[0]?.voteStatus !== voteStatus) {
            doc = await databases.createDocument(db, voteCollection, ID.unique(), {
                type,
                typeId,
                voteStatus,
                votedById: vById,
            });
            reputationDelta += voteStatus === "upvoted" ? 1 : -1;
        }

        if (reputationDelta !== 0) {
            const questionOrAnswer = await databases.getDocument(
                db,
                type === "question" ? questionCollection : answerCollection,
                typeId
            );

            const authorPrefs = await users.getPrefs<UserPrefs>(questionOrAnswer.authorId);

            await users.updatePrefs(questionOrAnswer.authorId, {
                reputation: Number(authorPrefs.reputation || 0) + reputationDelta,
            });
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
                message: "Vote handled",
            },
            { status: 200 }
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
