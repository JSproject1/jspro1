/* =========================================================
   HR POLICIES
========================================================= */

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

let policies = [];


/* =========================================================
   ELEMENTS
========================================================= */

const policiesContainer =
    document.getElementById(
        "policiesContainer"
    );


const policySearch =
    document.getElementById(
        "policySearch"
    );


const categoryFilter =
    document.getElementById(
        "categoryFilter"
    );


const addPolicyBtn =
    document.getElementById(
        "addPolicyBtn"
    );


const viewPolicyModal =
    document.getElementById(
        "viewPolicyModal"
    );


const closePolicyModal =
    document.getElementById(
        "closePolicyModal"
    );


const totalPolicies =
    document.getElementById(
        "totalPolicies"
    );


const totalCategories =
    document.getElementById(
        "totalCategories"
    );


/* =========================================================
   LOAD HR INFORMATION
========================================================= */

async function loadHR() {

    try {

        const response =
            await fetch(
                "../JSON/employee.json"
            );


        const employees =
            await response.json();


        const hrUser =
            employees.find(employee => {

                return employee.role === "HR";

            });


        if (!hrUser) {

            return;

        }


        const hrName =
            document.getElementById(
                "hrName"
            );


        const hrAvatar =
            document.getElementById(
                "hrAvatar"
            );


        if (hrName) {

            hrName.textContent =
                hrUser.name;

        }


        if (hrAvatar) {

            hrAvatar.textContent =
                hrUser.name
                    .charAt(0)
                    .toUpperCase();

        }

    }

    catch (error) {

        console.log(
            "Error loading HR:",
            error
        );

    }

}


/* =========================================================
   LOAD POLICIES
========================================================= */

async function loadPolicies() {

    const savedPolicies =
        localStorage.getItem(
            "policies"
        );


    /* ================= LOCAL STORAGE ================= */

    if (savedPolicies) {

        try {

            policies =
                JSON.parse(
                    savedPolicies
                );


            displayPolicies(
                policies
            );


            updateStatistics();


            return;

        }

        catch (error) {

            localStorage.removeItem(
                "policies"
            );

        }

    }


    /* ================= JSON ================= */

    try {

        const response =
            await fetch(
                "../JSON/policies.json"
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load policies"
            );

        }


        policies =
            await response.json();


        localStorage.setItem(
            "policies",
            JSON.stringify(
                policies
            )
        );


        displayPolicies(
            policies
        );


        updateStatistics();

    }

    catch (error) {

        console.log(
            "Error:",
            error
        );


        policiesContainer.innerHTML = `

            <div class="no-policies">

                <h3>
                    Unable to load policies
                </h3>

            </div>

        `;

    }

}


/* =========================================================
   DISPLAY
========================================================= */

function displayPolicies(policyList) {

    policiesContainer.innerHTML = "";


    if (policyList.length === 0) {

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


    policyList.forEach(policy => {


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


                        <button
                            class="view-policy-btn"
                            onclick="viewPolicy(${policy.id})"
                        >

                            View

                        </button>


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


                    </div>


                </div>


            </div>

        `;

    });

}


/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics() {

    if (totalPolicies) {

        totalPolicies.textContent =
            policies.length;

    }


    const categories =
        new Set();


    policies.forEach(policy => {

        if (policy.category) {

            categories.add(
                policy.category
            );

        }

    });


    if (totalCategories) {

        totalCategories.textContent =
            categories.size;

    }

}


/* =========================================================
   SEARCH + FILTER
========================================================= */

function filterPolicies() {

    const search =
        policySearch.value
            .toLowerCase()
            .trim();


    const category =
        categoryFilter.value;


    const filtered =
        policies.filter(policy => {


            const title =
                policy.title
                    ? policy.title.toLowerCase()
                    : "";


            const description =
                policy.description
                    ? policy.description.toLowerCase()
                    : "";


            const matchSearch =

                title.includes(search)

                ||

                description.includes(search);


            const matchCategory =

                category === "all"

                ||

                policy.category === category;


            return (

                matchSearch &&
                matchCategory

            );

        });


    displayPolicies(
        filtered
    );

}


/* =========================================================
   VIEW
========================================================= */

function viewPolicy(id) {

    const policy =
        policies.find(policy => {

            return Number(policy.id) === Number(id);

        });


    if (!policy) {

        return;

    }


    document.getElementById(
        "modalPolicyTitle"
    ).textContent =
        policy.title;


    document.getElementById(
        "modalPolicyCategory"
    ).textContent =
        policy.category;


    document.getElementById(
        "modalPolicyDescription"
    ).textContent =
        policy.description;


    /* ================= PURPOSE ================= */

    const purposeSection =
        document.getElementById(
            "purposeSection"
        );


    const purposeText =
        document.getElementById(
            "modalPolicyPurpose"
        );


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


    /* ================= SCOPE ================= */

    const scopeSection =
        document.getElementById(
            "scopeSection"
        );


    const scopeText =
        document.getElementById(
            "modalPolicyScope"
        );


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


    /* ================= RESPONSIBILITIES ================= */

    const responsibilitiesSection =
        document.getElementById(
            "responsibilitiesSection"
        );


    const responsibilitiesText =
        document.getElementById(
            "modalPolicyResponsibilities"
        );


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


    /* ================= DATES ================= */

    const effective =
        document.getElementById(
            "modalEffectiveDate"
        );


    const updated =
        document.getElementById(
            "modalUpdatedDate"
        );


    effective.textContent =
        policy.effectiveDate
            ? "Effective: " +
              policy.effectiveDate
            : "";


    updated.textContent =
        policy.updatedDate
            ? "Updated: " +
              policy.updatedDate
            : "";


    /* ================= OPEN ================= */

    viewPolicyModal.style.display =
        "flex";

}


/* =========================================================
   EDIT
========================================================= */

function editPolicy(id) {

    localStorage.setItem(
        "selectedPolicyId",
        id
    );


    window.location.href =
        "editPolicy.html";

}


/* =========================================================
   DELETE
========================================================= */

function deletePolicy(id) {

    const policy =
        policies.find(policy => {

            return Number(policy.id) === Number(id);

        });


    if (!policy) {

        return;

    }


    const confirmDelete =
        confirm(
            `Are you sure you want to delete "${policy.title}"?`
        );


    if (!confirmDelete) {

        return;

    }


    policies =
        policies.filter(policy => {

            return Number(policy.id) !== Number(id);

        });


    localStorage.setItem(
        "policies",
        JSON.stringify(
            policies
        )
    );


    updateStatistics();

    filterPolicies();

}


/* =========================================================
   ADD
========================================================= */

addPolicyBtn.addEventListener(

    "click",

    function () {

        window.location.href =
            "addpolicise.html";

    }

);


/* =========================================================
   SEARCH
========================================================= */

policySearch.addEventListener(

    "input",

    filterPolicies

);


/* =========================================================
   FILTER
========================================================= */

categoryFilter.addEventListener(

    "change",

    filterPolicies

);


/* =========================================================
   CLOSE MODAL
========================================================= */

closePolicyModal.addEventListener(

    "click",

    function () {

        viewPolicyModal.style.display =
            "none";

    }

);


/* =========================================================
   CLICK OUTSIDE
========================================================= */

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


/* =========================================================
   ESCAPE
========================================================= */

document.addEventListener(

    "keydown",

    function (event) {

        if (
            event.key === "Escape"
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

    await loadHR();

    await loadPolicies();

}


startPage();