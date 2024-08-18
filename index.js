// imports
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { firebaseConfig } from "./firebase-config";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initilize Firebase auth
const auth = getAuth(app);

/* === UI === */

/* == UI - Elements == */

const viewLoggedOut = document.getElementById("logged-out-view")
const viewLoggedIn = document.getElementById("logged-in-view")

const signInWithGoogleButtonEl = document.getElementById("sign-in-with-google-btn")

const emailInputEl = document.getElementById("email-input")
const passwordInputEl = document.getElementById("password-input")

const signInButtonEl = document.getElementById("sign-in-btn")
const createAccountButtonEl = document.getElementById("create-account-btn")

const signOutButtonEl = document.querySelector(".js-logout-btn");

/* == UI - Event Listeners == */

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle)

signInButtonEl.addEventListener("click", authSignInWithEmailAndPassword)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmailAndPassword)

signOutButtonEl.addEventListener("click", authSignOut);

// variables

/* === Main Code === */
onAuthStateChanged(auth, user => {
    if (user) {
        const uID = user.uid;
        showLoggedInView();
    } else {
        showLoggedOutView();
    }
});


/* === Functions === */

/* = Functions - Firebase - Authentication = */

function authSignInWithGoogle() {
    console.log("Sign in with Google")
}

function authSignInWithEmailAndPassword() {
    const password = passwordInputEl.value;
    const email = emailInputEl.value;

    signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            const user = userCredential.user;
            clearAuthInput();

        }).catch(error => {
            console.log(error);

        })
};

function authCreateAccountWithEmailAndPassword() {
    const password = passwordInputEl.value;
    const email = emailInputEl.value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            clearAuthInput();

        }).catch(error => {
            const errorCode = error.errorCode;
            const errorMessage = error.message
            console.log(error);

        })
}

function authSignOut() {
    signOut(auth).then(() => {
        console.log("Sign out");

    }).catch(err => console.error(err))
};

/* == Functions - UI Functions == */

function showLoggedOutView() {
    hideElement(viewLoggedIn)
    showElement(viewLoggedOut)
}

function showLoggedInView() {
    hideElement(viewLoggedOut)
    showElement(viewLoggedIn)
}

function showElement(element) {
    element.style.display = "flex"
}

function hideElement(element) {
    element.style.display = "none"
};

function clearInputField(field) {
    field.value = "";
};

function clearAuthInput() {
    clearInputField(emailInputEl);
    clearInputField(passwordInputEl);
}