// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB8x14SoITrwl0WAhRmAhWjNVEASKL3Gv8",
    authDomain: "carpooler-pro.firebaseapp.com",
    databaseURL: "https://carpooler-pro-default-rtdb.firebaseio.com",
    projectId: "carpooler-pro",
    storageBucket: "carpooler-pro.firebasestorage.app",
    messagingSenderId: "559447035458",
    appId: "1:559447035458:web:0ea044e624a560693ca7db",
    measurementId: "G-8NR3PQL6N7"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// Debug: Log Firebase initialization
console.log('Firebase initialized:', {
    apiKey: firebaseConfig.apiKey.substring(0, 10) + '...',
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
});

// ============================================
// TAB NAVIGATION & SWIPE SYSTEM
// ============================================

let currentTab = 0;
let touchStartX = 0;
let touchEndX = 0;

function switchTab(tabIndex) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons and dots
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.dot').forEach(dot => {
        dot.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`tab-content-${tabIndex}`).classList.add('active');

    // Update button if it exists
    const tabBtn = document.getElementById(`tab-${tabIndex}`);
    if (tabBtn) tabBtn.classList.add('active');

    // Update dot indicator
    const dot = document.getElementById(`dot-${tabIndex}`);
    if (dot) dot.classList.add('active');

    currentTab = tabIndex;
}

// Add swipe detection
const swipeContainer = document.getElementById('swipeContainer');
swipeContainer.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

swipeContainer.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0 && currentTab < 3) {
            // Swipe left - next tab
            switchTab(currentTab + 1);
        } else if (diff < 0 && currentTab > 0) {
            // Swipe right - previous tab
            switchTab(currentTab - 1);
        }
    }
}

// ============================================
// AUTHENTICATION SYSTEM
// ============================================

let currentUser = null;

// Monitor authentication state
auth.onAuthStateChanged((user) => {
    const cookie = document.querySelector('.dancing-cookie');
    if (user) {
        // User is signed in
        currentUser = user;
        console.log('User signed in:', user.email);

        // Hide auth modal
        document.getElementById('authOverlay').classList.remove('active');

        // Show cookie again
        if (cookie) cookie.classList.remove('hidden');

        // Initialize app with user's data
        initializeUserData();
    } else {
        // No user signed in - show auth modal
        currentUser = null;
        console.log('No user signed in');

        document.getElementById('authOverlay').classList.add('active');

        // Hide cookie while auth modal is showing
        if (cookie) cookie.classList.add('hidden');
    }
});

// Switch between login and signup tabs
function switchAuthTab(tab, event) {
    if (event) event.preventDefault();

    const loginTab = document.querySelector('.auth-tab:nth-child(1)');
    const signupTab = document.querySelector('.auth-tab:nth-child(2)');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const resetForm = document.getElementById('resetForm');
    const authError = document.getElementById('authError');

    // Clear error
    authError.classList.remove('show');

    // Hide all forms first
    loginForm.classList.remove('active');
    signupForm.classList.remove('active');
    resetForm.classList.remove('active');

    if (tab === 'login') {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.add('active');
    } else if (tab === 'signup') {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.add('active');
    } else if (tab === 'reset') {
        loginTab.classList.remove('active');
        signupTab.classList.remove('active');
        resetForm.classList.add('active');
    }
}

// Show reset password form
function showResetPassword(event) {
    event.preventDefault();
    switchAuthTab('reset');
}

// Show error message
function showAuthError(message) {
    const authError = document.getElementById('authError');
    authError.textContent = message;
    authError.classList.add('show');
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');

    console.log('Attempting login for:', email);

    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';

    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        console.log('Login successful:', result.user.email);
        // Success - onAuthStateChanged will handle the rest
    } catch (error) {
        console.error('Login error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);

        let errorMessage = 'Login failed. Please try again.';

        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Try again later.';
        } else if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid email or password.';
        } else {
            errorMessage = `Login failed: ${error.message}`;
        }

        showAuthError(errorMessage);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
}

// Handle signup
async function handleSignup(event) {
    event.preventDefault();

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const signupBtn = document.getElementById('signupBtn');

    console.log('Attempting signup for:', email);

    // Validate passwords match
    if (password !== confirmPassword) {
        showAuthError('Passwords do not match!');
        return;
    }

    signupBtn.disabled = true;
    signupBtn.textContent = 'Creating account...';

    try {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        console.log('Signup successful:', result.user.email);
        // Success - onAuthStateChanged will handle the rest
    } catch (error) {
        console.error('Signup error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);

        let errorMessage = 'Signup failed. Please try again.';

        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already registered. Try logging in instead.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password should be at least 6 characters.';
        } else {
            errorMessage = `Signup failed: ${error.message}`;
        }

        showAuthError(errorMessage);
    } finally {
        signupBtn.disabled = false;
        signupBtn.textContent = 'Create Account';
    }
}

// Handle password reset
async function handleResetPassword(event) {
    event.preventDefault();

    const email = document.getElementById('resetEmail').value;
    const resetBtn = document.getElementById('resetBtn');

    resetBtn.disabled = true;
    resetBtn.textContent = 'Sending...';

    try {
        await auth.sendPasswordResetEmail(email);
        alert('Password reset email sent! Check your inbox.');
        switchAuthTab('login');
        document.getElementById('resetEmail').value = '';
    } catch (error) {
        console.error('Password reset error:', error);
        let errorMessage = 'Failed to send reset email. Please try again.';

        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many attempts. Please try again later.';
        }

        showAuthError(errorMessage);
    } finally {
        resetBtn.disabled = false;
        resetBtn.textContent = 'Send Reset Link';
    }
}

// Handle Google Sign In
async function handleGoogleSignIn() {
    console.log('Attempting Google sign in...');
    const provider = new firebase.auth.GoogleAuthProvider();

    try {
        const result = await auth.signInWithPopup(provider);
        console.log('Google sign in successful:', result.user.email);
        // Success - onAuthStateChanged will handle the rest
    } catch (error) {
        console.error('Google sign in error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);

        let errorMessage = 'Google sign in failed. Please try again.';

        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Sign in cancelled.';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Pop-up blocked. Please allow pop-ups and try again.';
        } else if (error.code === 'auth/unauthorized-domain') {
            errorMessage = 'This domain is not authorized. Please check Firebase settings.';
        } else {
            errorMessage = `Google sign in failed: ${error.message}`;
        }

        showAuthError(errorMessage);
    }
}

// Handle Apple Sign In
async function handleAppleSignIn() {
    console.log('Attempting Apple sign in...');
    const provider = new firebase.auth.OAuthProvider('apple.com');

    try {
        const result = await auth.signInWithPopup(provider);
        console.log('Apple sign in successful:', result.user.email);
        // Success - onAuthStateChanged will handle the rest
    } catch (error) {
        console.error('Apple sign in error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);

        let errorMessage = 'Apple sign in failed. Please try again.';

        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Sign in cancelled.';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Pop-up blocked. Please allow pop-ups and try again.';
        } else if (error.code === 'auth/unauthorized-domain') {
            errorMessage = 'This domain is not authorized. Please check Firebase settings.';
        } else {
            errorMessage = `Apple sign in failed: ${error.message}`;
        }

        showAuthError(errorMessage);
    }
}

// Handle logout
async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            await auth.signOut();
            // onAuthStateChanged will handle showing the auth modal
        } catch (error) {
            console.error('Logout error:', error);
            alert('Logout failed. Please try again.');
        }
    }
}

// Initialize user's data after authentication
function initializeUserData() {
    // This will be called after user signs in
    // Set up the database reference with user-specific path
    eventId = getOrCreateEventId();
    dbRef = database.ref(`users/${currentUser.uid}/events/${eventId}`);
    loadData();
}

// ============================================
// END AUTHENTICATION SYSTEM
// ============================================

// Get or create event ID from URL parameter
let eventId = null;
let dbRef = null;

