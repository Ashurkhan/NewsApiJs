
const BASE = "https://newsapi.org/v2";
const API_KEY = "3a91e6511187446db42168d4d6eeda7e"; 


let currentTopic = "general";
let currentPage = 1;
let currentCountry = "";
const pageSize = 6;

// Маппинг твоих кнопок → категории NewsAPI
const categoryMap = {
  world: "general",
  politics: "general",
  economy: "business",
  business: "business",
  travel: "general",
  climate: "science",
  technology: "technology",
  sports: "sports"
};

// === ТОП-СЕКЦИЯ (большая + боковая новость) ===
function loadTopSection(articles) {
  const top = document.getElementById('topNews');
  if (!articles || articles.length < 2) {
    top.innerHTML = "<p>Новостей пока нет</p>";
    return;
  }

  top.innerHTML = `
    <div class="big-news" onclick="openModal(0)">
      <img src="${articles[0].urlToImage || 'https://via.placeholder.com/800x400?text=No+Image'}" alt="">
      <h2>${articles[0].title}</h2>
      <p>${articles[0].description || ''}</p>
    </div>
    <div class="side-news" onclick="openModal(1)">
      <h3>${articles[1].title}</h3>
      <p>${articles[1].description || ''}</p>
    </div>
  `;
  window.latestArticles = articles; // сохраняем для модалки
}

// === СПИСОК НОВОСТЕЙ (карточки) ===
function loadLatest(articles, append = false) {
  const list = document.getElementById('latestNews');
  if (!articles || articles.length === 0) return;

  const html = articles.map((n, i) => `
    <div class="card" onclick="openModal(${append ? list.children.length + i : i})">
      <img src="${n.urlToImage || 'https://via.placeholder.com/400?text=No+Image'}" alt="">
      <h4>${n.title}</h4>
      <p>${n.description || 'Подробнее...'}</p>
    </div>
  `).join('');

  if (append) {
    list.innerHTML += html;
  } else {
    list.innerHTML = html;
  }

  window.latestArticles = articles; // обновляем массив для модалки
}

// === ЗАГРУЗКА НОВОСТЕЙ ===
function fetchNews(topic, page) {
  const category = categoryMap[topic] || "general";
  let url = `${BASE}/top-headlines?category=${category}&pageSize=${pageSize}&page=${page}&apiKey=${API_KEY}`;
  if (currentCountry) url += `&country=${currentCountry}`;

  fetch(url)
    .then(r => r.ok ? r.json() : Promise.reject(r))
    .then(data => {
      const articles = data.articles || [];
      if (page === 1) {
        loadTopSection(articles);
        loadLatest(articles);
      } else {
        loadLatest(articles, true);
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById('latestNews').innerHTML = "<p style='color:red;text-align:center;'>Ошибка загрузки новостей</p>";
    });
}

// === СМЕНА ТЕМЫ ===
function changeTopic(topic) {
  currentTopic = topic;
  currentPage = 1;
  fetchNews(topic, currentPage);
}

// === СМЕНА СТРАНЫ ===
function changeCountry(country) {
  currentCountry = country || "";
  currentPage = 1;
  fetchNews(currentTopic, currentPage);
}

// === ПОИСК ===
function searchNews() {
  const q = document.getElementById("searchInput").value.trim();
  if (!q) return;

  currentPage = 1;
  const url = `${BASE}/everything?q=${encodeURIComponent(q)}&pageSize=${pageSize}&page=1&apiKey=${API_KEY}`;

  fetch(url)
    .then(r => r.json())
    .then(data => {
      loadTopSection(data.articles || []);
      loadLatest(data.articles || []);
    });
}

// === ЗАГРУЗИТЬ ЕЩЁ ===
function loadMore() {
  currentPage++;
  fetchNews(currentTopic, currentPage);
}

// === МОДАЛЬНОЕ ОКНО ===
function openModal(index) {
  const article = window.latestArticles[index];
  if (!article) return;

  document.getElementById('modalImage').src = article.urlToImage || '';
  document.getElementById('modalTitle').innerText = article.title;
  document.getElementById('modalDescription').innerText = article.content || article.description || 'Полный текст недоступен';
  document.getElementById('modalSource').innerText = "Источник: " + (article.source.name || "Неизвестно");
  document.getElementById('modalDate').innerText = "Дата: " + new Date(article.publishedAt).toLocaleString();
  document.getElementById('modalUrl').href = article.url;

  document.getElementById('newsModal').style.display = "block";
}

function closeModal() {
  document.getElementById('newsModal').style.display = "none";
}

// Закрытие модалки по клику вне контента
window.onclick = function(e) {
  const modal = document.getElementById('newsModal');
  if (e.target === modal) closeModal();
};

// === СТАРТ ===
changeTopic("world"); // автоматически переведёт в general
