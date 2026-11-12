"use client";

import React from "react";
import Link from "next/link";
import { ID } from "appwrite";
import { databases } from "@/models/client/config";
import { commentCollection, db } from "@/models/name";
import { useAuthStore } from "@/store/Auth";
import { convertDateToRelativeTime, slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

export interface CommentItem {
    $id: string;
    $createdAt: string;
    content: string;
    authorId: string;
    authorName: string;
}

interface CommentsProps {
    type: "question" | "answer";
    typeId: string;
    initialComments: CommentItem[];
}

export default function Comments({ type, typeId, initialComments }: CommentsProps) {
    const { user } = useAuthStore();
    const [comments, setComments] = React.useState<CommentItem[]>(initialComments);
    const [newComment, setNewComment] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState("");
    const [success, setSuccess] = React.useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            setError("Please log in to post a comment.");
            return;
        }
        if (!newComment.trim()) {
            setError("Comment cannot be empty.");
            return;
        }

        setIsSubmitting(true);
        setError("");
        setSuccess("");
        try {
            const doc = await databases.createDocument(db, commentCollection, ID.unique(), {
                content: newComment.trim(),
                type,
                typeId,
                authorId: user.$id,
            });

            setComments((prev) => [
                ...prev,
                {
                    $id: doc.$id,
                    $createdAt: doc.$createdAt,
                    content: newComment.trim(),
                    authorId: user.$id,
                    authorName: user.name,
                },
            ]);
            setNewComment("");
            setSuccess("Comment posted.");
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e?.message || "Failed to post comment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        setError("");
        setSuccess("");
        try {
            await databases.deleteDocument(db, commentCollection, commentId);
            setComments((prev) => prev.filter((c) => c.$id !== commentId));
            setSuccess("Comment deleted.");
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e?.message || "Failed to delete comment.");
        }
    };

    return (
        <div className="mt-4 border-t border-border/60 pt-3">
            {comments.length > 0 && (
                <ul className="space-y-2">
                    {comments.map((comment) => (
                        <li
                            key={comment.$id}
                            className="flex items-start justify-between gap-3 border-b border-border/40 pb-2 text-xs text-muted-foreground last:border-b-0"
                        >
                            <div className="min-w-0 break-words">
                                <span className="text-foreground">{comment.content}</span>
                                {" — "}
                                <Link
                                    href={`/users/${comment.authorId}/${slugify(comment.authorName)}`}
                                    className="font-medium text-orange-500 hover:underline"
                                >
                                    {comment.authorName}
                                </Link>{" "}
                                <span>{convertDateToRelativeTime(comment.$createdAt)}</span>
                            </div>
                            {user?.$id === comment.authorId && (
                                <button
                                    type="button"
                                    onClick={() => handleDelete(comment.$id)}
                                    className="shrink-0 p-1 text-muted-foreground transition-colors hover:text-destructive"
                                    aria-label="Delete comment"
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {user && (
                <form
                    onSubmit={handleSubmit}
                    className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center"
                >
                    <Input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a concise clarification or follow-up comment..."
                        disabled={isSubmitting}
                        className="h-9 text-xs sm:h-8"
                    />
                    <Button
                        type="submit"
                        size="sm"
                        variant="secondary"
                        disabled={isSubmitting || !newComment.trim()}
                        className="w-full shrink-0 sm:h-8 sm:w-auto"
                    >
                        {isSubmitting ? "Posting..." : "Post Comment"}
                    </Button>
                </form>
            )}

            {error && (
                <p className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">
                    {error}
                </p>
            )}
            {success && (
                <p className="mt-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    {success}
                </p>
            )}
        </div>
    );
}