function getOrCreateEventId() {
    const params = new URLSearchParams(window.location.search);
    const urlEventId = params.get('e');

    if (urlEventId) {
        // Joining specific event from URL
        console.log('Joining event:', urlEventId);
        return urlEventId;
    } else {
        // Use default shared event - everyone accessing base URL sees same data
        console.log('Using default shared event');
        return 'default';
    }
}

// Don't initialize dbRef here - wait for authentication
// eventId and dbRef will be set in initializeUserData() after sign-in
eventId = null;
dbRef = null;

let cars = [];
let unassignedPassengers = [];
let selectedEmoji = '🚙';
let isSaving = false;
let eventStatus = 'draft'; // 'draft' or 'finalized'

// Security: Rate limiting to prevent spam
let lastActionTime = 0;
const ACTION_COOLDOWN = 500; // 500ms between actions

function isRateLimited() {
    const now = Date.now();
    if (now - lastActionTime < ACTION_COOLDOWN) {
        alert('Slow down! You\'re going too fast 🐌');
        return true;
    }
    lastActionTime = now;
    return false;
}

// Security: Sanitize user input to prevent XSS attacks
function sanitizeInput(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Security: Validate input length and content
function validateInput(input, maxLength, fieldName) {
    if (!input || input.trim().length === 0) {
        alert(`Please enter a ${fieldName}!`);
        return false;
    }
    if (input.length > maxLength) {
        alert(`${fieldName} must be ${maxLength} characters or less!`);
        return false;
    }
    // Block obviously malicious patterns
    if (/<script|javascript:|onerror|onclick/i.test(input)) {
        alert('Invalid characters detected!');
        return false;
    }
    return true;
}

// Auto-save function - now saves to Firebase!
function autoSave() {
    if (isSaving) return; // Don't save if already saving

    // Check if user is authenticated and dbRef is initialized
    if (!currentUser || !dbRef) {
        console.log('Cannot save: User not authenticated or dbRef not initialized');
        return;
    }

    isSaving = true;

    const eventName = document.getElementById('eventName').value.trim();

    // Security: Sanitize and limit event name length
    const sanitizedEventName = eventName.length > 100
        ? sanitizeInput(eventName.substring(0, 100))
        : sanitizeInput(eventName);

    // Get event details
    const eventDetails = {
        date: document.getElementById('eventDate').value || '',
        time: document.getElementById('eventTime').value || '',
        location: sanitizeInput(document.getElementById('eventLocation').value.trim()),
        address: sanitizeInput(document.getElementById('eventAddress').value.trim()),
        notes: sanitizeInput(document.getElementById('eventNotes').value.trim()),
        maxAttendees: document.getElementById('maxAttendees').value || '',
        gasCost: document.getElementById('gasCost').value || '',
        parkingFee: document.getElementById('parkingFee').value || '',
        tollsFees: document.getElementById('tollsFees').value || '',
        splitMethod: document.getElementById('splitMethod').value || 'passengers-only',
        venmoUsername: sanitizeInput(document.getElementById('venmoUsername').value.trim())
    };

    // Use transactions to update specific fields atomically
    // This prevents overwriting teammates' concurrent edits
    const updates = {};
    updates[`users/${currentUser.uid}/events/${eventId}/eventName`] = sanitizedEventName;
    updates[`users/${currentUser.uid}/events/${eventId}/eventDetails`] = eventDetails;
    updates[`users/${currentUser.uid}/events/${eventId}/cars`] = cars;
    updates[`users/${currentUser.uid}/events/${eventId}/unassignedPassengers`] = unassignedPassengers;
    updates[`users/${currentUser.uid}/events/${eventId}/eventStatus`] = eventStatus;
    updates[`users/${currentUser.uid}/events/${eventId}/lastUpdated`] = firebase.database.ServerValue.TIMESTAMP;

    // Use update() instead of set() to avoid overwriting entire object
    database.ref().update(updates).then(() => {
        console.log('Saved to Firebase!');
        setTimeout(() => {
            isSaving = false;
        }, 500);
    }).catch(error => {
        console.error('Error saving to Firebase:', error);
        alert('Save Error: ' + error.message + '\n\nCheck that:\n1. Firebase Realtime Database is enabled\n2. Security rules are published\n3. You have internet connection\n\nError details: ' + error.code);
        isSaving = false;
    });
}

// Open address in Maps
function openInMaps() {
    const address = document.getElementById('eventAddress').value.trim();
    if (!address) {
        alert('Please enter an address first!');
        return;
    }

    // Create Google Maps URL
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
}

function addCar() {
    // Check if event is finalized
    if (eventStatus === 'finalized') {
        showToastNotification("🔒 Event is finalized! Cannot add new cars. Message the host if you need changes.");
        return;
    }

    // Security: Rate limiting
    if (isRateLimited()) return;

    const driverName = document.getElementById('driverName').value.trim();
    const seatCount = parseInt(document.getElementById('seatCount').value);
    const carNickname = document.getElementById('carNickname').value.trim();
    const playlistVibe = document.getElementById('playlistVibe').value;
    const energyLevel = document.getElementById('energyLevel').value;
    const singAlong = document.getElementById('singAlong').checked;

    // Security: Validate driver name
    if (!validateInput(driverName, 50, 'driver name')) {
        return;
    }

    // Validate seat count
    if (!seatCount || seatCount < 1 || seatCount > 20) {
        alert('Please enter a valid seat count (1-20)!');
        return;
    }

    // Security: Sanitize driver name before storing
    const sanitizedName = sanitizeInput(driverName);
    const sanitizedNickname = carNickname ? sanitizeInput(carNickname) : '';

    cars.push({
        id: Date.now(),
        driver: sanitizedName,
        seats: seatCount,
        passengers: [],
        emoji: selectedEmoji,
        nickname: sanitizedNickname,
        playlistVibe: playlistVibe,
        energyLevel: energyLevel,
        singAlong: singAlong
    });

    document.getElementById('driverName').value = '';
    document.getElementById('seatCount').value = '';
    document.getElementById('carNickname').value = '';
    document.getElementById('playlistVibe').selectedIndex = 0;
    document.getElementById('energyLevel').selectedIndex = 0;
    document.getElementById('singAlong').checked = false;

    renderCars();
    updateStatusUI();
    autoSave();
}

function addPassenger() {
    // Security: Rate limiting
    if (isRateLimited()) return;

    const passengerName = document.getElementById('passengerName').value.trim();

    // Security: Validate friend name
    if (!validateInput(passengerName, 50, 'friend name')) {
        return;
    }

    // Security: Sanitize friend name before storing
    const sanitizedName = sanitizeInput(passengerName);

    unassignedPassengers.push({
        id: Date.now(),
        name: sanitizedName
    });

    document.getElementById('passengerName').value = '';
    renderUnassigned();
    autoSave();
}

function assignPassenger(passengerId, carId) {
    const passenger = unassignedPassengers.find(p => p.id === passengerId);
    const car = cars.find(c => c.id === carId);

    if (!passenger || !car) return;

    if (car.passengers.length >= car.seats) {
        alert('This car is full!');
        return;
    }

    car.passengers.push(passenger);
    unassignedPassengers = unassignedPassengers.filter(p => p.id !== passengerId);

    renderCars();
    renderUnassigned();
    autoSave();
}

function removePassengerFromCar(carId, passengerId) {
    const car = cars.find(c => c.id === carId);
    const passenger = car.passengers.find(p => p.id === passengerId);

    if (!passenger) return;

    car.passengers = car.passengers.filter(p => p.id !== passengerId);
    unassignedPassengers.push(passenger);

    renderCars();
    renderUnassigned();
    autoSave();
}

function deleteCar(carId) {
    // Check if event is finalized
    if (eventStatus === 'finalized') {
        showToastNotification("🔒 Event is finalized! Cannot delete cars. Message the host if you need changes.");
        return;
    }

    const car = cars.find(c => c.id === carId);
    if (car) {
        unassignedPassengers.push(...car.passengers);
    }
    cars = cars.filter(c => c.id !== carId);
    renderCars();
    renderUnassigned();
    autoSave();
}

function editSeats(carId) {
    const car = cars.find(c => c.id === carId);
    if (!car) return;

    const newSeats = prompt(`Change number of seats for ${car.driver}'s car:`, car.seats);
    if (newSeats === null) return; // User cancelled

    const seatCount = parseInt(newSeats);
    if (isNaN(seatCount) || seatCount < 1) {
        alert('Please enter a valid number of seats!');
        return;
    }

    if (seatCount < car.passengers.length) {
        alert(`Cannot set seats to ${seatCount} because there are already ${car.passengers.length} friends in this car!`);
        return;
    }

    car.seats = seatCount;
    renderCars();
    autoSave();
}

function renderCars() {
    const container = document.getElementById('carsContainer');

    if (cars.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No cars yet! Add one above.</p>';
        return;
    }

    container.innerHTML = cars.map(car => {
        // Ensure passengers array exists
        if (!car.passengers) {
            car.passengers = [];
        }
        const isFull = car.passengers.length >= car.seats;

        // Permission checks
        const isEventOwner = currentShareId && eventOwnerId && currentUser && currentUser.uid === eventOwnerId;
        const isCarOwner = currentUser && car.ownerId && currentUser.uid === car.ownerId;
        const canEditCar = !currentShareId || isEventOwner || isCarOwner;
        const canDeleteCar = !currentShareId || isEventOwner || isCarOwner;

        // Build vibe pills
        let vibePills = '';
        if (car.playlistVibe) {
            vibePills += `<span class="vibe-pill">🎶 ${car.playlistVibe}</span>`;
        }
        if (car.energyLevel) {
            vibePills += `<span class="vibe-pill">${car.energyLevel}</span>`;
        }
        if (car.singAlong) {
            vibePills += `<span class="vibe-pill">🔊 Sing-along!</span>`;
        }

        return `
            <div class="car-card ${isFull ? 'full' : ''}" onclick="handleCarClick(event, ${car.id})">
                ${canDeleteCar ? `<button class="delete-car" onclick="event.stopPropagation(); deleteCar(${car.id})">×</button>` : ''}
                <div class="car-visual">${car.emoji}</div>
                <div class="car-info">
                    Driver: ${car.driver}${car.nickname ? ` – <em>'${car.nickname}'</em>` : ''}${isCarOwner ? ' <span style="color: #4CAF50; font-size: 0.8em;">(You)</span>' : ''}
                </div>
                ${vibePills ? `<div class="vibe-pills-container">${vibePills}</div>` : ''}
                <div class="seats-info">
                    ${car.passengers.length} / ${canEditCar ? `<span class="editable-seats" onclick="event.stopPropagation(); editSeats(${car.id})">${car.seats}</span>` : car.seats} seats filled ${isFull ? '<span style="color: #f44336; font-weight: bold;">(FULL!)</span>' : ''}
                </div>
                <div class="passengers-list">
                    ${car.passengers.map(p => {
                        const isThisUser = currentUser && p.userId && currentUser.uid === p.userId;
                        const canRemovePassenger = !currentShareId || isEventOwner || isCarOwner || isThisUser;
                        return `
                            <div class="passenger-tag" ${canRemovePassenger ? `onclick="event.stopPropagation(); removePassengerFromCar(${car.id}, ${p.id})"` : ''}>
                                ${p.name}${isThisUser ? ' <span style="color: #4CAF50;">(You)</span>' : ''}
                                ${canRemovePassenger ? '<span class="remove">×</span>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
                ${car.perPassengerCost && car.perPassengerCost > 0 && car.passengers.length > 0 ? `
                    <div style="margin-top: 12px; padding: 10px; background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius: 6px; border-left: 3px solid #667eea;">
                        <div style="font-size: 13px; color: #666; margin-bottom: 4px;">💰 Cost per passenger:</div>
                        <div style="font-size: 18px; font-weight: bold; color: #667eea;">$${car.perPassengerCost.toFixed(2)}</div>
                        <div style="font-size: 12px; color: #999; margin-top: 4px;">Driver gets: <strong style="color: #4CAF50;">$${car.totalCarCost.toFixed(2)}</strong></div>
                        ${generateVenmoLink(car.perPassengerCost, car.driver) ? `
                            <a href="${generateVenmoLink(car.perPassengerCost, car.driver)}" target="_blank" style="display: inline-block; margin-top: 8px; padding: 8px 16px; background: #008CFF; color: white; text-decoration: none; border-radius: 20px; font-size: 13px; font-weight: bold;">
                                💸 Pay via Venmo
                            </a>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function removeUnassignedFriend(passengerId) {
    unassignedPassengers = unassignedPassengers.filter(p => p.id !== passengerId);
    renderUnassigned();
    autoSave();
}

function renderUnassigned() {
    const container = document.getElementById('unassignedList');

    if (unassignedPassengers.length === 0) {
        container.innerHTML = '<p style="color: #999;">All friends are assigned!</p>';
        return;
    }

    container.innerHTML = unassignedPassengers.map(p => `
        <div class="unassigned-tag" data-passenger-id="${p.id}">
            ${p.name}
            <span class="remove" onclick="event.stopPropagation(); removeUnassignedFriend(${p.id})">×</span>
        </div>
    `).join('');

    // Add click handlers for drag-to-assign
    container.querySelectorAll('.unassigned-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            const passengerId = parseInt(this.dataset.passengerId);
            selectPassengerForAssignment(passengerId);
        });
    });
}

let selectedPassengerId = null;

function selectPassengerForAssignment(passengerId) {
    selectedPassengerId = passengerId;
    const passenger = unassignedPassengers.find(p => p.id === passengerId);
    alert(`Click on a car to assign ${passenger.name}! 🚗`);
}

function handleCarClick(event, carId) {
    if (selectedPassengerId) {
        assignPassenger(selectedPassengerId, carId);
        selectedPassengerId = null;
    }
}

// Manual save function (auto-save happens automatically in background)
function saveData() {
    autoSave();
    alert('Saved to cloud! ☁️');
}

// Clear everything function
function clearEverything() {
    if (confirm('Going to clear everything now.')) {
        // Clear local data
        cars = [];
        unassignedPassengers = [];
        document.getElementById('eventName').value = '';

        // Clear event details
        document.getElementById('eventDate').value = '';
        document.getElementById('eventTime').value = '';
        document.getElementById('eventLocation').value = '';
        document.getElementById('eventAddress').value = '';
        document.getElementById('eventNotes').value = '';
        document.getElementById('maxAttendees').value = '';

        // Clear Firebase
        dbRef.remove().then(() => {
            console.log('Firebase data cleared');
        }).catch(error => {
            console.error('Error clearing Firebase:', error);
        });

        // Re-render
        renderCars();
        renderUnassigned();

        alert('Everything cleared! 🧹');
    }
}

// Share data (global for modal access)
let currentShareUrl = '';
let currentShareSummary = '';

// Share event with friends
async function shareEvent() {
    if (!currentUser) {
        alert('You must be logged in to share events!');
        return;
    }

    const eventName = document.getElementById('eventName').value.trim();
    if (!eventName) {
        alert('Please add an event name before sharing!');
        return;
    }

    if (cars.length === 0 && unassignedPassengers.length === 0) {
        alert('Please add some cars or friends before sharing!');
        return;
    }

    try {
        // Generate unique share ID
        const shareId = generateShareId();

        // Get event details
        const eventDetails = {
            date: document.getElementById('eventDate').value || '',
            time: document.getElementById('eventTime').value || '',
            location: sanitizeInput(document.getElementById('eventLocation').value.trim()),
            address: sanitizeInput(document.getElementById('eventAddress').value.trim()),
            notes: sanitizeInput(document.getElementById('eventNotes').value.trim()),
            maxAttendees: document.getElementById('maxAttendees').value || ''
        };

        // Save event to shared location
        const sharedData = {
            ownerId: currentUser.uid,
            ownerEmail: currentUser.email,
            eventName: sanitizeInput(eventName),
            eventDetails: eventDetails,
            cars: cars,
            unassignedPassengers: unassignedPassengers,
            lastUpdated: firebase.database.ServerValue.TIMESTAMP,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };

        await database.ref(`shared/${shareId}`).set(sharedData);

        // Generate share URL
        currentShareUrl = `${window.location.origin}${window.location.pathname}?share=${shareId}`;

        // Create event summary for sharing
        currentShareSummary = `📢 ${eventName}`;

        if (eventDetails.date && eventDetails.time) {
            const dateObj = new Date(eventDetails.date + 'T' + eventDetails.time);
            const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            currentShareSummary += `\n📅 ${dateStr} at ${timeStr}`;
        } else if (eventDetails.date) {
            const dateObj = new Date(eventDetails.date);
            const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            currentShareSummary += `\n📅 ${dateStr}`;
        }

        if (eventDetails.location) {
            currentShareSummary += `\n📍 ${eventDetails.location}`;
        }

        if (eventDetails.notes) {
            currentShareSummary += `\n📝 ${eventDetails.notes}`;
        }

        currentShareSummary += `\n\n🔗 ${currentShareUrl}\n\nAnyone with this link can view and join this carpool!`;

        // Open share modal
        document.getElementById('shareModal').classList.add('active');

    } catch (error) {
        console.error('Share error:', error);
        alert('Failed to create share link. Please try again.');
    }
}

function closeShareModal() {
    document.getElementById('shareModal').classList.remove('active');
}

async function copyShareLink() {
    try {
        await navigator.clipboard.writeText(currentShareUrl);
        alert('Share link copied to clipboard! 📋');
        closeShareModal();
    } catch (error) {
        prompt('Copy this link:', currentShareUrl);
    }
}

function shareViaText() {
    // SMS sharing - works on iOS and Android
    const smsBody = encodeURIComponent(currentShareSummary);
    window.location.href = `sms:?&body=${smsBody}`;
    closeShareModal();
}

async function shareViaNative() {
    // Try native share API (works on mobile and some desktop browsers)
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Join my carpool!',
                text: currentShareSummary,
                url: currentShareUrl
            });
            closeShareModal();
        } catch (error) {
            // User cancelled or error occurred
            if (error.name !== 'AbortError') {
                console.error('Share error:', error);
                // Fall back to copy
                copyShareLink();
            }
        }
    } else {
        alert('Native sharing not supported. Copying link instead!');
        copyShareLink();
    }
}

