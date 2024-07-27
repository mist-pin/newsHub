import { database, ref, push, set, get, auth, signInWithEmailAndPassword, signOut, getAuth, onAuthStateChanged, storage, storageRef, uploadBytes, getDownloadURL } from './firebase_config.js';
import { fetchNews, openNews } from './index.js';
// login-signup
function checkAuth() {
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        if (user) {
            const username = user.email;
            console.log("User is logged in:", username);
            fetchNews();
        } else {
            console.log("No user is logged in.");
            window.location.href = "login.html";
        }
        unsubscribe();
    });
}

async function adminLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("login successfull")
    } catch (error) {
        alert("Login failed: " + error.message);
        return;
    }
    window.location.href = "admin.html"
}

function logout() {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        alert("Logout failed: " + error.message);
    });
}





// admin side
async function add_news() {
    const content = document.getElementById('news-content').value;
    const title = document.getElementById('news-title').value;
    const thumbnail = document.getElementById('news-thumbnail').files[0];

    if (!title || !content) {
        alert('Please enter both title and content.');
        return;
    }

    let thumb_data = '';

    if (thumbnail) {
        try {
            const storageReference = storageRef(storage, `news-thumbnails/${thumbnail.name}`);
            const snapshot = await uploadBytes(storageReference, thumbnail);
            console.log('Uploaded a blob or file!', snapshot);
            thumb_data = await getDownloadURL(snapshot.ref);
        } catch (error) {
            alert('Error uploading file:', error.message);
            return;
        }
    }

    try {
        const newsRef = ref(database);
        await push(newsRef, {
            title: title,
            content: content,
            created_at: Date.now(),
            updated_at: Date.now(),
            likes: 0,
            thumbnail: thumb_data,
            comments: {}
        });

        alert("News submitted successfully!");
        document.getElementById('news-title').value = '';
        document.getElementById('news-content').value = '';
        document.getElementById('news-thumbnail').value = '';
        window.location.reload();
    } catch (error) {
        alert('Error saving news:', error.message);
        console.log(error);
    }
}



window.adminLogin = adminLogin;
window.add_news = add_news;
window.fetchNews = fetchNews;
window.openNews = openNews;
window.logout = logout;
window.checkAuth = checkAuth;