// Firebase SDK (modular v10)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ Your Firebase config - Replace with your actual Firebase config
const firebaseConfig = {
apiKey: "AIzaSyCy0MtChGF4le6McTnk9jis6dPNsK_YI4c",
            authDomain: "company-reg-demo.firebaseapp.com",
            projectId: "company-reg-demo",
            storageBucket: "company-reg-demo.appspot.com",
            messagingSenderId: "349352725791",
            appId: "1:349352725791:web:4f52312d738b9e8a0e742a",
            measurementId: "G-7ES5ZEY9WD"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function
const $ = (id) => document.getElementById(id);

// Form elements
const form = $('company-form');
const submitBtn = $('submitBtn');
const charCount = $('charCount');
const desc = $('description');

// Character counter for description
desc.addEventListener('input', () => {
  const count = desc.value.length;
  charCount.textContent = `${count} / 1000`;
  charCount.style.color = count > 900 ? 'var(--danger)' : 'var(--muted)';
});

// Enhanced toast function
function showToast(message, type = 'success') {
  const toast = $('toast');
  const bgColor = type === 'success' ? 'var(--success)' : 'var(--danger)';
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 4px; height: 24px; background: ${bgColor}; border-radius: 2px;"></div>
      <span>${message}</span>
    </div>
  `;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 5000);
}

// Form validation
function validateForm() {
  // Check required fields
  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.style.borderColor = 'var(--danger)';
      isValid = false;
    } else {
      field.style.borderColor = '';
    }
  });
  
  // Validate email format
  const emailField = $('email');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailField.value && !emailRegex.test(emailField.value)) {
    emailField.style.borderColor = 'var(--danger)';
    isValid = false;
    showToast('Please enter a valid email address', 'error');
  }
  
  // Validate GSTIN format if provided
  const gstinField = $('gstin');
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (gstinField.value && !gstinRegex.test(gstinField.value)) {
    gstinField.style.borderColor = 'var(--danger)';
    isValid = false;
    showToast('Please enter a valid GSTIN number', 'error');
  }
  
  // Check terms agreement
  if (!$('terms').checked) {
    showToast('Please agree to the terms before submitting', 'error');
    isValid = false;
  }
  
  return isValid;
}

// Reset field styles on input
form.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('input', () => {
    field.style.borderColor = '';
  });
});

// Form submission handler
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Validate form
  if (!validateForm()) {
    return;
  }

  // Update button state
  submitBtn.disabled = true;
  submitBtn.classList.add('loading');
  submitBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
    </svg>
    Processing...
  `;

  // Prepare data
  const formData = {
    name: form.name.value.trim(),
    registrationNumber: form.regNo.value.trim(),
    industry: form.industry.value,
    establishedOn: form.established.value || null,
    email: form.email.value.trim().toLowerCase(),
    phone: form.phone.value.trim(),
    address: form.address.value.trim(),
    website: form.website.value.trim() || null,
    gstin: form.gstin.value.trim() || null,
    description: form.description.value.trim() || null,
    consent: form.terms.checked,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    // Save to Firestore
    const docRef = await addDoc(collection(db, "companies"), formData);
    
    // Update UI
    $('lastId').textContent = docRef.id;
    showToast(`✅ Company registered successfully! Document ID: ${docRef.id}`, 'success');
    
    // Reset form
    form.reset();
    charCount.textContent = "0 / 1000";
    charCount.style.color = 'var(--muted)';
    
  } catch (error) {
    console.error("Firestore error:", error);
    showToast(`❌ Registration failed: ${error.message}`, 'error');
  } finally {
    // Reset button state
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
    submitBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
      </svg>
      Submit Registration
    `;
  }
});

// Form reset handler
form.addEventListener('reset', () => {
  charCount.textContent = "0 / 1000";
  charCount.style.color = 'var(--muted)';
  
  // Reset all field borders
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.style.borderColor = '';
  });
});

// Initialize the form
document.addEventListener('DOMContentLoaded', () => {
  console.log('Company registration form loaded');
  
  // Set today's date as max for establishment date
  const today = new Date().toISOString().split('T')[0];
  $('established').setAttribute('max', today);
});