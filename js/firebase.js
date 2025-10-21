// Firebase Manager
class FirebaseManager {
    constructor() {
        this.app = null;
        this.auth = null;
        this.database = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            if (!this.initialized) {
                this.app = firebase.initializeApp(CONFIG.firebase);
                this.auth = firebase.auth();
                this.database = firebase.database();
                this.initialized = true;
                console.log('Firebase Manager initialized successfully');
            }
            return true;
        } catch (error) {
            console.error('Firebase Manager initialization error:', error);
            return false;
        }
    }

    // Auth methods
    async signInWithGoogle() {
        if (!this.initialized) await this.initialize();
        
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            const result = await this.auth.signInWithPopup(provider);
            return result.user;
        } catch (error) {
            console.error('Google sign-in error:', error);
            throw error;
        }
    }

    async signOut() {
        if (!this.initialized) await this.initialize();
        
        try {
            await this.auth.signOut();
            return true;
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }

    onAuthStateChanged(callback) {
        if (!this.initialized) {
            this.initialize().then(() => {
                this.auth.onAuthStateChanged(callback);
            });
        } else {
            this.auth.onAuthStateChanged(callback);
        }
    }

    getCurrentUser() {
        return this.auth ? this.auth.currentUser : null;
    }

    // Database methods
    async saveUserData(userId, data) {
        if (!this.initialized) await this.initialize();
        
        try {
            const userRef = this.database.ref(`users/${userId}`);
            await userRef.set(data);
            return true;
        } catch (error) {
            console.error('Error saving user data:', error);
            throw error;
        }
    }

    async getUserData(userId) {
        if (!this.initialized) await this.initialize();
        
        try {
            const userRef = this.database.ref(`users/${userId}`);
            const snapshot = await userRef.once('value');
            return snapshot.val();
        } catch (error) {
            console.error('Error getting user data:', error);
            throw error;
        }
    }

    async updateUserData(userId, data) {
        if (!this.initialized) await this.initialize();
        
        try {
            const userRef = this.database.ref(`users/${userId}`);
            await userRef.update(data);
            return true;
        } catch (error) {
            console.error('Error updating user data:', error);
            throw error;
        }
    }

    async saveAvatar(userId, avatarData) {
        if (!this.initialized) await this.initialize();
        
        try {
            const userRef = this.database.ref(`users/${userId}`);
            await userRef.update({
                avatar: avatarData,
                avatarUpdated: Date.now()
            });
            return true;
        } catch (error) {
            console.error('Error saving avatar:', error);
            throw error;
        }
    }

    async getAvatar(userId) {
        if (!this.initialized) await this.initialize();
        
        try {
            const userRef = this.database.ref(`users/${userId}`);
            const snapshot = await userRef.once('value');
            const userData = snapshot.val();
            return userData ? userData.avatar : null;
        } catch (error) {
            console.error('Error getting avatar:', error);
            throw error;
        }
    }
}

// Create global instance
const firebaseManager = new FirebaseManager();
