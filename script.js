'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');
const countryInput = document.getElementById('input');

// NEW COUNTRIES API URL (use instead of the URL shown in videos):
// https://restcountries.com/v2/name/portugal

// NEW REVERSE GEOCODING API URL (use instead of the URL shown in videos):
// https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}

///////////////////////////////////////

// const getCountryAndNeighbour = function (country) {
//   // AJAX Call 1
//   const request = new XMLHttpRequest();
//   request.open('GET', `https://restcountries.com/v3.1/name/${country}`);
//   request.send();

const renderCountry = function (data, className = '') {
  const html = `
  <article class="country ${className}">
          <img class="country__img" src="${data.flags.png}" />
          <div class="country__data">
            <h3 class="country__name">${data.altSpellings[1]}</h3>
            <h4 class="country__region">${data.region}</h4>
            <p class="country__row"><span>👫</span>${(
              +data.population / 1000000
            ).toFixed(1)} <span> m</span></p>
            <p class="country__row"><span>🗣️</span>${JSON.stringify(
              Object.values(data.languages)[0]
            )}</p>
            <p class="country__row"><span>💰</span>${JSON.stringify(
              Object.values(data.currencies)[0].symbol
            )}</p>
          </div>
        </article>
  `;

  countriesContainer.insertAdjacentHTML('beforeend', html);
  countriesContainer.style.opacity = 1;
};

//   request.addEventListener('load', function () {
//     // console.log(this.responseText);

//     const [data] = JSON.parse(this.responseText);
//     console.log(data);

//     //render country 1
//     renderCountry(data);

//     //Get Neighbour Country (2)
// const [neighbour] = data.borders;
//     // console.log(neighbour);

// if (!neighbour) return;

//     //AJAX Call 2
//     const request2 = new XMLHttpRequest();
//     request2.open('GET', `https://restcountries.com/v3.1/alpha/${neighbour}`);
//     request2.send();

//     request2.addEventListener('load', function () {
//       const [data2] = JSON.parse(this.responseText);
//       renderCountry(data2, 'neighbour');
//       console.log(data2);
//     });

//   });
// };

// Country Input and submit
// function countryNameFromInput() {
//   const name = countryInput.value;
//   if(!name) return

//     countriesContainer.innerHTML = '';

//   getCountryAndNeighbour(name);
// };

//Fetch API

// const request = fetch(`https://restcountries.com/v3.1/name/oman`);

// Get Country data
const getCountryData = country => {
  fetch(`https://restcountries.com/v3.1/name/${country}`)
    .then(response => response.json())
    .then(data => {
      renderCountry(data[0]);

      const neighbour = data[0].borders[0];

      if (!neighbour) return;
      //Nighbour country
      return fetch(`https://restcountries.com/v3.1/alpha/${neighbour}`);
    })
    .then(response => response.json())
    .then(data => {
      renderCountry(data[0], 'neighbour');
    });
};
// getCountryData('oman');

// Country Input and submit
function countryNameFromInput() {
  const name = countryInput.value;
  if (!name) return;

  countriesContainer.innerHTML = '';
  getCountryData(name);
  
}
