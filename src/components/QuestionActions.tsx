"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/Auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";

export function DeleteQuestionButton({
    questionId,
    authorId,
}: {
    questionId: string;
    authorId: string;
}) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [error, setError] = React.useState("");

    if (user?.$id !== authorId) return null;

    const handleDelete = async () => {
        if (isDeleting) return;
        setIsDeleting(true);
        setError("");
        try {
            const res = await fetch("/api/question", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questionId }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to delete question");
            }
            router.push("/questions");
            router.refresh();
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e?.message || "Failed to delete question.");
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col items-end gap-1">
            <Button
                type="button"
                size="xs"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-1"
            >
                <Trash2 className="size-3.5" />
                {isDeleting ? "Deleting..." : "Delete Question"}
            </Button>
            {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
    );
}

export function DeleteAnswerButton({
    answerId,
    authorId,
}: {
    answerId: string;
    authorId: string;
}) {
    const { user, verifySession } = useAuthStore();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [error, setError] = React.useState("");

    if (user?.$id !== authorId) return null;

    const handleDelete = async () => {
        if (isDeleting) return;
        setIsDeleting(true);
        setError("");
        try {
            const res = await fetch("/api/answer", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answerId }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to delete answer");
            }
            await verifySession();
            router.refresh();
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e?.message || "Failed to delete answer.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col items-start gap-1">
            <Button
                type="button"
                size="xs"
                variant="ghost"
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
                <Trash2 className="size-3.5" />
                {isDeleting ? "Deleting..." : "Delete"}
            </Button>
            {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
    );
}

export function AnswerForm({ questionId }: { questionId: string }) {
    const { user, verifySession } = useAuthStore();
    const router = useRouter();
    const [answer, setAnswer] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState("");
    const [success, setSuccess] = React.useState("");

    if (!user) {
        return (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
                <p className="text-sm text-muted-foreground">
                    Want to contribute an answer?{" "}
                    <Link href="/login" className="font-medium text-orange-500 hover:underline">
                        Log in
                    </Link>{" "}
                    or{" "}
                    <Link href="/register" className="font-medium text-orange-500 hover:underline">
                        sign up
                    </Link>{" "}
                    to reply.
                </p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!answer.trim()) {
            setError("Please write an answer before submitting.");
            return;
        }

        setIsSubmitting(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch("/api/answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    questionId,
                    answer: answer.trim(),
                    authorId: user.$id,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to post answer.");
            }

            setAnswer("");
            setSuccess("Your answer has been posted successfully!");
            await verifySession();
            router.refresh();
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e?.message || "Failed to post answer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-border bg-card p-5 sm:p-6"
        >
            <h3 className="text-lg font-semibold">Your Answer</h3>

            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
                    {success}
                </div>
            )}

            <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={6}
                placeholder="Provide a clear, well-structured solution or explanation..."
                disabled={isSubmitting}
                required
            />

            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || !answer.trim()} className="w-full sm:w-auto">
                    {isSubmitting ? "Posting..." : "Post Your Answer"}
                </Button>
            </div>
        </form>
    );
}
