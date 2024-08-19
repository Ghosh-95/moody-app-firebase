// imports
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
import { firebaseConfig } from "./firebase-config";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initilize Firebase auth
const auth = getAuth(app);

const provider = new GoogleAuthProvider();

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

const userProfilePictureEl = document.getElementById("user-profile-picture");
const userGreetingEl = document.getElementById("user-greet");

const profielUpdateFormEl = document.getElementById("profile-update-form");
const displayNameInputEl = document.getElementById("display-name-input");
const photoUrlInputEl = document.getElementById("photo-url-input");
const updateProfileButtonEl = document.getElementById("update-profile-btn");

const toggleUpdateFormButtonEl = document.getElementById("toggle-update-form-btn");

/* == UI - Event Listeners == */

toggleUpdateFormButtonEl.addEventListener("click", toggleUpdateProfileForm);

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle)

signInButtonEl.addEventListener("click", authSignInWithEmailAndPassword)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmailAndPassword)

signOutButtonEl.addEventListener("click", authSignOut);

updateProfileButtonEl.addEventListener("click", authUpdateProfile);

// variables

/* === Main Code === */
onAuthStateChanged(auth, user => {
    if (user) {
        showLoggedInView();
        showProfilePicture(userProfilePictureEl, user);
        showUserGreeting(userGreetingEl, user);
    } else {
        showLoggedOutView();
    }
});


/* === Functions === */

/* = Functions - Firebase - Authentication = */

function authSignInWithGoogle() {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("Signed in with google");

        }).catch((error) => {
            console.error(error.message);
        });
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
    }).catch(err => console.error(err))
};

function authUpdateProfile(e) {
    e.preventDefault();

    const newDisplayName = displayNameInputEl.value;
    const newPhotoUrl = photoUrlInputEl.value;

    updateProfile(auth.currentUser, {
        displayName: newDisplayName,
        photoURL: newPhotoUrl,
    })
        .then(() => {
            console.log("Profile Updated");
            clearUpdateInput();
        })
        .catch(err => console.error(err))

    toggleUpdateFormButtonEl.classList.remove("hide");
    profielUpdateFormEl.classList.add("hide");

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
};

function clearUpdateInput() {
    clearInputField(displayNameInputEl);
    clearInputField(photoUrlInputEl);
}

function showProfilePicture(fieldElement, user) {
    const photoURL = user.photoURL;

    if (photoURL) {
        fieldElement.src = photoURL;
    } else {
        fieldElement.src = "./assets/default-profile-picture.svg"
    };
};

function showUserGreeting(elem, user) {
    const userName = user.displayName;

    if (userName) {
        elem.textContent = "Hi " + userName.split(" ").at(0);
    } else {
        elem.textContent = "Hello buddy!";
    }
};

function toggleUpdateProfileForm(e) {
    profielUpdateFormEl.classList.remove("hide");
    e.target.classList.add("hide");
}