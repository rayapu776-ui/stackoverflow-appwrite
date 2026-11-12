import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { AppwriteException, ID, Models } from "appwrite";
import { account } from "@/models/client/config";

export interface UserPrefs extends Models.Preferences {
    reputation: number;
}

interface IAuthStore {
    session: Models.Session | null;
    jwt: string | null;
    user: Models.User<UserPrefs> | null;
    hydrated: boolean;

    setHydrated(): void;
    verifySession(): Promise<void>;
    login(
        email: string,
        password: string
    ): Promise<{
        success: boolean;
        error?: AppwriteException | null;
    }>;
    createAccount(
        name: string,
        email: string,
        password: string
    ): Promise<{
        success: boolean;
        error?: AppwriteException | null;
    }>;
    logout(): Promise<void>;
}

export const useAuthStore = create<IAuthStore>()(
    persist(
        immer((set) => ({
            session: null,
            jwt: null,
            user: null,
            hydrated: false,

            setHydrated() {
                set({ hydrated: true });
            },

            async verifySession() {
                try {
                    const session = await account.getSession("current");
                    const user = await account.get<UserPrefs>();
                    set({ session, user });
                } catch {
                    set({ session: null, user: null, jwt: null });
                }
            },

            async login(email: string, password: string) {
                try {
                    const session = await account.createEmailPasswordSession(email, password);
                    const [user, { jwt }] = await Promise.all([
                        account.get<UserPrefs>(),
                        account.createJWT(),
                    ]);
                    set({ session, user, jwt });
                    return { success: true };
                } catch (error) {
                    return {
                        success: false,
                        error: error as AppwriteException,
                    };
                }
            },

            async createAccount(name: string, email: string, password: string) {
                try {
                    await account.create(ID.unique(), email, password, name);
                    const session = await account.createEmailPasswordSession(email, password);
                    await account.updatePrefs({ reputation: 0 });
                    const [user, { jwt }] = await Promise.all([
                        account.get<UserPrefs>(),
                        account.createJWT(),
                    ]);
                    set({ session, user, jwt });
                    return { success: true };
                } catch (error) {
                    return {
                        success: false,
                        error: error as AppwriteException,
                    };
                }
            },

            async logout() {
                try {
                    await account.deleteSession("current");
                    set({ session: null, user: null, jwt: null });
                } catch (error) {
                    console.error("Error logging out:", error);
                }
            },
        })),
        {
            name: "auth",
            onRehydrateStorage() {
                return (state, error) => {
                    if (!error) {
                        state?.setHydrated();
                    }
                };
            },
        }
    )
);