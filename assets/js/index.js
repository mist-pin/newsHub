import { database, ref, get, set, push, child } from './firebase_config.js';


function showSection(sectionId) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => section.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
}

// import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
// import { getDatabase, ref, push, set, get, child } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';
// import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
// import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

// Firebase configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyBZuNtoMgy77mvk165vuzBhOecjBQRULVA",
//     authDomain: "expensetracker-27c8f.firebaseapp.com",
//     databaseURL: "https://expensetracker-27c8f-default-rtdb.firebaseio.com",
//     projectId: "expensetracker-27c8f",
//     storageBucket: "expensetracker-27c8f.appspot.com",
//     messagingSenderId: "487606584678",
//     appId: "1:487606584678:web:5f7316bd18dcc913fb74a7"
// };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const database = getDatabase(app);
// const auth = getAuth(app);
// const storage = getStorage(app);

// Initialize Quill editor
const quill = new Quill('#editor-container', {
    theme: 'snow',
    modules: {
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image']
            ],
            handlers: {
                'image': imageHandler
            }
        }
    }
});

function imageHandler() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
        const file = input.files[0];
        const fileRef = storageRef(storage, `images/${file.name}`);
        await uploadBytes(fileRef, file);
        const imageUrl = await getDownloadURL(fileRef);
        insertToEditor(imageUrl);
    };
}

function insertToEditor(url) {
    const range = quill.getSelection();
    quill.insertEmbed(range.index, 'image', url);
}

// Admin login
async function adminLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert("Login failed: " + error.message);
        return;
    }
    showAdminPanel();
}

function showAdminPanel() {
    document.querySelector('.login').style.display = 'none';
    document.querySelector('.admin-panel').style.display = 'block';
    document.querySelector('.news-list').style.display = 'none';
    fetchNews();
}

function showNewsList() {
    document.querySelector('.login').style.display = 'none';
    document.querySelector('.admin-panel').style.display = 'none';
    document.querySelector('.news-list').style.display = 'block';
    fetchNews();
}

async function submitNews() {
    const content = quill.root.innerHTML;
    const title = document.getElementById('news-title').value;
    const author = auth.currentUser.email;

    if (title.trim() === "" || content.trim() === "") {
        alert("Please provide both title and content.");
        return;
    }

    const newsRef = ref(database, 'news');
    const newNewsRef = push(newsRef);
    await set(newNewsRef, {
        title: title,
        content: content,
        author: author,
        created_at: Date.now(),
        updated_at: Date.now(),
        likes: {},
        comments: {}
    });

    alert("News submitted successfully!");
    document.getElementById('news-title').value = '';
    quill.root.innerHTML = '';
    showNewsList();
}

async function fetchNews() {
    const newsRef = ref(database, 'news');
    const newsSnapshot = await get(newsRef);
    const newsList = [];
    newsSnapshot.forEach((childSnapshot) => {
        newsList.push({ id: childSnapshot.key, ...childSnapshot.val() });
    });

    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = '';
    newsList.forEach(news => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.innerHTML = `
          <h2>${news.title}</h2>
          <div>${news.content}</div>
          <button onclick="likeNews('${news.id}')">Like (${Object.keys(news.likes || {}).length})</button>
          <div class="comments">
            <input type="text" id="comment-${news.id}" placeholder="Add a comment">
            <button onclick="addComment('${news.id}')">Comment</button>
            <div id="comments-${news.id}"></div>
          </div>
        `;
        newsContainer.appendChild(newsItem);
        displayComments(news.id, news.comments);
    });
}

async function likeNews(newsId) {
    const userId = auth.currentUser.uid;
    const likeRef = ref(database, `news/${newsId}/likes/${userId}`);
    const snapshot = await get(likeRef);
    if (snapshot.exists()) {
        await set(likeRef, null); // Unlike
    } else {
        await set(likeRef, true); // Like
    }
    fetchNews(); // Refresh the news list to update the like count
}

async function addComment(newsId) {

    const commentRef = ref(database, `news/${newsId}/comments/${auth.currentUser.uid}`);
    await set(commentRef, { text: commentText, timestamp: Date.now() });
    commentInput.value = '';
    fetchNews(); // Refresh the news list to update the comments
}

function displayComments(newsId, comments) {
    const commentsContainer = document.getElementById(`comments-${newsId}`);
    commentsContainer.innerHTML = '';
    for (const [userId, comment] of Object.entries(comments || {})) {
        const commentElement = document.createElement('div');
        commentElement.textContent = comment.text;
        commentsContainer.appendChild(commentElement);
    }
}

function logout() {
    signOut(auth).then(() => {
        document.querySelector('.login').style.display = 'block';
        document.querySelector('.admin-panel').style.display = 'none';
        document.querySelector('.news-list').style.display = 'none';
    }).catch((error) => {
        alert("Logout failed: " + error.message);
    });
}

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        showAdminPanel();
    } else {
        showNewsList();
    }
});

window.showSection = showSection;