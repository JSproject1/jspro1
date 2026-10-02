//    GET ELEMENTS
const table =
    document.getElementById("employeesTable");

const employeeCount =
    document.getElementById("employeeCount");

const searchInput =
    document.getElementById("employeeSearch");

const departmentFilter =
    document.getElementById("departmentFilter");

const addEmployeeBtn =
    document.getElementById("addEmployeeBtn");

const topSearch =
    document.getElementById("topSearch");
//    VIEW MODAL ELEMENTS
const employeeModal =
    document.getElementById("employeeModal");

const closeModal =
    document.getElementById("closeModal");
//    DEACTIVATE MODAL ELEMENTS
const deactivateModal =
    document.getElementById("deactivateModal");

const deactivateEmployeeName =
    document.getElementById("deactivateEmployeeName");

const closeDeactivateModal =
    document.getElementById("closeDeactivateModal");

const cancelDeactivateBtn =
    document.getElementById("cancelDeactivateBtn");

const confirmDeactivateBtn =
    document.getElementById("confirmDeactivateBtn");
//    VARIABLES
let employees = [];
let employeeToDeactivateId = null;
//    SAVE EMPLOYEES
function saveEmployees() {

    localStorage.setItem(
        "employees",
        JSON.stringify(employees)
    );
}
//    LOAD EMPLOYEES
function loadEmployees() {
    const savedEmployees =
        localStorage.getItem("employees");
    /* Employees already exist in Local Storage */
    if (savedEmployees) {
        employees =
            JSON.parse(savedEmployees);
        /* Add status to old employees */
        employees.forEach(employee => {

            if (!employee.status) {
                employee.status =
                    "Active";
            }
        });
        saveEmployees();
        displayEmployees(employees);
    }
    else {

        fetch("../JSON/employee.json")

            .then(response => {

                if (!response.ok) {

                    throw new Error(
                        "Failed to load employee.json"
                    );
                }
                return response.json();
            })
            .then(data => {
                employees = data;  
                employees.forEach(employee => {
                    if (!employee.status) {
                        employee.status =
                            "Active";
                    }
                });
                saveEmployees();
                displayEmployees(employees);
            })
            .catch(error => {
                console.log(
                    "Error loading employees:",
                    error
                );
            });
    }
}
//   DISPLAY EMPLOYEES
function displayEmployees(employeeList) {
    table.innerHTML = "";
    /* Number currently displayed */

    employeeCount.textContent =
        employeeList.length;

    employeeList.forEach(employee => {
        const status =
            employee.status || "Active";

        const isInactive =
            status === "Inactive";

        table.innerHTML += `
            <tr class="${isInactive ? "inactive-row" : ""}">
                <!-- EMPLOYEE -->
                <td>
                    <div class="employee-info">
                        <div class="employee-avatar">
                            ${employee.name
                                .charAt(0)
                                .toUpperCase()}
                        </div>
                        <div class="employee-details">

                            <strong>
                                ${employee.name}
                            </strong>

                            <span>
                                ${employee.email}
                            </span>
                        </div>
                    </div>
                </td>
                <!-- ROLE -->
                <td>
                    ${employee.role}
                </td>
                <!-- DEPARTMENT -->
                <td>
                    ${employee.department}
                </td>
                <!-- EMAIL -->
                <td>
                    ${employee.email}
                </td>
                <!-- ACTIONS -->
                <td>
                    <div class="actions">
                        <!-- VIEW -->
                        <button
                            type="button"
                            class="view-btn"
                            onclick="viewEmployee(${employee.id})"
                        >
                            View
                        </button>
                        <!-- EDIT -->
                        <button
                            type="button"
                            class="edit-btn"
                            onclick="editEmployee(${employee.id})"
                        >
                            Edit
                        </button>
                        <!-- ACTIVE / INACTIVE BUTTON -->
                        ${
                            isInactive
                            ?
                            `
                            <button
                                type="button"
                                class="reactivate-btn"
                                onclick="reactivateEmployee(${employee.id})"
                            >
                                Reactivate
                            </button>
                            `
                            :
                            `
                            <button
                                type="button"
                                class="deactivate-btn"
                                onclick="deactivateEmployee(${employee.id})"
                            >
                                Deactivate
                            </button>
                            `
                        }
                    </div>
                </td>
            </tr>
        `;
    });
}