async function copySummaryText() {
    const eventName = document.getElementById('eventName').value.trim() || 'Carpool Event';
    const eventDate = document.getElementById('eventDate').value;
    const eventTime = document.getElementById('eventTime').value;
    const eventLocation = document.getElementById('eventLocation').value;

    let summary = `✨ ${eventName} ✨\n\n`;

    // Add date and time
    if (eventDate && eventTime) {
        const dateObj = new Date(eventDate + 'T' + eventTime);
        const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        summary += `📅 ${dateStr} at ${timeStr}\n`;
    }

    // Add location
    if (eventLocation) {
        summary += `📍 ${eventLocation}\n`;
    }

    // Add share link
    if (currentShareUrl) {
        summary += `\n🔗 Join here: ${currentShareUrl}\n`;
    }

    // Add current cars
    if (cars.length > 0) {
        summary += `\n🚗 Current Cars:\n`;
        cars.forEach(car => {
            const carName = car.nickname ? `${car.driver} – '${car.nickname}'` : car.driver;
            summary += `   ${car.emoji} ${carName} (${car.passengers.length}/${car.seats} seats)\n`;
        });
    }

    summary += `\nSee you there! 🎉`;

    // Copy to clipboard
    try {
        await navigator.clipboard.writeText(summary);
        alert('📋 Beautiful summary copied! Paste it in your group chat.');
        closeShareModal();
    } catch (error) {
        prompt('Copy this summary:', summary);
    }
}

