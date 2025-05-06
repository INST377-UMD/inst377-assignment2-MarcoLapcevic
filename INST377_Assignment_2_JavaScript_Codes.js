// JavaScript codes:


function navigate(page) {
  const lower = page.toLowerCase();
  if (lower === 'home') {
    window.location.href = 'home.html';
  } else if (lower === 'stocks') {
    window.location.href = 'stocks.html';
  } else if (lower === 'dogs') {
    window.location.href = 'dogs.html';
  } else {
    alert('Page not found: ' + page);
  }
}

function toggleAnnyang(on) {
  if (annyang) {
    on ? annyang.start() : annyang.abort();
  }
}

const baseCommands = {
  'hello': () => alert('Hello World'),
  'change the color to *color': (color) => document.body.style.backgroundColor = color,
  'navigate to *page': (page) => navigate(page.toLowerCase())
};

if (annyang) annyang.addCommands(baseCommands);

const pages = {
  home: `
    <h1>Welcome to Class Activities</h1>
    <p id="quote"></p>
    <button class="button" onclick="navigate('stocks')">Go to Stocks</button>
    <button class="button" onclick="navigate('dogs')">Go to Dogs</button>
  `,

  stocks: `
    <h2>Stock Lookup</h2>
    <input type="text" id="ticker" placeholder="Enter Ticker Symbol">
    <select id="days">
      <option value="30">30 Days</option>
      <option value="60">60 Days</option>
      <option value="90">90 Days</option>
    </select>
    <button class="button" id="stockBtn">Get Stock Data</button>
    <canvas id="stockChart" width="600" height="400"></canvas>

    <h2>Top 5 Reddit Stocks</h2>
    <table border="1" id="redditStocks">
      <thead><tr><th>Ticker</th><th>Comments</th><th>Sentiment</th></tr></thead>
      <tbody></tbody>
    </table>
  `,

  dogs: `
    <h2>Dog Carousel</h2>
    <div id="dogCarousel" class="slider"></div>

    <h2>Dog Breeds</h2>
    <div id="breedButtons"></div>
    <div id="breedInfo"></div>
  `
};

let chart;
function fetchStockData() {
  const ticker = document.getElementById('ticker').value.toUpperCase();
  const days = +document.getElementById('days').value;
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  const from = start.toISOString().split('T')[0];
  const to = end.toISOString().split('T')[0];
  const apiKey = "fDvBXxVwS_yRlylpuAeBWT7eVqJ3aDeM";
  fetch(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (!data.results) {
        alert('No data found for ticker.');
        return;
      }
      const labels = data.results.map(entry => new Date(entry.t).toLocaleDateString());
      const prices = data.results.map(entry => entry.c);
      const ctx = document.getElementById('stockChart').getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: `${ticker} Close Price`,
            data: prices,
            borderColor: 'blue',
            fill: false
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true }
          }
        }
      });
    })
    .catch(err => alert('Error fetching stock data.'));
}


// Stocks page setup:
function setupStocksPage() {
  document.getElementById('stockBtn').addEventListener('click', fetchStockData);

  fetch('https://tradestie.com/api/v1/apps/reddit?date=2022-04-03')
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('#redditStocks tbody');
      tbody.innerHTML = '';
      data.slice(0, 5).forEach(stock => {
        const row = document.createElement('tr');
        row.innerHTML = `<td><a href="https://finance.yahoo.com/quote/${stock.ticker}" target="_blank">${stock.ticker}</a></td>
                         <td>${stock.no_of_comments}</td>
                         <td>${stock.sentiment === 'Bullish' ? '🐂' : '🐻'}</td>`;
        tbody.appendChild(row);
      });
    });

  if (annyang) {
    annyang.addCommands({
      'lookup *stock': stock => {
        document.getElementById('ticker').value = stock.toUpperCase();
        document.getElementById('days').value = "30";
        fetchStockData();
      }
    });
  }
}


// Dogs page setup:
function setupDogsPage() {
  fetch('https://dog.ceo/api/breeds/image/random/10')
    .then(res => res.json())
    .then(data => {
      const carousel = document.getElementById('dogCarousel');
      carousel.innerHTML = '';
      data.message.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.width = 150;
        img.alt = "Dog Image";
        carousel.appendChild(img);
      });
    });

  fetch('https://api.thedogapi.com/v1/breeds')
    .then(res => res.json())
    .then(breeds => {
      const btnContainer = document.getElementById('breedButtons');
      const info = document.getElementById('breedInfo');
      btnContainer.innerHTML = '';
      info.innerHTML = '';

      const commands = {};

      breeds.forEach(breed => {
        const btn = document.createElement('button');
        btn.textContent = breed.name;
        btn.className = 'button';
        btn.onclick = () => {
          info.innerHTML = `
            <h3>${breed.name}</h3>
            <p>${breed.temperament || 'No temperament info available'}</p>
            <p>Lifespan: ${breed.life_span}</p>`;
        };
        btnContainer.appendChild(btn);

        const breedName = breed.name.toLowerCase();
        commands[`load dog breed ${breedName}`] = () => {
          console.log('Voice command detected for breed:', breedName);
          document.querySelectorAll('#breedButtons button').forEach(button => {
            if (button.textContent.toLowerCase() === breedName) button.click();
          });
        };
      });

      if (annyang) {
        console.log("Adding dog breed voice commands");
        annyang.addCommands(commands);
        annyang.start(); 
        console.log("Annyang started after adding dog commands");
      }
    });
}


// Home page quote setup:
function renderPage() {
  const page = window.location.hash.replace('#', '') || 'home';

  if (document.getElementById('app')) {
    document.getElementById('app').innerHTML = pages[page];
  }

  if (page === 'home') {
    fetch('https://api.quotable.io/random')
      .then(res => res.json())
      .then(data => {
        const quoteEl = document.getElementById('quote');
        if (quoteEl) {
          quoteEl.innerText = `"${data.content}" — ${data.author}`;
        }
      });
  } else if (page === 'stocks') {
    setupStocksPage();
  } else if (page === 'dogs') {
    setupDogsPage();
  }
}


window.addEventListener('load', () => {
  renderPage();
  if (annyang) annyang.start();
});
window.addEventListener('hashchange', renderPage);
