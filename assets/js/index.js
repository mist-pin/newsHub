import { database, ref, get, getAuth, onAuthStateChanged } from './firebase_config.js';


async function fetchNews() {
    const newsRef = ref(database,);
    const newsSnapshot = await get(newsRef);
    const newsList = [];
    newsSnapshot.forEach((childSnapshot) => {
        newsList.push({ id: childSnapshot.key, ...childSnapshot.val() });
    });

    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = '';
    newsList.forEach(news => {
        const newsItem = document.createElement('div');
        newsItem.addEventListener('click', function () {
            openNews(news.id);
        });
        newsItem.className = 'news-item';
        const newsInbox = document.createElement('div');
        newsInbox.innerHTML = `
          <h2 >${news.title}</h2>
          <p>${news.content}</p>
        `;

        const nextButton = document.createElement('span');
        nextButton.innerHTML = ">>>";
        newsItem.appendChild(newsInbox);
        newsItem.appendChild(nextButton);
        newsContainer.appendChild(newsItem);
    });
}

function openNews(newsId) {
    window.location.href = `news_detail.html?newsId=${newsId}`;
}



window.fetchNews = fetchNews;


export { fetchNews, openNews };