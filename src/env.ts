const env = {
    appwrite: {
        get endpoint() {
            return process.env.NEXT_PUBLIC_APPWRITE_HOST_URL ?? "";
        },
        get projectId() {
            return process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "";
        },
        get apikey() {
            return process.env.APPWRITE_API_KEY ?? "";
        },
    },
};

export default env;