function addToCalendar() {
    const eventName = document.getElementById('eventName').value.trim() || 'Carpool Event';
    const eventDate = document.getElementById('eventDate').value;
    const eventTime = document.getElementById('eventTime').value;
    const eventLocation = document.getElementById('eventLocation').value;
    const eventAddress = document.getElementById('eventAddress').value;

    if (!eventDate || !eventTime) {
        alert('Please set an event date and time first!');
        return;
    }

    // Parse date and time
    const startDate = new Date(eventDate + 'T' + eventTime);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours

    // Format dates for .ics (YYYYMMDDTHHMMSS format)
    const formatICSDate = (date) => {
        const pad = (n) => n.toString().padStart(2, '0');
        return date.getFullYear() +
               pad(date.getMonth() + 1) +
               pad(date.getDate()) + 'T' +
               pad(date.getHours()) +
               pad(date.getMinutes()) +
               pad(date.getSeconds());
    };

    const startStr = formatICSDate(startDate);
    const endStr = formatICSDate(endDate);

    // Build description with link and car info
    let description = '';
    if (currentShareUrl) {
        description += `Join the carpool: ${currentShareUrl}\\n\\n`;
    }
    if (cars.length > 0) {
        description += 'Cars:\\n';
        cars.forEach(car => {
            const carName = car.nickname ? `${car.driver} - '${car.nickname}'` : car.driver;
            description += `${car.emoji} ${carName} (${car.passengers.length}/${car.seats} seats)\\n`;
        });
    }

    // Create .ics content
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Carpool Splitter//EN
BEGIN:VEVENT
UID:${Date.now()}@carpoolsplitter.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${startStr}
DTEND:${endStr}
SUMMARY:${eventName}
DESCRIPTION:${description}
LOCATION:${eventAddress || eventLocation || ''}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    // Create download link
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${eventName.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('📅 Calendar event downloaded! Open the file to add it to your calendar.');
    closeShareModal();
}

// ============================================
// EVENT LIFECYCLE (DRAFT / FINALIZED)
// ============================================

function updateStatusUI() {
    const statusPill = document.getElementById('eventStatusPill');
    const finalizeBtn = document.getElementById('finalizeBtn');

    if (eventStatus === 'finalized') {
        statusPill.textContent = '✅ Finalized';
        statusPill.className = 'status-pill status-finalized';
        if (finalizeBtn) finalizeBtn.style.display = 'none';
    } else {
        statusPill.textContent = '📝 Draft';
        statusPill.className = 'status-pill status-draft';

        // Show finalize button only for event owner
        const isEventOwner = currentShareId && eventOwnerId && currentUser && currentUser.uid === eventOwnerId;
        if (finalizeBtn && isEventOwner && cars.length > 0) {
            finalizeBtn.style.display = 'block';
        }
    }
}

function showFinalizeConfirmation() {
    if (cars.length === 0) {
        alert('Please add at least one car before finalizing!');
        return;
    }

    // Count unassigned passengers
    const unassignedCount = unassignedPassengers.length;
    let message = '🔒 Lock in these carpools and notify everyone?\n\n';

    if (unassignedCount > 0) {
        message += `⚠️ Note: ${unassignedCount} friend${unassignedCount > 1 ? 's are' : ' is'} still unassigned!\n\n`;
    }

    message += 'After finalizing:\n';
    message += '• Carpools are locked\n';
    message += '• Only minor edits allowed\n';
    message += '• People can still join but changes are limited\n\n';
    message += 'Continue?';

    if (confirm(message)) {
        finalizeEvent();
    }
}

function finalizeEvent() {
    eventStatus = 'finalized';
    updateStatusUI();
    autoSave();

    alert('✅ Carpools finalized! Everyone is locked in. If someone needs to swap, they should message you.');
}

function showToastNotification(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: bold;
        animation: slideDown 0.3s ease;
    `;

    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

function checkIfFinalized() {
    if (eventStatus === 'finalized') {
        showToastNotification("🔒 This event is finalized! Changes are limited. Message the host if you need to swap.");
        return true;
    }
    return false;
}

// ============================================
// AUTO-ASSIGN FEATURES
// ============================================

function autoFillCars() {
    // Check if event is finalized
    if (eventStatus === 'finalized') {
        showToastNotification("🔒 Event is finalized! Cannot auto-assign. Make manual changes if needed.");
        return;
    }

    if (unassignedPassengers.length === 0) {
        alert('No unassigned friends to auto-fill! 🤷');
        return;
    }

    if (cars.length === 0) {
        alert('Please add at least one car first! 🚗');
        return;
    }

    // Calculate available seats in each car
    const availableSeats = cars.map((car, index) => ({
        carIndex: index,
        available: car.seats - car.passengers.length
    })).filter(car => car.available > 0);

    if (availableSeats.length === 0) {
        alert('All cars are full! Add more cars or increase seat counts. 🚙');
        return;
    }

    // Total available seats
    const totalAvailable = availableSeats.reduce((sum, car) => sum + car.available, 0);

    if (unassignedPassengers.length > totalAvailable) {
        if (!confirm(`Only ${totalAvailable} seats available, but ${unassignedPassengers.length} friends unassigned. Fill as many as possible?`)) {
            return;
        }
    }

    // Fill cars evenly
    let passengersToAssign = [...unassignedPassengers];
    let carPointer = 0;

    while (passengersToAssign.length > 0 && availableSeats.length > 0) {
        const currentCar = availableSeats[carPointer];

        if (currentCar.available > 0) {
            // Assign passenger to car
            const passenger = passengersToAssign.shift();
            cars[currentCar.carIndex].passengers.push(passenger);
            currentCar.available--;
        }

        // Move to next car (circular)
        carPointer = (carPointer + 1) % availableSeats.length;

        // Remove cars that are now full
        availableSeats.forEach((car, index) => {
            if (car.available <= 0) {
                availableSeats.splice(index, 1);
                if (carPointer >= availableSeats.length) {
                    carPointer = 0;
                }
            }
        });
    }

    // Update unassigned list
    unassignedPassengers = passengersToAssign;

    renderCars();
    renderUnassigned();
    autoSave();

    const assigned = unassignedPassengers.length === 0
        ? 'All friends assigned! ✨'
        : `Assigned friends to available seats! ${unassignedPassengers.length} still unassigned.`;
    alert(assigned);
}

function randomizeCars() {
    // Check if event is finalized
    if (eventStatus === 'finalized') {
        showToastNotification("🔒 Event is finalized! Cannot randomize. Make manual changes if needed.");
        return;
    }

    if (cars.length === 0) {
        alert('Please add at least one car first! 🚗');
        return;
    }

    // Collect all passengers from all cars
    let allPassengers = [];
    cars.forEach(car => {
        allPassengers = allPassengers.concat(car.passengers);
    });

    // Add unassigned passengers
    allPassengers = allPassengers.concat(unassignedPassengers);

    if (allPassengers.length === 0) {
        alert('No passengers to randomize! 👥');
        return;
    }

    if (!confirm('🎲 Shuffle all passengers randomly across cars? (Drivers stay fixed)')) {
        return;
    }

    // Shuffle passengers
    for (let i = allPassengers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allPassengers[i], allPassengers[j]] = [allPassengers[j], allPassengers[i]];
    }

    // Clear all cars
    cars.forEach(car => {
        car.passengers = [];
    });

    // Reassign passengers
    let passengerIndex = 0;
    let carIndex = 0;

    while (passengerIndex < allPassengers.length) {
        const car = cars[carIndex];

        if (car.passengers.length < car.seats) {
            car.passengers.push(allPassengers[passengerIndex]);
            passengerIndex++;
        } else {
            carIndex++;
            if (carIndex >= cars.length) {
                // No more space in any car
                break;
            }
        }
    }

    // Any remaining passengers go to unassigned
    unassignedPassengers = allPassengers.slice(passengerIndex);

    renderCars();
    renderUnassigned();
    autoSave();

    alert('🎲 Passengers randomized! Drivers stayed in their cars. ✨');
}

// ============================================
// COST SPLITTING FEATURES
// ============================================

function calculateCosts() {
    const gasCost = parseFloat(document.getElementById('gasCost').value) || 0;
    const parkingFee = parseFloat(document.getElementById('parkingFee').value) || 0;
    const tollsFees = parseFloat(document.getElementById('tollsFees').value) || 0;
    const splitMethod = document.getElementById('splitMethod').value;

    // No costs entered
    if (gasCost === 0 && parkingFee === 0 && tollsFees === 0) {
        document.getElementById('costSummary').style.display = 'none';
        renderCars();
        return;
    }

    // Count total people
    let totalPassengers = 0;
    let totalPeople = cars.length; // Start with drivers

    cars.forEach(car => {
        totalPassengers += car.passengers.length;
        totalPeople += car.passengers.length;
    });

    if (totalPeople === 0) {
        document.getElementById('costSummary').style.display = 'none';
        return;
    }

    const totalCosts = (gasCost * cars.length) + (parkingFee * cars.length) + (tollsFees * cars.length);
    let breakdownHTML = '';

    // Calculate per-car costs
    cars.forEach((car, index) => {
        let carCost = 0;
        let perPassengerCost = 0;
        const perCarTotal = gasCost + parkingFee + tollsFees;

        if (splitMethod === 'passengers-only') {
            // Passengers split everything
            if (totalPassengers > 0) {
                perPassengerCost = totalCosts / totalPassengers;
                carCost = perPassengerCost * car.passengers.length;
            }
        } else if (splitMethod === 'per-car-gas') {
            // Each car's passengers split THAT car's costs (gas, parking, tolls) ⚡ Perfect for EVs!
            if (car.passengers.length > 0) {
                perPassengerCost = perCarTotal / car.passengers.length;
                carCost = perPassengerCost * car.passengers.length;
            } else {
                perPassengerCost = 0;
                carCost = 0;
            }
        } else if (splitMethod === 'everyone') {
            // Everyone splits equally
            perPassengerCost = totalCosts / totalPeople;
            carCost = perPassengerCost * (car.passengers.length + 1); // +1 for driver
        } else if (splitMethod === 'passengers-gas') {
            // Passengers split gas, everyone splits parking/tolls
            const sharedCostsPerCar = parkingFee + tollsFees;
            const sharedCostsTotal = sharedCostsPerCar * cars.length;
            const sharedPerPerson = sharedCostsTotal / totalPeople;

            if (totalPassengers > 0) {
                const gasPerPassenger = (gasCost * cars.length) / totalPassengers;
                perPassengerCost = gasPerPassenger + sharedPerPerson;
                carCost = (perPassengerCost * car.passengers.length);
            } else {
                perPassengerCost = sharedPerPerson;
                carCost = sharedPerPerson * (car.passengers.length + 1);
            }
        }

        // Store costs on car object for rendering
        car.perPassengerCost = perPassengerCost;
        car.totalCarCost = carCost;
    });

    // Generate breakdown text
    breakdownHTML += `<div style="color: #666; line-height: 1.8;">`;
    breakdownHTML += `<strong>Total Trip Cost:</strong> $${totalCosts.toFixed(2)}<br>`;
    breakdownHTML += `<strong>Split Method:</strong> ${getSplitMethodText(splitMethod)}<br><br>`;

    cars.forEach((car, index) => {
        if (car.passengers.length > 0) {
            breakdownHTML += `<div style="margin-bottom: 10px; padding: 10px; background: #f5f5f5; border-radius: 6px;">`;
            breakdownHTML += `<strong>${car.emoji} ${car.driver}'s car:</strong><br>`;
            breakdownHTML += `Each passenger pays: <strong style="color: #667eea;">$${car.perPassengerCost.toFixed(2)}</strong><br>`;
            breakdownHTML += `Driver receives: <strong style="color: #4CAF50;">$${car.totalCarCost.toFixed(2)}</strong>`;
            breakdownHTML += `</div>`;
        }
    });

    breakdownHTML += `</div>`;

    document.getElementById('costBreakdownText').innerHTML = breakdownHTML;
    document.getElementById('costSummary').style.display = 'block';

    // Re-render cars to show costs
    renderCars();
    autoSave();
}

