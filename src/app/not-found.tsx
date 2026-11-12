import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, Search } from "lucide-react";

export const metadata: Metadata = {
    title: "Page Not Found",
    description: "The page you are looking for could not be found on StackFlow.",
};

export default function NotFound() {
    return (
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-500">
                <FileQuestion className="size-8" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
                404 Error
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Page not found
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                The page you requested does not exist or may have been moved. Try browsing
                recent questions or returning home.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link href="/" className="w-full sm:w-auto">
                    <Button className="w-full gap-2 sm:w-auto">
                        <Home className="size-4" />
                        Back to Home
                    </Button>
                </Link>
                <Link href="/questions" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full gap-2 sm:w-auto">
                        <Search className="size-4" />
                        Browse Questions
                    </Button>
                </Link>
            </div>
        </div>
    );
}
