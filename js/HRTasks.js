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

let addBtn = document.getElementById("add");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let employee = document.getElementById("ENames");
let taskForm = document.getElementById("taskForm");
let closeBtn = document.getElementById("close");
let saveTaskBtn = document.getElementById("save");
let taskModal = document.getElementById("addTasks");
let taskTitle = document.getElementById("newTaskName");
let taskDeadline = document.getElementById("dueDate");
let dueTime = document.getElementById("dueTime");
let taskDescription = document.getElementById("newDescription");
let taskPriority = document.getElementById("taskPriority");
let searchTask = document.getElementById("search");
let filterPriority = document.getElementById("filterPriority");
let filterStatus = document.getElementById("filterStatus");
let taskTableBody = document.getElementById("tBody");
let taskStatus = document.getElementById("taskStatus");
let noTasks = document.getElementById("noTask");
let modalTitle = document.getElementById("modalTitle");
let progressTasks = document.getElementById("progress");
let pendingTasks = document.getElementById("pending");
let totalTasks = document.getElementById("totalTasks");
let completedTasks = document.getElementById("completed");
let startDate = document.getElementById("startDate");
let startTime = document.getElementById("startTime");
let attachFile = document.getElementById("attachFile");
let submissionsContainer = document.getElementById("submissionsContainer");
taskModal.style.display = "none";


fetch("../JSON/employee.json")

    .then(function (response) { return response.json(); })
    .then(function (data) {
        for (let i = 0; i < data.length; i++) {

            if (data[i].role !== "EMP") {
                continue;
            }

            let option = document.createElement("option");

            option.value = data[i].name;

            option.textContent =
                data[i].name + " - " + data[i].email;

            employee.appendChild(option);
        }

        $('#ENames').multipleSelect({
            placeholder: "Select Employees",
            filter: true
        });

    })
    .catch(function (error) {

        console.log(
            "Error loading employees:",
            error
        );

    });

let editIndex = -1
addBtn.addEventListener("click", function () {
    editIndex = -1
    taskForm.reset();
    modalTitle.textContent = "Add New Task";
    saveTaskBtn.textContent = "Add Task";
    taskModal.style.display = "flex";
    taskModal.style.flexDirection = "column";
});

closeBtn.addEventListener("click", closeTaskModal);

