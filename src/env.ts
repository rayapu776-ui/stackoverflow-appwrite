const env = {
    appwrite : {
        endpoint :(process.env.NEXT-PUBLIC_APPWRITE_HOST_URL),
        projectId : (process.env.NEXT-PUBLIC_APPWRITE_PROJECT_ID),
        apikey : (process.env.APPWRITE_API_KEY)
    }
}

export default env