"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ID } from "appwrite";
import { databases, storage } from "@/models/client/config";
import { db, questionAttachmentBucket, questionCollection } from "@/models/name";
import { useAuthStore } from "@/store/Auth";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

export default function AskQuestionForm() {
    const { user, session, hydrated } = useAuthStore();
    const router = useRouter();

    const [title, setTitle] = React.useState("");
    const [content, setContent] = React.useState("");
    const [tagInput, setTagInput] = React.useState("");
    const [tags, setTags] = React.useState<string[]>([]);
    const [attachment, setAttachment] = React.useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState("");
    const [success, setSuccess] = React.useState("");

    const addTag = (raw: string) => {
        const cleaned = raw.trim().toLowerCase().replace(/^#/, "");
        if (!cleaned) return;
        if (cleaned.length > 50) {
            setError("Each tag must be 50 characters or fewer.");
            return;
        }
        if (!tags.includes(cleaned) && tags.length < 5) {
            setTags((prev) => [...prev, cleaned]);
        }
        setTagInput("");
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(tagInput);
        }
    };

    const removeTag = (target: string) => {
        setTags((prev) => prev.filter((t) => t !== target));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            router.push("/login");
            return;
        }

        const finalTags = [...tags];
        if (tagInput.trim()) {
            const extra = tagInput
                .split(",")
                .map((t) => t.trim().toLowerCase().replace(/^#/, ""))
                .filter(Boolean);
            for (const t of extra) {
                if (!finalTags.includes(t) && finalTags.length < 5) {
                    finalTags.push(t);
                }
            }
        }

        if (!title.trim() || !content.trim() || finalTags.length === 0) {
            setError("Please provide a title, detailed description, and at least one tag.");
            return;
        }

        setIsSubmitting(true);
        setError("");
        setSuccess("");

        try {
            let attachmentId: string | undefined;

            if (attachment) {
                const uploaded = await storage.createFile(
                    questionAttachmentBucket,
                    ID.unique(),
                    attachment
                );
                attachmentId = uploaded.$id;
            }

            const doc = await databases.createDocument(
                db,
                questionCollection,
                ID.unique(),
                {
                    title: title.trim().slice(0, 100),
                    content: content.trim().slice(0, 10000),
                    authorId: user.$id,
                    tags: finalTags,
                    ...(attachmentId ? { attachmentId } : {}),
                }
            );

            setSuccess("Question published successfully! Redirecting...");
            router.push(`/questions/${doc.$id}/${slugify(title)}`);
            router.refresh();
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e?.message || "Failed to publish question.");
            setIsSubmitting(false);
        }
    };

    if (hydrated && !session) {
        return (
            <div className="mx-auto max-w-xl px-4 py-16 text-center">
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                    <h1 className="text-xl font-bold">Sign in to ask a question</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        You need an account to post questions and earn reputation.
                    </p>
                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link href="/login">
                            <Button className="w-full sm:w-auto">Log in</Button>
                        </Link>
                        <Link href="/register">
                            <Button variant="outline" className="w-full sm:w-auto">
                                Sign up
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Ask a Public Question</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Be specific and include everything someone needs to answer your question.
                </p>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-600 dark:text-emerald-400">
                    {success}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-8"
            >
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={100}
                        placeholder="Summarize your technical question in one clear sentence"
                        required
                        disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                        Up to 100 characters ({title.length}/100)
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="content">Details</Label>
                    <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                        maxLength={10000}
                        placeholder="Include context, code snippets, expected behavior, and any errors encountered."
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tags">Tags (up to 5)</Label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Input
                            id="tags"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            placeholder="Add up to 5 relevant tags (press Enter or comma)"
                            disabled={isSubmitting || tags.length >= 5}
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => addTag(tagInput)}
                            disabled={isSubmitting || !tagInput.trim() || tags.length >= 5}
                            className="w-full shrink-0 sm:w-auto"
                        >
                            Add Tag
                        </Button>
                    </div>
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 rounded-md bg-orange-500/15 px-2.5 py-1 text-xs font-medium text-orange-600 dark:text-orange-400"
                                >
                                    #{tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        aria-label={`Remove ${tag}`}
                                        className="hover:text-foreground"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="attachment">Image Attachment (optional)</Label>
                    <Input
                        id="attachment"
                        type="file"
                        accept="image/png,image/jpeg,image/gif,image/webp,image/heic"
                        onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                        disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                        Supported formats: JPG, PNG, GIF, WEBP, HEIC
                    </p>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Link href="/questions" className="w-full sm:w-auto">
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                        {isSubmitting ? "Publishing..." : "Publish Question"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
