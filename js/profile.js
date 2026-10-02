// =========================================================
// EMPLOYEE PROFILE
// =========================================================

let currentUser = null;


// =========================================================
// DOM ELEMENTS
// =========================================================

const profileImage =
    document.getElementById("profileImage");

const nameElement =
    document.getElementById("name");

const emailElement =
    document.getElementById("email");

const positionElement =
    document.getElementById("position");

const positionCard =
    document.getElementById("positionCard");

const roleElement =
    document.getElementById("role");

const departmentElement =
    document.getElementById("department");

const departmentCard =
    document.getElementById("departmentCard");

const salaryElement =
    document.getElementById("salary");

const phoneElement =
    document.getElementById("phone");

const addressElement =
    document.getElementById("address");


const sidebarName =
    document.getElementById("sidebarName");

const sidebarRole =
    document.getElementById("sidebarRole");

const miniAvatar =
    document.getElementById("miniAvatar");


// EDIT MODAL

const editButton =
    document.getElementById("editButton");

const editModal =
    document.getElementById("editModal");

const closeModal =
    document.getElementById("closeModal");

const cancelEdit =
    document.getElementById("cancelEdit");

const editProfileForm =
    document.getElementById("editProfileForm");

const editName =
    document.getElementById("editName");

const editPhone =
    document.getElementById("editPhone");

const editAddress =
    document.getElementById("editAddress");

const editImage =
    document.getElementById("editImage");

const formMessage =
    document.getElementById("formMessage");

const logoutButton =
    document.getElementById("logoutButton");


// =========================================================
// LOAD USER
// =========================================================

async function loadCurrentUser() {

    // المستخدم الذي سجل الدخول
    const storedUser =
        JSON.parse(
            localStorage.getItem("currentUser")
        );


    if (!storedUser) {

        console.log(
            "No current user found."
        );

        window.location.href =
            "login.html";

        return;

    }


    try {

        // نقرأ البيانات الأصلية من JSON
        const response =
            await fetch("../JSON/users.json");


        if (!response.ok) {

            throw new Error(
                "Could not load users.json"
            );

        }


        const users =
            await response.json();


        // نبحث عن نفس المستخدم
        let jsonUser =
            users.find(function (user) {

                return (
                    user.id === storedUser.id ||
                    user.email === storedUser.email
                );

            });


        // إذا لم نجده نستخدم currentUser
        if (!jsonUser) {

            jsonUser =
                storedUser;

        }


        // ID المستخدم
        const userKey =
            jsonUser.id ||
            jsonUser.email;


        // التعديلات المحلية
        const savedEdits =
            JSON.parse(
                localStorage.getItem(
                    "profileEdits_" +
                    userKey
                )
            ) || {};


        // JSON الأصلي
        // ثم currentUser
        // ثم التعديلات المحلية
        currentUser = {

            ...jsonUser,

            ...storedUser,

            ...savedEdits

        };


        // تحديث currentUser
        localStorage.setItem(
            "currentUser",
            JSON.stringify(currentUser)
        );


        displayProfile();


    } catch (error) {

        console.log(
            "Error loading profile:",
            error
        );


        // حتى لو JSON فشل
        // نعرض currentUser الموجود في localStorage

        currentUser =
            storedUser;


        displayProfile();

    }

}


// =========================================================
// DISPLAY USER
// =========================================================

