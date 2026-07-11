"use strict";
import {
  saveUser,
  getUser,
  saveName,
  getName,
  getOption,
  setOption,
} from "./theme.js";

const notification_tab = document.querySelector(".notification_tab");
const notification_icon = document.querySelector(".menu_notification");
const main = document.querySelector(".main");
const paragraph = document.querySelector(".p");
const reset = document.querySelector(".text-reset i");
const cursor = document.querySelector(".cursor");
const timeVal = document.querySelectorAll('input[name="val"]');
const timeOut = document.querySelector(".timeOut");
const liveWpmEl = document.querySelector("#liveWpm");
const liveAccEl = document.querySelector("#liveAcc");
const liveStats = document.querySelector(".liveStats");
const result_tab = document.querySelector(".result_tab");
const typing_area = document.querySelector(".typing_area");
const textArea = document.querySelector(".text_area");
const focusMessage = document.querySelector(".focus");
const custTime = document.querySelector("#custom-time-radio");
const timeSubmit = document.querySelector("#submit");
const changeParaType = document.querySelectorAll("input[name='para']");

changeParaType.forEach(function (radio) {
  radio.addEventListener("click", function () {
    setOption(radio.value);
    location.reload();
  });
});

// ---------------------------------------------------------------------------
// networking helpers (fetch + async/await instead of hand-rolled XHR; every
// call has real error handling instead of failing silently)
// ---------------------------------------------------------------------------
async function postJSON(url, data) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`${url} responded ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Request failed:", err);
    return null;
  }
}

async function getJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} responded ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Request failed:", err);
    return [];
  }
}

function sendData(data) {
  postJSON("php/data.php", data);
}

function getime() {
  return localStorage.getItem("time") || 15;
}
function settime(time) {
  localStorage.setItem("time", time);
}

// flag for notification tab
var n_open = false;
var time = getime();
var maxtime = time;
timeOut.innerText = time;

// exported variables for the results tab
var cmp = [];
var wpm = [];
var xAxis = [];
var count = 0;

// keep a single Chart.js instance so re-running a test never tries to draw
// a second chart on top of an existing one (which throws and leaks memory)
var chartInstance = null;

custTime.addEventListener("click", function () {
  const box = document.querySelector(".custom_time");
  box.classList.toggle("hidden");
  document.querySelector(".main_menu").classList.toggle("effect");
});
timeSubmit.addEventListener("click", function () {
  time = document.querySelector("#tvalue").value;
  settime(time);
  maxtime = getime();
  timeOut.innerText = getime();
  const box = document.querySelector(".custom_time");
  box.classList.toggle("hidden");
  document.querySelector(".main_menu").classList.toggle("effect");
});
timeVal.forEach(function (radio) {
  radio.addEventListener("click", function () {
    time = radio.value;
    settime(time);
    maxtime = getime();
    timeOut.innerText = getime();
  });
});

focusMessage.addEventListener("click", function () {
  textArea.focus();
  focusMessage.style.display = "none";
  startTyping();
});

// random number
var number = Math.floor(Math.random() * 10);
// changePara function chooses a random string from the object
function changePara(number) {
  return text[getOption()][number];
}

// split string into span elements and concat them in the html file
function createLetter(str) {
  var string = str.split("");
  var output = "";
  for (var i = 0; i < string.length; i++) {
    output += `<span>${string[i]}</span>`;
  }
  output += `<span> </span>`;
  paragraph.innerHTML = output;
}
createLetter(changePara(number));

// reset button to change paragraph
reset.addEventListener("click", function (event) {
  event.stopPropagation();
  location.reload();
});

// blinking cursor
function blickCursor() {
  cursor.classList.toggle("blink");
}
var blink = setInterval(blickCursor, 1000);

// notification tab
notification_icon.addEventListener("click", function (event) {
  event.stopPropagation();
  notification_tab.classList.toggle("hidden");
  main.classList.toggle("n_hide");
  n_open = true;
});
const check = function (n_open) {
  if (n_open) {
    notification_tab.classList.toggle("hidden");
    main.classList.toggle("n_hide");
    n_open = false;
  }
};
main.addEventListener("click", function () {
  check(n_open);
  n_open = false;
});
main.addEventListener("keydown", function (event) {
  if (event.key == "Escape") {
    check(n_open);
  }
});

const exit = document.querySelector(".exit i");
exit.addEventListener("click", function () {
  main.classList.toggle("n_hide");
  const leaderScreen = document.querySelector(".leader_board");
  leaderScreen.classList.toggle("hidden");
});

const leader = document.querySelector(".leader");
leader.addEventListener("click", function () {
  main.classList.toggle("n_hide");
  const leaderScreen = document.querySelector(".leader_board");
  leaderScreen.classList.toggle("hidden");
});

function startTyping() {
  // main function for implementing the typing structure
  var isTyping = false;
  var correct = 0,
    incorrect = 0;
  var obj = { l: 0, t: 0 };

  // ---------------------------------------------------------------------
  // PERFORMANCE FIX #1: query every <span> once up front instead of on
  // every single keystroke. The old code ran
  // `document.querySelectorAll("span")` inside the keyup handler, which
  // re-scans the *entire document* on every keypress - by far the biggest
  // source of typing lag, especially on longer paragraphs.
  // ---------------------------------------------------------------------
  const spans = paragraph.querySelectorAll("span");
  const totalChars = spans.length;

  const defaultLocation = spans[0].getBoundingClientRect().top; // first line's top
  var moveLine = defaultLocation;
  var countdownInterval = null;
  var liveStatsInterval = null;
  var finished = false;

  // to find the position of the element being typed
  function position(span, obj) {
    const rect = span.getBoundingClientRect();
    obj.l = rect.left;
    obj.t = rect.top;
  }

  var start = 1;
  xAxis[0] = 0;

  function calculateWPM(correctChars, elapsedSeconds) {
    const words = correctChars / 5; // average word length of 5 characters
    const minutes = elapsedSeconds / 60;
    return minutes > 0 ? Math.round(words / minutes) : 0;
  }

  function calculateAccuracy(correctChars, total) {
    return total > 0 ? ((correctChars / total) * 100).toFixed(1) : "100.0";
  }

  function calculateConsistency(cmpArr) {
    var total = cmpArr.reduce((acc, val) => acc + val, 0);
    return total > 0 ? ((total / (cmpArr.length * 5) / 6) * 100).toFixed(1) : 0;
  }

  function calculateRawSpeed(total, elapsedSeconds) {
    return elapsedSeconds > 0 ? (total / 5 / elapsedSeconds) * 60 : 0;
  }

  let shiftPressed = false;
  document.addEventListener("keyup", function (event) {
    if (event.key === "Shift") shiftPressed = false;
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Shift") shiftPressed = true;
  });

  document.addEventListener("keyup", function (event) {
    if (finished) return;

    if (!isTyping) {
      timming();
      startLiveStats();
      isTyping = true;
    }
    if (event.key === "Shift") return;

    // -----------------------------------------------------------------
    // PERFORMANCE FIX #2: read `.textContent` instead of `.innerText`.
    // `.innerText` forces the browser to run a full layout pass before it
    // can return a value (it needs to know what's actually rendered).
    // `.textContent` reads the raw DOM text with no layout cost at all,
    // and since every span here holds one plain character, the result is
    // identical. This alone removes a forced synchronous reflow on every
    // keystroke.
    // -----------------------------------------------------------------
    const left = spans[0].getBoundingClientRect().left;
    const top = spans[0].getBoundingClientRect().top;
    const keyValue = shiftPressed ? event.key.toUpperCase() : event.key;

    if (spans[count].textContent === keyValue) {
      spans[count].classList.add("correct");
      if (count + 1 < totalChars) position(spans[count + 1], obj);
      cursor.style.left = `${obj.l - left}px`;
      correct++;
      count++;
    } else if (count > 0 && event.key === "Backspace") {
      count--;
      if (spans[count].classList.contains("correct")) {
        spans[count].classList.remove("correct");
        correct--;
      }
      if (spans[count].classList.contains("incorrect")) {
        spans[count].classList.remove("incorrect");
        incorrect--;
      } else if (moveLine > obj.t) {
        moveLine = obj.t;
        paragraph.style.transform = `translateY(${-1 * (obj.t - top)}px)`;
      }
      position(spans[count], obj);
      cursor.style.left = `${obj.l - left}px`;
    } else if (event.key !== "Backspace") {
      spans[count].classList.add("incorrect");
      if (count + 1 < totalChars) position(spans[count + 1], obj);
      cursor.style.left = `${obj.l - left}px`;
      count++;
      incorrect++;
    }

    if (obj.t != moveLine) {
      moveLine = obj.t;
      paragraph.style.transform = `translateY(${-1 * (obj.t - top)}px)`;
    }

    cmp[start] = count - incorrect;
    wpm[start] = calculateWPM(count - incorrect, maxtime - time);

    // FEATURE: end the test automatically once every character has been
    // typed, instead of forcing the user to wait out the full timer.
    if (count >= totalChars) {
      finishTest();
    }
  });

  function pushtime(mt) {
    for (var i = 0; i <= mt; i++) {
      xAxis.push(i);
    }
  }

  // lightweight live WPM / accuracy readout, updated on its own timer
  // (not on every keystroke) so it never adds work to the typing path.
  function startLiveStats() {
    liveStats.classList.add("active");
    liveStatsInterval = setInterval(function () {
      const elapsed = maxtime - time || 1;
      liveWpmEl.textContent = calculateWPM(correct, elapsed);
      liveAccEl.textContent = calculateAccuracy(correct, count);
    }, 500);
  }

  function timming() {
    countdownInterval = setInterval(function () {
      time--;
      if (time > 0) {
        timeOut.innerText = time;
        start++;
      }
      if (time <= 0) {
        finishTest();
      }
    }, 1000);
  }

  function finishTest() {
    if (finished) return;
    finished = true;

    if (countdownInterval) clearInterval(countdownInterval);
    if (liveStatsInterval) clearInterval(liveStatsInterval);
    liveStats.classList.remove("active");

    result_tab.classList.remove("hidden");
    typing_area.classList.add("hidden");

    const elapsedSeconds = maxtime - time > 0 ? maxtime - time : maxtime;
    const totalWPM = wpm.reduce((acc, val) => acc + val, 0);
    const wpmavg = wpm.length ? Math.round(totalWPM / wpm.length) : 0;
    const rawSpeed = calculateRawSpeed(count, elapsedSeconds).toFixed(2);
    const consistency = calculateConsistency(cmp);
    const accuracy = calculateAccuracy(correct, count);

    pushtime(maxtime);
    displayResult(xAxis, cmp, wpm, elapsedSeconds, rawSpeed, consistency, accuracy, wpmavg);

    sendData({
      user_id: getUser(),
      wpm: wpmavg,
      time: maxtime,
      rawSpeed: rawSpeed,
      consistency: consistency,
      accuracy: accuracy,
    });
  }

  // graph code
  var root = document.documentElement;
  var computedStyle = window.getComputedStyle(root);
  var mainColor = computedStyle.getPropertyValue("--main-color");
  var mainColor2 = computedStyle.getPropertyValue("--sub-color");

  const graph = function (xAxisData, cmpData, wpmData) {
    const ctx = document.getElementById("myChart");

    // Destroy any previous chart bound to this canvas before drawing a new
    // one - reusing a canvas without destroying the old instance throws
    // "Canvas is already in use" and leaks the old chart's memory/listeners.
    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
      data: {
        datasets: [
          {
            type: "line",
            label: "Count",
            data: cmpData,
            backgroundColor: mainColor2,
            borderColor: mainColor2,
            borderWidth: 2,
            pointRadius: 0, // fewer draw calls per frame while animating in
          },
          {
            type: "line",
            label: "WPM",
            borderColor: mainColor,
            backgroundColor: mainColor,
            data: wpmData,
            borderWidth: 2,
            pointRadius: 0,
          },
        ],
        labels: xAxisData,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400 }, // snappier than Chart.js's 1000ms default
        plugins: {
          legend: {
            labels: {
              font: { size: 16 },
            },
          },
        },
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  };

  function displayResult(xAxisData, cmpData, wpmData, elapsedSeconds, rawSpeed, consistency, accuracy, wpmavg) {
    graph(xAxisData, cmpData, wpmData);
    document.querySelector("#time").textContent = maxtime;
    document.querySelector("#char").textContent = `${count}/${correct}/${incorrect}`;
    document.querySelector("#accuracy").textContent = `${accuracy}%`;
    document.querySelector("#consistency").textContent = `${consistency}%`;
    document.querySelector("#rawSpeed").textContent = rawSpeed;
    document.querySelector("#wpm").textContent = wpmavg;
  }
}

// ---------------------------------------------------------------------------
// leaderboard / notifications / announcements - now using fetch()+async
// instead of hand-written XHR, and building each list with a single
// document fragment instead of repeated `innerHTML +=` (which reparses the
// full, ever-growing HTML string on every iteration).
// ---------------------------------------------------------------------------
async function fetchDataFromPHP() {
  const data = await getJSON("php/leader.php");
  const leader_15 = document.querySelector(".board_15");
  const leader_60 = document.querySelector(".board_60");
  const frag15 = document.createDocumentFragment();
  const frag60 = document.createDocumentFragment();
  var c_15 = 0,
    c_60 = 0;

  for (var i = 0; i < data.length; i++) {
    const row = document.createElement("div");
    const isFifteen = data[i]["time"] === "15";
    const idx = isFifteen ? c_15 : c_60;
    const className = idx % 2 === 0 ? "even_row" : "odd_row";
    const num = idx === 0 ? '<i class="fa-solid fa-crown"></i>' : idx + 1;

    row.className = `leader_data ${className}`;
    row.innerHTML = `
      <ul>
        <li>${num}</li>
        <li><i class="fa-solid fa-user"></i>  ${data[i]["username"]}</li>
        <li>${data[i]["wpm"]}<br><span class="weight">${data[i]["accuracy"]}%</span></li>
        <li>${data[i]["rawspeed"]}<br><span class="weight">${data[i]["consistency"]}%</span></li>
        <li>${data[i]["time"]}</li>
      </ul>`;

    if (isFifteen) {
      frag15.appendChild(row);
      c_15++;
    } else {
      frag60.appendChild(row);
      c_60++;
    }
  }

  leader_15.appendChild(frag15);
  leader_60.appendChild(frag60);
}
fetchDataFromPHP();

// logout / user session
var loginUser = getUser();
const displayName = document.querySelector(".display_name");
const exit_icon = document.querySelector(".exit_icon");
const user_page = document.querySelector(".user_page");
if (loginUser !== "1") {
  exit_icon.classList.toggle("hide");
  displayName.innerText = getName();
  user_page.href = "pages/user.html";
}
exit_icon.addEventListener("click", function () {
  exit_icon.classList.toggle("hide");
  saveUser(1);
  displayName.innerHTML = "";
  saveName("admin");
  user_page.href = "pages/login.html";
});

async function fetchNotification() {
  const data = await getJSON("php/notification.php");
  const message = document.querySelector(".message_2");
  const frag = document.createDocumentFragment();
  for (var i = 0; i < data.length; i++) {
    const className = i % 2 === 0 ? "even_row" : "odd_row";
    const box = document.createElement("div");
    box.className = `box ${className}`;
    box.innerHTML = `
      <p class="date_time">${data[i]["notification"]}</p>
      <p class="text_message">${data[i]["message"]}</p>`;
    frag.appendChild(box);
  }
  message.appendChild(frag);
}
fetchNotification();

async function fetchAnnouncement() {
  const data = await getJSON("php/announcement.php");
  const message = document.querySelector(".message_1");
  const frag = document.createDocumentFragment();
  for (var i = 0; i < data.length; i++) {
    const className = i % 2 === 0 ? "even_row" : "odd_row";
    const box = document.createElement("div");
    box.className = `box ${className}`;
    box.innerHTML = `
      <p class="date_time">${data[i]["date"]}</p>
      <p class="text_message">${data[i]["announcement"]}</p>`;
    frag.appendChild(box);
  }
  message.appendChild(frag);
}
fetchAnnouncement();