import { Query } from "node-appwrite";
import { databases, users } from "@/models/server/config";
import {
    answerCollection,
    commentCollection,
    db,
    questionCollection,
    voteCollection,
} from "@/models/name";
import { UserPrefs } from "@/store/Auth";
import { QuestionCardData } from "@/components/QuestionCard";
import { CommentItem } from "@/components/Comments";

export interface EnrichedAnswer {
    $id: string;
    $createdAt: string;
    content: string;
    questionId: string;
    authorId: string;
    authorName: string;
    authorReputation: number;
    voteResult: number;
    comments: CommentItem[];
}

export interface QuestionDetailData {
    $id: string;
    $createdAt: string;
    title: string;
    content: string;
    tags: string[];
    attachmentId?: string;
    authorId: string;
    authorName: string;
    authorReputation: number;
    voteResult: number;
    comments: CommentItem[];
    answers: EnrichedAnswer[];
}

async function getSafeAuthor(authorId: string): Promise<{ name: string; reputation: number }> {
    try {
        const author = await users.get<UserPrefs>(authorId);
        return {
            name: author.name || "Anonymous",
            reputation: Number(author.prefs?.reputation || 0),
        };
    } catch {
        return { name: "Unknown User", reputation: 0 };
    }
}

async function getVoteResult(type: "question" | "answer", typeId: string): Promise<number> {
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
    return upvotes.total - downvotes.total;
}

export async function getQuestionsList({
    page = 1,
    limit = 10,
    tag,
    search,
}: {
    page?: number;
    limit?: number;
    tag?: string;
    search?: string;
}): Promise<{ questions: QuestionCardData[]; total: number }> {
    const queries: string[] = [
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
        Query.offset((page - 1) * limit),
    ];

    if (tag) {
        queries.push(Query.equal("tags", tag));
    }

    if (search) {
        queries.push(
            Query.or([
                Query.contains("title", search),
                Query.contains("content", search),
            ])
        );
    }

    let result;
    try {
        result = await databases.listDocuments(db, questionCollection, queries);
    } catch {
        // Fallback if server doesn't support contains/or on text without index
        try {
            const fallbackQueries = [Query.orderDesc("$createdAt"), Query.limit(100)];
            if (tag) fallbackQueries.push(Query.equal("tags", tag));
            const all = await databases.listDocuments(db, questionCollection, fallbackQueries);
            const filtered = search
                ? all.documents.filter((doc) => {
                      const q = search.toLowerCase();
                      return (
                          String(doc.title || "").toLowerCase().includes(q) ||
                          String(doc.content || "").toLowerCase().includes(q)
                      );
                  })
                : all.documents;
            const start = (page - 1) * limit;
            result = {
                total: filtered.length,
                documents: filtered.slice(start, start + limit),
            };
        } catch {
            return { questions: [], total: 0 };
        }
    }

    const enriched = await Promise.all(
        result.documents.map(async (doc) => {
            const [author, totalVotes, answers] = await Promise.all([
                getSafeAuthor(String(doc.authorId)),
                getVoteResult("question", doc.$id),
                databases.listDocuments(db, answerCollection, [
                    Query.equal("questionId", doc.$id),
                    Query.limit(1),
                ]),
            ]);

            return {
                $id: doc.$id,
                $createdAt: doc.$createdAt,
                title: String(doc.title),
                content: String(doc.content),
                tags: Array.isArray(doc.tags) ? doc.tags.map(String) : [],
                authorId: String(doc.authorId),
                authorName: author.name,
                authorReputation: author.reputation,
                totalVotes,
                totalAnswers: answers.total,
            };
        })
    );

    return { questions: enriched, total: result.total };
}

export async function getTopContributors(limit = 5) {
    try {
        const res = await users.list<UserPrefs>([Query.limit(25)]);
        return res.users
            .map((u) => ({
                $id: u.$id,
                name: u.name || "Anonymous",
                reputation: Number(u.prefs?.reputation || 0),
                $createdAt: u.$createdAt,
            }))
            .sort((a, b) => b.reputation - a.reputation)
            .slice(0, limit);
    } catch {
        return [];
    }
}

