'use strict';

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
  // id = Date.now() + '';
  // clicks = 0;
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat , lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    }, ${this.date.getDate()}`;
  }
  // _click() {
  //   this.clicks++;
  // }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
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
  #mapZoomLevel = 18;
  #mapEvent;
  #workouts = [];

  constructor() {
    // get user position
    this._getPosition();
    // get data from local storage
    this._getLocalStorage();
    form.addEventListener('submit', this._newWorkout.bind(this));
    // if type is cycling
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
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

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
    // console.log(map);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      // maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(this.#map);
    // the on() method is generated from leaflet library it replace the event listener
    this.#map.on('click', this._showForm.bind(this));

    // callign the renderworkoutmarker in loadmap function to integrate with getlocationStorage
    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
    // using the public interface
    // workout._click();
  }
  _showForm(mapE) {
    // I copy mapE to the global variable to get access to the next event listener
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    // empty inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    // while clicking on the map to show the form
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();

    // clean code for "guard clause" using rest pattern:
    // isFinite : The isFinite function examines the number in its argument. If the argument is NaN , positive infinity, or negative infinity, this method returns false ; otherwise, it returns true
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value; // (+) is to convert it to a number
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If activity running , create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // Check if data is valid
      // this is a "guard clause" means that we will check for the opposite of what we are originally interested in and if that opposite is true then will return the function immediately (this is a trait of modern js kind of trend)
      // changing guard clause with clean code
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        // if (
        //   !Number.isFinite(distance) ||
        //   !Number.isFinite(duration) ||
        //   !Number.isFinite(cadence)
        // )
        return alert('Inputs have to be positive numbers!');

      workout = new Running([lat, lng], duration, distance, cadence);
    }

    // If activity cycling , create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      // Check if data is valid
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');
      workout = new Cycling([lat, lng], duration, distance, elevation);
    }

    // Add new object to workout array
    this.#workouts.push(workout);
    // console.log(workout);
    // Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);

    // hide form + clear input fields
    this._hideForm();
    // console.log(this);

    // set local storage to all workouts
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚲'} ${workout.description} `
      );
  }

  _renderWorkout(workout) {
    let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚲'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
        </div>
        `;
    if (workout.type === 'running')
      html += `
        <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
          </li>
        `;
    if (workout.type === 'cycling')
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevationGain}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>
    `;

    form.insertAdjacentHTML('afterend', html);
  }
  _moveToPopup(e) {
    // closest is the opposite of querySelector which will take the classe or id and the scope elements
    const workoutEl = e.target.closest('.workout');
    // console.log(workoutEl);
    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    // console.log(workout);

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    // console.log(data);
    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }
  reset() {
    // to reset all the workouts from the local storage
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();

// remark : when we converted the objects to string and then get back from string to objects we lost the prototype chain which will not get the methods of the inherit classes that is the reason why workout.click() is not a function anymore that's why I will disable it .
// --> This is a big problem while working with OOP and local storage
