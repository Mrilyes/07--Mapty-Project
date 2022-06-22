'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// geolocation
if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(
    function (postion) {
      // console.log(postion);
      const { latitude } = postion.coords;
      const { longitude } = postion.coords;
      console.log(latitude, longitude);
      console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

      // leaflet (library for interactive maps)

      const coords = [latitude, longitude];

      const map = L.map('map').setView(coords, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        // maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(map);

      L.marker(coords)
        .addTo(map)
        .bindPopup('<b>Hello world!</b><br>I am a popup.')
        .openPopup();
    },
    function () {
      alert('Could not get your position , allow location access');
    }
  );
