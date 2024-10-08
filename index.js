// imports
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initilize Firebase auth
const auth = getAuth(app);

const provider = new GoogleAuthProvider();

// Initialize could firestore
const db = getFirestore(app);

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

const postButtonEl = document.getElementById("post-btn");
const textareaEl = document.getElementById("text-input");

const moodEmojiElements = document.getElementsByClassName("mood-emoji-btn");

const postsEl = document.getElementById("display-posts");

const filterButtonEls = document.getElementsByClassName("filter-btn");
const allFilterButtonEl = document.getElementById("all-filter-btn");

/* == UI - Event Listeners == */

toggleUpdateFormButtonEl.addEventListener("click", toggleUpdateProfileForm);

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle)

signInButtonEl.addEventListener("click", authSignInWithEmailAndPassword)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmailAndPassword)

signOutButtonEl.addEventListener("click", authSignOut);

updateProfileButtonEl.addEventListener("click", authUpdateProfile);

postButtonEl.addEventListener("click", handlePostButton);

// loop and add event listener
for (const moodButtons of moodEmojiElements) {
    moodButtons.addEventListener("click", handleSelectMood);
}

for (const fileterButton of filterButtonEls) {
    fileterButton.addEventListener("click", selectFilterButton);
}

// State
let moodState = 0;

// Global variables
const collectionName = "posts";

/* === Main Code === */
onAuthStateChanged(auth, user => {
    if (user) {
        showLoggedInView();
        showProfilePicture(userProfilePictureEl, user);
        showUserGreeting(userGreetingEl, user);
        styleOnFilterButtonSelect(allFilterButtonEl);
        fetchAllPosts(user);
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

async function addPostToDB(postBody, user) {
    try {
        const docRef = await addDoc(collection(db, collectionName), {
            body: postBody,
            uid: user.uid,
            createdAt: serverTimestamp(),
            moodState
        });

        console.log("Document written with document ID:", docRef.id);

    } catch (err) {
        console.error("Error adding document:", err);
    }
}

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
};

function handlePostButton() {
    const postBody = textareaEl.value;
    const user = auth.currentUser

    if (postBody && moodState) {
        addPostToDB(postBody, user);
        clearInputField(textareaEl);
        resetAllMoodElements(moodEmojiElements);
    } else {
        console.log("Please choose a mood and write something in the post");
    }
};

// mood operation functions
function handleSelectMood(e) {
    const selectMoodEmojiElementID = e.currentTarget.id;
    changeMoodStyleAfterSelection(selectMoodEmojiElementID);

    const choosenMoodValue = returnValueFromElementID(selectMoodEmojiElementID);

    moodState = choosenMoodValue;
};

function changeMoodStyleAfterSelection(selectedMoodElementId) {
    for (const moodElements of moodEmojiElements) {
        if (moodElements.id === selectedMoodElementId) {
            moodElements.classList.remove("unselected-emoji");
            moodElements.classList.add("selected-emoji");
        } else {
            moodElements.classList.remove("selected-emoji");
            moodElements.classList.add("unselected-emoji");
        }
    };
};

function resetAllMoodElements(allMoodElements) {
    for (const moodElement of allMoodElements) {
        moodElement.classList.remove("selected-emoji");
        moodElement.classList.remove("unselected-emoji");
    };

    moodState = 5;
}

function returnValueFromElementID(elementId) {
    return Number(elementId.slice(5));
};

// fetch and render posts

function queryAndFetchForAPeriod(user, startPeriod) {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const postRef = collection(db, collectionName);
    const q = query(postRef, where("uid", "==", user.uid),
        where("createdAt", ">=", startPeriod),
        where("createdAt", "<=", endOfDay),
        orderBy("createdAt", "desc"))

    fetchInRealtimeAndRenderPostsFromDB(q);
}

function fetchTodayPost(user) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    queryAndFetchForAPeriod(user, startOfDay);
};

function fetchWeekPost(user) {
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);

    if (startOfWeek.getDay() === 0) { // if today is sunday
        startOfWeek.setDate(startOfWeek.getDate() - 6); // go back to previous Monday
    } else {
        // set the start week as previous sunday
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1)
    };

    queryAndFetchForAPeriod(user, startOfWeek);
};

