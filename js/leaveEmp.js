let currentUser = getCurrentUser();

if (currentUser == null) {

    window.location.href = "login.html";

}
else if (currentUser.role !== "EMP") {

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

            <div class="leave-card-top">

                <div class="leave-title">

                    <div class="leave-icon">
                        ↗
                    </div>

                    <div>
                        <span class="leave-label">
                            LEAVE REQUEST
                        </span>

                        <h3>
                            ${leaves[i].leaveType}
                        </h3>
                    </div>

                </div>

                <span class="status ${leaves[i].status.toLowerCase()}">
                    ${leaves[i].status}
                </span>

            </div>


            <div class="leave-info">

                <div class="leave-info-item">

                    <span class="info-label">
                        START DATE
                    </span>

                    <strong>
                        ${leaves[i].startDate}
                    </strong>

                </div>


                <div class="leave-info-item">

                    <span class="info-label">
                        END DATE
                    </span>

                    <strong>
                        ${leaves[i].endDate}
                    </strong>

                </div>

            </div>


            <div class="leave-reason">

                <span class="reason-label">
                    REASON
                </span>

                <p>
                    ${leaves[i].reason}
                </p>

            </div>

        `;

        leaveContainer.appendChild(div);
    }
}


// Display old leaves

displayLeaves();