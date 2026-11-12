"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/Auth";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flame, LogOut, Menu, Plus, Search, User as UserIcon, X } from "lucide-react";

export default function Navbar() {
    const { user, session, hydrated, verifySession, logout } = useAuthStore();
    const router = useRouter();
    const [search, setSearch] = React.useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    React.useEffect(() => {
        if (hydrated) {
            verifySession();
        }
    }, [hydrated, verifySession]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmed = search.trim();
        setMobileMenuOpen(false);
        if (trimmed) {
            router.push(`/questions?search=${encodeURIComponent(trimmed)}`);
        } else {
            router.push("/questions");
        }
    };

    const handleLogout = async () => {
        await logout();
        setMobileMenuOpen(false);
        router.push("/");
        router.refresh();
    };

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:gap-5 lg:px-8">
                <div className="flex shrink-0 items-center gap-4 lg:gap-7">
                    <Link
                        href="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 font-bold tracking-tight transition-opacity hover:opacity-90"
                    >
                        <span className="flex size-10 items-center justify-center rounded-xl bg-orange-500 text-white">
                            <Flame className="size-6" />
                        </span>
                        <span className="text-xl sm:text-2xl">
                            Stack<span className="text-orange-500">Flow</span>
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-5 text-base font-medium md:flex">
                        <Link
                            href="/questions"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Questions
                        </Link>
                    </nav>
                </div>

                <form onSubmit={handleSearch} className="hidden max-w-md flex-1 md:block">
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search topics, tags, or questions..."
                            className="h-11 pl-10 text-base md:text-base"
                        />
                    </div>
                </form>

                <div className="hidden shrink-0 items-center gap-2 lg:gap-3 md:flex">
                    <Link href="/questions/ask">
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-10 gap-1.5 px-3.5 text-[0.95rem] lg:px-4 lg:text-base"
                        >
                            <Plus className="size-[18px]" />
                            Ask Question
                        </Button>
                    </Link>

                    {session && user ? (
                        <>
                            <Link
                                href={`/users/${user.$id}/${slugify(user.name)}`}
                                className="flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-[0.95rem] font-medium transition-colors hover:bg-muted lg:text-base"
                            >
                                <UserIcon className="size-[18px] text-orange-500" />
                                <span className="max-w-28 truncate">{user.name}</span>
                                <span className="rounded bg-orange-500/15 px-2 py-0.5 text-xs font-semibold text-orange-600 dark:text-orange-400 lg:text-sm">
                                    {user.prefs?.reputation ?? 0}
                                </span>
                            </Link>
                            <Button
                                size="lg"
                                variant="ghost"
                                onClick={handleLogout}
                                title="Log out"
                                className="h-10 gap-1.5 px-3 text-[0.95rem] lg:px-3.5 lg:text-base"
                            >
                                <LogOut className="size-[18px]" />
                                <span>Logout</span>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button
                                    size="lg"
                                    variant="ghost"
                                    className="h-10 px-3 text-[0.95rem] lg:px-4 lg:text-base"
                                >
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button
                                    size="lg"
                                    className="h-10 px-3.5 text-[0.95rem] lg:px-4 lg:text-base"
                                >
                                    Sign up
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2 md:hidden">
                    <Link href="/questions/ask" onClick={() => setMobileMenuOpen(false)}>
                        <Button size="lg" variant="outline" className="h-10 gap-1.5 px-3 text-base">
                            <Plus className="size-[18px]" />
                            Ask
                        </Button>
                    </Link>
                    <Button
                        type="button"
                        size="icon-lg"
                        variant="ghost"
                        className="size-10"
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                        aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                    </Button>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="border-t border-border bg-background px-4 py-4 md:hidden">
                    <form onSubmit={handleSearch} className="mb-4">
                        <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search topics, tags, or questions..."
                                className="h-11 pl-10 text-base"
                            />
                        </div>
                    </form>

                    <div className="flex flex-col gap-2">
                        <Link
                            href="/questions"
                            onClick={() => setMobileMenuOpen(false)}
                            className="rounded-lg px-3.5 py-2.5 text-base font-medium hover:bg-muted"
                        >
                            All Questions
                        </Link>
                        <Link
                            href="/questions/ask"
                            onClick={() => setMobileMenuOpen(false)}
                            className="rounded-lg px-3.5 py-2.5 text-base font-medium hover:bg-muted"
                        >
                            Ask a Question
                        </Link>

                        {session && user ? (
                            <>
                                <Link
                                    href={`/users/${user.$id}/${slugify(user.name)}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2.5 text-base font-medium hover:bg-muted"
                                >
                                    <span className="flex items-center gap-2 truncate">
                                        <UserIcon className="size-[18px] text-orange-500" />
                                        {user.name}
                                    </span>
                                    <span className="rounded bg-orange-500/15 px-2 py-0.5 text-sm font-semibold text-orange-600 dark:text-orange-400">
                                        {user.prefs?.reputation ?? 0} rep
                                    </span>
                                </Link>
                                <Button
                                    type="button"
                                    size="lg"
                                    variant="ghost"
                                    onClick={handleLogout}
                                    className="h-11 justify-start gap-2 text-base text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <LogOut className="size-[18px]" />
                                    Log out
                                </Button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <Button size="lg" variant="outline" className="h-11 w-full text-base">
                                        Log in
                                    </Button>
                                </Link>
                                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                    <Button size="lg" className="h-11 w-full text-base">
                                        Sign up
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
