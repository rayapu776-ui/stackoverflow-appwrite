import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
    title: "Log In",
    description: "Sign in to your StackFlow account to ask questions, answer, and vote.",
};

export default function LoginPage() {
    return <LoginForm />;
}