//    SEARCH + DEPARTMENT FILTER
function filterEmployees() {
    const search =
        searchInput.value
            .toLowerCase()
            .trim();

    const selectedDepartment =
        departmentFilter.value;
    const filteredEmployees =
        employees.filter(employee => {
            const name =
                employee.name
                    .toLowerCase();
            const email =
                employee.email
                    .toLowerCase();
            const role =
                employee.role
                    .toLowerCase();
            const department =
                employee.department
                    .toLowerCase();
            /* SEARCH */
            const matchSearch =
                name.includes(search)
                ||

                email.includes(search)

                ||
                role.includes(search)
                ||
                department.includes(search);
            /* DEPARTMENT FILTER */
            const matchDepartment =
                selectedDepartment === "all"
                ||
                employee.department ===
                selectedDepartment;
            return (
                matchSearch &&
                matchDepartment
            );
        });
    displayEmployees(
        filteredEmployees
    );
}
//    EMPLOYEE SEARCH
searchInput.addEventListener(
    "input",
    function () {
        /* Keep top search synchronized */

        if (topSearch) {
            topSearch.value =
                searchInput.value;
        }
        filterEmployees();
    }
);
//    TOP SEARCH
if (topSearch) {
    topSearch.addEventListener(
        "input",
        function () {
            searchInput.value =
                topSearch.value;
            filterEmployees();
        }
    );
}
//    DEPARTMENT FILTER

departmentFilter.addEventListener(
    "change",
    filterEmployees
);

//    VIEW EMPLOYEE
function viewEmployee(id) {

    const employee =
        employees.find(employee => {

            return employee.id === id;
        });

    if (!employee) {
        return;
    }
    /* Put employee data inside Modal */
    document.getElementById(
        "modalName"
    ).textContent =
        employee.name;
    document.getElementById(
        "modalEmail"
    ).textContent =
        employee.email;


    document.getElementById(
        "modalRole"
    ).textContent =
        employee.role;

    document.getElementById(
        "modalDepartment"
    ).textContent =
        employee.department;
    /* Open Modal */
    employeeModal.style.display =
        "flex";
}

//    CLOSE VIEW MODAL
function closeEmployeeModal() {

    employeeModal.style.display =
        "none";
}
/* X BUTTON */
closeModal.addEventListener(
    "click",
    closeEmployeeModal
);

/* CLICK OUTSIDE */
employeeModal.addEventListener(
    "click",
    function (event) {
        if (
            event.target ===
            employeeModal
        ) {
            closeEmployeeModal();
        }
    }
);
//    EDIT EMPLOYEE

function editEmployee(id) {
    /*
        Save employee ID.

        edit_employee.html will use
        this ID to know which employee
        should be edited.
    */
    localStorage.setItem(
        "selectedEmployeeId",
        id
    );
    window.location.href =
        "edit_employee.html";
}
//    OPEN DEACTIVATE POPUP
function deactivateEmployee(id) {
    const employee =
        employees.find(employee => {
            return employee.id === id;
        });
    if (!employee) {
        return;
    }
    /*
        IMPORTANT:
        We DO NOT deactivate here.
        We only remember the employee ID
        and open the confirmation popup.
    */
    employeeToDeactivateId =
        id;
    deactivateEmployeeName.textContent =
        employee.name;
    deactivateModal.style.display =
        "flex";
}
//    CONFIRM DEACTIVATE
confirmDeactivateBtn.addEventListener(
    "click",
    function () {
        if (
            employeeToDeactivateId === null
        ) {
            return;
        }
        const employee =
            employees.find(employee => {
                return (
                    employee.id ===
                    employeeToDeactivateId
                );
            });
        if (!employee) {
            return;
        }
        /* Change status */
        employee.status =
            "Inactive";
        /* Save */
        saveEmployees();
        /* Close popup */
        closeDeactivateEmployeeModal();
        /* Refresh table */
        filterEmployees();
    }
);
//    CLOSE DEACTIVATE POPUP
function closeDeactivateEmployeeModal() {
    deactivateModal.style.display =
        "none";
    employeeToDeactivateId =
        null;
}
/* CANCEL */
cancelDeactivateBtn.addEventListener(
    "click",
    closeDeactivateEmployeeModal
);
/* X */
closeDeactivateModal.addEventListener(
    "click",
    closeDeactivateEmployeeModal
);
/* CLICK OUTSIDE */
deactivateModal.addEventListener(
    "click",
    function (event) {
        if (
            event.target ===
            deactivateModal
        ) {
            closeDeactivateEmployeeModal();
        }
    }
);
//    REACTIVATE EMPLOYEE
function reactivateEmployee(id) {
    const employee =
        employees.find(employee => {
            return employee.id === id;
        });
    if (!employee) {
        return;
    }
    employee.status =
        "Active";
    saveEmployees();
    filterEmployees();
}

//    ADD EMPLOYEE
addEmployeeBtn.addEventListener(
    "click",
    function () {
        window.location.href =
            "addEmployee.html";
    }
);
//    ESC KEY CLOSE MODALS
document.addEventListener(
    "keydown",
    function (event) {
        if (event.key === "Escape") {
            if (
                employeeModal.style.display ===
                "flex"
            ) {
                closeEmployeeModal();
            }
            if (
                deactivateModal.style.display ===
                "flex"
            ) {
                closeDeactivateEmployeeModal();
            }
        }
    }
);
//    START APPLICATION
loadEmployees();