function closeTaskModal() {
    taskModal.style.display = "none";
    taskForm.reset();
    editIndex = -1;
}
taskModal.addEventListener("click", function (event) {
    if (event.target === taskModal) {
        closeTaskModal();
    }
}
);
taskForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    let selectedEmployees = Array.from(employee.selectedOptions)
        .map(function (option) {
            return option.value;
        });

    let newFile = attachFile.files[0];
    let hrAttachment = null;
    try {
        if (newFile) {
            hrAttachment = await readFile(newFile);
        }
        let task = {
            id: Date.now(),
            title: taskTitle.value,
            description: taskDescription.value,
            employeeEmail: selectedEmployees,
            start: startDate.value,
            STime: startTime.value,
            deadline: taskDeadline.value,
            DTime: dueTime.value,
            priority: taskPriority.value,
            status: taskStatus.value,
            hrAttachment: hrAttachment,
            employeeSubmissions: {}
        };

        if (editIndex === -1) {
            tasks.push(task);
            alert("Task added successfully!");
        }
        else {
            task.id = tasks[editIndex].id;
            task.employeeSubmissions = tasks[editIndex].employeeSubmissions || {};
            if (!newFile) {
                task.hrAttachment = tasks[editIndex].hrAttachment || null;
            }
            tasks[editIndex] = task;
            alert("Task updated successfully!");
        } localStorage.setItem("tasks", JSON.stringify(tasks));
        closeTaskModal();
        displayTasks();
        displaySubmissions();
    }
    catch (error) {
        console.log(error);
    }


}

);
function displayTasks() {
    taskTableBody.innerHTML = "";
    let searchValue = searchTask.value.toLowerCase();
    let statusValue = filterStatus.value;
    let priorityValue = filterPriority.value;
    let foundTasks = 0;

    for (let i = 0; i < tasks.length; i++) {
        if (!tasks[i].title.toLowerCase().includes(searchValue)) {
            continue;
        }
        if (statusValue !== "All" && tasks[i].status !== statusValue) {
            continue;
        }
        if (priorityValue !== "All" && tasks[i].priority !== priorityValue
        ) {
            continue;
        }

        foundTasks++;

        let row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${tasks[i].title}</strong></td>
            <td><small>${tasks[i].description}</small></td>
            <td>${tasks[i].employeeEmail.join(", ")}</td>
            <td><span class="status">${tasks[i].status}</span></td>
            <td><button class="edit-btn" onclick="editTask(${i})">Edit</button>
                <button class="delete-btn" onclick="deleteTask(${i})">Block</button>
                <button class="view-btn" onclick="viewTask(${i})">View</button>
            </td>
        `;
        taskTableBody.appendChild(row);
    }
    if (foundTasks === 0) {
        noTasks.hidden = false;
    }
    else {
        noTasks.hidden = true;
    }
    updateStatistics();
}

function editTask(index) {
    editIndex = index;
    let task = tasks[index];
    taskTitle.value = task.title;
    taskDescription.value = task.description;
    for (let i = 0; i < employee.options.length; i++) {
        employee.options[i].selected =
            task.employeeEmail.includes(employee.options[i].value);
    }
    $('#ENames').multipleSelect('refresh');
    taskDeadline.value = task.deadline;
    dueTime.value = task.DTime;
    taskPriority.value = task.priority;
    taskStatus.value = task.status;
    modalTitle.innerHTML = "Edit Task";
    saveTaskBtn.textContent = "Update Task";
    taskModal.style.display = "flex";
    taskModal.style.flexDirection = "column";
    startDate.value = task.start;
    startTime.value = task.STime;
}

function deleteTask(index) {
    let confirmDelete = confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) {
        return;
    }
    tasks.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    displayTasks();
    displaySubmissions();
    alert("Task deleted successfully!");
}

function updateStatistics() {
    let total = tasks.length;
    let pending = 0;
    let progress = 0;
    let completed = 0;
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].status === "Pending") {
            pending++;
        }
        else if (tasks[i].status === "In Progress") {
            progress++;
        }
        else if (tasks[i].status === "Completed") {
            completed++;
        }
    }
    totalTasks.textContent = total;
    pendingTasks.textContent = pending;
    progressTasks.textContent = progress;
    completedTasks.textContent = completed;
}

searchTask.addEventListener("input", function () {
    displayTasks();
}
);

filterStatus.addEventListener("change", function () {
    displayTasks();
}
);

filterPriority.addEventListener("change", function () {
    displayTasks();
}
);

function viewTask(index) {

    let task = tasks[index];
    document.querySelector(".Home").style.display = "none";
    document.getElementById("tasksCards").style.display = "none";
    document.getElementById("viewTitle").textContent = task.title;
    document.getElementById("viewDescription").textContent = task.description;
    document.getElementById("viewEmployee").textContent = task.employeeEmail.join(", ");
    document.getElementById("viewDeadline").textContent = task.deadline + "  " + task.DTime;
    document.getElementById("viewStart").textContent = task.start + "  " + task.STime;
    document.getElementById("viewPriority").textContent = task.priority;
    document.getElementById("viewStatus").textContent = task.status;
    document.getElementById("viewSection").style.display = "block";
    document.getElementById("viewTask").style.display = "flex"


    let viewAttach = document.getElementById("viewAttach");
    viewAttach.innerHTML = "";
    if (task.hrAttachment) {
        let link = document.createElement("a");
        link.href = task.hrAttachment.data;
        link.textContent = "📎 " + task.hrAttachment.name;
        link.target = "_blank";
        link.download = task.hrAttachment.name;
        viewAttach.appendChild(link);
    }
    else {
        viewAttach.textContent = "No Attachment";
    }
    let viewSubmission = document.getElementById("viewSubmission");
    viewSubmission.innerHTML = "";
    if (task.employeeSubmissions) {
        let link = document.createElement("a");
        link.href = task.employeeSubmissions.data;
        link.textContent = "📎 " + task.employeeSubmissions.name;
        link.target = "_blank";
        link.download = task.employeeSubmissions.name;
        viewSubmission.appendChild(link);
    }
    else {
        viewSubmission.textContent = "No submission yet";
    }
}
function closeViewTask() {

    document.getElementById("viewSection").style.display = "none";
    document.querySelector(".Home").style.display = "block";
    document.getElementById("tasksCards").style.display = "block";


}
function readFile(file) {
    return new Promise(function (resolve, reject) {

        if (!file) {
            resolve(null);
            return;
        }

        let allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/png",
            "image/jpeg"
        ];

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
function displaySubmissions() {
    submissionsContainer.innerHTML = "";
    let foundSubmission = false;
    for (let i = 0; i < tasks.length; i++) {
        let task = tasks[i];
        if (!task.employeeSubmissions) { continue; }
        for (let employeeName in task.employeeSubmissions) {
            foundSubmission = true;
            let submission = task.employeeSubmissions[employeeName];
            let status = submission.status || "Pending";
            let card = document.createElement("div");
            card.className = "submissionCard";
            let actionContent = "";
            if (status === "Completed") {
                actionContent = ` 
                <br><br>
               <div class="submissionResult completed-result">
                <span class="result-icon">✓</span>
              <span>Completed</span> </div> `;
            }
            else if (status === "Rejected") {
                actionContent = `
                <div></div>
                <div class="submissionResult rejected-result">
                <span class="result-icon">✕</span>
                <span>Rejected</span> 
                </div> `;
            } else {
                actionContent = `
                <br><br>
                <div class="submissionActions">
                <button class="completed" onclick='completed(${i}, ${JSON.stringify(employeeName)})'> ✓ Completed </button>
                <button class="rejected" onclick='rejected(${i}, ${JSON.stringify(employeeName)})'> ✕ Rejected </button>
                </div> `;
            }
            card.innerHTML = `
                <div class="submissionHeader">
                <div>
                <h3>${employeeName}</h3>
                <p class="submissionTask"> ${task.title} </p> 
                </div> 
                <br>
                <span class="submissionStatus ${status.toLowerCase()}"> ${status} </span> 
                </div> 
                <div class="submissionInfo"> 
                <div>
                <span>Task &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span>
                <strong>${task.title}</strong> 
                </div> 
                <br><br>
                <div> 
                <br><br>
                <span>Status &nbsp</span> 
                <strong>${status}</strong> 
                </div> 
                </div>
                <br><br>
             ${submission.data ? ` 
                <a class="submissionLink" href="${submission.data}" target="_blank" download="${submission.name}">
                📎 ${submission.name} 
                </a> 
                `
                : `
                <div class="submissionLink no-file"> No file submitted </div> 
                `
                }
   ${actionContent} `;
            submissionsContainer.appendChild(card);
        }
    }
    if (!foundSubmission) {
        submissionsContainer.innerHTML = ` 
          <div class="noSubmission">
          <span>📂</span> 
         <p>No employee submissions yet.</p> 
         </div> `;
    }
}


function completed(taskIndex, employeeName) {
    let task = tasks[taskIndex];
    if (!task.employeeSubmissions) {
        alert("No submission found.");
        return;
    } if (!task.employeeSubmissions[employeeName]) {
        alert("No submission found for this employee.");
        return;

    }
    task.employeeSubmissions[employeeName].status = "Completed";
    localStorage.setItem("tasks", JSON.stringify(tasks));
    displaySubmissions();
    displayTasks();
}
function rejected(taskIndex, employeeName) {
    let task = tasks[taskIndex];
    if (!task.employeeSubmissions) {
        alert("No submission found.");
        return;
    }
    if (!task.employeeSubmissions[employeeName]) {
        alert("No submission found for this employee.");
        return;
    }
    task.employeeSubmissions[employeeName].status = "Rejected";
    localStorage.setItem("tasks", JSON.stringify(tasks));
    displaySubmissions();
    displayTasks();
}
displayTasks();
displaySubmissions();