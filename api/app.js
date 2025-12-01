// FREE API without real key (demo key works for tests)
const BASE = "https://gnews.io/api/v4";
const API_KEY = "71fa1d945be210951066a0325b2cbc15"; // no registration required

let currentTopic = "world";
let currentPage = 1;
let currentCountry = ""; // empty = all countries
const pageSize = 6; // сколько новостей подгружается за раз

function loadTopSection(data) {
  const top = document.getElementById('topNews');
  if (!data || data.length < 2) return;

  top.innerHTML = `
    <div class='big-news'>
      <img src='${data[0].image || ''}'/>
      <h2>${data[0].title}</h2>
      <p>${data[0].description || ''}</p>
    </div>
    <div class='side-news'>
      <h3>${data[1].title}</h3>
      <p>${data[1].description || ''}</p>
    </div>`;
}

function loadLatest(data, append=false) {
  const list = document.getElementById('latestNews');
  if (!data) return;

  const html = data
    .map(
      (n) => `
    <div class='card'>
      <img src='${n.image || ''}' />
      <h4>${n.title}</h4>
      <p>${n.description || ''}</p>
    </div>`
    )
    .join('');

  if(append) {
    list.innerHTML += html;
  } else {
    list.innerHTML = html;
  }
}

// Load news by topic
function changeTopic(topic) {
  currentTopic = topic;
  currentPage = 1;

  fetchNews(currentTopic, currentPage);
}

// смена страны для запроса (например 'kg' для Кыргызстана)
function changeCountry(country) {
  currentCountry = country || "";
  currentPage = 1;
  fetchNews(currentTopic, currentPage);
}

// Fetch news with pagination
function fetchNews(topic, page) {
  // Формируем параметры: добавляем country только если выбрана
  let params = `category=${encodeURIComponent(topic)}&max=${pageSize}&page=${page}&apikey=${API_KEY}`;
  if(currentCountry) params += `&country=${encodeURIComponent(currentCountry)}`;
  const url = `${BASE}/top-headlines?${params}`;

  fetch(url)
    .then((r) => r.json())
    .then((d) => {
      if(page === 1){
        loadTopSection(d.articles);
        loadLatest(d.articles);
      } else {
        loadLatest(d.articles, true);
      }
    });
}

// Search news
function searchNews() {
  const q = document.getElementById("searchInput").value.trim();
  if (!q) return;

  currentPage = 1;

  // Для поиска также учитываем выбранную страну (если есть)
  let params = `q=${encodeURIComponent(q)}&max=${pageSize}&page=${currentPage}&apikey=${API_KEY}`;
  if(currentCountry) params += `&country=${encodeURIComponent(currentCountry)}`;
  const url = `${BASE}/search?${params}`;

  fetch(url)
    .then((r) => r.json())
    .then((d) => {
      loadTopSection(d.articles);
      loadLatest(d.articles);
    });
}

// Load more news
function loadMore() {
  currentPage++;
  fetchNews(currentTopic, currentPage);
}

// Load default category
function loadDefault() {
  changeTopic("world");
}

loadDefault();

function loadLatest(data, append=false) {
  const list = document.getElementById('latestNews');
  if (!data) return;

  const html = data
    .map(
      (n, index) => `
    <div class='card' onclick='openModal(${index})'>
      <img src='${n.image || ""}' />
      <h4>${n.title}</h4>
      <p>${n.description || ""}</p>
    </div>`
    )
    .join('');

  if(append) {
    list.innerHTML += html;
  } else {
    list.innerHTML = html;
  }

  // сохраняем последние данные для модального окна
  window.latestArticles = data;
}

// открыть модальное окно
function openModal(index) {
  const article = window.latestArticles[index];
  if(!article) return;

  document.getElementById('modalImage').src = article.image || "";
  document.getElementById('modalTitle').innerText = article.title || "";
  document.getElementById('modalDescription').innerText = article.content || article.description || "";
  document.getElementById('modalSource').innerText = "Source: " + (article.source.name || "");
  document.getElementById('modalDate').innerText = "Published at: " + (article.publishedAt || "");
  document.getElementById('modalUrl').href = article.url || "";

  document.getElementById('newsModal').style.display = "block";
}

// закрыть модальное окно
function closeModal() {
  document.getElementById('newsModal').style.display = "none";
}

// закрыть при клике вне окна
window.onclick = function(event) {
  const modal = document.getElementById('newsModal');
  if(event.target == modal) {
    modal.style.display = "none";
  }
}

