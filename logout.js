// logout function
import { saveUser, getUser, saveName, getName } from "./theme.js";
//logout function
var loginUser = getUser();
const displayName = document.querySelector(".display_name");
const exit_icon = document.querySelector(".exit_icon");
const user_page = document.querySelector(".user_page");
if (loginUser !== "1") {
  exit_icon.classList.toggle("hide");
  displayName.innerText = getName();
  user_page.href = "user.html";
}
exit_icon.addEventListener("click", function () {
  exit_icon.classList.toggle("hide");
  saveUser(1);
  displayName.innerHTML = "";
  saveName("admin");
  user_page.href = "login.html";
});
