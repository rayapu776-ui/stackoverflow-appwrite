import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";

export const metadata: Metadata = {
    title: "User Not Found",
    description: "The requested contributor profile could not be found.",
};

export default function UserNotFound() {
    return (
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-500">
                <UserX className="size-8" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
                404 — User Not Found
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Contributor profile not found
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                The user profile you are looking for does not exist or has been removed.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link href="/" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto">Return Home</Button>
                </Link>
                <Link href="/questions" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto">
                        Browse Questions
                    </Button>
                </Link>
            </div>
        </div>
    );
}
