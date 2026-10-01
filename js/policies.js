/* =========================================================
   POLICIES.JS
   HR + EMPLOYEE PERMISSIONS
========================================================= */


/* =========================================================
   CURRENT USER
========================================================= */

let currentUser = null;

let policies = [];


/*
    للتجربة:

    بدون userId في الرابط:
    المستخدم الافتراضي = 1 = HR

    ?userId=1  => HR
    ?userId=2  => EMP
    ?userId=3  => EMP
*/

const DEFAULT_USER_ID = 1;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const policiesContainer =
    document.getElementById("policiesContainer");

const policySearch =
    document.getElementById("policySearch");

const categoryFilter =
    document.getElementById("categoryFilter");

const addPolicyBtn =
    document.getElementById("addPolicyBtn");

const viewPolicyModal =
    document.getElementById("viewPolicyModal");

const closePolicyModal =
    document.getElementById("closePolicyModal");


/* =========================================================
   HIDE ADD BUTTON FIRST
========================================================= */

if (addPolicyBtn) {

    addPolicyBtn.style.display = "none";

}


/* =========================================================
   LOAD CURRENT USER
========================================================= */

async function loadCurrentUser() {

    try {

        /*
            لو في userId بالرابط نستخدمه.

            لو ما في:
            نستخدم DEFAULT_USER_ID = 1
        */

        const params =
            new URLSearchParams(
                window.location.search
            );


        const idFromUrl =
            Number(
                params.get("userId")
            );


        const userId =
            idFromUrl || DEFAULT_USER_ID;


        /* ================= READ EMPLOYEE JSON ================= */

        const response =
            await fetch(
                "../JSON/employee.json"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load employee.json"
            );

        }


        const employees =
            await response.json();


        /* ================= FIND USER ================= */

        currentUser =
            employees.find(employee => {

                return Number(employee.id) === Number(userId);

            });


        if (!currentUser) {

            console.log(
                "User not found"
            );

            return;

        }


        console.log(
            "Current User:",
            currentUser
        );


        console.log(
            "Current Role:",
            currentUser.role
        );


        /* ================= UPDATE PAGE ================= */

        updateUserInterface();

        applyPermissions();

    }

    catch (error) {

        console.error(
            "Error loading employee:",
            error
        );

    }

}


/* =========================================================
   UPDATE USER INTERFACE
========================================================= */

function updateUserInterface() {

    if (!currentUser) {

        return;

    }


    /* ================= NAME ================= */

    const nameElement =
        document.querySelector(
            ".profile-info strong"
        );


    if (nameElement) {

        nameElement.textContent =
            currentUser.name;

    }


    /* ================= ROLE ================= */

    const roleElement =
        document.querySelector(
            ".profile-info span"
        );


    if (roleElement) {

        if (currentUser.role === "HR") {

            roleElement.textContent =
                "HR Manager";

        }

        else {

            roleElement.textContent =
                "Employee";

        }

    }


    /* ================= AVATAR ================= */

    const avatar =
        document.querySelector(
            ".avatar"
        );


    if (
        avatar &&
        currentUser.name
    ) {

        avatar.textContent =
            currentUser.name
                .charAt(0)
                .toUpperCase();

    }


    /* ================= PAGE DESCRIPTION ================= */

    const description =
        document.querySelector(
            ".page-header p"
        );


    if (description) {

        if (currentUser.role === "HR") {

            description.textContent =
                "Manage and view all CTRL+NXT company policies";

        }

        else {

            description.textContent =
                "View all CTRL+NXT company policies";

        }

    }

}


/* =========================================================
   APPLY PERMISSIONS
========================================================= */

function applyPermissions() {

    if (!currentUser) {

        if (addPolicyBtn) {

            addPolicyBtn.style.display =
                "none";

        }

        return;

    }


    /* ================= HR ================= */

    if (currentUser.role === "HR") {

        if (addPolicyBtn) {

            addPolicyBtn.style.display =
                "inline-flex";

        }

    }


    /* ================= EMPLOYEE ================= */

    else {

        if (addPolicyBtn) {

            addPolicyBtn.style.display =
                "none";

        }

    }


    /*
        إعادة رسم الكروت حتى تظهر
        Edit + Delete للـ HR
    */

    if (policies.length > 0) {

        displayPolicies(
            policies
        );

    }

}


/* =========================================================
   LOAD POLICIES
========================================================= */

async function loadPolicies() {

    try {

        const savedPolicies =
            localStorage.getItem(
                "policies"
            );


        /* ================= FROM LOCAL STORAGE ================= */

        if (savedPolicies) {

            policies =
                JSON.parse(
                    savedPolicies
                );


            displayPolicies(
                policies
            );


            return;

        }


        /* ================= FROM JSON ================= */

        const response =
            await fetch(
                "../JSON/policies.json"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load policies.json"
            );

        }


        policies =
            await response.json();


        /* ================= SAVE ================= */

        localStorage.setItem(
            "policies",
            JSON.stringify(
                policies
            )
        );


        displayPolicies(
            policies
        );

    }

    catch (error) {

        console.error(
            "Error loading policies:",
            error
        );


        if (policiesContainer) {

            policiesContainer.innerHTML = `

                <div class="no-policies">

                    <h3>
                        Unable to load policies
                    </h3>

                    <p>
                        Please try again.
                    </p>

                </div>

            `;

        }

    }

}


