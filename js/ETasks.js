function getCurrentUser() {

    let user = localStorage.getItem("currentUser");

    if (user == null) {
        return null;
    }

    return JSON.parse(user);
}
let currentUser = getCurrentUser();
if (currentUser == null) {
    window.location.href = "login.html";
}
else if (currentUser.role !== "EMP") {
    window.location.href = "login.html";
}

let tasksContainer = document.getElementById("tasksContainer");
let noTasks = document.getElementById("noTasks");
let searchTask = document.getElementById("search");
let filterStatus = document.getElementById("filterStatus");
let filterPriority = document.getElementById("filterPriority");
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let closeView = document.getElementById("closeBtn");
let closeEdit = document.getElementById("closeEditBtn");
let viewTask = document.getElementById("viewTask");
let saveBtn = document.getElementById("saveBtn");
let editTaskModal = document.getElementById("editTaskModal");

viewTask.style.display = "none";
editTaskModal.style.display = "none";


let editTaskForm = document.getElementById("editTaskForm");
let editTaskStatus = document.getElementById("editTaskStatus");
let employeeFile = document.getElementById("employeeFile");
let editTaskIndex = -1;


function displayTasks() {

    tasksContainer.innerHTML = "";

    let searchValue = searchTask.value.toLowerCase();
    let statusValue = filterStatus.value;
    let priorityValue = filterPriority.value;

    let foundTasks = 0;

    for (let i = 0; i < tasks.length; i++) {

        let task = tasks[i];

        if (!task.employeeEmail.includes(currentUser.name)) {
            continue;
        }

        if (!task.title.toLowerCase().includes(searchValue)) {
            continue;
        }

        if (statusValue !== "All" && task.status !== statusValue) {
            continue;
        }

        if (priorityValue !== "All" && task.priority !== priorityValue) {
            continue;
        }

        foundTasks++;

        let card = document.createElement("div");
        card.className = "taskCard";

        card.innerHTML = `

            <div class="taskCardTop">

                <span class="taskNumber">
                    TASK ${String(i + 1).padStart(2, "0")}
                </span>

                <span class="priority ${getPriorityClass(task.priority)}">
                    ${task.priority}
                </span>

            </div>


            <div class="taskMain">

                <h3>${task.title}</h3>

                <p class="description">
                    ${task.description}
                </p>

            </div>


            <div class="taskDetails">

                <div class="detailBox">

                    <span class="detailIcon">◷</span>

                    <div>
                        <span class="detailLabel">
                            Deadline
                        </span>

                        <strong>
                            ${task.deadline || "Not provided"}
                        </strong>
                    </div>

                </div>


                <div class="detailBox">

                    <span class="detailIcon">●</span>

                    <div>
                        <span class="detailLabel">
                            Status
                        </span>

                        <span class="status ${getStatusClass(task.status)}">
                            ${task.status}
                        </span>
                    </div>

                </div>

            </div>


            <div class="taskActions">

                <button 
                    class="viewBtn"
                    onclick="viewETask(${i})"
                >
                    <span>View Details</span>
                    <span class="viewArrow">→</span>
                </button>

                <button 
                    class="editBtn"
                    onclick="editETask(${i})"
                >
                    Edit
                </button>

            </div>

        `;

        tasksContainer.appendChild(card);
    }


    if (foundTasks === 0) {
        noTasks.hidden = false;
    }
    else {
        noTasks.hidden = true;
    }

    updateStatistics();
}
function viewETask(index) {

    let task = tasks[index];

    if (!task) {
        return;
    }


    document.getElementById("taskTitleE").textContent =
        task.title;


    document.getElementById("taskDescriptionE").textContent =
        task.description || "No description provided";


    let statusElement =
        document.getElementById("taskStatusE");

    statusElement.textContent =
        task.status;

    statusElement.className =
        "modalStatus " + getStatusClass(task.status);


    document.getElementById("startDateE").textContent =
        (task.start || "Not provided") +
        " " +
        (task.STime || "");


    document.getElementById("dueDateE").textContent =
        (task.deadline || "Not provided") +
        " " +
        (task.DTime || "");


    /* HR ATTACHMENT */

    let attachE =
        document.getElementById("attachE");

    attachE.innerHTML = "";


    if (task.hrAttachment) {

        let link = document.createElement("a");

        link.href = task.hrAttachment.data;

        link.textContent =
            "📎 " + task.hrAttachment.name;

        link.target = "_blank";

        link.download =
            task.hrAttachment.name;

        link.className =
            "attachmentLink";

        attachE.appendChild(link);

    }
    else {

        attachE.innerHTML = `
            <span class="emptyAttachment">
                No attachment provided
            </span>
        `;

    }
    /* EMPLOYEE SUBMISSION */

    let submissionE =
        document.getElementById("submissionE");

    submissionE.innerHTML = "";
    if (
        task.employeeSubmissions &&
        task.employeeSubmissions[currentUser.name]
    ) {
        let submission =
            task.employeeSubmissions[currentUser.name];
        let link =
            document.createElement("a");
        link.href =
            submission.data;

        link.textContent =
            "📎 " + submission.name;
        link.target = "_blank";

        link.download =
            submission.name;

        link.className =
            "attachmentLink";

        submissionE.appendChild(link);
    }
    else {

        submissionE.innerHTML = `
            <span class="emptyAttachment">
                Not submitted yet
            </span>
        `;
    }
    viewTask.style.display = "flex";
}
function editETask(index) {
    let task = tasks[index];
    if (!task) {
        console.log("Task not found");
        return;
    }
    editTaskIndex = index;
    document.getElementById("taskName").textContent = task.title;
    editTaskStatus.value = task.status;
    employeeFile.value = "";
    editTaskModal.style.display = "flex";
}


editTaskForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (editTaskIndex === -1) {
        return;
    }
    let task = tasks[editTaskIndex];
    if (!task) {
        return;
    }
    try {
        task.status = editTaskStatus.value;
        let file = employeeFile.files[0];
        if (file) {

            let submission = await readFile(file);

            if (!task.employeeSubmissions) {
                task.employeeSubmissions = {};
            }

            task.employeeSubmissions[currentUser.name] = submission;
        }
        localStorage.setItem("tasks", JSON.stringify(tasks));
        editTaskIndex = -1;
        editTaskModal.style.display = "none";
        displayTasks();
        alert("Task updated successfully!");

    }
    catch (error) {
        console.log(error);
    }
});
function getPriorityClass(priority) {
    if (priority === "High") {
        return "high";
    }
    if (priority === "Medium") {
        return "medium";
    }
    if (priority === "Low") {
        return "low";
    }
    return "";
}
function getStatusClass(status) {
    if (status === "Completed") {
        return "completed";
    }
    if (status === "In Progress") {
        return "progress";
    }
    if (status === "Pending") {
        return "pending";
    }
    return "";
}

function updateStatistics() {
    let total = 0;
    let pending = 0;
    let progress = 0;
    let completed = 0;
    for (let i = 0; i < tasks.length; i++) {
        let task = tasks[i];
        if (!task.employeeEmail.includes(currentUser.name)) {
            continue;
        }
        total++;
        if (task.status === "Pending") {
            pending++;
        }
        else if (task.status === "In Progress") {
            progress++;
        }
        else if (task.status === "Completed") {
            completed++;
        }
    }
    document.getElementById("totalTasks").textContent = total;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("progressTasks").textContent = progress;
    document.getElementById("completedTasks").textContent = completed;
}

searchTask.addEventListener("input", function () {
    displayTasks();
});

filterStatus.addEventListener("change", function () {
    displayTasks();
});

filterPriority.addEventListener("change", function () {
    displayTasks();
});

closeView.addEventListener("click", closeViewTask);
function closeViewTask() {

    document.getElementById("viewTask").style.display = "none";

}
closeEdit.addEventListener("click", closeEditTask);
function closeEditTask() {

    editTaskModal.style.display = "none";
    editTaskIndex = -1;
}
function readFile(file) {

    return new Promise(function (resolve, reject) {

        if (!file) {
            resolve(null);
            return;
        }

        let allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/png", "image/jpeg"];

        if (!allowedTypes.includes(file.type)) {
            alert("File type is not allowed.");
            reject("Invalid file type");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            alert("File size must be less than 2MB.");
            reject("File too large");
            return;
        }
        let reader = new FileReader();
        reader.onload = function (event) {
            resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                data: event.target.result
            });
        };
        reader.onerror = function () {
            reject("Error reading file");
        };
        reader.readAsDataURL(file);
    });
}
displayTasks();