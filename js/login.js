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

                if (data[i].email === email.value && data[i].password === password.value) {

                    user = data[i];

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


            // Go according to role

            if (user.role === "EMP") {

                window.location.href = "../html/leaveEmp.html";

            }
            else if (user.role === "HR") {

                window.location.href = "../html/leaveHr.html";

            }

        });
        
});