'use strict';

// ===== DOM ELEMENTS =====
const btn = document.querySelector('.btn-country');
const countryInput = document.getElementById('input');
const appContainer = document.querySelector('.container');
const countriesContainer = document.querySelector('.countries');
const countriesBody = document.querySelector('.countries-body');
const universitiesWrapper = document.querySelector('.images');

// ===== ERROR ELEMENT (تحت الجدول) =====
const errorContainer = document.createElement('p');
errorContainer.classList.add('error');
countriesContainer.append(errorContainer);

// ===== SUMMARY ELEMENT (خارج قائمة الجامعات بمكان ثابت) =====
const uniSummary = document.createElement('div');
uniSummary.classList.add('uni-summary');
universitiesWrapper.after(uniSummary);

// ===== LOADER OVERLAY =====
const loader = document.createElement('div');
loader.classList.add('loader', 'hidden');
loader.innerHTML = `<div class="spinner"></div>`;
appContainer.append(loader);

const showLoader = () => loader.classList.remove('hidden');
const hideLoader = () => loader.classList.add('hidden');

// نخزّن آخر Region عشان نلوّن الجامعات بناءً عليه
let lastRegion = null;

// ===== UI: RENDER COUNTRY ROW IN TABLE =====
const renderCountry = function (data, className = '') {
  const countryName = data.altSpellings?.[1] || data.name?.common || 'Unknown';

  const html = `
    <tr class="country ${className}">
      <td>
        <img class="country__img" src="${data.flags.png}" alt="${countryName} flag" />
      </td>
      <td>${countryName}</td>
      <td>${data.region}</td>
      <td>${(+data.population / 1000000).toFixed(1)} m</td>
      <td>${Object.values(data.languages || {})[0] || '-'}</td>
      <td>${Object.values(data.currencies || {})[0]?.symbol || '-'}</td>
    </tr>
  `;

  countriesBody.insertAdjacentHTML('beforeend', html);
  countriesContainer.classList.remove('error');
  errorContainer.textContent = '';
};

// ===== UI: RENDER ERROR =====
const renderError = function (msg) {
  errorContainer.textContent = msg;
  countriesContainer.classList.add('error');
};

// ===== HELPER: FETCH JSON WITH ERROR HANDLING =====
const getJson = (url, errorMsg) => {
  return fetch(url).then(response => {
    if (!response.ok) throw new Error(`${errorMsg} ❗ ${response.status}`);
    return response.json();
  });
};

// ===== MAIN: FETCH COUNTRY + NEIGHBOUR =====
const getCountryData = country => {
  return getJson(
    `https://restcountries.com/v3.1/name/${country}`,
    `"${country}" not found`
  )
    .then(data => {
      const mainCountry = data[0];

      // نحفظ Region لاستخدامه مع الجامعات
      lastRegion = mainCountry.region;

      // نعرف إذا فيه جار أو لا
      const neighbour = mainCountry.borders?.[0];

      // كلاس مختلف حسب وجود جار
      renderCountry(
        mainCountry,
        neighbour ? 'has-neighbour' : 'no-neighbour'
      );

      // نجيب الجامعات (مرة واحدة)
      listOfUni(country);

      // لو ما فيه جار نوقف السلسلة بهدوء
      if (!neighbour) return null;

      // لو فيه جار نجيب بياناته
      return getJson(
        `https://restcountries.com/v3.1/alpha/${neighbour}`,
        `"${neighbour}" not found as a neighbour of ${country}`
      );
    })
    .then(data => {
      // لو ما فيه جار data بتكون null
      if (!data) return;

      // نرندر الجار بكلاس neighbour
      renderCountry(data[0], 'neighbour');
    })
    .catch(err => {
      renderError(`Something went wrong 😞: "${err.message}" Try again!`);
    });
};

// ===== INPUT HANDLER =====
function countryNameFromInput() {
  const name = countryInput.value.trim();
  if (!name) return;

  // Clear previous data
  countriesBody.innerHTML = '';
  universitiesWrapper.innerHTML = '';
  uniSummary.innerHTML = '';
  errorContainer.textContent = '';
  countriesContainer.classList.remove('error');

  showLoader();

  const p = getCountryData(name);
  if (p && typeof p.finally === 'function') {
    p.finally(() => hideLoader());
  } else {
    hideLoader();
  }
}

// عندك onclick="countryNameFromInput()" في الـ HTML للزر
// هنا فقط نضيف دعم زر Enter
countryInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') countryNameFromInput();
});

// ===== PRACTICE: GEOLOCATION (اختياري) =====
const whereAmI = (lat, lng) => {
  fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}`
  )
    .then(res => {
      if (!res.ok) throw new Error(`Problem with geocoding ${res.status}`);
      return res.json();
    })
    .then(data => {
      console.log(data);
      console.log(`You are in ${data.city}, ${data.countryName}`);
    })
    .catch(err => console.log(`${err.message} 💥`));
};

// ===== UNIVERSITIES (ASYNC / AWAIT + DYNAMIC COLORS + EMPTY STATE) =====
async function listOfUni(country) {
  try {
    const res = await fetch(
      `http://universities.hipolabs.com/search?country=${country}`
    );
    let data = await res.json();

    universitiesWrapper.innerHTML = ''; // clear previous
    uniSummary.innerHTML = '';         // clear previous summary

    console.log(`List of Universities in ${country}`);

    // خريطة ألوان حسب الـ Region
    const regionColors = {
      Asia: '#22c55e',
      Europe: '#38bdf8',
      Africa: '#eab308',
      Americas: '#f97316',
      Oceania: '#a855f7',
    };

    const accent = regionColors[lastRegion] || '#64748b';

    // نطبق اللون على إطار صندوق الجامعات + CSS variable
    universitiesWrapper.style.borderColor = accent;
    universitiesWrapper.style.boxShadow = `0 0 0 1px ${accent}33`;
    universitiesWrapper.style.setProperty('--uni-accent', accent);

    let number = 1;

    if (data.length === 0) {
      universitiesWrapper.insertAdjacentHTML(
        'beforeend',
        `<div class="empty-state">
           <p>🚫 No universities found for <strong>${country}</strong>.</p>
           <p>Try another country name.</p>
         </div>`
      );
      uniSummary.innerHTML = `<p class="uni-total">Total Universities in ${country}: <strong>0</strong></p>`;
      return;
    }

    data.forEach(uni => {
      const listOfUNIrender = `
        <div class="university">
          <h3>${number}. ${uni.name}</h3>
          <p><strong>Country:</strong> ${uni.country}</p>
          <p><strong>Website:</strong> <a href="${uni.web_pages[0]}" target="_blank">${uni.web_pages[0]}</a></p>
          <hr>
        </div>
      `;
      universitiesWrapper.insertAdjacentHTML('beforeend', listOfUNIrender);
      number++;
    });

    uniSummary.innerHTML = `<p class="uni-total">Total Universities in ${country}: <strong>${number - 1}</strong></p>`;
  } catch (err) {
    console.error(err);
    universitiesWrapper.innerHTML = `
      <div class="empty-state">
        <p>⚠️ Error loading universities.</p>
        <p>${err.message}</p>
      </div>
    `;
    uniSummary.innerHTML = `<p class="uni-total">Total Universities in ${country}: <strong>0</strong></p>`;
  }
}
