import { database, ref, push, set, get, child, auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, storage, storageRef, uploadBytes, getDownloadURL } from './firebase_config.js';


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


onAuthStateChanged(auth, (user) => {
    if (user) {
        // showAdminPanel();
    } else {
        // showNewsList();
    }
});













//user side
function fetch_news() {

}







// admin side

async function get_news_count(update) {
    // returns the count of the news if update is true, then add+1 and push the value too
    const newsCountRef = ref(database, 'news_count');
    const newsCountSnapshot = await get(newsCountRef);
    let newsCount = newsCountSnapshot.exists() ? newsCountSnapshot.val() : 0;

    if (update) {
        // Increment the news count and update in database
        newsCount += 1;
        await set(newsCountRef, newsCount);
    }

    return newsCount;
}


async function add_news() {
    const content = quill.root.innerHTML;
    const title = document.getElementById('news-title').value;

    if (title.trim() === "" || content.trim() === "") {
        alert("Please provide both title and content.");
        return;
    }
    const newsRef = ref(database, `${get_news_count(false)}`);
    await set(newsRef, {
        title: title,
        content: content,
        created_at: Date.now(),
        updated_at: Date.now(),
        likes: 0,
        comments: {}
    });

    alert("News submitted successfully!");
    document.getElementById('news-title').value = '';
    quill.root.innerHTML = '';
    showNewsList();
}