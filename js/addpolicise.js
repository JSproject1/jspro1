// auth
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
const policyForm =
    document.getElementById("policyForm");

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

//    ADD NEW POLICY

policyForm.addEventListener(
    "submit",
    function (event) {
        event.preventDefault();
        const title =
            titleInput.value.trim();

        const category =
            categoryInput.value;

        const description =
            descriptionInput.value.trim();
        /* ================= VALIDATION ================= */

        if (
            title === "" ||
            category === "" ||
            description === ""
        ) {
            formMessage.textContent =
                "Please fill in all fields.";
            formMessage.style.color =
                "red";
            return;
        }
        /* ================= GET POLICIES ================= */
        let policies =
            JSON.parse(
                localStorage.getItem("policies")
            ) || [];
        /* ================= CHECK DUPLICATE TITLE ================= */
        const titleExists =
            policies.some(policy => {

                return policy.title.toLowerCase()
                    === title.toLowerCase();
            });
        if (titleExists) {

            formMessage.textContent =
                "A policy with this title already exists.";
            formMessage.style.color =
                "red";
            return;
        }
        /* ================= GENERATE ID ================= */
        let newId = 1;
        if (policies.length > 0) {

            newId =
                Math.max(
                    ...policies.map(policy => policy.id)
                ) + 1;
        }
        /* ================= CREATE POLICY ================= */
        const newPolicy = {

            id: newId,

            title: title,

            category: category,

            description: description
        };
        /* ================= ADD TO ARRAY ================= */
        policies.push(newPolicy);
        /* ================= SAVE TO LOCAL STORAGE ================= */
        localStorage.setItem(
            "policies",
            JSON.stringify(policies)
        );
        /* ================= SUCCESS MESSAGE ================= */

        formMessage.textContent =
            "Policy added successfully.";
        formMessage.style.color =
            "green";
        /* ================= REDIRECT ================= */
        setTimeout(
            function () {
                window.location.href =
                    "policies.html";
            },
            600
        );

    }
);
//    CANCEL
cancelBtn.addEventListener(
    "click",
    function () {
        window.location.href =
            "policies.html";
    }
);