import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-jetbrains-mono",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "StackFlow — Developer Q&A Community",
        template: "%s | StackFlow",
    },
    description:
        "StackFlow is a developer Q&A platform to ask technical questions, share verified solutions, vote on answers, and build community reputation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang="en"
            className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
        >
            <body className="flex min-h-full flex-col overflow-x-hidden bg-background font-sans text-foreground">
                <Navbar />
                <main className="flex-1">{children}</main>
            </body>
        </html>
    );
}