function getSplitMethodText(method) {
    if (method === 'passengers-only') return 'Passengers split all costs (Drivers pay nothing)';
    if (method === 'per-car-gas') return 'Each car splits their own gas (⚡ EV-friendly!)';
    if (method === 'everyone') return 'Everyone splits equally';
    if (method === 'passengers-gas') return 'Passengers split gas, Everyone splits parking/tolls';
    return method;
}

function generateVenmoLink(amount, driverName) {
    const venmoUsername = document.getElementById('venmoUsername').value.trim();
    if (!venmoUsername) return null;

    // Remove @ if user included it
    const cleanUsername = venmoUsername.replace('@', '');
    const note = encodeURIComponent(`Carpool with ${driverName}`);

    return `https://venmo.com/${cleanUsername}?txn=pay&amount=${amount.toFixed(2)}&note=${note}`;
}

function copyGroupChatSummary() {
    const eventName = document.getElementById('eventName').value.trim() || 'Carpool';

    if (cars.length === 0) {
        alert('Add some cars first! 🚗');
        return;
    }

    let summary = `🚗 ${eventName} - Carpool Assignments\n\n`;

    // Event details if available
    const eventDate = document.getElementById('eventDate').value;
    const eventTime = document.getElementById('eventTime').value;
    const eventLocation = document.getElementById('eventLocation').value;

    if (eventDate && eventTime) {
        const dateObj = new Date(eventDate + 'T' + eventTime);
        const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        summary += `📅 ${dateStr} at ${timeStr}\n`;
    }

    if (eventLocation) {
        summary += `📍 ${eventLocation}\n`;
    }

    if (eventDate || eventLocation) {
        summary += `\n`;
    }

    // Car assignments
    cars.forEach((car, index) => {
        // Car name line with optional nickname
        const carName = car.nickname ? `${car.driver} – '${car.nickname}'` : car.driver;
        summary += `${car.emoji} ${carName}'s car (${car.passengers.length}/${car.seats} seats):\n`;

        // Add vibes if any are set
        let vibes = [];
        if (car.playlistVibe) vibes.push(`🎶 ${car.playlistVibe}`);
        if (car.energyLevel) vibes.push(car.energyLevel);
        if (car.singAlong) vibes.push('🔊 Sing-along!');

        if (vibes.length > 0) {
            summary += `   Vibe: ${vibes.join(' | ')}\n`;
        }

        if (car.passengers.length > 0) {
            const passengerNames = car.passengers.map(p => p.name).join(', ');
            summary += `   Passengers: ${passengerNames}\n`;

            // Add cost info if costs are set
            if (car.perPassengerCost && car.perPassengerCost > 0) {
                summary += `   💰 Each passenger: $${car.perPassengerCost.toFixed(2)}\n`;
            }
        } else {
            summary += `   (Empty - need passengers!)\n`;
        }

        summary += `\n`;
    });

    // Unassigned passengers
    if (unassignedPassengers.length > 0) {
        summary += `⚠️ Unassigned: ${unassignedPassengers.map(p => p.name).join(', ')}\n\n`;
    }

    // Cost summary
    const gasCost = parseFloat(document.getElementById('gasCost').value) || 0;
    const parkingFee = parseFloat(document.getElementById('parkingFee').value) || 0;
    const tollsFees = parseFloat(document.getElementById('tollsFees').value) || 0;

    if (gasCost > 0 || parkingFee > 0 || tollsFees > 0) {
        summary += `💵 Total Trip Cost: $${((gasCost * cars.length) + (parkingFee * cars.length) + (tollsFees * cars.length)).toFixed(2)}\n`;
        summary += `   ⛽ Gas: $${gasCost}/car | 🅿️ Parking: $${parkingFee}/car | 🎫 Tolls: $${tollsFees}/car\n`;
    }

    // Open Messages app with pre-filled text
    const encodedMessage = encodeURIComponent(summary);
    const smsUrl = `sms:&body=${encodedMessage}`;

    // Try to open Messages app
    window.location.href = smsUrl;
}

