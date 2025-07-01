/**
 * Polor Avatar Module
 * Easy access to user avatars without dealing with Firebase directly
 */

class Avatar {
    constructor() {
        this.firebaseConfig = {
            apiKey: "AIzaSyA8HcTDiCQtJHRiMES2p1iUlA30AkZPx1Y",
            authDomain: "polor-62c29.firebaseapp.com",
            databaseURL: "https://polor-62c29-default-rtdb.firebaseio.com",
            projectId: "polor-62c29",
            storageBucket: "polor-62c29.firebasestorage.app",
            messagingSenderId: "232986823513",
            appId: "1:232986823513:web:a6ee6bef6b0609ace3da48",
            measurementId: "G-KRT42D5TQK"
        };
        
        this.auth = null;
        this.firestore = null;
        this.currentUser = null;
        this.isReady = false;
        
        this.init();
    }
    
    // Initialize Firebase
    async init() {
        try {
            if (!window.firebase) {
                console.error('Firebase SDK not loaded. Please include Firebase scripts before avatar.js');
                return;
            }
            
            firebase.initializeApp(this.firebaseConfig);
            this.auth = firebase.auth();
            this.firestore = firebase.firestore();
            
            // Listen for auth changes
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                this.isReady = true;
            });
            
        } catch (error) {
            console.error('Failed to initialize Avatar module:', error);
        }
    }
    
    // Wait for module to be ready
    async waitForReady() {
        while (!this.isReady) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    // Get current user's avatar
    async getMyAvatar() {
        await this.waitForReady();
        
        if (!this.currentUser) {
            throw new Error('User not signed in');
        }
        
        try {
            const doc = await this.firestore.collection('users').doc(this.currentUser.uid).get();
            if (doc.exists) {
                const data = doc.data();
                return {
                    image: data.avatarIMG || null,           // WebP base64 image
                    url: data.avatarURL || null,             // Editor URL with parameters
                    imageUrl: data.avatarURL ? data.avatarURL + '&I=1' : null  // Direct image URL
                };
            }
            return null;
        } catch (error) {
            console.error('Failed to get avatar:', error);
            return null;
        }
    }
    
    // Get any user's avatar by UID
    async getUserAvatar(uid) {
        await this.waitForReady();
        
        try {
            const doc = await this.firestore.collection('users').doc(uid).get();
            if (doc.exists) {
                const data = doc.data();
                return {
                    image: data.avatarIMG || null,
                    url: data.avatarURL || null,
                    imageUrl: data.avatarURL ? data.avatarURL + '&I=1' : null,
                    username: data.username || 'User'
                };
            }
            return null;
        } catch (error) {
            console.error('Failed to get user avatar:', error);
            return null;
        }
    }
    
    // Get current user info
    async getMyProfile() {
        await this.waitForReady();
        
        if (!this.currentUser) {
            return null;
        }
        
        try {
            const doc = await this.firestore.collection('users').doc(this.currentUser.uid).get();
            if (doc.exists) {
                return {
                    uid: this.currentUser.uid,
                    email: this.currentUser.email,
                    ...doc.data()
                };
            }
            return null;
        } catch (error) {
            console.error('Failed to get profile:', error);
            return null;
        }
    }
    
    // Check if user is signed in
    isSignedIn() {
        return !!this.currentUser;
    }
    
    // Get current user UID
    getUserId() {
        return this.currentUser?.uid || null;
    }
    
    // Helper: Display avatar in element
    async displayMyAvatar(elementId, size = '200px') {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element with id '${elementId}' not found`);
            return;
        }
        
        const avatar = await this.getMyAvatar();
        if (avatar) {
            const imageUrl = avatar.image || avatar.imageUrl;
            if (imageUrl) {
                element.innerHTML = `<img src="${imageUrl}" alt="Avatar" style="width: ${size}; height: ${size}; border-radius: 50%; object-fit: cover;">`;
            } else {
                element.innerHTML = `<div style="width: ${size}; height: ${size}; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #999;">🎨</div>`;
            }
        } else {
            element.innerHTML = `<div style="width: ${size}; height: ${size}; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #999;">👤</div>`;
        }
    }
    
    // Helper: Display any user's avatar
    async displayUserAvatar(elementId, uid, size = '200px') {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element with id '${elementId}' not found`);
            return;
        }
        
        const avatar = await this.getUserAvatar(uid);
        if (avatar) {
            const imageUrl = avatar.image || avatar.imageUrl;
            if (imageUrl) {
                element.innerHTML = `<img src="${imageUrl}" alt="Avatar" style="width: ${size}; height: ${size}; border-radius: 50%; object-fit: cover;">`;
            } else {
                element.innerHTML = `<div style="width: ${size}; height: ${size}; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #999;">🎨</div>`;
            }
        } else {
            element.innerHTML = `<div style="width: ${size}; height: ${size}; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #999;">👤</div>`;
        }
    }
    
    // Get edit URL for current user's avatar
    async getEditURL() {
        const avatar = await this.getMyAvatar();
        return avatar?.url || 'https://polor.org/Avatars/';
    }
}

// Create global instance
window.Avatar = new Avatar();
