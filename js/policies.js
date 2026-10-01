const policiesContainer =
    document.getElementById("policiesContainer");

const policySearch =
    document.getElementById("policySearch");

const categoryFilter =
    document.getElementById("categoryFilter");

const addPolicyBtn =
    document.getElementById("addPolicyBtn");

let policies = [];


/* ================= LOAD POLICIES ================= */

function loadPolicies() {

    const savedPolicies =
        localStorage.getItem("policies");

    if (savedPolicies) {

        policies =
            JSON.parse(savedPolicies);

        displayPolicies(policies);

    } else {

        fetch("../JSON/policies.json")

            .then(response => response.json())

            .then(data => {

                policies = data;

                localStorage.setItem(
                    "policies",
                    JSON.stringify(policies)
                );

                displayPolicies(policies);

            })

            .catch(error => {
                console.log(error);
            });

    }

}


/* ================= DISPLAY POLICIES ================= */

function displayPolicies(policyList) {

    policiesContainer.innerHTML = "";


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


/* ================= SEARCH + FILTER ================= */

function filterPolicies() {

    const search =
        policySearch.value
            .toLowerCase()
            .trim();

    const category =
        categoryFilter.value;


    const filteredPolicies =
        policies.filter(policy => {

            const matchSearch =
                policy.title
                    .toLowerCase()
                    .includes(search)
                ||
                policy.description
                    .toLowerCase()
                    .includes(search);


            const matchCategory =
                category === "all"
                ||
                policy.category === category;


            return matchSearch && matchCategory;

        });


    displayPolicies(filteredPolicies);

}


/* ================= VIEW POLICY ================= */

/* ================= VIEW POLICY ================= */

function viewPolicy(id) {

    const policy = policies.find(policy => {
        return policy.id === id;
    });


    if (!policy) {
        return;
    }


    /* TITLE */

    document.getElementById(
        "modalPolicyTitle"
    ).textContent = policy.title;


    /* CATEGORY */

    document.getElementById(
        "modalPolicyCategory"
    ).textContent = policy.category;


    /* DESCRIPTION */

    document.getElementById(
        "modalPolicyDescription"
    ).textContent = policy.description;


    /* PURPOSE */

    const purposeSection =
        document.getElementById("purposeSection");

    if (policy.purpose) {

        purposeSection.style.display = "block";

        document.getElementById(
            "modalPolicyPurpose"
        ).textContent = policy.purpose;

    } else {

        purposeSection.style.display = "none";

    }


    /* SCOPE */

    const scopeSection =
        document.getElementById("scopeSection");

    if (policy.scope) {

        scopeSection.style.display = "block";

        document.getElementById(
            "modalPolicyScope"
        ).textContent = policy.scope;

    } else {

        scopeSection.style.display = "none";

    }


    /* RESPONSIBILITIES */

    const responsibilitiesSection =
        document.getElementById(
            "responsibilitiesSection"
        );

    if (policy.responsibilities) {

        responsibilitiesSection.style.display =
            "block";

        document.getElementById(
            "modalPolicyResponsibilities"
        ).textContent =
            policy.responsibilities;

    } else {

        responsibilitiesSection.style.display =
            "none";

    }


    /* EFFECTIVE DATE */

    const effectiveDate =
        document.getElementById(
            "modalEffectiveDate"
        );

    if (policy.effectiveDate) {

        effectiveDate.textContent =
            "Effective: " + policy.effectiveDate;

    } else {

        effectiveDate.textContent = "";

    }


    /* UPDATED DATE */

    const updatedDate =
        document.getElementById(
            "modalUpdatedDate"
        );

    if (policy.updatedDate) {

        updatedDate.textContent =
            "Updated: " + policy.updatedDate;

    } else {

        updatedDate.textContent = "";

    }


    /* OPEN MODAL */

    document.getElementById(
        "viewPolicyModal"
    ).style.display = "flex";

}

/* ================= EDIT POLICY ================= */

function editPolicy(id) {

    localStorage.setItem(
        "selectedPolicyId",
        id
    );


    window.location.href =
        "editPolicy.html";

}


/* ================= DELETE POLICY ================= */

function deletePolicy(id) {

    const policy =
        policies.find(policy => {
            return policy.id === id;
        });


    if (!policy) {
        return;
    }


    const confirmDelete =
        confirm(
            "Are you sure you want to delete \"" +
            policy.title +
            "\"?"
        );


    if (!confirmDelete) {
        return;
    }


    policies =
        policies.filter(policy => {
            return policy.id !== id;
        });


    localStorage.setItem(
        "policies",
        JSON.stringify(policies)
    );


    filterPolicies();

}


/* ================= ADD POLICY ================= */

addPolicyBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "addpolicise.html";

    }
);


/* ================= EVENTS ================= */

policySearch.addEventListener(
    "input",
    filterPolicies
);


categoryFilter.addEventListener(
    "change",
    filterPolicies
);




/* ================= CLOSE VIEW MODAL ================= */

const viewPolicyModal =
    document.getElementById("viewPolicyModal");

const closePolicyModal =
    document.getElementById("closePolicyModal");


closePolicyModal.addEventListener(
    "click",
    function () {

        viewPolicyModal.style.display =
            "none";

    }
);


/* CLICK OUTSIDE MODAL */

viewPolicyModal.addEventListener(
    "click",
    function (event) {

        if (event.target === viewPolicyModal) {

            viewPolicyModal.style.display =
                "none";

        }

    }
);




/* ================= START ================= */


loadPolicies();