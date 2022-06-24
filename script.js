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

class Workout {
  date = new Date();

  // id = (new Date() + '').slice(-10);
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat , lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }
  calcSpeed() {
    // km/h   // speed is inverse to speed
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// testing classes
// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycling1);

// ----------------------------------------------------------------
// APPLICATION ARCHITECTURE
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

    // clean code for "guard clause":
    const validInput = (...inputs) => {
      inputs.every(inp => Number.isFinite(inp));
    };

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value; // (+) is to convert it to a number
    const duration = +inputDuration.value;

    // If activity running , create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // Check if data is valid
      // this is a "guard clause" means that we will check for the opposite of what we are originally interested in and if that opposite is true then will return the function immediately (this is a trait of modern js kind of trend)
      // changing guard clause with clean code
      if (!validInput(distance, duration, cadence))
        // if (
        //   !Number.isFinite(distance) ||
        //   !Number.isFinite(duration) ||
        //   !Number.isFinite(cadence)
        // )
        return alert('Inputs have to be positive numbers!');
    }

    // If activity cycling , create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      // Check if data is valid
      if (!validInput(distance, duration, elevation))
        return alert('Inputs have to be positive numbers!');
    }

    // Add new object to workout array
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

    // Render workout on list

    // hide form + clear input fields

    // console.log(this);
    // clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    // display the marker
    // console.log(this.#mapEvent);
  }
}
const app = new App();
