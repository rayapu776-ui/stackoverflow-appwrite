import type { Metadata } from "next";
import AskQuestionForm from "@/components/AskQuestionForm";

export const metadata: Metadata = {
    title: "Ask a Question",
    description: "Post a technical question with tags and optional image attachments on StackFlow.",
};

export default function AskQuestionPage() {
    return <AskQuestionForm />;
}
