import { answerCollection, db } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { UserPrefs } from "@/store/Auth";

export async function POST(request: NextRequest) {
    try {
        const { questionId, question, answer, authorId } = await request.json();

        const qId = questionId || question;

        if (!qId || !answer || !authorId) {
            return NextResponse.json(
                {
                    error: "Missing required fields: questionId, answer, authorId",
                },
                { status: 400 }
            );
        }

        const response = await databases.createDocument(
            db,
            answerCollection,
            ID.unique(),
            {
                content: answer,
                questionId: qId,
                authorId: authorId,
            }
        );

        // Increase author reputation
        const prefs = await users.getPrefs<UserPrefs>(authorId);
        await users.updatePrefs(authorId, {
            reputation: Number(prefs.reputation || 0) + 1,
        });

        return NextResponse.json(response, {
            status: 201,
        });
    } catch (error: unknown) {
        const err = error as { message?: string; status?: number; code?: number };
        return NextResponse.json(
            {
                error: err?.message || "Error creating answer",
            },
            {
                status: typeof err?.status === "number" ? err.status : typeof err?.code === "number" ? err.code : 500,
            }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { answerId } = await request.json();

        if (!answerId) {
            return NextResponse.json(
                { error: "answerId is required" },
                { status: 400 }
            );
        }

        const answer = await databases.getDocument(db, answerCollection, answerId);

        const response = await databases.deleteDocument(db, answerCollection, answerId);

        // Decrease author reputation
        const prefs = await users.getPrefs<UserPrefs>(answer.authorId);
        await users.updatePrefs(answer.authorId, {
            reputation: Number(prefs.reputation || 0) - 1,
        });

        return NextResponse.json(
            { data: response, message: "Answer deleted successfully" },
            { status: 200 }
        );
    } catch (error: unknown) {
        const err = error as { message?: string; status?: number; code?: number };
        return NextResponse.json(
            {
                error: err?.message || "Error deleting answer",
            },
            {
                status: typeof err?.status === "number" ? err.status : typeof err?.code === "number" ? err.code : 500,
            }
        );
    }
}
