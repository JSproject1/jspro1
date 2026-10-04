// Get Current User
function getCurrentUser() {
    let user = localStorage.getItem("currentUser");

    if (user == null) {
        return null;
    }

    return JSON.parse(user);
}


// Load Employees
function loadUsers() {
    let currentUser = getCurrentUser();

    if (currentUser == null) {
        alert("Please login first.");
        return;
    }

    fetch("../JSON/employee.json")
        .then(response => response.json())
        .then(users => {
            let container = document.getElementById("usersContainer");
            container.innerHTML = "";

            for (let i = 0; i < users.length; i++) {
                if (users[i].id === currentUser.id) {
                    continue;
                }

                let div = document.createElement("div");
                div.className = "user";

                div.innerHTML = `
                    <label>
                        <input
                            type="checkbox"
                            value="${users[i].id}"
                            data-name="${users[i].name}"
                            class="participant"
                        >

                        <strong>${users[i].name}</strong>
                        - ${users[i].role}
                        - ${users[i].department}
                    </label>
                `;

                container.appendChild(div);
            }
        })
        .catch(error => {
            console.log(error);

            document.getElementById("usersContainer").innerHTML = `
                <p>Could not load users.</p>
            `;
        });
}


// Create Meeting
function createMeeting() {
    let currentUser = getCurrentUser();

    if (currentUser == null) {
        alert("Please login first.");
        return;
    }

    let title = document.getElementById("meetingTitle").value;
    let date = document.getElementById("meetingDate").value;
    let time = document.getElementById("meetingTime").value;
    let duration = document.getElementById("meetingDuration").value;

    if (title === "" || date === "" || time === "") {
        alert("Please fill all meeting information.");
        return;
    }

    let checkboxes = document.querySelectorAll(".participant:checked");

    if (checkboxes.length === 0) {
        alert("Please select at least one participant.");
        return;
    }

    let participants = [];

    for (let i = 0; i < checkboxes.length; i++) {
        participants.push({
            userId: Number(checkboxes[i].value),
            name: checkboxes[i].dataset.name,
            status: "pending"
        });
    }

    let meetingId = Date.now();
    let roomName = "CompanyMeeting_" + meetingId;

    let meeting = {
        id: meetingId,
        title: title,
        date: date,
        time: time,
        duration: duration,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        creatorRole: currentUser.role,
        participants: participants,
        roomName: roomName
    };

    let meetings =
        JSON.parse(localStorage.getItem("meetings")) || [];

    meetings.push(meeting);

    localStorage.setItem(
        "meetings",
        JSON.stringify(meetings)
    );

    alert("Meeting request sent successfully!");

    document.getElementById("meetingTitle").value = "";
    document.getElementById("meetingDate").value = "";
    document.getElementById("meetingTime").value = "";

    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
    }

    closeNewMeeting();
    displayMeetings();
}


// Display HR Meetings
function displayMeetings() {
    let currentUser = getCurrentUser();

    if (currentUser == null) {
        return;
    }

    let meetings =
        JSON.parse(localStorage.getItem("meetings")) || [];

    let container = document.getElementById("meetingsContainer");
    let meetingCount = document.getElementById("meetingCount");

    container.innerHTML = "";

    let myMeetings = meetings.filter(
        meeting => meeting.creatorId === currentUser.id
    );

    meetingCount.textContent =
        myMeetings.length +
        (myMeetings.length === 1 ? " Meeting" : " Meetings");

    if (myMeetings.length === 0) {
        container.innerHTML = `
            <p>No meetings found.</p>
        `;
        return;
    }

    for (let i = 0; i < myMeetings.length; i++) {
        let meeting = myMeetings[i];

        let card = document.createElement("div");
        card.className = "meeting-card";

        let html = `
            <h3>${meeting.title}</h3>

            <p>
                <strong>Date:</strong>
                ${meeting.date}
            </p>

            <p>
                <strong>Time:</strong>
                ${meeting.time}
            </p>

            <p>
                <strong>Duration:</strong>
                ${meeting.duration} minutes
            </p>

            <h4>Participants</h4>
        `;

        for (let j = 0; j < meeting.participants.length; j++) {
            let participant = meeting.participants[j];

            html += `
                <div class="participant">
                    <strong>${participant.name}</strong>

                    <span class="${participant.status}">
                        ${participant.status}
                    </span>
                </div>
            `;
        }

        let allAccepted =
            meeting.participants.every(
                participant => participant.status === "accepted"
            );

        if (allAccepted) {
            html += `
                <p class="accepted">
                    All participants accepted.
                </p>

                <button
                    class="join"
                    onclick="joinMeeting('${meeting.roomName}')"
                >
                    Join Meeting
                </button>
            `;
        }

        card.innerHTML = html;
        container.appendChild(card);
    }
}


// Join Meeting
function joinMeeting(roomName) {
    window.open(
        "meetingRoom.html?room=" + encodeURIComponent(roomName),
        "_blank"
    );
}


// Show Modal
function showNewMeeting() {
    document.getElementById("meetingModal").style.display = "flex";
    loadUsers();
}


// Close Modal
function closeNewMeeting() {
    document.getElementById("meetingModal").style.display = "none";
}


// Logout
document
    .getElementById("logoutButton")
    .addEventListener("click", function () {
        localStorage.removeItem("currentUser");
    });


// Page Load
window.onload = function () {
    loadUsers();
    displayMeetings();
};