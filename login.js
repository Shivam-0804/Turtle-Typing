import { saveUser, getUser, getName, saveName } from "./theme.js";
const signup = document.querySelector("#signup").closest(".submit_button"),
  username = document.getElementById("username"),
  mail = document.getElementById("mail"),
  verifyMail = document.getElementById("verifyMail"),
  password = document.getElementById("password"),
  verifyPassword = document.getElementById("verifyPassword"),
  message = document.querySelector("#error_message");
// Using Fetch API to send a POST request to a PHP script
function sendData(data) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "../php/login.php", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      // alert(xhr.responseText);
    }
  };
  xhr.send(JSON.stringify(data));
}
//strength of password function
var strengthTests = [
  /[A-Z]+/, // checks for at least one uppercase letter
  /[a-z]+/, // checks for at least one lowercase letter
  /[0-9]+/, // checks for at least one number
  /[^A-Za-z0-9]+/, // checks for at least one special character
  /.{8,}/, // checks for a minimum length of 8 characters
];

function validatePasswordStrength(password) {
  var strength = 0;
  for (var i = 0; i < strengthTests.length; i++) {
    if (strengthTests[i].test(password)) {
      strength++;
    }
  }
  return strength;
}

function displayPasswordStrengthMessage() {
  var strength = validatePasswordStrength(password.value);
  const message = document.querySelector("#strength");
  if (strength < 5) {
    message.innerText = "Your password is not strong enough.";
    message.classList.remove("correct_message");
  } else {
    message.innerText = "Your password is strong.";
    message.classList.add("correct_message");
  }
}

// Event listener for password input
password.addEventListener("input", function () {
  displayPasswordStrengthMessage();
});

verifyMail.addEventListener("input", function () {
  mail.classList.remove("form-error");
  verifyMail.classList.remove("form-error");
  message.innerText = "";
  if (mail.value !== verifyMail.value) {
    mail.classList.add("form-error");
    verifyMail.classList.add("form-error");
    message.innerText = "Entered mail are not the same!";
  }
});

// email verification
function validateEmail(email) {
  var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (emailPattern.test(email)) {
    return true;
  } else {
    return false;
  }
}
// Event listener for Submit
signup.addEventListener("click", function (event) {
  event.preventDefault();
  username.classList.remove("form-error");
  mail.classList.remove("form-error");
  verifyMail.classList.remove("form-error");
  password.classList.remove("form-error");
  verifyPassword.classList.remove("form-error");
  message.innerText = "";

  // Validate username
  if (username.value.trim() === "") {
    username.classList.add("form-error");
    message.innerText = "Username cannot be empty";
    return;
  }

  if (username.value.length < 8) {
    username.classList.add("form-error");
    message.innerText = "Length cannot be less than 8 characters";
    return;
  }

  // Validate email matching
  if (mail.value.trim() === "" || verifyMail.value.trim() === "") {
    mail.classList.add("form-error");
    verifyMail.classList.add("form-error");
    message.innerText = "Emails cannot be empty";
    return;
  }
  if (!validateEmail(mail.value)) {
    mail.classList.add("form-error");
    verifyMail.classList.add("form-error");
    message.innerText = "Enter a valid mail";
    return;
  }
  if (mail.value !== verifyMail.value) {
    mail.classList.add("form-error");
    verifyMail.classList.add("form-error");
    message.innerText = "Entered emails are not the same!";
    return;
  }

  // Validate password matching
  if (password.value.trim() === "" || verifyPassword.value.trim() === "") {
    password.classList.add("form-error");
    verifyPassword.classList.add("form-error");
    message.innerText = "Passwords cannot be empty";
    return;
  }
  if (validatePasswordStrength(password.value) < 5) {
    password.classList.add("form-error");
    verifyPassword.classList.add("form-error");
    message.innerText = "Enter a strong password.";
    return;
  }
  if (password.value !== verifyPassword.value) {
    password.classList.add("form-error");
    verifyPassword.classList.add("form-error");
    message.innerText = "Entered passwords are not the same!";
    return;
  } else {
    const dataToSend = {
      username: username.value.trim(),
      email: mail.value.trim(),
      password: password.value.trim(),
    };
    sendData(dataToSend);
    const popWindow = document.querySelector(".signup_window");
    popWindow.classList.toggle("hidden");
  }
});

const login = document.querySelector("#login").closest(".submit_button"),
  lmail = document.getElementById("lmail"),
  lpassword = document.getElementById("lpassword"),
  lmessage = document.getElementById("login_message");

login.addEventListener("click", function (event) {
  event.preventDefault();
  lmessage.innerText = " ";
  lmail.classList.remove("form-error");
  lpassword.classList.remove("form-error");
  if (lmail.value.trim() === "") {
    lmail.classList.add("form-error");
    lmessage.innerText = "Email cannot be empty";
    return;
  }
  if (!validateEmail(lmail.value)) {
    lmail.classList.add("form-error");
    lmessage.innerText = "Enter a valid mail";
    return;
  }
  if (lpassword.value.trim() === "") {
    lpassword.classList.add("form-error");
    lmessage.innerText = "Passwords cannot be empty";
    return;
  } else {
    const dataToSend = {
      user_id: getUser(),
      email: lmail.value.trim(),
      password: lpassword.value.trim(),
    };
    function sendData(data, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "../php/login_details.php", true);
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
      if (!responseData || responseData.length === 0) {
        lmessage.innerText = "Invalid credentials or user does not exist.";
      } else {
        var user = responseData[0]["user_id"];
        var userName = responseData[0]["username"];
        saveName(userName);
        saveUser(user);
        location.reload();
        window.location.href = "../index.html";
      }
    });
  }
});
