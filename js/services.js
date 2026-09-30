function goToLeave() {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser.role === "EMP") {

        window.location.href = "leaveEmp.html";

    }
    else if (currentUser.role === "HR") {

        window.location.href = "leaveHR.html";

    }
}

function goToEmployees() {
    window.location.href = "employees.html";
}

function goToPolicies() {
    window.location.href = "policies.html";
}

function goToTasks() {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser.role === "EMP") {

        window.location.href = "-.html";

    }
    else if (currentUser.role === "HR") {

        window.location.href = "-.html";

    }
}

function goToFeedback() {
    window.location.href = "feedback.html";
}