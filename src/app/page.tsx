import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getQuestionsList, getTopContributors } from "@/lib/queries";
import QuestionCard from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import { ArrowRight, Award, MessageSquarePlus } from "lucide-react";

export const metadata: Metadata = {
    title: "StackFlow — Developer Q&A Community",
    description:
        "Ask engineering questions, share verified solutions, vote on answers, and grow your developer reputation on StackFlow.",
};

async function HomeFeed() {
    const [{ questions }, topUsers] = await Promise.all([
        getQuestionsList({ page: 1, limit: 8 }),
        getTopContributors(5),
    ]);

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <section className="space-y-4 lg:col-span-2">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xl font-bold tracking-tight">Latest Questions</h2>
                    <Link
                        href="/questions"
                        className="inline-flex items-center gap-1 text-sm font-medium text-orange-500 hover:underline"
                    >
                        View all
                        <ArrowRight className="size-4" />
                    </Link>
                </div>

                {questions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center sm:p-10">
                        <p className="text-base font-medium">No questions yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Be the first to ask a question and start earning reputation.
                        </p>
                        <Link href="/questions/ask" className="mt-4 inline-block">
                            <Button size="sm">Ask a Question</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {questions.map((question) => (
                            <QuestionCard key={question.$id} question={question} />
                        ))}
                    </div>
                )}
            </section>

            <aside className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-5">
                    <div className="mb-4 flex items-center gap-2">
                        <Award className="size-5 text-orange-500" />
                        <h3 className="font-semibold">Top Contributors</h3>
                    </div>

                    {topUsers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No contributors yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {topUsers.map((u) => (
                                <li
                                    key={u.$id}
                                    className="flex items-center justify-between gap-2 text-sm"
                                >
                                    <Link
                                        href={`/users/${u.$id}/${slugify(u.name)}`}
                                        className="truncate font-medium hover:text-orange-500 hover:underline"
                                    >
                                        {u.name}
                                    </Link>
                                    <span className="shrink-0 rounded bg-orange-500/15 px-2 py-0.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
                                        {u.reputation} rep
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </aside>
        </div>
    );
}

export default function HomePage() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <section className="mb-8 rounded-2xl border border-border bg-gradient-to-br from-orange-500/10 via-card to-card p-6 sm:mb-10 sm:p-10">
                <div className="max-w-2xl space-y-4">
                    <span className="inline-block rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-500">
                        Developer Q&amp;A powered by Appwrite
                    </span>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
                        Every developer has a tab open to{" "}
                        <span className="text-orange-500">StackFlow</span>
                    </h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Ask tough engineering questions, share verified solutions, vote on the
                        best answers, and grow your community reputation.
                    </p>
                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
                        <Link href="/questions/ask" className="w-full sm:w-auto">
                            <Button className="w-full gap-2 sm:w-auto">
                                <MessageSquarePlus className="size-4" />
                                Ask a Question
                            </Button>
                        </Link>
                        <Link href="/questions" className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:w-auto">
                                Browse Questions
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <Suspense
                fallback={
                    <div className="space-y-4">
                        <div className="h-28 animate-pulse rounded-xl bg-muted" />
                        <div className="h-28 animate-pulse rounded-xl bg-muted" />
                        <div className="h-28 animate-pulse rounded-xl bg-muted" />
                    </div>
                }
            >
                <HomeFeed />
            </Suspense>
        </div>
    );
}
