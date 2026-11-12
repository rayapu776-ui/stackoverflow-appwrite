import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
    title: "Sign Up",
    description:
        "Create a StackFlow account to join the developer Q&A community and earn reputation.",
};

export default function RegisterPage() {
    return <RegisterForm />;
}
