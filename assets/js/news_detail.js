import { database, ref, get, push } from "./firebase_config.js";

const urlParams = new URLSearchParams(window.location.search);
const newsId = urlParams.get('newsId');

const newsTitle = document.getElementById('news-title');
const newsThumbnail = document.getElementById('news-thumbnail');
const newsContent = document.getElementById('news-content');

const dbRef = ref(database, `/${newsId}`);
const newsSnapshot = await get(dbRef);
if (newsSnapshot) {
    console.log(newsSnapshot)
}
get(dbRef).then((snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        newsTitle.textContent = data.title;
        newsThumbnail.src = data.thumbnail;
        newsContent.textContent = data.content;
    } else {
        console.log("No data available");
    }
}).catch((error) => {
    console.error(error);
    alert('something went wrong', error)
    window.location.reload();
});
loadComments();


async function loadComments() {
    const comref = ref(database, `/${newsId}/comments`);
    try {
        const snapshot = await get(comref);
        if (snapshot.exists()) {
            const comments = snapshot.val();
            const container = document.getElementById('com_holder');
            container.innerHTML = '';
            for (const [id, content] of Object.entries(comments)) {
                const p = document.createElement('p');
                const date = new Date(content.timestamp);
                const formattedDate = date.toLocaleString();
                p.innerHTML = formattedDate + " : " + content.text;
                p.fid = id;
                container.appendChild(p);
            }
        } else {
            console.log('No comments available');
        }
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
}


async function likeNews(newsId) {
    const userId = auth.currentUser.uid;
    const likeRef = ref(database, `news/${newsId}/likes`);
    const snapshot = await get(likeRef);
    if (snapshot.exists()) {
        await set(likeRef, null);
    } else {
        await set(likeRef, true);
    }
}


async function addComment() {
    const commentInput = document.getElementById('new_comment')
    let commentText = commentInput.value;
    console.log('text: ', commentText);
    const commentRef = ref(database, `${newsId}/comments`);
    await push(commentRef, { text: commentText, timestamp: Date.now() });
    commentInput.value = '';
    loadComments();
}


window.addComment = addComment;
window.likeNews = likeNews;