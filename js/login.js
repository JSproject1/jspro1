let loginForm = document.getElementById("loginForm");

let email = document.getElementById("email");
let password = document.getElementById("password");
let message = document.getElementById("message");

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    fetch("../JSON/employee.json")
        .then(response => response.json())
        .then(data => {

            let user = null;

            for (let i = 0; i < data.length; i++) {

                if (data[i].email === email.value) {

                    user = data[i];

                    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

                    if (currentUser && currentUser.email === email.value) {
                        user.password = currentUser.password;
                    }

                    if (user.password !== password.value) {
                        user = null;
                    }

                    break;
                }
            }


            if (user == null) {

                alert("Email or password is incorrect");

                return;
            }


            // Save logged-in user

            localStorage.setItem(
                "currentUser",
                JSON.stringify(user)
            );
    // fatima add 
           sessionStorage.setItem(
                "currentUserId",
                user.id
            );
            
            // Go according to role

            if (user.role === "EMP") {

                window.location.href = "../html/home.html";

            }
            else if (user.role === "HR") {

                window.location.href = "../html/hrDashboard.html";

            }

        });

});
//LOGIN ANIMATION
const lampSwitch = document.getElementById("lampSwitch");

lampSwitch.addEventListener("click", function () {

    document.body.classList.toggle("light-on");

});