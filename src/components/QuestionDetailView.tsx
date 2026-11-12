import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuestionDetail } from "@/lib/queries";
import { storage } from "@/models/client/config";
import { questionAttachmentBucket } from "@/models/name";
import { convertDateToRelativeTime, slugify } from "@/lib/utils";
import VoteButtons from "@/components/VoteButtons";
import Comments from "@/components/Comments";
import {
    AnswerForm,
    DeleteAnswerButton,
    DeleteQuestionButton,
} from "@/components/QuestionActions";

export default async function QuestionDetailView({ quesId }: { quesId: string }) {
    const question = await getQuestionDetail(quesId);

    if (!question) {
        notFound();
    }

    const attachmentUrl = question.attachmentId
        ? storage.getFileView(questionAttachmentBucket, question.attachmentId)
        : null;

    return (
        <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <div className="border-b border-border pb-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
                        {question.title}
                    </h1>
                    <DeleteQuestionButton
                        questionId={question.$id}
                        authorId={question.authorId}
                    />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span>Asked {convertDateToRelativeTime(question.$createdAt)}</span>
                    <span>
                        {question.answers.length}{" "}
                        {question.answers.length === 1 ? "answer" : "answers"}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
                <VoteButtons
                    type="question"
                    id={question.$id}
                    initialVoteResult={question.voteResult}
                />

                <div className="min-w-0 flex-1 space-y-5">
                    <div className="break-words whitespace-pre-wrap text-sm leading-relaxed text-foreground sm:text-base">
                        {question.content}
                    </div>

                    {attachmentUrl && (
                        <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={attachmentUrl}
                                alt={question.title}
                                className="max-h-96 w-full object-contain"
                            />
                        </div>
                    )}

                    <div className="flex flex-col justify-between gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
                        <div className="flex flex-wrap gap-1.5">
                            {question.tags.map((tag) => (
                                <Link
                                    key={tag}
                                    href={`/questions?tag=${encodeURIComponent(tag)}`}
                                    className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-orange-500/15 hover:text-orange-500"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>

                        <div className="w-fit rounded-lg border border-border bg-card px-3 py-2 text-xs">
                            <span className="text-muted-foreground">Asked by </span>
                            <Link
                                href={`/users/${question.authorId}/${slugify(question.authorName)}`}
                                className="font-semibold text-orange-500 hover:underline"
                            >
                                {question.authorName}
                            </Link>
                            <span className="ml-2 rounded bg-muted px-1.5 py-0.5 font-semibold">
                                {question.authorReputation} rep
                            </span>
                        </div>
                    </div>

                    <Comments
                        type="question"
                        typeId={question.$id}
                        initialComments={question.comments}
                    />
                </div>
            </div>

            <section className="space-y-6 border-t border-border pt-8">
                <h2 className="text-xl font-bold">
                    {question.answers.length}{" "}
                    {question.answers.length === 1 ? "Answer" : "Answers"}
                </h2>

                {question.answers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No answers yet. Be the first to respond!
                    </p>
                ) : (
                    <div className="space-y-6">
                        {question.answers.map((ans) => (
                            <div
                                key={ans.$id}
                                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:gap-5 sm:p-5"
                            >
                                <VoteButtons
                                    type="answer"
                                    id={ans.$id}
                                    initialVoteResult={ans.voteResult}
                                />

                                <div className="min-w-0 flex-1 space-y-4">
                                    <div className="break-words whitespace-pre-wrap text-sm leading-relaxed">
                                        {ans.content}
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                                        <DeleteAnswerButton
                                            answerId={ans.$id}
                                            authorId={ans.authorId}
                                        />

                                        <div className="sm:ml-auto">
                                            <span>
                                                Answered{" "}
                                                {convertDateToRelativeTime(ans.$createdAt)} by{" "}
                                            </span>
                                            <Link
                                                href={`/users/${ans.authorId}/${slugify(ans.authorName)}`}
                                                className="font-semibold text-orange-500 hover:underline"
                                            >
                                                {ans.authorName}
                                            </Link>
                                            <span className="ml-2 rounded bg-muted px-1.5 py-0.5 font-semibold text-foreground">
                                                {ans.authorReputation} rep
                                            </span>
                                        </div>
                                    </div>

                                    <Comments
                                        type="answer"
                                        typeId={ans.$id}
                                        initialComments={ans.comments}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <AnswerForm questionId={question.$id} />
            </section>
        </div>
    );
}
