import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getQuestionsList } from "@/lib/queries";
import QuestionCard from "@/components/QuestionCard";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquarePlus, Search, X } from "lucide-react";

const PAGE_LIMIT = 10;

export const metadata: Metadata = {
    title: "All Questions",
    description:
        "Browse developer questions, filter by technical tags, and search solutions on StackFlow.",
};

async function QuestionsResults({
    searchParamsPromise,
}: {
    searchParamsPromise: Promise<{ page?: string; tag?: string; search?: string }>;
}) {
    const params = await searchParamsPromise;
    const page = Math.max(1, Number(params.page || "1") || 1);
    const tag = params.tag?.trim() || undefined;
    const search = params.search?.trim() || undefined;

    const { questions, total } = await getQuestionsList({
        page,
        limit: PAGE_LIMIT,
        tag,
        search,
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">All Questions</h1>
                    <p className="text-sm text-muted-foreground">
                        {total} {total === 1 ? "question" : "questions"} found
                        {tag ? ` tagged #${tag}` : ""}
                        {search ? ` matching "${search}"` : ""}
                    </p>
                </div>

                <Link href="/questions/ask" className="w-full sm:w-auto">
                    <Button className="w-full gap-2 sm:w-auto">
                        <MessageSquarePlus className="size-4" />
                        Ask Question
                    </Button>
                </Link>
            </div>

            <form
                action="/questions"
                method="GET"
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
            >
                {tag && <input type="hidden" name="tag" value={tag} />}
                <div className="relative w-full min-w-0 sm:flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        name="search"
                        defaultValue={search || ""}
                        placeholder="Search questions by title or description..."
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    <Button type="submit" variant="secondary" className="flex-1 sm:flex-initial">
                        Search
                    </Button>
                    {(tag || search) && (
                        <Link href="/questions" className="flex-1 sm:flex-initial">
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full gap-1 sm:w-auto"
                            >
                                <X className="size-4" />
                                Clear
                            </Button>
                        </Link>
                    )}
                </div>
            </form>

            {questions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center sm:p-12">
                    <p className="text-base font-medium">No matching questions found</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Try clearing your filters or ask a new question.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {questions.map((q) => (
                        <QuestionCard key={q.$id} question={q} />
                    ))}
                </div>
            )}

            <Pagination total={total} limit={PAGE_LIMIT} />
        </div>
    );
}

export default function QuestionsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; tag?: string; search?: string }>;
}) {
    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <Suspense
                fallback={
                    <div className="space-y-4">
                        <div className="h-12 w-48 animate-pulse rounded-lg bg-muted" />
                        <div className="h-28 animate-pulse rounded-xl bg-muted" />
                        <div className="h-28 animate-pulse rounded-xl bg-muted" />
                    </div>
                }
            >
                <QuestionsResults searchParamsPromise={searchParams} />
            </Suspense>
        </div>
    );
}