function fetchMonthPost(user) {
    const startOfMonth = new Date();
    startOfMonth.setHours(0, 0, 0, 0);
    startOfMonth.setDate(1);

    queryAndFetchForAPeriod(user, startOfMonth);
};

function fetchAllPosts(user) {
    const q = query(collection(db, collectionName), where("uid", "==", user.uid),
        orderBy("createdAt", "desc"));

    fetchInRealtimeAndRenderPostsFromDB(q);
}

function clearAll(elem) {
    elem.innerHTML = "";
}

function displayDate(firestoreTimestamp) {
    if (!firestoreTimestamp) return "processing...";
    const date = firestoreTimestamp.toDate();

    const year = date.getFullYear();
    const day = date.getDate();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];

    let hours = date.getHours();
    let minutes = date.getMinutes();

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    return `${day} ${month}, ${year} - ${hours}:${minutes}`;
};

function fetchInRealtimeAndRenderPostsFromDB(query) {

    onSnapshot(query, (querySnapshot) => {
        clearAll(postsEl);

        querySnapshot.forEach(doc => {
            resetPost(postsEl, doc);
        })
    });
};

async function updatePostInDB(postID, newPostBody) {
    const updatePostRef = doc(db, collectionName, postID);

    await updateDoc(updatePostRef, { body: newPostBody });
};

async function deletePostInDB(postID) {
    const deleteRef = doc(db, collectionName, postID);

    await deleteDoc(deleteRef);
}

function createUpdateTextButton(wholeDoc) {
    const postData = wholeDoc.data();
    const postID = wholeDoc.id;

    const button = document.createElement('button');
    button.textContent = "Edit";
    button.className = "edit-color";

    button.addEventListener("click", function () {
        const newPostBody = prompt('Edit this post', postData.body);

        if (newPostBody) {
            updatePostInDB(postID, newPostBody);
        };
    });

    return button;
};

function createDeletePostButton(wholeDoc) {
    const postID = wholeDoc.id;

    const button = document.createElement('button');
    button.textContent = "Delete";
    button.className = "delete-color";
    button.addEventListener("click", function () {
        deletePostInDB(postID);
    });

    return button;
}

function createPostFooter(wholeDoc) {
    const footerDiv = document.createElement("div");
    footerDiv.className = 'footer';

    footerDiv.appendChild(createUpdateTextButton(wholeDoc));
    footerDiv.appendChild(createDeletePostButton(wholeDoc));

    return footerDiv;
}

function resetPost(postsEl, wholeDoc) {
    const postData = wholeDoc.data();

    const postDiv = document.createElement('div');
    postDiv.classList = "post";

    const postDivHeader = document.createElement('header');
    postDivHeader.className = "header";

    const headerH3 = document.createElement('h3');
    headerH3.textContent = `${displayDate(postData.createdAt)}`;

    const headerImg = document.createElement("img");
    headerImg.src = `assets/emojis/${postData.moodState}.png`;
    headerImg.alt = "mood emoji";

    const postBodyPara = document.createElement("p");
    postBodyPara.innerText = `${postData.body}`;

    postDivHeader.append(headerH3, headerImg);
    postDiv.appendChild(postDivHeader);
    postDiv.appendChild(postBodyPara);
    postDiv.appendChild(createPostFooter(wholeDoc));

    postsEl.appendChild(postDiv);
}

// filter buttons
function resetAllFilterButtons(allFilterButtons) {
    for (const filterButton of allFilterButtons) {
        filterButton.classList.remove("selected-filter")
    }
};

function styleOnFilterButtonSelect(element) {
    element.classList.add("selected-filter");
};

function queryAndFetchFromSelectedPeriod(period, user) {
    if (period === "today") fetchTodayPost(user);
    if (period === "week") fetchWeekPost(user);
    if (period === "month") fetchMonthPost(user);
    if (period === "all") fetchAllPosts(user);
};


function selectFilterButton(e) {
    const user = auth.currentUser;

    const selectedFilterElementId = e.currentTarget.id;

    const selectedElementPeriod = selectedFilterElementId.split("-")[0];

    const selectedElement = document.getElementById(selectedFilterElementId);

    resetAllFilterButtons(filterButtonEls);
    styleOnFilterButtonSelect(selectedElement);

    queryAndFetchFromSelectedPeriod(selectedElementPeriod, user);
}