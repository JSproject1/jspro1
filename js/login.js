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

                    let currentUser =
                        JSON.parse(localStorage.getItem("currentUser"));

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


            // Fatima add

            sessionStorage.setItem(
                "currentUserId",
                user.id
            );


            // Go according to role

            if (user.role === "EMP") {

                window.location.href = "../html/home2.html";

            }
            else if (user.role === "HR") {

                window.location.href = "../html/home2.html";

            }

        });

});


// ======================================
// LAMP PULL ANIMATION
// ======================================

const lampSwitch = document.getElementById("lampSwitch");

let isDragging = false;
let startY = 0;

lampSwitch.addEventListener("pointerdown", function(event) {

    isDragging = true;

    startY = event.clientY;

    lampSwitch.setPointerCapture(event.pointerId);

});


lampSwitch.addEventListener("pointermove", function(event) {

    if (!isDragging) {
        return;
    }

    let distance = event.clientY - startY;

    // Only allow pulling downward
    if (distance > 0) {

        let pullDistance = Math.min(distance, 35);

        lampSwitch.style.transform =
            `translateY(${pullDistance}px)`;

    }

});


lampSwitch.addEventListener("pointerup", function(event) {

    if (!isDragging) {
        return;
    }

    isDragging = false;

    let distance = event.clientY - startY;


    // If user pulled the string enough
    if (distance >= 20) {

        document.body.classList.add("light-on");

    }


    // Return string to original position
    lampSwitch.style.transform = "";

});