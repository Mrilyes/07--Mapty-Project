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

let map, mapEvent;

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

      map = L.map('map').setView(coords, 15);
      // console.log(map);
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        // maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(map);

      // the on() method is generated from leaflet library it replace the event listener
      map.on('click', function (mapE) {
        // I copy mapE to the global variable to get access to the next event listener
        mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
      });
    },
    function () {
      alert('Could not get your position , allow location access');
    }
  );
form.addEventListener('submit', function (e) {
  e.preventDefault();
  // clear input fields
  inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      '';

  // display the marker
  console.log(mapEvent);
  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      })
    )
    .setPopupContent('Workout')
    .openPopup();
});
// if type is cycling
inputType.addEventListener('change', function (e) {
  e.preventDefault();
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});
