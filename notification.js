const notification_tab = document.querySelector(".notification_tab");
const notification_icon = document.querySelector(".menu_notification");
const main = document.querySelector(".main");
var n_open = false;

// notification tab function
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

function fetchNotification() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        const message = document.querySelector(".message_2");
        for (var i = 0; i < data.length; i++) {
          const className = i % 2 === 0 ? "even_row" : "odd_row";
          message.innerHTML += `<div class="box ${className}">
        <p class="date_time">${data[i]["notification"]}</p>
        <p class="text_message">${data[i]["message"]}</p>
      </div>`;
        }
      } else {
        console.error("Request error:", xhr.status);
      }
    }
  };

  xhr.open("GET", "../php/notification.php", true);
  xhr.send();
}
fetchNotification();
function fetchAnnouncement() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        const message = document.querySelector(".message_1");
        for (var i = 0; i < data.length; i++) {
          const className = i % 2 === 0 ? "even_row" : "odd_row";
          message.innerHTML += `<div class="box ${className}">
        <p class="date_time">${data[i]["date"]}</p>
        <p class="text_message">${data[i]["announcement"]}</p>
      </div>`;
        }
      } else {
        console.error("Request error:", xhr.status);
      }
    }
  };

  xhr.open("GET", "../php/announcement.php", true);
  xhr.send();
}
fetchAnnouncement();
