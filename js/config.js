// Firebase Configuration Manager
// This file handles environment-based configuration loading

class ConfigManager {
    constructor() {
        this.config = null;
        this.isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    }

    // Load configuration from environment or fallback
    async loadConfig() {
        try {
            // In development, try to load from .env file (if available)
            if (!this.isProduction) {
                // For local development, you would typically use a build tool
                // that injects environment variables. For now, we'll use a fallback.
                this.config = this.getDefaultConfig();
            } else {
                // In production, load from environment variables or secure config
                this.config = this.getProductionConfig();
            }

            return this.config;
        } catch (error) {
            console.error('Failed to load Firebase config:', error);
            throw new Error('Configuration loading failed');
        }
    }

    // Development/fallback configuration
    getDefaultConfig() {
        // IMPORTANT: Replace these with your actual Firebase config
        // In production, use environment variables or secure config management
        return {
            apiKey: "AIzaSyCy0MtChGF4le6McTnk9jis6dPNsK_YI4c",
            authDomain: "company-reg-demo.firebaseapp.com",
            projectId: "company-reg-demo",
            storageBucket: "company-reg-demo.appspot.com",
            messagingSenderId: "349352725791",
            appId: "1:349352725791:web:4f52312d738b9e8a0e742a",
            measurementId: "G-7ES5ZEY9WD"
        };
    }

    // Production configuration (load from environment variables)
    getProductionConfig() {
        // In production, these should come from secure environment variables
        return {
            apiKey: process.env.FIREBASE_API_KEY || window.ENV?.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN || window.ENV?.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID || window.ENV?.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || window.ENV?.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || window.ENV?.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID || window.ENV?.FIREBASE_APP_ID,
            measurementId: process.env.FIREBASE_MEASUREMENT_ID || window.ENV?.FIREBASE_MEASUREMENT_ID
        };
    }

    // Validate configuration
    validateConfig(config) {
        const requiredFields = [
            'apiKey', 'authDomain', 'projectId', 
            'storageBucket', 'messagingSenderId', 'appId'
        ];

        for (const field of requiredFields) {
            if (!config[field]) {
                throw new Error(`Missing required Firebase config field: ${field}`);
            }
        }

        return true;
    }

    // Get current configuration
    getConfig() {
        if (!this.config) {
            throw new Error('Configuration not loaded. Call loadConfig() first.');
        }
        return this.config;
    }
}

// Initialize Firebase with proper error handling
class FirebaseInitializer {
    constructor() {
        this.app = null;
        this.db = null;
        this.auth = null;
        this.configManager = new ConfigManager();
    }

    async initialize() {
        try {
            // Load configuration
            const config = await this.configManager.loadConfig();
            this.configManager.validateConfig(config);

            // Import Firebase modules
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
            const { getFirestore, connectFirestoreEmulator } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
            const { getAuth, connectAuthEmulator } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');

            // Initialize Firebase
            this.app = initializeApp(config);
            this.db = getFirestore(this.app);
            this.auth = getAuth(this.app);

            // Connect to emulators in development
            if (!this.configManager.isProduction && !this._emulatorsConnected) {
                try {
                    connectFirestoreEmulator(this.db, 'localhost', 8080);
                    connectAuthEmulator(this.auth, 'http://localhost:9099');
                    this._emulatorsConnected = true;
                    console.log('Connected to Firebase emulators');
                } catch (error) {
                    console.log('Firebase emulators not available, using production');
                }
            }

            console.log('Firebase initialized successfully');
            return { app: this.app, db: this.db, auth: this.auth };

        } catch (error) {
            console.error('Firebase initialization failed:', error);
            throw error;
        }
    }

    // Get initialized services
    getServices() {
        if (!this.app || !this.db) {
            throw new Error('Firebase not initialized. Call initialize() first.');
        }
        return { app: this.app, db: this.db, auth: this.auth };
    }
}

// Utility functions for common Firebase operations
class FirebaseUtils {
    static formatFirebaseError(error) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'permission-denied': 'You do not have permission to perform this action.',
            'unavailable': 'Service is currently unavailable. Please try again later.',
            'deadline-exceeded': 'Request timeout. Please try again.',
        };

        const code = error.code || error.message;
        return errorMessages[code] || error.message || 'An unexpected error occurred.';
    }

    static showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} show`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 4px; height: 24px; background: var(--${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'accent'}); border-radius: 2px;"></div>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    static formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        
        if (timestamp.toDate) {
            return timestamp.toDate().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input.trim().replace(/[<>]/g, '');
    }
}

// Global Firebase instance
let firebaseInstance = null;

// Initialize Firebase and make it globally available
async function initializeFirebase() {
    if (firebaseInstance) {
        return firebaseInstance.getServices();
    }

    try {
        firebaseInstance = new FirebaseInitializer();
        return await firebaseInstance.initialize();
    } catch (error) {
        console.error('Global Firebase initialization failed:', error);
        FirebaseUtils.showToast('Failed to connect to database. Please refresh the page.', 'error');
        throw error;
    }
}

// Export for use in other modules
window.FirebaseUtils = FirebaseUtils;
window.initializeFirebase = initializeFirebase;

// Auto-initialize Firebase when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase().catch(error => {
        console.error('Auto-initialization failed:', error);
    });
});

console.log('Firebase configuration module loaded');