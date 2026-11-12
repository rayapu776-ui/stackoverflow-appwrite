import Link from "next/link";
import { convertDateToRelativeTime, slugify } from "@/lib/utils";
import { MessageSquare, ThumbsUp } from "lucide-react";

export interface QuestionCardData {
    $id: string;
    $createdAt: string;
    title: string;
    content: string;
    tags: string[];
    authorId: string;
    authorName: string;
    authorReputation: number;
    totalVotes: number;
    totalAnswers: number;
}

export default function QuestionCard({ question }: { question: QuestionCardData }) {
    return (
        <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-orange-500/40 sm:flex-row sm:gap-4 sm:p-5">
            <div className="flex shrink-0 flex-wrap items-center gap-3 text-xs text-muted-foreground sm:w-28 sm:flex-col sm:items-end sm:gap-2 sm:text-right">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <ThumbsUp className="size-3.5 text-orange-500" />
                    <span>{question.totalVotes} votes</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5">
                    <MessageSquare className="size-3.5" />
                    <span>{question.totalAnswers} answers</span>
                </div>
            </div>

            <div className="min-w-0 flex-1 space-y-2.5">
                <h2 className="break-words text-base font-semibold leading-snug sm:text-lg">
                    <Link
                        href={`/questions/${question.$id}/${slugify(question.title)}`}
                        className="text-foreground transition-colors hover:text-orange-500"
                    >
                        {question.title}
                    </Link>
                </h2>

                <p className="line-clamp-2 break-words text-sm text-muted-foreground">
                    {question.content}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                    <div className="flex flex-wrap gap-1.5">
                        {question.tags?.map((tag) => (
                            <Link
                                key={tag}
                                href={`/questions?tag=${encodeURIComponent(tag)}`}
                                className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-orange-500/15 hover:text-orange-500"
                            >
                                #{tag}
                            </Link>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Link
                            href={`/users/${question.authorId}/${slugify(question.authorName)}`}
                            className="font-medium text-orange-500 hover:underline"
                        >
                            {question.authorName}
                        </Link>
                        <span className="rounded bg-muted px-1.5 py-0.5 font-semibold text-foreground">
                            {question.authorReputation}
                        </span>
                        <span>asked {convertDateToRelativeTime(question.$createdAt)}</span>
                    </div>
                </div>
            </div>
        </article>
    );
}