// Generate random share ID
function generateShareId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// ============================================
// ONBOARDING SYSTEM FOR SHARED EVENTS
// ============================================

let currentShareId = null;
let eventOwnerId = null;
let selectedOnboardingEmoji = '🚙';

function selectRole(role) {
    document.getElementById('onboardingStep1').style.display = 'none';

    if (role === 'driver') {
        document.getElementById('onboardingStep2Driver').style.display = 'block';
    } else {
        document.getElementById('onboardingStep2Rider').style.display = 'block';
        renderOnboardingCarList();
    }
}

function selectOnboardingEmoji(emoji) {
    selectedOnboardingEmoji = emoji;
    document.getElementById('onboardingEmoji').value = emoji;

    // Update visual selection
    document.querySelectorAll('.emoji-option').forEach(el => {
        el.classList.remove('selected');
    });
    event.target.classList.add('selected');
}

function completeDriverOnboarding() {
    const name = document.getElementById('onboardingName').value.trim();
    const seats = parseInt(document.getElementById('onboardingSeats').value);

    if (!name) {
        alert('Please enter your name!');
        return;
    }

    if (!seats || seats < 1 || seats > 20) {
        alert('Please enter valid number of seats (1-20)!');
        return;
    }

    // Add car with user's UID
    const newCar = {
        driver: name,
        seats: seats,
        emoji: selectedOnboardingEmoji,
        passengers: [],
        ownerId: currentUser.uid,
        ownerEmail: currentUser.email
    };

    cars.push(newCar);
    autoSave();

    // Close onboarding
    document.getElementById('onboardingOverlay').classList.remove('active');
    alert(`🎉 Your car has been added! You're driving with ${seats} seats available.`);
}

function renderOnboardingCarList() {
    const carList = document.getElementById('onboardingCarList');
    carList.innerHTML = '';

    if (cars.length === 0) {
        carList.innerHTML = '<p style="text-align: center; color: #666;">No cars yet. Be the first driver!</p>';
        return;
    }

    cars.forEach((car, index) => {
        const availableSeats = car.seats - car.passengers.length;
        const isFull = availableSeats <= 0;

        const cardHTML = `
            <div class="onboarding-car-card">
                <div class="onboarding-car-info">
                    <div class="onboarding-car-driver">${car.emoji} ${car.driver}</div>
                    <div class="onboarding-car-seats">${availableSeats} of ${car.seats} seats available</div>
                </div>
                <button class="onboarding-join-btn"
                        onclick="joinCarFromOnboarding(${index})"
                        ${isFull ? 'disabled' : ''}>
                    ${isFull ? 'FULL' : 'Join'}
                </button>
            </div>
        `;
        carList.innerHTML += cardHTML;
    });
}

function joinCarFromOnboarding(carIndex) {
    const name = document.getElementById('onboardingName').value.trim();

    if (!name) {
        alert('Please enter your name!');
        return;
    }

    // Add passenger with user's UID
    const passenger = {
        name: name,
        userId: currentUser.uid,
        userEmail: currentUser.email
    };

    cars[carIndex].passengers.push(passenger);
    autoSave();

    // Close onboarding
    document.getElementById('onboardingOverlay').classList.remove('active');
    alert(`🎉 You've joined ${cars[carIndex].driver}'s car!`);
}

function skipRiderOnboarding() {
    document.getElementById('onboardingOverlay').classList.remove('active');
}

function showOnboardingModal(eventName) {
    // Check if user already has a spot
    let userHasSpot = false;

    cars.forEach(car => {
        if (car.ownerId === currentUser.uid) {
            userHasSpot = true;
        }
        if (car.passengers && car.passengers.some(p => p.userId === currentUser.uid)) {
            userHasSpot = true;
        }
    });

    if (unassignedPassengers && unassignedPassengers.some(p => p.userId === currentUser.uid)) {
        userHasSpot = true;
    }

    // Only show onboarding if user doesn't have a spot
    if (!userHasSpot) {
        document.getElementById('onboardingEventName').textContent = eventName || 'this event';
        document.getElementById('onboardingName').value = currentUser.displayName || currentUser.email.split('@')[0];
        document.getElementById('onboardingEmail').textContent = currentUser.email;
        document.getElementById('onboardingOverlay').classList.add('active');
    }
}