/* =========================================================
   DISPLAY POLICIES
========================================================= */

function displayPolicies(policyList) {

    if (!policiesContainer) {

        return;

    }


    policiesContainer.innerHTML = "";


    /* ================= EMPTY ================= */

    if (!policyList || policyList.length === 0) {

        policiesContainer.innerHTML = `

            <div class="no-policies">

                <h3>
                    No policies found
                </h3>

                <p>
                    Try another search or category.
                </p>

            </div>

        `;


        return;

    }


    /* ================= CHECK ROLE ================= */

    const isHR =
        currentUser &&
        currentUser.role === "HR";


    /* ================= CARDS ================= */

    policyList.forEach(policy => {


        let buttons = `

            <button
                class="view-policy-btn"
                onclick="viewPolicy(${policy.id})"
            >
                View
            </button>

        `;


        /* =========================================
           HR ONLY
        ========================================= */

        if (isHR) {

            buttons += `

                <button
                    class="edit-policy-btn"
                    onclick="editPolicy(${policy.id})"
                >
                    Edit
                </button>


                <button
                    class="delete-policy-btn"
                    onclick="deletePolicy(${policy.id})"
                >
                    Delete
                </button>

            `;

        }


        /* ================= CARD ================= */

        policiesContainer.innerHTML += `

            <div class="policy-card">

                <div class="policy-card-top">

                    <div class="policy-icon">
                        📄
                    </div>


                    <div>

                        <h3>
                            ${policy.title}
                        </h3>


                        <span class="policy-category">
                            ${policy.category}
                        </span>

                    </div>

                </div>


                <p class="policy-description">
                    ${policy.description}
                </p>


                <div class="policy-footer">

                    <div class="policy-actions">

                        ${buttons}

                    </div>

                </div>

            </div>

        `;

    });

}


/* =========================================================
   SEARCH + FILTER
========================================================= */

