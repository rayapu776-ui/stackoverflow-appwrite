import React, { Suspense } from "react";
import type { Metadata } from "next";
import UserProfileView from "@/components/UserProfileView";
import { getUserProfile } from "@/lib/queries";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ userId: string }>;
}): Promise<Metadata> {
    const { userId } = await params;
    const profile = await getUserProfile(userId);

    if (!profile) {
        return {
            title: "User Not Found",
            description: "The requested contributor profile could not be found on StackFlow.",
        };
    }

    return {
        title: `${profile.user.name} — Profile`,
        description: `View ${profile.user.name}'s questions, answers, and ${profile.user.reputation} reputation on StackFlow.`,
    };
}

async function UserProfileLoader({
    paramsPromise,
}: {
    paramsPromise: Promise<{ userId: string }>;
}) {
    const { userId } = await paramsPromise;
    return <UserProfileView userId={userId} />;
}

export default function UserProfilePage({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    return (
        <Suspense
            fallback={
                <div className="mx-auto max-w-5xl space-y-4 px-4 py-10">
                    <div className="h-32 animate-pulse rounded-2xl bg-muted" />
                    <div className="h-40 animate-pulse rounded-xl bg-muted" />
                </div>
            }
        >
            <UserProfileLoader paramsPromise={params} />
        </Suspense>
    );
}
