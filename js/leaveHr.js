let leaveContainer1 = document.getElementById("leaveContainer1");
let leaveContainer2 = document.getElementById("leaveContainer2");


// Get leaves from Local Storage

let leaves = JSON.parse(localStorage.getItem("leaves")) || [];


// Display Pending Leaves

function displayLeavesPending() {

    leaveContainer1.innerHTML = "";

    for (let i = 0; i < leaves.length; i++) {

        if (leaves[i].status != "Pending") {
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

            <button onclick="approveLeave(${i})">
                Approve
            </button>

            <button onclick="rejectLeave(${i})">
                Reject
            </button>

        `;

        leaveContainer1.appendChild(div);
    }
}


// Display Approved / Rejected Leaves

function displayLeavesApproved() {

    leaveContainer2.innerHTML = "";

    for (let i = 0; i < leaves.length; i++) {

        if (
            leaves[i].status != "Approved" &&
            leaves[i].status != "Rejected"
        ) {
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

        leaveContainer2.appendChild(div);
    }
}


// Approve

function approveLeave(index) {

    leaves[index].status = "Approved";

    localStorage.setItem("leaves", JSON.stringify(leaves));

    displayLeavesPending();
    displayLeavesApproved();

    alert("Leave approved!");
}


// Reject

function rejectLeave(index) {

    leaves[index].status = "Rejected";

    localStorage.setItem("leaves", JSON.stringify(leaves));

    displayLeavesPending();
    displayLeavesApproved();

    alert("Leave rejected!");
}


// Display

displayLeavesPending();
displayLeavesApproved();