// Check if user is accessing a shared event
function checkForSharedEvent() {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share');

    if (shareId) {
        currentShareId = shareId;
        console.log('Loading shared event:', shareId);

        // Load shared event data
        database.ref(`shared/${shareId}`).on('value', (snapshot) => {
            const data = snapshot.val();

            if (!data) {
                alert('This shared event does not exist or has been deleted.');
                return;
            }

            // Load shared event into app
            document.getElementById('eventName').value = data.eventName || '';

            // Load event details
            if (data.eventDetails) {
                document.getElementById('eventDate').value = data.eventDetails.date || '';
                document.getElementById('eventTime').value = data.eventDetails.time || '';
                document.getElementById('eventLocation').value = data.eventDetails.location || '';
                document.getElementById('eventAddress').value = data.eventDetails.address || '';
                document.getElementById('eventNotes').value = data.eventDetails.notes || '';
                document.getElementById('maxAttendees').value = data.eventDetails.maxAttendees || '';
                document.getElementById('gasCost').value = data.eventDetails.gasCost || '';
                document.getElementById('parkingFee').value = data.eventDetails.parkingFee || '';
                document.getElementById('tollsFees').value = data.eventDetails.tollsFees || '';
                document.getElementById('splitMethod').value = data.eventDetails.splitMethod || 'passengers-only';
                document.getElementById('venmoUsername').value = data.eventDetails.venmoUsername || '';
            }

            cars = data.cars || [];
            unassignedPassengers = data.unassignedPassengers || [];
            eventOwnerId = data.ownerId || null;

            // Ensure all cars have passengers arrays
            cars.forEach(car => {
                if (!car.passengers) {
                    car.passengers = [];
                }
            });

            renderCars();
            renderUnassigned();
            calculateCosts(); // Calculate costs after loading shared data

            // Show onboarding modal if user is new to this event
            if (currentUser) {
                showOnboardingModal(data.eventName);
            }

            // Show sharing info
            const ownerInfo = data.ownerEmail ? ` (shared by ${data.ownerEmail})` : '';
            console.log(`Loaded shared event${ownerInfo}`);
        });

        // Override save function to save to shared location
        const originalAutoSave = autoSave;
        autoSave = function() {
            if (isSaving) return;
            isSaving = true;

            const eventName = document.getElementById('eventName').value.trim();
            const sanitizedEventName = eventName.length > 100
                ? sanitizeInput(eventName.substring(0, 100))
                : sanitizeInput(eventName);

            // Get event details
            const eventDetails = {
                date: document.getElementById('eventDate').value || '',
                time: document.getElementById('eventTime').value || '',
                location: sanitizeInput(document.getElementById('eventLocation').value.trim()),
                address: sanitizeInput(document.getElementById('eventAddress').value.trim()),
                notes: sanitizeInput(document.getElementById('eventNotes').value.trim()),
                maxAttendees: document.getElementById('maxAttendees').value || ''
            };

            const updates = {
                eventName: sanitizedEventName,
                eventDetails: eventDetails,
                cars: cars,
                unassignedPassengers: unassignedPassengers,
                lastUpdated: firebase.database.ServerValue.TIMESTAMP
            };

            database.ref(`shared/${shareId}`).update(updates).then(() => {
                console.log('Shared event updated!');
                setTimeout(() => {
                    isSaving = false;
                }, 500);
            }).catch(error => {
                console.error('Error updating shared event:', error);
                isSaving = false;
            });
        };
    }
}

function loadData() {
    // Real-time listener - updates whenever anyone makes a change!
    dbRef.on('value', (snapshot) => {
        // Don't update if we're currently saving
        if (isSaving) {
            console.log('Skipping Firebase update - currently saving');
            return;
        }

        const data = snapshot.val();

        // If no data exists yet (first time), just render empty state
        if (!data) {
            console.log('No data in Firebase yet');
            return;
        }

        console.log('Loading data from Firebase:', data);
        document.getElementById('eventName').value = data.eventName || '';

        // Load event details
        if (data.eventDetails) {
            document.getElementById('eventDate').value = data.eventDetails.date || '';
            document.getElementById('eventTime').value = data.eventDetails.time || '';
            document.getElementById('eventLocation').value = data.eventDetails.location || '';
            document.getElementById('eventAddress').value = data.eventDetails.address || '';
            document.getElementById('eventNotes').value = data.eventDetails.notes || '';
            document.getElementById('maxAttendees').value = data.eventDetails.maxAttendees || '';
            document.getElementById('gasCost').value = data.eventDetails.gasCost || '';
            document.getElementById('parkingFee').value = data.eventDetails.parkingFee || '';
            document.getElementById('tollsFees').value = data.eventDetails.tollsFees || '';
            document.getElementById('splitMethod').value = data.eventDetails.splitMethod || 'passengers-only';
            document.getElementById('venmoUsername').value = data.eventDetails.venmoUsername || '';
        }

        cars = data.cars || [];
        unassignedPassengers = data.unassignedPassengers || [];
        eventStatus = data.eventStatus || 'draft';

        // Ensure all cars have passengers arrays
        cars.forEach(car => {
            if (!car.passengers) {
                car.passengers = [];
            }
        });

        renderCars();
        renderUnassigned();
        updateStatusUI();
        calculateCosts(); // Recalculate costs after loading data
    });
}

// Add auto-save to event name and event details inputs
document.getElementById('eventName').addEventListener('input', autoSave);
document.getElementById('eventDate').addEventListener('change', autoSave);
document.getElementById('eventTime').addEventListener('change', autoSave);
document.getElementById('eventLocation').addEventListener('input', autoSave);
document.getElementById('eventAddress').addEventListener('input', autoSave);
document.getElementById('eventNotes').addEventListener('input', autoSave);
document.getElementById('maxAttendees').addEventListener('input', autoSave);

// Allow Enter key to submit
document.getElementById('driverName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addCar();
});
document.getElementById('seatCount').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addCar();
});
document.getElementById('passengerName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addPassenger();
});

// Check for shared event on page load
checkForSharedEvent();

// Initial render
renderCars();
renderUnassigned();

// DVD-style bouncing cookie
const cookie = document.querySelector('.dancing-cookie');
let x = Math.random() * (window.innerWidth - 100);
let y = Math.random() * (window.innerHeight - 100);
let xSpeed = 2;
let ySpeed = 2;

// Cookie menu functionality
const cookieMenu = document.getElementById('cookieMenu');

// TETRIS Easter Egg - Click cookie 6 times to spell TETRIS
let cookieClickCount = 0;
const tetrisLetters = ['S', 'I', 'R', 'T', 'E', 'T'];
const tetrisRevealDiv = document.getElementById('tetrisReveal');
let cookieResetTimer = null;

cookie.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent event bubbling

    // Don't show menu or start game if auth modal is showing
    const authOverlay = document.getElementById('authOverlay');
    if (authOverlay.classList.contains('active')) {
        return;
    }

    // Show menu centered on screen
    cookieMenu.classList.add('show');

    // Easter egg counter
    cookieClickCount++;

    // Reset timer - if you don't complete within 5 seconds, reset
    clearTimeout(cookieResetTimer);
    cookieResetTimer = setTimeout(() => {
        cookieClickCount = 0;
        tetrisRevealDiv.textContent = '';
    }, 5000);

    if (cookieClickCount <= 6) {
        // Build up TETRIS letter by letter
        const currentWord = tetrisLetters.slice(0, cookieClickCount).join('');
        tetrisRevealDiv.textContent = currentWord;

        if (cookieClickCount === 6) {
            // Spell complete! Launch game
            clearTimeout(cookieResetTimer);
            closeCookieMenu();

            setTimeout(() => {
                tetrisRevealDiv.textContent = '';
                cookieClickCount = 0;
                openTetris();
            }, 500);
        }
    }
});

// Close menu when clicking outside
document.addEventListener('click', function(e) {
    if (!cookieMenu.contains(e.target) && e.target !== cookie) {
        cookieMenu.classList.remove('show');
    }
});

function closeCookieMenu() {
    cookieMenu.classList.remove('show');
}

