"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Query } from "appwrite";
import { databases } from "@/models/client/config";
import { db, voteCollection } from "@/models/name";
import { useAuthStore } from "@/store/Auth";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
    type: "question" | "answer";
    id: string;
    initialVoteResult: number;
    className?: string;
}

export default function VoteButtons({
    type,
    id,
    initialVoteResult,
    className,
}: VoteButtonsProps) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [voteResult, setVoteResult] = React.useState(initialVoteResult);
    const [votedStatus, setVotedStatus] = React.useState<"upvoted" | "downvoted" | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [voteError, setVoteError] = React.useState("");

    React.useEffect(() => {
        let cancelled = false;
        async function fetchUserVote() {
            if (!user) {
                setVotedStatus(null);
                return;
            }
            try {
                const res = await databases.listDocuments(db, voteCollection, [
                    Query.equal("type", type),
                    Query.equal("typeId", id),
                    Query.equal("votedById", user.$id),
                    Query.limit(1),
                ]);
                if (!cancelled) {
                    const status = res.documents[0]?.voteStatus;
                    setVotedStatus(
                        status === "upvoted" || status === "downvoted" ? status : null
                    );
                }
            } catch {
                // Ignore read failure
            }
        }
        fetchUserVote();
        return () => {
            cancelled = true;
        };
    }, [type, id, user]);

    const handleVote = async (status: "upvoted" | "downvoted") => {
        if (!user) {
            router.push("/login");
            return;
        }
        if (isSubmitting) return;

        setIsSubmitting(true);
        setVoteError("");
        try {
            const response = await fetch("/api/vote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    votedById: user.$id,
                    voteStatus: status,
                    type,
                    typeId: id,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to record vote");
            }

            setVoteResult(data.data.voteResult);
            setVotedStatus(data.data.document ? status : null);
            router.refresh();
        } catch (err: unknown) {
            const e = err as { message?: string };
            setVoteError(e?.message || "Could not update vote.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={cn("flex flex-row items-center gap-2 sm:flex-col sm:gap-1", className)}>
            <button
                type="button"
                onClick={() => handleVote("upvoted")}
                disabled={isSubmitting}
                aria-label="Upvote"
                className={cn(
                    "flex size-9 items-center justify-center rounded-full border transition-colors hover:bg-orange-500/10 hover:text-orange-500 disabled:opacity-50",
                    votedStatus === "upvoted"
                        ? "border-orange-500 bg-orange-500/15 text-orange-500"
                        : "border-border text-muted-foreground"
                )}
            >
                <ChevronUp className="size-5" />
            </button>

            <span className="min-w-6 text-center text-base font-bold tabular-nums">
                {voteResult}
            </span>

            <button
                type="button"
                onClick={() => handleVote("downvoted")}
                disabled={isSubmitting}
                aria-label="Downvote"
                className={cn(
                    "flex size-9 items-center justify-center rounded-full border transition-colors hover:bg-orange-500/10 hover:text-orange-500 disabled:opacity-50",
                    votedStatus === "downvoted"
                        ? "border-orange-500 bg-orange-500/15 text-orange-500"
                        : "border-border text-muted-foreground"
                )}
            >
                <ChevronDown className="size-5" />
            </button>

            {voteError && (
                <span className="text-[11px] text-destructive" role="alert">
                    {voteError}
                </span>
            )}
        </div>
    );
}
