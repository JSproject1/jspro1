let currentUser = getCurrentUser();

if (currentUser == null) {

    window.location.href = "login.html";

}
else if (currentUser.rol !== "EMP") {

    window.location.href = "login.html";

}

let employeeSelect = document.getElementById("employee");

let leaveForm = document.getElementById("leaveForm");

let leaveType = document.getElementById("leaveType");
let startDate = document.getElementById("startDate");
let endDate = document.getElementById("endDate");
let reason = document.getElementById("reason");

let leaveContainer = document.getElementById("leaveContainer");


let openModal = document.getElementById("openModal");
let closeModal = document.getElementById("closeModal");
let cancelModal = document.getElementById("cancelModal");
let leaveModal = document.getElementById("leaveModal");


openModal.addEventListener("click", function () {

    leaveModal.classList.add("show");

});


closeModal.addEventListener("click", function () {

    leaveModal.classList.remove("show");

});


cancelModal.addEventListener("click", function () {

    leaveModal.classList.remove("show");

});

let userName = document.getElementById("userName");
let userEmail = document.getElementById("userEmail");

userName.textContent = currentUser.name;
userEmail.textContent = currentUser.email;

// Get old leaves from Local Storage
// localStorage.clear();
let leaves = JSON.parse(localStorage.getItem("leaves")) || [];

// Submit Leave

leaveForm.addEventListener("submit", function (event) {

    let leave = {

        email: currentUser.email,
        leaveType: leaveType.value,
        leaveStatus: "pending approval",
        startDate: startDate.value,
        endDate: endDate.value,
        reason: reason.value,
        status: "Pending"

    };

    leaves.push(leave);

    localStorage.setItem("leaves", JSON.stringify(leaves));

    alert("Leave application submitted successfully!");

    leaveForm.reset();//بمسح المدخلات عشان ادخل كمان 

    displayLeaves();

});


// Display Leaves

function displayLeaves() {

    leaveContainer.innerHTML = "";

    for (let i = 0; i < leaves.length; i++) {

        if (leaves[i].email !== currentUser.email) {
            continue;
        }
        let div = document.createElement("div");

        div.className = "leave-card";

        div.innerHTML = `

            <h3>${leaves[i].email}</h3>

            <p>
                <strong>Leave Type:</strong>
                ${leaves[i].leaveType}
            </p>

            <p>
                <strong>Start Date:</strong>
                ${leaves[i].startDate}
            </p>

            <p>
                <strong>End Date:</strong>
                ${leaves[i].endDate}
            </p>

            <p>
                <strong>Reason:</strong>
                ${leaves[i].reason}
            </p>

            <p>
                <strong>Status:</strong>
                ${leaves[i].status}
            </p>

        `;

        leaveContainer.appendChild(div);
    }
}


// Display old leaves

displayLeaves();