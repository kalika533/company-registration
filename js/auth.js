// auth.js - Firebase Authentication Module
import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  sendPasswordResetEmail,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  updateEmail,
  updatePassword,
  deleteUser,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
 apiKey: "AIzaSyCy0MtChGF4le6McTnk9jis6dPNsK_YI4c",
            authDomain: "company-reg-demo.firebaseapp.com",
            projectId: "company-reg-demo",
            storageBucket: "company-reg-demo.appspot.com",
            messagingSenderId: "349352725791",
            appId: "1:349352725791:web:4f52312d738b9e8a0e742a",
            measurementId: "G-7ES5ZEY9WD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Authentication state management
let currentUser = null;
let authStateListeners = [];

// Subscribe to authentication state changes
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  
  // Notify all listeners
  authStateListeners.forEach(listener => {
    try {
      listener(user);
    } catch (error) {
      console.error("Error in auth state listener:", error);
    }
  });
});

// Authentication functions
export const Auth = {
  // Get current user
  getCurrentUser: () => currentUser,
  
  // Check if user is logged in
  isLoggedIn: () => !!currentUser,
  
  // Check if email is verified
  isEmailVerified: () => currentUser && currentUser.emailVerified,
  
  // Register new user
  register: async (email, password, displayName = null) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name if provided
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      return { 
        success: true, 
        user: userCredential.user,
        message: "Registration successful. Please check your email for verification."
      };
    } catch (error) {
      let message = "Registration failed. Please try again.";
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = "This email is already registered.";
          break;
        case 'auth/invalid-email':
          message = "Invalid email address.";
          break;
        case 'auth/operation-not-allowed':
          message = "Email/password accounts are not enabled.";
          break;
        case 'auth/weak-password':
          message = "Password is too weak.";
          break;
      }
      
      return { success: false, error: error.code, message };
    }
  },
  
  // Login user
  login: async (email, password, rememberMe = false) => {
    try {
      // Set persistence based on remember me selection
      await setPersistence(
        auth, 
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      return { 
        success: true, 
        user: userCredential.user,
        message: "Login successful."
      };
    } catch (error) {
      let message = "Login failed. Please try again.";
      
      switch (error.code) {
        case 'auth/invalid-email':
          message = "Invalid email address.";
          break;
        case 'auth/user-disabled':
          message = "This account has been disabled.";
          break;
        case 'auth/user-not-found':
          message = "No account found with this email.";
          break;
        case 'auth/wrong-password':
          message = "Incorrect password.";
          break;
        case 'auth/too-many-requests':
          message = "Too many failed attempts. Please try again later.";
          break;
      }
      
      return { success: false, error: error.code, message };
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      await signOut(auth);
      return { success: true, message: "Logged out successfully." };
    } catch (error) {
      return { 
        success: false, 
        error: error.code, 
        message: "Logout failed. Please try again." 
      };
    }
  },
  
  // Send password reset email
  sendPasswordReset: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { 
        success: true, 
        message: "Password reset email sent. Please check your inbox." 
      };
    } catch (error) {
      let message = "Failed to send password reset email.";
      
      switch (error.code) {
        case 'auth/user-not-found':
          message = "No account found with this email.";
          break;
        case 'auth/invalid-email':
          message = "Invalid email address.";
          break;
      }
      
      return { success: false, error: error.code, message };
    }
  },
  
  // Update user profile
  updateProfile: async (updates) => {
    try {
      if (!currentUser) {
        return { success: false, message: "No user is currently logged in." };
      }
      
      await updateProfile(currentUser, updates);
      return { success: true, message: "Profile updated successfully." };
    } catch (error) {
      return { 
        success: false, 
        error: error.code, 
        message: "Failed to update profile." 
      };
    }
  },
  
  // Update user email
  updateEmail: async (newEmail) => {
    try {
      if (!currentUser) {
        return { success: false, message: "No user is currently logged in." };
      }
      
      await updateEmail(currentUser, newEmail);
      return { 
        success: true, 
        message: "Email updated successfully. A verification email has been sent." 
      };
    } catch (error) {
      let message = "Failed to update email.";
      
      switch (error.code) {
        case 'auth/requires-recent-login':
          message = "Please log in again to update your email.";
          break;
        case 'auth/invalid-email':
          message = "Invalid email address.";
          break;
        case 'auth/email-already-in-use':
          message = "This email is already in use by another account.";
          break;
      }
      
      return { success: false, error: error.code, message };
    }
  },
  
  // Update user password
  updatePassword: async (newPassword) => {
    try {
      if (!currentUser) {
        return { success: false, message: "No user is currently logged in." };
      }
      
      await updatePassword(currentUser, newPassword);
      return { success: true, message: "Password updated successfully." };
    } catch (error) {
      let message = "Failed to update password.";
      
      switch (error.code) {
        case 'auth/requires-recent-login':
          message = "Please log in again to update your password.";
          break;
        case 'auth/weak-password':
          message = "Password is too weak.";
          break;
      }
      
      return { success: false, error: error.code, message };
    }
  },
  
  // Delete user account
  deleteAccount: async () => {
    try {
      if (!currentUser) {
        return { success: false, message: "No user is currently logged in." };
      }
      
      await deleteUser(currentUser);
      return { success: true, message: "Account deleted successfully." };
    } catch (error) {
      let message = "Failed to delete account.";
      
      if (error.code === 'auth/requires-recent-login') {
        message = "Please log in again to delete your account.";
      }
      
      return { success: false, error: error.code, message };
    }
  },
  
  // Resend email verification
  resendEmailVerification: async () => {
    try {
      if (!currentUser) {
        return { success: false, message: "No user is currently logged in." };
      }
      
      await sendEmailVerification(currentUser);
      return { 
        success: true, 
        message: "Verification email sent. Please check your inbox." 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.code, 
        message: "Failed to send verification email." 
      };
    }
  },
  
  // Add auth state change listener
  addAuthStateListener: (listener) => {
    if (typeof listener === 'function') {
      authStateListeners.push(listener);
      
      // Immediately call with current state
      try {
        listener(currentUser);
      } catch (error) {
        console.error("Error in auth state listener:", error);
      }
      
      // Return unsubscribe function
      return () => {
        authStateListeners = authStateListeners.filter(l => l !== listener);
      };
    }
  },
  
  // Remove all listeners (useful for cleanup)
  removeAllListeners: () => {
    authStateListeners = [];
  },
  
  // Get ID token (useful for API requests)
  getIdToken: async (forceRefresh = false) => {
    if (!currentUser) return null;
    
    try {
      return await currentUser.getIdToken(forceRefresh);
    } catch (error) {
      console.error("Error getting ID token:", error);
      return null;
    }
  }
};

