
const watchlistRow = document.getElementById("watchlistRow");

let watchlist = [];
const marketGrid = document.getElementById("marketGrid");
const searchInput = document.querySelector(".nav-search");

let allCoins = [];
let isViewAll = false;
// Load watchlist from localStorage
function loadWatchlist() {
  const stored = localStorage.getItem("watchlist");
  if (stored) {
    watchlist = JSON.parse(stored);
  }
}

// Save watchlist to localStorage
function saveWatchlist() {
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
}

// CoinGecko API
const API_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h";

// Fetch data
async function fetchMarketData() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("API failed");

    const data = await response.json();
    allCoins = data; // store full list
    if (isViewAll) {
        renderMarketCards(allCoins);
    } else {
        renderMarketCards(allCoins.slice(0, 8));
    }
  } catch (error) {
    marketGrid.innerHTML =
      "<p style='color:#ef4444'>Failed to load market data.</p>";
  }
}

// Render cards
function renderMarketCards(coins) {
  marketGrid.innerHTML = "";

  coins.forEach((coin) => {
    const change = coin.price_change_percentage_24h;
    const changeClass = change >= 0 ? "positive" : "negative";

    const isInWatchlist = watchlist.some(
      (item) => item.id === coin.id
    );

    const card = document.createElement("div");
    card.className = "crypto-card";

    card.innerHTML = `
    <div class="card-top">
      <div class="coin-info">
        <img
          src="${coin.image}"
          alt="${coin.name}"
          class="coin-logo"
        />
        <span class="coin-name">${coin.name}</span>
      </div>
      <span class="star">${isInWatchlist ? "★" : "☆"}</span>
    </div>
      <span class="symbol">${coin.symbol.toUpperCase()}</span>
      <h3>$${coin.current_price.toLocaleString()}</h3>
      <p class="${changeClass}">
        ${change >= 0 ? "+" : ""}${change.toFixed(2)}%
      </p>
    `;

    // Star click event
    card.querySelector(".star").addEventListener("click", () => {
      toggleWatchlist(coin);
    });

    marketGrid.appendChild(card);
  });
}
function toggleWatchlist(coin) {
  const index = watchlist.findIndex(
    (item) => item.id === coin.id
  );

  if (index === -1) {
    watchlist.push(coin);
  } else {
    watchlist.splice(index, 1);
  }
  saveWatchlist();
  renderWatchlist();
  if (isViewAll) {
    renderMarketCards(allCoins);
  } else {
    renderMarketCards(allCoins.slice(0, 8));
}
}
function renderWatchlist() {
  const addCard = document.getElementById("addWatchlistCard");

  watchlistRow.innerHTML = "";

  if (watchlist.length === 0) {
    watchlistRow.appendChild(addCard);
    return;
  }

  watchlist.forEach((coin) => {
    const change = coin.price_change_percentage_24h;
    const changeClass = change >= 0 ? "positive" : "negative";

    const card = document.createElement("div");
    card.className = "crypto-card";

    card.innerHTML = `
      <div class="card-top">
        <div class="coin-info">
          <img
            src="${coin.image}"
            alt="${coin.name}"
            class="coin-logo"
          />
          <span class="coin-name">${coin.name}</span>
        </div>
        <span class="star">★</span>
      </div>
      <span class="symbol">${coin.symbol.toUpperCase()}</span>
      <h3>$${coin.current_price.toLocaleString()}</h3>
      <p class="${changeClass}">
        ${change >= 0 ? "+" : ""}${change.toFixed(2)}%
      </p>
    `;

    card.querySelector(".star").addEventListener("click", () => {
      toggleWatchlist(coin);
    });

    watchlistRow.appendChild(card);
  });

  // 🔑 Always keep Add Asset card at the end
  watchlistRow.appendChild(addCard);
}
// Search filter
searchInput.addEventListener("input", (e) => {
  const searchText = e.target.value.toLowerCase();

  // If user is searching, always show full matching list
  if (searchText.length > 0) {
    isViewAll = true;

    const filteredCoins = allCoins.filter((coin) =>
      coin.name.toLowerCase().includes(searchText)
    );

    renderMarketCards(filteredCoins);
  } else {
    // Search cleared → back to top 10
    isViewAll = false;
    renderMarketCards(allCoins.slice(0, 10));
  }
});

const viewAllBtn = document.querySelector(".view-all-btn");

if (viewAllBtn) {
  viewAllBtn.addEventListener("click", () => {
    isViewAll = !isViewAll; // 🔁 toggle state

    if (isViewAll) {
      renderMarketCards(allCoins);
      viewAllBtn.textContent = "View Less";
    } else {
      renderMarketCards(allCoins.slice(0, 10));
      viewAllBtn.textContent = "View All Cryptocurrencies";
    }
  });
}
const addWatchlistCard = document.getElementById("addWatchlistCard");

if (addWatchlistCard) {
  addWatchlistCard.addEventListener("click", () => {
    // Scroll to Market Overview
    document.querySelector(".market").scrollIntoView({
      behavior: "smooth"
    });

    // Focus search input
    searchInput.focus();

    // Optional hint
    searchInput.placeholder = "Search assets and click ⭐ to add to watchlist";
  });
}


// Load watchlist first
loadWatchlist();
renderWatchlist();

// Fetch market data
fetchMarketData();

// Auto refresh
setInterval(fetchMarketData, 30000);