function moveCookie() {
    x += xSpeed;
    y += ySpeed;

    const cookieSize = 64; // Approximate size of the emoji

    // Bounce off edges
    if (x + cookieSize >= window.innerWidth || x <= 0) {
        xSpeed = -xSpeed;
    }
    if (y + cookieSize >= window.innerHeight || y <= 0) {
        ySpeed = -ySpeed;
    }

    cookie.style.left = x + 'px';
    cookie.style.top = y + 'px';

    requestAnimationFrame(moveCookie);
}

moveCookie();

// ============================================
// TETRIS EASTER EGG - GAME BOY STYLE
// ============================================

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 20;
const COLORS = ['#0f380f', '#306230', '#0f380f', '#8bac0f', '#9bbc0f'];

let tetrisCanvas, tetrisCtx;
let tetrisBoard = [];
let currentPiece = null;
let tetrisScore = 0;
let tetrisLevel = 1;
let tetrisGameRunning = false;
let tetrisGameLoop = null;
let tetrisPaused = false;
let tetrisDropCounter = 0;
let tetrisDropInterval = 1000;

// Tetris pieces (tetrominoes)
const PIECES = {
    I: [[1,1,1,1]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1]],
    S: [[0,1,1],[1,1,0]],
    Z: [[1,1,0],[0,1,1]],
    J: [[1,0,0],[1,1,1]],
    L: [[0,0,1],[1,1,1]]
};

function initTetris() {
    tetrisCanvas = document.getElementById('tetrisCanvas');
    tetrisCtx = tetrisCanvas.getContext('2d');

    // Initialize board
    tetrisBoard = Array(ROWS).fill().map(() => Array(COLS).fill(0));

    tetrisScore = 0;
    tetrisLevel = 1;
    updateTetrisUI();

    spawnPiece();

    // Music already started on cookie click - don't start again
}

function spawnPiece() {
    const pieces = Object.keys(PIECES);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    currentPiece = {
        shape: PIECES[randomPiece],
        x: Math.floor(COLS / 2) - 1,
        y: 0,
        color: 1
    };

    if (collision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
        // Game over
        tetrisGameRunning = false;
        alert('Game Over! Score: ' + tetrisScore);
        closeTetris();
    }
}

function collision(x, y, shape) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col] &&
                (y + row >= ROWS ||
                 x + col < 0 ||
                 x + col >= COLS ||
                 tetrisBoard[y + row] && tetrisBoard[y + row][x + col])) {
                return true;
            }
        }
    }
    return false;
}

function merge() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                tetrisBoard[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
            }
        });
    });
}

function rotate(shape) {
    const rotated = shape[0].map((_, i) =>
        shape.map(row => row[i]).reverse()
    );
    return rotated;
}

function clearLines() {
    let linesCleared = 0;
    for (let row = ROWS - 1; row >= 0; row--) {
        if (tetrisBoard[row].every(cell => cell !== 0)) {
            tetrisBoard.splice(row, 1);
            tetrisBoard.unshift(Array(COLS).fill(0));
            linesCleared++;
            row++; // Check same row again
        }
    }
    if (linesCleared > 0) {
        tetrisScore += linesCleared * 100 * tetrisLevel;
        tetrisLevel = Math.floor(tetrisScore / 1000) + 1;
        tetrisDropInterval = Math.max(100, 1000 - (tetrisLevel * 100));
        updateTetrisUI();
    }
}

function movePiece(dir) {
    currentPiece.x += dir;
    if (collision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
        currentPiece.x -= dir;
    }
}

function dropPiece() {
    currentPiece.y++;
    if (collision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
        currentPiece.y--;
        merge();
        clearLines();
        spawnPiece();
    }
    tetrisDropCounter = 0;
}

function hardDrop() {
    while (!collision(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
        currentPiece.y++;
    }
    merge();
    clearLines();
    spawnPiece();
}

function rotatePiece() {
    const rotated = rotate(currentPiece.shape);
    if (!collision(currentPiece.x, currentPiece.y, rotated)) {
        currentPiece.shape = rotated;
    }
}

function drawTetris() {
    // Clear canvas with Game Boy green
    tetrisCtx.fillStyle = '#0f380f';
    tetrisCtx.fillRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);

    // Draw board
    tetrisBoard.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                drawBlock(x, y, '#8bac0f');
            }
        });
    });

    // Draw current piece
    if (currentPiece) {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(currentPiece.x + x, currentPiece.y + y, '#9bbc0f');
                }
            });
        });
    }
}

function drawBlock(x, y, color) {
    tetrisCtx.fillStyle = color;
    tetrisCtx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
    tetrisCtx.strokeStyle = '#306230';
    tetrisCtx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
}

function updateTetrisUI() {
    document.getElementById('tetrisScore').textContent = tetrisScore;
    document.getElementById('tetrisLevel').textContent = tetrisLevel;
}

function tetrisUpdate(deltaTime) {
    if (!tetrisGameRunning || tetrisPaused) return;

    tetrisDropCounter += deltaTime;
    if (tetrisDropCounter > tetrisDropInterval) {
        dropPiece();
    }

    drawTetris();
}

let lastTetrisTime = 0;
function tetrisLoop(time = 0) {
    const deltaTime = time - lastTetrisTime;
    lastTetrisTime = time;

    tetrisUpdate(deltaTime);

    if (tetrisGameRunning) {
        tetrisGameLoop = requestAnimationFrame(tetrisLoop);
    }
}

// Tetris controls
document.addEventListener('keydown', (e) => {
    if (!tetrisGameRunning) return;

    switch(e.key) {
        case 'ArrowLeft':
            movePiece(-1);
            break;
        case 'ArrowRight':
            movePiece(1);
            break;
        case 'ArrowDown':
            dropPiece();
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case ' ':
            tetrisPaused = !tetrisPaused;
            break;
    }
});

function openTetris() {
    document.getElementById('tetrisOverlay').classList.add('active');
    document.getElementById('mobileControls').classList.add('active');
    tetrisGameRunning = true;
    initTetris();
    tetrisLoop();

    // Play the 8-bit MP3 track
    const mp3Player = document.getElementById('mp3Player');
    mp3Player.volume = 0.3; // Set volume to 30%
    mp3Player.play().catch(err => {
        console.log('Audio play failed:', err);
        document.getElementById('musicPrompt').classList.add('show');
    });
}

function closeTetris() {
    document.getElementById('tetrisOverlay').classList.remove('active');
    document.getElementById('mobileControls').classList.remove('active');
    document.getElementById('musicPrompt').classList.remove('show');
    tetrisGameRunning = false;
    if (tetrisGameLoop) {
        cancelAnimationFrame(tetrisGameLoop);
    }

    // Stop the MP3 player
    const mp3Player = document.getElementById('mp3Player');
    mp3Player.pause();
    mp3Player.currentTime = 0;
}

// Mobile touch controls - also resume audio on first touch (iOS fix)
function handleTouchControl(callback) {
    return function(e) {
        e.preventDefault();

        // Try to play MP3 on first touch (iOS requirement)
        const mp3Player = document.getElementById('mp3Player');
        if (mp3Player.paused) {
            mp3Player.play().then(() => {
                document.getElementById('musicPrompt').classList.remove('show');
            }).catch(err => {
                console.log('Audio play failed on touch:', err);
            });
        }

        if (tetrisGameRunning) callback();
    };
}

document.getElementById('btnLeft').addEventListener('touchstart', handleTouchControl(() => movePiece(-1)));
document.getElementById('btnRight').addEventListener('touchstart', handleTouchControl(() => movePiece(1)));
document.getElementById('btnDown').addEventListener('touchstart', handleTouchControl(() => dropPiece()));
document.getElementById('btnRotate').addEventListener('touchstart', handleTouchControl(() => rotatePiece()));

// Desktop shortcut: Press 'T' three times quickly
let tPressCount = 0;
let tPressTimer = null;
document.addEventListener('keydown', (e) => {
    if (e.key === 't' || e.key === 'T') {
        tPressCount++;
        clearTimeout(tPressTimer);

        if (tPressCount >= 3 && !tetrisGameRunning) {
            tPressCount = 0;
            openTetris();
        } else {
            tPressTimer = setTimeout(() => {
                tPressCount = 0;
            }, 1000);
        }
    }
});
