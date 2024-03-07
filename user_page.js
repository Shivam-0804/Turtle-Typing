import { saveUser, getUser, getName, saveName } from "./theme.js";
const dataToSend = {
  user_id: getUser(),
};
function sendData(data, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "../php/user.php", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const responseData = JSON.parse(xhr.responseText);
        callback(responseData);
      } else {
        console.error("Request error:", xhr.status);
      }
    }
  };
  xhr.send(JSON.stringify(data));
}
sendData(dataToSend, function (responseData) {
  const user_name = document.querySelector(".user_name");
  const user_id = document.querySelector(".user_id");
  const leaderboard = document.querySelector(".user_leaderboard");
  user_name.innerText = getName();
  user_id.innerText = `user_${getUser()}`;
  var data = responseData;
  for (var i = 0; i < data.length; i++) {
    const className = i % 2 === 0 ? "even_row" : "odd_row";
    leaderboard.innerHTML += `<div class="leader_data ${className}">
    <ul>
      <li>${i + 1}</li>
      <li>${data[i]["wpm"]}<br><span class="weight">${
      data[i]["accuracy"]
    }%</span></li>
      <li>${data[i]["rawspeed"]}<br><span class="weight">${
      data[i]["consistency"]
    }%</span></li>
      <li>${data[i]["time"]}</li>
    </ul>
  </div>`;
  }
});