function filterPolicies() {

    const search =
        policySearch
            ? policySearch.value
                .toLowerCase()
                .trim()
            : "";


    const category =
        categoryFilter
            ? categoryFilter.value
            : "all";


    const filteredPolicies =
        policies.filter(policy => {


            const title =
                policy.title
                    ? policy.title.toLowerCase()
                    : "";


            const description =
                policy.description
                    ? policy.description.toLowerCase()
                    : "";


            const matchesSearch =

                title.includes(search)

                ||

                description.includes(search);


            const matchesCategory =

                category === "all"

                ||

                policy.category === category;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    displayPolicies(
        filteredPolicies
    );

}


/* =========================================================
   VIEW POLICY
========================================================= */

function viewPolicy(id) {

    const policy =
        policies.find(policy => {

            return Number(policy.id) === Number(id);

        });


    if (!policy) {

        return;

    }


    /* ================= TITLE ================= */

    const modalTitle =
        document.getElementById(
            "modalPolicyTitle"
        );


    if (modalTitle) {

        modalTitle.textContent =
            policy.title;

    }


    /* ================= CATEGORY ================= */

    const modalCategory =
        document.getElementById(
            "modalPolicyCategory"
        );


    if (modalCategory) {

        modalCategory.textContent =
            policy.category;

    }


    /* ================= DESCRIPTION ================= */

    const modalDescription =
        document.getElementById(
            "modalPolicyDescription"
        );


    if (modalDescription) {

        modalDescription.textContent =
            policy.description;

    }


    /* ================= PURPOSE ================= */

    const purposeSection =
        document.getElementById(
            "purposeSection"
        );


    const purposeText =
        document.getElementById(
            "modalPolicyPurpose"
        );


    if (
        purposeSection &&
        purposeText
    ) {

        if (policy.purpose) {

            purposeSection.style.display =
                "block";


            purposeText.textContent =
                policy.purpose;

        }

        else {

            purposeSection.style.display =
                "none";

        }

    }


    /* ================= SCOPE ================= */

    const scopeSection =
        document.getElementById(
            "scopeSection"
        );


    const scopeText =
        document.getElementById(
            "modalPolicyScope"
        );


    if (
        scopeSection &&
        scopeText
    ) {

        if (policy.scope) {

            scopeSection.style.display =
                "block";


            scopeText.textContent =
                policy.scope;

        }

        else {

            scopeSection.style.display =
                "none";

        }

    }


    /* ================= RESPONSIBILITIES ================= */

    const responsibilitiesSection =
        document.getElementById(
            "responsibilitiesSection"
        );


    const responsibilitiesText =
        document.getElementById(
            "modalPolicyResponsibilities"
        );


    if (
        responsibilitiesSection &&
        responsibilitiesText
    ) {

        if (policy.responsibilities) {

            responsibilitiesSection.style.display =
                "block";


            responsibilitiesText.textContent =
                policy.responsibilities;

        }

        else {

            responsibilitiesSection.style.display =
                "none";

        }

    }


    /* ================= EFFECTIVE DATE ================= */

    const effectiveDate =
        document.getElementById(
            "modalEffectiveDate"
        );


    if (effectiveDate) {

        if (policy.effectiveDate) {

            effectiveDate.textContent =
                "Effective: " +
                policy.effectiveDate;

        }

        else {

            effectiveDate.textContent =
                "";

        }

    }


    /* ================= UPDATED DATE ================= */

    const updatedDate =
        document.getElementById(
            "modalUpdatedDate"
        );


    if (updatedDate) {

        if (policy.updatedDate) {

            updatedDate.textContent =
                "Updated: " +
                policy.updatedDate;

        }

        else {

            updatedDate.textContent =
                "";

        }

    }


    /* ================= OPEN MODAL ================= */

    if (viewPolicyModal) {

        viewPolicyModal.style.display =
            "flex";

    }

}


/* =========================================================
   EDIT POLICY
   HR ONLY
========================================================= */

function editPolicy(id) {

    /* ================= SECURITY CHECK ================= */

    if (
        !currentUser ||
        currentUser.role !== "HR"
    ) {

        alert(
            "Only HR can edit policies."
        );

        return;

    }


    /* ================= SAVE POLICY ID ================= */

    localStorage.setItem(
        "selectedPolicyId",
        id
    );


    /* ================= GO EDIT PAGE ================= */

    window.location.href =
        "editPolicy.html";

}


/* =========================================================
   DELETE POLICY
   HR ONLY
========================================================= */

function deletePolicy(id) {

    /* ================= SECURITY CHECK ================= */

    if (
        !currentUser ||
        currentUser.role !== "HR"
    ) {

        alert(
            "Only HR can delete policies."
        );

        return;

    }


    /* ================= FIND POLICY ================= */

    const policy =
        policies.find(policy => {

            return Number(policy.id) === Number(id);

        });


    if (!policy) {

        return;

    }


    /* ================= CONFIRM ================= */

    const confirmDelete =
        confirm(
            `Are you sure you want to delete "${policy.title}"?`
        );


    if (!confirmDelete) {

        return;

    }


    /* ================= DELETE ================= */

    policies =
        policies.filter(policy => {

            return Number(policy.id) !== Number(id);

        });


    /* ================= UPDATE LOCAL STORAGE ================= */

    localStorage.setItem(
        "policies",
        JSON.stringify(
            policies
        )
    );


    /* ================= REFRESH ================= */

    filterPolicies();

}


/* =========================================================
   ADD POLICY
   HR ONLY
========================================================= */

if (addPolicyBtn) {

    addPolicyBtn.addEventListener(

        "click",

        function () {


            if (
                !currentUser ||
                currentUser.role !== "HR"
            ) {

                alert(
                    "Only HR can add policies."
                );

                return;

            }


            window.location.href =
                "addpolicise.html";

        }

    );

}


/* =========================================================
   SEARCH EVENT
========================================================= */

if (policySearch) {

    policySearch.addEventListener(

        "input",

        filterPolicies

    );

}


/* =========================================================
   FILTER EVENT
========================================================= */

if (categoryFilter) {

    categoryFilter.addEventListener(

        "change",

        filterPolicies

    );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

if (closePolicyModal) {

    closePolicyModal.addEventListener(

        "click",

        function () {

            viewPolicyModal.style.display =
                "none";

        }

    );

}


/* =========================================================
   CLICK OUTSIDE MODAL
========================================================= */

if (viewPolicyModal) {

    viewPolicyModal.addEventListener(

        "click",

        function (event) {

            if (
                event.target ===
                viewPolicyModal
            ) {

                viewPolicyModal.style.display =
                    "none";

            }

        }

    );

}


/* =========================================================
   ESCAPE CLOSE
========================================================= */

document.addEventListener(

    "keydown",

    function (event) {

        if (
            event.key === "Escape" &&
            viewPolicyModal
        ) {

            viewPolicyModal.style.display =
                "none";

        }

    }

);


/* =========================================================
   START
========================================================= */

async function startPage() {

    /*
        مهم جدًا:

        أول شيء نقرأ المستخدم.
        بعدين نقرأ الـ policies.

        عشان لما تنرسم الكروت
        نكون عارفين هل هو HR أو EMP.
    */


    await loadCurrentUser();


    await loadPolicies();


    applyPermissions();

}


/* =========================================================
   RUN
========================================================= */

startPage();