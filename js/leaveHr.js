let leaveTableBody = document.getElementById("leaveTableBody");

let employeeFilter = document.getElementById("employeeFilter");

let statusFilter = document.getElementById("statusFilter");


// Get leaves from Local Storage

let leaves = JSON.parse(localStorage.getItem("leaves")) || [];


// =========================
// Add Employees to Filter
// =========================

function loadEmployees() {

    let employees = [];

    for (let i = 0; i < leaves.length; i++) {

        let email = leaves[i].email;

        if (!employees.includes(email)) {

            employees.push(email);

        }

    }


    for (let i = 0; i < employees.length; i++) {

        let option = document.createElement("option");

        option.value = employees[i];

        option.textContent = employees[i];

        employeeFilter.appendChild(option);

    }
}


// =========================
// Display Leaves
// =========================

function displayLeaves() {

    leaveTableBody.innerHTML = "";


    let selectedEmployee = employeeFilter.value;

    let selectedStatus = statusFilter.value;


    for (let i = 0; i < leaves.length; i++) {


        // Employee Filter

        if (
            selectedEmployee !== "all" &&
            leaves[i].email !== selectedEmployee
        ) {
            continue;
        }


        // Status Filter

        if (
            selectedStatus !== "all" &&
            leaves[i].status !== selectedStatus
        ) {
            continue;
        }


        let row = document.createElement("tr");


        let action = "";


        if (leaves[i].status === "Pending") {

            action = `

                <div class="action-buttons">

                    <button
                        class="approve-btn"
                        onclick="approveLeave(${i})"
                    >
                        Approve
                    </button>

                    <button
                        class="reject-btn"
                        onclick="rejectLeave(${i})"
                    >
                        Reject
                    </button>

                </div>

            `;

        }
        else {

            action = `
                <span class="no-action">
                    Processed
                </span>
            `;

        }


        let statusClass = leaves[i].status.toLowerCase();


        row.innerHTML = `

            <td>

                <div class="employee-name">
                    ${leaves[i].email}
                </div>

            </td>


            <td>
                ${leaves[i].leaveType}
            </td>


            <td>
                ${leaves[i].startDate}
            </td>


            <td>
                ${leaves[i].endDate}
            </td>


            <td>
                ${leaves[i].reason}
            </td>


            <td>

                <span class="status ${statusClass}">
                    ${leaves[i].status}
                </span>

            </td>


            <td>
                ${action}
            </td>

        `;


        leaveTableBody.appendChild(row);

    }

}


// =========================
// Approve
// =========================

function approveLeave(index) {

    leaves[index].status = "Approved";


    localStorage.setItem(
        "leaves",
        JSON.stringify(leaves)
    );


    displayLeaves();


    alert("Leave approved!");

}


// =========================
// Reject
// =========================

function rejectLeave(index) {

    leaves[index].status = "Rejected";


    localStorage.setItem(
        "leaves",
        JSON.stringify(leaves)
    );


    displayLeaves();


    alert("Leave rejected!");

}


// =========================
// Filters
// =========================

employeeFilter.addEventListener(
    "change",
    displayLeaves
);


statusFilter.addEventListener(
    "change",
    displayLeaves
);


// =========================
// Start
// =========================

loadEmployees();

displayLeaves();