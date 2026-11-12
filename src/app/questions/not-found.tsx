import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { MessageSquareOff, Search } from "lucide-react";

export const metadata: Metadata = {
    title: "Question Not Found",
    description: "The requested question could not be found or was deleted.",
};

export default function QuestionNotFound() {
    return (
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-500">
                <MessageSquareOff className="size-8" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
                404 — Question Not Found
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                This question is no longer available
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                It may have been removed by its author or the link may be incorrect.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link href="/questions" className="w-full sm:w-auto">
                    <Button className="w-full gap-2 sm:w-auto">
                        <Search className="size-4" />
                        Browse All Questions
                    </Button>
                </Link>
                <Link href="/questions/ask" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto">
                        Ask a New Question
                    </Button>
                </Link>
            </div>
        </div>
    );
}
