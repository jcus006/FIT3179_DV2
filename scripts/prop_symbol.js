// ----- Config -----
const SPEC_URL = "specs/prop_symbol.json";
const PARAM_NAME = "year_filter"; // must match your Vega-Lite param name

// If your spec's slider uses bind range 2008..2017, set these:
const YEAR_MIN = 2009;
const YEAR_MAX = 2016;
// -------------------

let view = null;
let timer = null;
let playing = false;

const $ = (id) => document.getElementById(id);
const $play = $("play");
const $pause = $("pause");
const $stepBack = $("step-back");
const $stepFwd = $("step-forward");
const $speed = $("speed");
const $loop = $("loop");
const $readout = $("year-readout");

function getYear() {
  return view.signal(PARAM_NAME);
}

function setYear(y) {
  const clamped = Math.max(YEAR_MIN, Math.min(YEAR_MAX, y));
  view.signal(PARAM_NAME, clamped).runAsync();
  $readout.textContent = `Year: ${clamped}`;
}

function step(delta) {
  const y = getYear();
  let next = y + delta;

  if (next > YEAR_MAX) {
    next = $loop.checked ? YEAR_MIN : YEAR_MAX;
    if (!$loop.checked && playing) pause();
  } else if (next < YEAR_MIN) {
    next = $loop.checked ? YEAR_MAX : YEAR_MIN;
    if (!$loop.checked && playing) pause();
  }

  setYear(next);
}

function play() {
  if (playing) return;
  playing = true;
  $play.disabled = true;
  $pause.disabled = false;

  const tick = () => step(+1);
  timer = setInterval(tick, Math.max(50, Number($speed.value) || 800));
}

function pause() {
  playing = false;
  $play.disabled = false;
  $pause.disabled = true;
  clearInterval(timer);
  timer = null;
}

function initUI() {
  $play.onclick = play;
  $pause.onclick = pause;

  $stepFwd.onclick = () => step(+1);
  $stepBack.onclick = () => step(-1);

  $speed.onchange = () => {
    if (playing) {
      pause();
      play();
    } // apply new speed immediately
  };

  // Handy keyboard shortcuts
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      playing ? pause() : play();
    }
    if (e.code === "ArrowRight") step(+1);
    if (e.code === "ArrowLeft") step(-1);
  });
}

vegaEmbed("#vis", SPEC_URL)
  .then(({ view: v }) => {
    view = v;
    initUI();

    // Initialize readout with the current slider value from the spec
    $readout.textContent = `Year: ${getYear()}`;
    console.log("Visualization loaded. Playback controls ready.");
  })
  .catch(console.error);
