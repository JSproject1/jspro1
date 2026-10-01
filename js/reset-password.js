let user = JSON.parse(localStorage.getItem("currentUser"));

let newPassword = document.getElementById("newPassword");
let confirmPassword = document.getElementById("confirmPassword");
let resetButton = document.getElementById("resetButton");
let message = document.getElementById("message");


resetButton.addEventListener("click", function() {

    let passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;


    if (!passwordPattern.test(newPassword.value)) {

        message.innerText = "Password must be at least 8 characters and contain uppercase, lowercase, and a number.";

        return;
    }


    if (newPassword.value !== confirmPassword.value) {

        message.innerText = "Passwords do not match";

        return;
    }


    user.password = newPassword.value;


    localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
    );


    window.location.href = "profile.html";

});