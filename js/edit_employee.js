/* ==============================
   GET ELEMENTS
============================== */

const editForm =
    document.getElementById("editEmployeeForm");

const nameInput =
    document.getElementById("editName");

const emailInput =
    document.getElementById("editEmail");

const roleInput =
    document.getElementById("editRole");

const departmentInput =
    document.getElementById("editDepartment");

const cancelBtn =
    document.getElementById("cancelEditBtn");

const editMessage =
    document.getElementById("editMessage");


/* ==============================
   GET EMPLOYEES
============================== */

let employees =
    JSON.parse(
        localStorage.getItem("employees")
    ) || [];


/* ==============================
   GET SELECTED EMPLOYEE ID
============================== */

const selectedEmployeeId =
    Number(
        localStorage.getItem("selectedEmployeeId")
    );


/* ==============================
   FIND EMPLOYEE
============================== */

const employee =
    employees.find(employee => {

        return employee.id === selectedEmployeeId;

    });


/* ==============================
   CHECK EMPLOYEE
============================== */

if (!employee) {

    alert("Employee not found");

    window.location.href =
        "employees.html";

}


/* ==============================
   DISPLAY CURRENT DATA
============================== */

else {

    nameInput.value =
        employee.name;

    emailInput.value =
        employee.email;

    roleInput.value =
        employee.role;

    departmentInput.value =
        employee.department;

}


/* ==============================
   SAVE CHANGES
============================== */

editForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const newName =
            nameInput.value.trim();

        const newEmail =
            emailInput.value.trim();

        const newRole =
            roleInput.value;

        const newDepartment =
            departmentInput.value;


        /* Validation */

        if (
            newName === "" ||
            newEmail === "" ||
            newRole === "" ||
            newDepartment === ""
        ) {

            editMessage.textContent =
                "Please fill in all fields.";

            return;

        }


        /* UPDATE EMPLOYEE */

        employee.name =
            newName;

        employee.email =
            newEmail;

        employee.role =
            newRole;

        employee.department =
            newDepartment;


        /* SAVE ARRAY AGAIN */

        localStorage.setItem(
            "employees",
            JSON.stringify(employees)
        );


        /* We don't need selected ID anymore */

        localStorage.removeItem(
            "selectedEmployeeId"
        );


        /* RETURN TO EMPLOYEES */

        window.location.href =
            "employees.html";

    }
);


/* ==============================
   CANCEL
============================== */

cancelBtn.addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "selectedEmployeeId"
        );

        window.location.href =
            "employees.html";

    }
);