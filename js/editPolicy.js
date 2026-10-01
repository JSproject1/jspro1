const editPolicyForm =
    document.getElementById("editPolicyForm");

const titleInput =
    document.getElementById("title");

const categoryInput =
    document.getElementById("category");

const descriptionInput =
    document.getElementById("description");

const formMessage =
    document.getElementById("formMessage");

const cancelBtn =
    document.getElementById("cancelBtn");


/* =========================================
   GET SELECTED POLICY
========================================= */

const selectedPolicyId =
    Number(
        localStorage.getItem("selectedPolicyId")
    );


let policies =
    JSON.parse(
        localStorage.getItem("policies")
    ) || [];


const selectedPolicy =
    policies.find(policy => {

        return policy.id === selectedPolicyId;

    });


/* =========================================
   DISPLAY CURRENT DATA
========================================= */

if (selectedPolicy) {

    titleInput.value =
        selectedPolicy.title;

    categoryInput.value =
        selectedPolicy.category;

    descriptionInput.value =
        selectedPolicy.description;

} else {

    formMessage.textContent =
        "Policy not found.";

    formMessage.style.color =
        "red";
}


/* =========================================
   SAVE CHANGES
========================================= */

editPolicyForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        if (!selectedPolicy) {
            return;
        }


        const newTitle =
            titleInput.value.trim();

        const newCategory =
            categoryInput.value;

        const newDescription =
            descriptionInput.value.trim();


        /* VALIDATION */

        if (
            newTitle === "" ||
            newCategory === "" ||
            newDescription === ""
        ) {

            formMessage.textContent =
                "Please fill in all fields.";

            formMessage.style.color =
                "red";

            return;
        }


        /* UPDATE POLICY */

        selectedPolicy.title =
            newTitle;

        selectedPolicy.category =
            newCategory;

        selectedPolicy.description =
            newDescription;


        /* SAVE TO LOCAL STORAGE */

        localStorage.setItem(
            "policies",
            JSON.stringify(policies)
        );


        formMessage.textContent =
            "Policy updated successfully.";

        formMessage.style.color =
            "green";


        setTimeout(
            function () {

                window.location.href =
                    "policies.html";

            },
            600
        );

    }
);


/* =========================================
   CANCEL
========================================= */

cancelBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "policies.html";

    }
);