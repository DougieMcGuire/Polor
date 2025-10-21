// Utility managers
const LoadingManager = {
    show: function(text = 'Loading...') {
        const loadingScreen = document.getElementById('loading-screen');
        const loadingText = document.getElementById('loading-text');
        if (loadingText) loadingText.textContent = text;
        if (loadingScreen) loadingScreen.style.display = 'flex';
    },
    hide: function() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) loadingScreen.style.display = 'none';
    }
};

const NotificationManager = {
    show: function(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
};

const StorageManager = {
    get: function(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error getting from storage:', error);
            return null;
        }
    },
    
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error setting storage:', error);
            return false;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from storage:', error);
            return false;
        }
    }
};

const ErrorHandler = {
    handle: function(error, context = 'Unknown') {
        console.error(`Error in ${context}:`, error);
        
        // Show user-friendly error message
        const message = this.getUserFriendlyMessage(error);
        NotificationManager.show(message, 'error');
    },
    
    getUserFriendlyMessage: function(error) {
        if (error.code === 'auth/user-not-found') {
            return 'User not found. Please check your credentials.';
        } else if (error.code === 'auth/wrong-password') {
            return 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/email-already-in-use') {
            return 'This email is already registered.';
        } else if (error.code === 'auth/weak-password') {
            return 'Password is too weak. Please choose a stronger password.';
        } else if (error.code === 'auth/network-request-failed') {
            return 'Network error. Please check your connection.';
        } else {
            return 'An unexpected error occurred. Please try again.';
        }
    }
};

// Global Firebase variables
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDatabase = null;

// Initialize Firebase
function initializeFirebase() {
    try {
        if (!firebaseApp) {
            firebaseApp = firebase.initializeApp(CONFIG.firebase);
            firebaseAuth = firebase.auth();
            firebaseDatabase = firebase.database();
            console.log('Firebase initialized successfully');
        }
        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        return false;
    }
}