async function getEnrichedComments(
    type: "question" | "answer",
    typeId: string
): Promise<CommentItem[]> {
    const res = await databases.listDocuments(db, commentCollection, [
        Query.equal("type", type),
        Query.equal("typeId", typeId),
        Query.orderAsc("$createdAt"),
        Query.limit(100),
    ]);

    return Promise.all(
        res.documents.map(async (doc) => {
            const author = await getSafeAuthor(String(doc.authorId));
            return {
                $id: doc.$id,
                $createdAt: doc.$createdAt,
                content: String(doc.content),
                authorId: String(doc.authorId),
                authorName: author.name,
            };
        })
    );
}

export async function getQuestionDetail(quesId: string): Promise<QuestionDetailData | null> {
    try {
        const question = await databases.getDocument(db, questionCollection, quesId);

        const [author, voteResult, comments, answersRes] = await Promise.all([
            getSafeAuthor(String(question.authorId)),
            getVoteResult("question", question.$id),
            getEnrichedComments("question", question.$id),
            databases.listDocuments(db, answerCollection, [
                Query.equal("questionId", question.$id),
                Query.orderDesc("$createdAt"),
                Query.limit(100),
            ]),
        ]);

        const answers: EnrichedAnswer[] = await Promise.all(
            answersRes.documents.map(async (ans) => {
                const [ansAuthor, ansVoteResult, ansComments] = await Promise.all([
                    getSafeAuthor(String(ans.authorId)),
                    getVoteResult("answer", ans.$id),
                    getEnrichedComments("answer", ans.$id),
                ]);

                return {
                    $id: ans.$id,
                    $createdAt: ans.$createdAt,
                    content: String(ans.content),
                    questionId: String(ans.questionId),
                    authorId: String(ans.authorId),
                    authorName: ansAuthor.name,
                    authorReputation: ansAuthor.reputation,
                    voteResult: ansVoteResult,
                    comments: ansComments,
                };
            })
        );

        // Sort answers by highest vote score first
        answers.sort((a, b) => b.voteResult - a.voteResult);

        return {
            $id: question.$id,
            $createdAt: question.$createdAt,
            title: String(question.title),
            content: String(question.content),
            tags: Array.isArray(question.tags) ? question.tags.map(String) : [],
            attachmentId: question.attachmentId ? String(question.attachmentId) : undefined,
            authorId: String(question.authorId),
            authorName: author.name,
            authorReputation: author.reputation,
            voteResult,
            comments,
            answers,
        };
    } catch {
        return null;
    }
}

export async function getUserProfile(userId: string) {
    try {
        const [user, questionsRes, answersRes] = await Promise.all([
            users.get<UserPrefs>(userId),
            databases.listDocuments(db, questionCollection, [
                Query.equal("authorId", userId),
                Query.orderDesc("$createdAt"),
                Query.limit(50),
            ]),
            databases.listDocuments(db, answerCollection, [
                Query.equal("authorId", userId),
                Query.orderDesc("$createdAt"),
                Query.limit(50),
            ]),
        ]);

        const questions: QuestionCardData[] = await Promise.all(
            questionsRes.documents.map(async (doc) => {
                const [totalVotes, ansCount] = await Promise.all([
                    getVoteResult("question", doc.$id),
                    databases.listDocuments(db, answerCollection, [
                        Query.equal("questionId", doc.$id),
                        Query.limit(1),
                    ]),
                ]);
                return {
                    $id: doc.$id,
                    $createdAt: doc.$createdAt,
                    title: String(doc.title),
                    content: String(doc.content),
                    tags: Array.isArray(doc.tags) ? doc.tags.map(String) : [],
                    authorId: user.$id,
                    authorName: user.name || "Anonymous",
                    authorReputation: Number(user.prefs?.reputation || 0),
                    totalVotes,
                    totalAnswers: ansCount.total,
                };
            })
        );

        const answers = await Promise.all(
            answersRes.documents.map(async (ans) => {
                let questionTitle = "View Question";
                try {
                    const q = await databases.getDocument(
                        db,
                        questionCollection,
                        String(ans.questionId)
                    );
                    questionTitle = String(q.title);
                } catch {
                    // Question may have been deleted
                }
                const voteResult = await getVoteResult("answer", ans.$id);
                return {
                    $id: ans.$id,
                    $createdAt: ans.$createdAt,
                    content: String(ans.content),
                    questionId: String(ans.questionId),
                    questionTitle,
                    voteResult,
                };
            })
        );

        return {
            user: {
                $id: user.$id,
                name: user.name || "Anonymous",
                reputation: Number(user.prefs?.reputation || 0),
                $createdAt: user.$createdAt,
            },
            questions,
            answers,
        };
    } catch {
        return null;
    }
}
