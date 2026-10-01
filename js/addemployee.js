const employeeForm =
    document.getElementById("employeeForm");

const nameInput =
    document.getElementById("name");

const emailInput =
    document.getElementById("email");

const roleInput =
    document.getElementById("role");

const departmentInput =
    document.getElementById("department");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const formMessage =
    document.getElementById("formMessage");

const cancelBtn =
    document.getElementById("cancelBtn");


employeeForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const name =
        nameInput.value.trim();

    const email =
        emailInput.value.trim();

    const role =
        roleInput.value;

    const department =
        departmentInput.value;

    const password =
        passwordInput.value;

    const confirmPassword =
        confirmPasswordInput.value;


    /* ================= VALIDATION ================= */

    if (
        name === "" ||
        email === "" ||
        role === "" ||
        department === "" ||
        password === "" ||
        confirmPassword === ""
    ) {

        formMessage.textContent =
            "Please fill in all fields.";

        formMessage.style.color = "red";

        return;
    }


    if (password !== confirmPassword) {

        formMessage.textContent =
            "Passwords do not match.";

        formMessage.style.color = "red";

        return;
    }


    /* ================= GET EMPLOYEES ================= */

    let employees =
        JSON.parse(
            localStorage.getItem("employees")
        ) || [];


    /* ================= CHECK EMAIL ================= */

    const emailExists =
        employees.some(employee => {

            return employee.email.toLowerCase()
                === email.toLowerCase();

        });


    if (emailExists) {

        formMessage.textContent =
            "This email already exists.";

        formMessage.style.color = "red";

        return;
    }


    /* ================= GENERATE ID ================= */

    let newId = 1;


    if (employees.length > 0) {

        newId =
            Math.max(
                ...employees.map(employee => employee.id)
            ) + 1;

    }


    /* ================= NEW EMPLOYEE ================= */

    const newEmployee = {

        id: newId,

        name: name,

        role: role,

        email: email,

        department: department,

        password: password

    };


    /* ================= ADD ================= */

    employees.push(newEmployee);


    /* ================= SAVE ================= */

    localStorage.setItem(
        "employees",
        JSON.stringify(employees)
    );


    /* ================= SUCCESS ================= */

    formMessage.textContent =
        "Employee added successfully.";

    formMessage.style.color = "green";


    setTimeout(function () {

        window.location.href =
            "employees.html";

    }, 700);

});


/* ================= CANCEL ================= */

cancelBtn.addEventListener("click", function () {

    window.location.href =
        "employees.html";

});