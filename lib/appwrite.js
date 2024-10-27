import { Account, Avatars, Client, Databases, ID } from 'react-native-appwrite';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.wonvincal.aora',
    projectId: '67138a40001ccf2e56cc',
    databaseId: '67138d4e0003a2004dd5',
    userCollectionId: '67138d800035e3d4a9a0', 
    videoCollectionId: '67138da6001cf85e794c',
    storageId: '67149d6d00249c907b7d'
}

// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint) // Your Appwrite Endpoint
    .setProject(config.projectId) // Your project ID
    .setPlatform(config.platform) // Your application ID or bundle ID.
;

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export async function cleanSession() {
    try {
        const session = await account.getSession('current');
        if (session) {
            await account.deleteSession('current');
            console.log('Deleted current session');
        }
    } catch (error) {
        // do nothing
    }    
} 

export const createUser = async (email, password, username) => {
    try {
        const newAccount = await account.create(
            ID.unique(), 
            email, 
            password, 
            username)

        if (!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username);

        await signIn(email, password);

        console.log("signed in");
        const newUser = await databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(), 
            {
                accountId: newAccount.$id,
                email: email,
                username: username,
                avatar: avatarUrl
            }
        );

        console.log("created new user");
        return newUser;
     } catch (error) {
        throw new Error(error);
    }
}

export async function signIn(email, password) {
    try {
        await cleanSession();
        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (error) {
        console.log("Something is wrong with createEmailPasswordSession: " + email);
        console.log(error);
        throw new Error(error);
    }
}
export const getCurrentUser = async() => {
    try {
        const currentAccount = await account.get();

        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if (!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
    }
}

