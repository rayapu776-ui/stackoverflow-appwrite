export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { default: getOrCreateDB } = await import('@/models/server/dbSetup');
        const { default: getOrCreateStorage } = await import('@/models/server/storageSetup');
        await Promise.all([
            getOrCreateDB(),
            getOrCreateStorage(),
        ]);
    }
}
