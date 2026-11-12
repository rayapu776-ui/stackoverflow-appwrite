import React, { Suspense } from "react";
import type { Metadata } from "next";
import QuestionDetailView from "@/components/QuestionDetailView";
import { getQuestionDetail } from "@/lib/queries";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ quesId: string }>;
}): Promise<Metadata> {
    const { quesId } = await params;
    const question = await getQuestionDetail(quesId);

    if (!question) {
        return {
            title: "Question Not Found",
            description: "The requested question could not be found on StackFlow.",
        };
    }

    return {
        title: question.title,
        description: question.content.slice(0, 155),
    };
}

async function QuestionDetailLoader({
    paramsPromise,
}: {
    paramsPromise: Promise<{ quesId: string }>;
}) {
    const { quesId } = await paramsPromise;
    return <QuestionDetailView quesId={quesId} />;
}

export default function QuestionPage({
    params,
}: {
    params: Promise<{ quesId: string }>;
}) {
    return (
        <Suspense
            fallback={
                <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
                    <div className="h-10 w-3/4 animate-pulse rounded-lg bg-muted" />
                    <div className="h-40 animate-pulse rounded-xl bg-muted" />
                </div>
            }
        >
            <QuestionDetailLoader paramsPromise={params} />
        </Suspense>
    );
}