function displayProfile() {

    if (!currentUser) {
        return;
    }


    // نعالج اختلاف أسماء الحقول
    const userPosition =
        currentUser.position ||
        currentUser.jobTitle ||
        currentUser.job_title ||
        currentUser.title ||
        currentUser.job ||
        "Employee";


    const userDepartment =
        currentUser.department ||
        "Not Assigned";


    const userRole =
        currentUser.role ||
        "EMP";


    const userSalary =
        currentUser.salary ??
        0;


    const userPhone =
        currentUser.phone ||
        "Not provided";


    const userAddress =
        currentUser.address ||
        "Not provided";


    const userEmail =
        currentUser.email ||
        "Not provided";


    const userName =
        currentUser.name ||
        "Employee";


    // =========================
    // PROFILE IMAGE
    // =========================

    if (
        currentUser.image &&
        currentUser.image.trim() !== ""
    ) {

        profileImage.src =
            currentUser.image;

    } else {

        setDefaultProfileImage(
            userName
        );

    }


    profileImage.onerror =
        function () {

            setDefaultProfileImage(
                userName
            );

        };


    // =========================
    // PROFILE CONTENT
    // =========================

    nameElement.textContent =
        userName;

    emailElement.textContent =
        userEmail;

    positionElement.textContent =
        userPosition;

    positionCard.textContent =
        userPosition;

    roleElement.textContent =
        userRole;

    departmentElement.textContent =
        userDepartment;

    departmentCard.textContent =
        userDepartment;

    salaryElement.textContent =
        userSalary;

    phoneElement.textContent =
        userPhone;

    addressElement.textContent =
        userAddress;


    // =========================
    // SIDEBAR USER
    // =========================

    sidebarName.textContent =
        userName;

    sidebarRole.textContent =
        userRole;


    miniAvatar.textContent =
        userName
            .charAt(0)
            .toUpperCase();

}


// =========================================================
// DEFAULT PROFILE IMAGE
// =========================================================

function setDefaultProfileImage(userName) {

    const firstLetter =
        userName
            .charAt(0)
            .toUpperCase();


    const svg = `

        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="300"
            height="300"
        >

            <rect
                width="100%"
                height="100%"
                fill="#362E2A"
            />

            <circle
                cx="150"
                cy="150"
                r="105"
                fill="#D4A373"
                opacity="0.18"
            />

            <text
                x="50%"
                y="54%"
                dominant-baseline="middle"
                text-anchor="middle"
                font-size="110"
                font-family="Georgia"
                font-weight="bold"
                fill="#D4A373"
            >
                ${firstLetter}
            </text>

        </svg>

    `;


    profileImage.src =
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(svg);

}


// =========================================================
// OPEN EDIT MODAL
// =========================================================

editButton.addEventListener(
    "click",
    function () {

        if (!currentUser) {
            return;
        }


        editName.value =
            currentUser.name || "";


        editPhone.value =
            currentUser.phone || "";


        editAddress.value =
            currentUser.address || "";


        editImage.value =
            currentUser.image || "";


        formMessage.textContent =
            "";


        editModal.classList.add(
            "show"
        );

    }
);


// =========================================================
// CLOSE MODAL
// =========================================================

function closeEditModal() {

    editModal.classList.remove(
        "show"
    );

}


closeModal.addEventListener(
    "click",
    closeEditModal
);


cancelEdit.addEventListener(
    "click",
    closeEditModal
);


// لما يكبس خارج المودال

editModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            editModal
        ) {

            closeEditModal();

        }

    }
);


// ESC CLOSE

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeEditModal();

        }

    }
);


// =========================================================
// SAVE PROFILE CHANGES
// =========================================================

editProfileForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        if (!currentUser) {
            return;
        }


        const newName =
            editName.value.trim();


        const newPhone =
            editPhone.value.trim();


        const newAddress =
            editAddress.value.trim();


        const newImage =
            editImage.value.trim();


        // =========================
        // VALIDATION
        // =========================

        if (newName === "") {

            formMessage.textContent =
                "Name cannot be empty.";

            return;

        }


        if (
            newPhone !== "" &&
            !/^07[0-9]{8}$/.test(newPhone)
        ) {

            formMessage.textContent =
                "Phone must contain 10 digits and start with 07.";

            return;

        }


        // =========================
        // UPDATE OBJECT
        // =========================

        const profileChanges = {

            name:
                newName,

            phone:
                newPhone,

            address:
                newAddress,

            image:
                newImage

        };


        currentUser = {

            ...currentUser,

            ...profileChanges

        };


        // =========================
        // SAVE LOCAL EDITS
        // =========================

        const userKey =
            currentUser.id ||
            currentUser.email;


        localStorage.setItem(

            "profileEdits_" +
            userKey,

            JSON.stringify(
                profileChanges
            )

        );


        // نخلي currentUser محدث كمان

        localStorage.setItem(

            "currentUser",

            JSON.stringify(
                currentUser
            )

        );


        displayProfile();


        closeEditModal();

    }
);


// =========================================================
// LOGOUT
// =========================================================

logoutButton.addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "currentUser"
        );

    }
);


// =========================================================
// START
// =========================================================

loadCurrentUser();