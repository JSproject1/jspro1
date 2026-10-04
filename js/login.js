let loginForm = document.getElementById("loginForm");

let email = document.getElementById("email");
let password = document.getElementById("password");
let message = document.getElementById("message");


// ======================================
// LOGIN
// ======================================

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    fetch("../JSON/employee.json")
        .then(response => response.json())
        .then(jsonEmployees => {

            // Get employees from localStorage
            let localEmployees =
                JSON.parse(localStorage.getItem("employees")) || [];

            let user = null;


            // ======================================
            // SEARCH IN LOCAL STORAGE FIRST
            // ======================================

            for (let i = 0; i < localEmployees.length; i++) {

                if (
                    localEmployees[i].email.toLowerCase() ===
                    email.value.trim().toLowerCase()
                ) {

                    user = localEmployees[i];

                    break;
                }
            }


            // ======================================
            // SEARCH IN JSON IF NOT FOUND
            // ======================================

            if (user === null) {

                for (let i = 0; i < jsonEmployees.length; i++) {

                    if (
                        jsonEmployees[i].email.toLowerCase() ===
                        email.value.trim().toLowerCase()
                    ) {

                        user = jsonEmployees[i];

                        break;
                    }
                }
            }


            // ======================================
            // USER NOT FOUND
            // ======================================

            if (user === null) {

                alert("Email or password is incorrect");

                return;
            }


            // ======================================
            // CHECK PASSWORD
            // ======================================

            if (user.password !== password.value) {

                alert("Email or password is incorrect");

                return;
            }


            // ======================================
            // SAVE CURRENT USER
            // ======================================

            localStorage.setItem(
                "currentUser",
                JSON.stringify(user)
            );


            // ======================================
            // SAVE USER ID
            // ======================================

            sessionStorage.setItem(
                "currentUserId",
                user.id
            );


            // ======================================
            // GO ACCORDING TO ROLE
            // ======================================

            if (user.role === "EMP") {

                window.location.href = "../html/home2.html";

            }
            else if (user.role === "HR") {

                window.location.href = "../html/home2.html";

            }

        })
        .catch(function(error) {

            console.log(error);

            alert("Something went wrong.");

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

    let distance = event.clientY - startY;

    isDragging = false;


    // Turn on light
    if (distance >= 20) {

        document.body.classList.add("light-on");

    }


    // Return string to original position
    lampSwitch.style.transform = "";


    // Release pointer
    if (lampSwitch.hasPointerCapture(event.pointerId)) {

        lampSwitch.releasePointerCapture(event.pointerId);

    }

});


lampSwitch.addEventListener("pointercancel", function() {

    isDragging = false;

    lampSwitch.style.transform = "";

});