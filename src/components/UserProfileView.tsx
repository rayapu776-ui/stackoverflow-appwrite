import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserProfile } from "@/lib/queries";
import { convertDateToRelativeTime, slugify } from "@/lib/utils";
import QuestionCard from "@/components/QuestionCard";
import { Award, Calendar, MessageSquare, HelpCircle } from "lucide-react";

export default async function UserProfileView({ userId }: { userId: string }) {
    const profile = await getUserProfile(userId);

    if (!profile) {
        notFound();
    }

    const { user, questions, answers } = profile;

    return (
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:space-y-10 sm:px-6 sm:py-10 lg:px-8">
            <section className="flex flex-col justify-between gap-6 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:p-8">
                <div className="flex items-center gap-4 sm:gap-5">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-xl font-bold text-white sm:size-16 sm:text-2xl">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                            {user.name}
                        </h1>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:text-sm">
                            <span className="inline-flex items-center gap-1.5">
                                <Calendar className="size-4" />
                                Joined {convertDateToRelativeTime(user.$createdAt)}
                            </span>
                            <span className="inline-flex items-center gap-1.5 font-semibold text-orange-500">
                                <Award className="size-4" />
                                {user.reputation} reputation
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
                    <div className="rounded-xl border border-border bg-background px-4 py-3 text-center">
                        <div className="text-xl font-bold">{questions.length}</div>
                        <div className="text-xs text-muted-foreground">Questions</div>
                    </div>
                    <div className="rounded-xl border border-border bg-background px-4 py-3 text-center">
                        <div className="text-xl font-bold">{answers.length}</div>
                        <div className="text-xs text-muted-foreground">Answers</div>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <HelpCircle className="size-5 text-orange-500" />
                    <h2 className="text-xl font-bold">Questions ({questions.length})</h2>
                </div>

                {questions.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                        This user hasn&apos;t asked any questions yet.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {questions.map((q) => (
                            <QuestionCard key={q.$id} question={q} />
                        ))}
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <MessageSquare className="size-5 text-orange-500" />
                    <h2 className="text-xl font-bold">Answers ({answers.length})</h2>
                </div>

                {answers.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                        This user hasn&apos;t answered any questions yet.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {answers.map((ans) => (
                            <div
                                key={ans.$id}
                                className="rounded-xl border border-border bg-card p-4 sm:p-5"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <Link
                                        href={`/questions/${ans.questionId}/${slugify(ans.questionTitle)}`}
                                        className="break-words font-semibold text-orange-500 hover:underline"
                                    >
                                        {ans.questionTitle}
                                    </Link>
                                    <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs font-semibold">
                                        {ans.voteResult} votes
                                    </span>
                                </div>
                                <p className="mt-2 line-clamp-3 break-words text-sm text-muted-foreground">
                                    {ans.content}
                                </p>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Answered {convertDateToRelativeTime(ans.$createdAt)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
