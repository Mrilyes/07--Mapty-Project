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

// let map, mapEvent;

class App {
  #map;
  #mapEvent;
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    // if type is cycling
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
  }

  _getPosition() {
    // geolocation
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position , allow location access');
        }
      );
  }

  _loadMap(postion) {
    // console.log(postion);
    const { latitude } = postion.coords;
    const { longitude } = postion.coords;
    console.log(latitude, longitude);
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    // leaflet (library for interactive maps)

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 15);
    // console.log(map);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      // maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(this.#map);
    // the on() method is generated from leaflet library it replace the event listener
    this.#map.on('click', this._showForm.bind(this));
  }
  _showForm(mapE) {
    // I copy mapE to the global variable to get access to the next event listener
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();
    // console.log(this);
    // clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    // display the marker
    // console.log(this.#mapEvent);
    const { lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
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
  }
}
const app = new App();
