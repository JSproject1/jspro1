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

        window.location.href = "ETasks.html";

    }
    else if (currentUser.role === "HR") {

        window.location.href = "HRTasks.html";

    }
}

function goToFeedback() {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser.role === "EMP") {

        window.location.href = "feedback.html";

    }
    else if (currentUser.role === "HR") {

        window.location.href = "hr-feedback.html";

    }
}

function goToMeetings() {
     let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser.role === "EMP") {

        window.location.href = "meetings.html";

    }
    else if (currentUser.role === "HR") {

        window.location.href = "hr-meeting.html";

    }
}

