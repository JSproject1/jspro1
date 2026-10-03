function getCurrentUser() {

    let user =
        localStorage.getItem("currentUser");

    if (user == null) {
        return null;
    }

    return JSON.parse(user);
}


let currentUser = getCurrentUser();


if (currentUser == null) {

    window.location.href = "login.html";

}
else if (currentUser.role !== "HR") {

    window.location.href = "ETasks.html";

}


// =========================
// GET DATA
// =========================

let employees =
    JSON.parse(
        localStorage.getItem("employees")
    ) || [];

let tasks =
    JSON.parse(
        localStorage.getItem("tasks")
    ) || [];

let leaves =
    JSON.parse(
        localStorage.getItem("leaves")
    ) || [];

let feedbacks =
    JSON.parse(
        localStorage.getItem("feedbacks")
    ) || [];


// =========================
// LOAD EMPLOYEES FROM JSON
// =========================

function loadEmployees() {

    /*
        إذا employees موجودة في Local Storage
        نستخدمها لأنها تحتوي على التعديلات
        مثل Active / Inactive.
    */

    if (employees.length > 0) {

        updateDashboard();

        return;
    }


    fetch("../JSON/employee.json")

        .then(function (response) {

            return response.json();

        })

        .then(function (data) {

            employees =
                data.filter(function (user) {

                    return user.role === "EMP";

                });


            employees.forEach(function (employee) {

                if (!employee.status) {

                    employee.status = "Active";

                }

            });


            localStorage.setItem(
                "employees",
                JSON.stringify(employees)
            );


            updateDashboard();

        })

        .catch(function (error) {

            console.log(
                "Error loading employees:",
                error
            );

        });
}


// =========================
// UPDATE ALL KPIs
// =========================

function updateDashboard() {


    // =========================
    // EMPLOYEES
    // =========================

    let totalEmployees = 0;

    let activeEmployees = 0;


    for (let i = 0; i < employees.length; i++) {

        if (employees[i].role === "EMP") {

            totalEmployees++;

        }


        if (
            employees[i].role === "EMP" &&
            employees[i].status === "Active"
        ) {

            activeEmployees++;

        }

    }


    document.getElementById(
        "totalEmployees"
    ).textContent =
        totalEmployees;


    document.getElementById(
        "activeEmployees"
    ).textContent =
        activeEmployees;


    // =========================
    // PENDING LEAVE
    // =========================

    let pendingLeave = 0;


    for (let i = 0; i < leaves.length; i++) {

        if (leaves[i].status === "Pending") {

            pendingLeave++;

        }

    }


    document.getElementById(
        "pendingLeave"
    ).textContent =
        pendingLeave;


    // =========================
    // TASKS
    // =========================

    let pendingTasks = 0;

    let submittedTasks = 0;


    for (let i = 0; i < tasks.length; i++) {

        /*
            Pending Tasks
        */

        if (tasks[i].status === "Pending") {

            pendingTasks++;

        }


        /*
            Submitted Tasks

            نحسب المهام التي فيها
            employeeSubmissions
            وبداخلها submission.
        */

        if (
            tasks[i].employeeSubmissions &&
            Object.keys(
                tasks[i].employeeSubmissions
            ).length > 0
        ) {

            submittedTasks++;

        }

    }


    document.getElementById(
        "pendingTasks"
    ).textContent =
        pendingTasks;


    document.getElementById(
        "submittedTasks"
    ).textContent =
        submittedTasks;


    // =========================
    // FEEDBACK
    // =========================

    let newFeedback = 0;


    for (let i = 0; i < feedbacks.length; i++) {

        if (feedbacks[i].status === "new") {

            newFeedback++;

        }

    }


    document.getElementById(
        "newFeedback"
    ).textContent =
        newFeedback;


    // =========================
    // RECENT EMPLOYEES
    // =========================

    displayRecentEmployees();


    // =========================
    // DEPARTMENTS
    // =========================

    displayDepartmentStats();
}


// =========================
// RECENT EMPLOYEES
// =========================

function displayRecentEmployees() {

    let recentEmployees =
        document.getElementById(
            "recentEmployees"
        );


    recentEmployees.innerHTML = "";


    let employeeList =
        employees.filter(function (employee) {

            return employee.role === "EMP";

        });


    for (
        let i = 0;
        i < employeeList.length;
        i++
    ) {

        recentEmployees.innerHTML += `

            <div class="employee-item">

                <div class="employee-avatar">

                    ${employeeList[i].name
                        .charAt(0)
                        .toUpperCase()}

                </div>


                <div class="employee-info">

                    <h4>
                        ${employeeList[i].name}
                    </h4>

                    <p>
                        ${employeeList[i].email}
                    </p>

                </div>


                <div class="employee-department">

                    ${employeeList[i].department}

                </div>

            </div>

        `;

    }
}


// =========================
// EMPLOYEES BY DEPARTMENT
// =========================

function displayDepartmentStats() {

    let departmentStats =
        document.getElementById(
            "departmentStats"
        );


    departmentStats.innerHTML = "";


    let departments = {};


    for (let i = 0; i < employees.length; i++) {

        if (employees[i].role !== "EMP") {

            continue;

        }


        let department =
            employees[i].department;


        if (!departments[department]) {

            departments[department] = 0;

        }


        departments[department]++;

    }


    for (let department in departments) {

        departmentStats.innerHTML += `

            <div class="department-item">

                <span>
                    ${department}
                </span>

                <strong>
                    ${departments[department]}
                </strong>

            </div>

        `;

    }
}


// =========================
// START DASHBOARD
// =========================

loadEmployees();