// Utility functions for UI integration
export const AuthUI = {
  // Show toast notification
  showToast: (message, type = 'success') => {
    // Create toast element if it doesn't exist
    let toast = document.getElementById('auth-toast');
    
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'auth-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 16px 24px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
        max-width: 400px;
      `;
      document.body.appendChild(toast);
    }
    
    // Set toast content and style
    toast.textContent = message;
    toast.style.backgroundColor = type === 'success' 
      ? 'var(--success, #51CF66)' 
      : 'var(--danger, #FF6B6B)';
    
    // Show toast
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    
    // Hide after delay
    setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
    }, 5000);
  },
  
  // Toggle button loading state
  setButtonLoading: (button, isLoading) => {
    if (!button) return;
    
    if (isLoading) {
      button.setAttribute('data-original-text', button.textContent);
      button.innerHTML = `
        <span class="spinner" style="
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          display: inline-block;
          margin-right: 8px;
        "></span>
        Processing...
      `;
      button.disabled = true;
    } else {
      const originalText = button.getAttribute('data-original-text');
      if (originalText) {
        button.innerHTML = originalText;
      }
      button.disabled = false;
    }
  },
  
  // Handle auth result
  handleAuthResult: (result, successMessage = null) => {
    if (result.success) {
      AuthUI.showToast(successMessage || result.message, 'success');
      return true;
    } else {
      AuthUI.showToast(result.message, 'error');
      return false;
    }
  }
};

// Add CSS for spinner animation
if (!document.getElementById('auth-styles')) {
  const style = document.createElement('style');
  style.id = 'auth-styles';
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

// Export auth instance for direct access if needed
export { auth };