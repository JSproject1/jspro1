function getCurrentUser() {
    let user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
}

function loadUsers() {
    let currentUser = getCurrentUser();

    if (!currentUser) {
        alert("Please login first.");
        return;
    }

    fetch("../JSON/employee.json")
        .then(response => response.json())
        .then(users => {
            let container = document.getElementById("usersContainer");
            container.innerHTML = "";

            users.forEach(user => {
                if (user.id === currentUser.id) return;

                let div = document.createElement("div");
                div.className = "user";

                div.innerHTML = `
                    <label>
                        <input type="checkbox"
                               value="${user.id}"
                               data-name="${user.name}"
                               class="participant">

                        <strong>${user.name}</strong>
                        - ${user.role}
                        - ${user.department}
                    </label>
                `;

                container.appendChild(div);
            });
        })
        .catch(error => {
            console.log(error);

            document.getElementById("usersContainer").innerHTML =
                "<p>Could not load users.</p>";
        });
}

function createMeeting() {
    let currentUser = getCurrentUser();

    if (!currentUser) {
        alert("Please login first.");
        return;
    }

    let title = document.getElementById("meetingTitle").value;
    let date = document.getElementById("meetingDate").value;
    let time = document.getElementById("meetingTime").value;
    let duration = document.getElementById("meetingDuration").value;

    if (!title || !date || !time) {
        alert("Please fill all meeting information.");
        return;
    }

    let checkboxes =
        document.querySelectorAll(".participant:checked");

    if (checkboxes.length === 0) {
        alert("Please select at least one participant.");
        return;
    }

    let participants = [];

    checkboxes.forEach(box => {
        participants.push({
            userId: Number(box.value),
            name: box.dataset.name,
            status: "pending"
        });
    });

    let meetingId = Date.now();

    let meeting = {
        id: meetingId,
        title,
        date,
        time,
        duration,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        creatorRole: currentUser.role,
        participants,
        roomName: "CompanyMeeting_" + meetingId
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

    checkboxes.forEach(box => box.checked = false);

    closeNewMeeting();
    displayMeetings();
}

function displayMeetings() {
    let currentUser = getCurrentUser();

    if (!currentUser) return;

    let meetings =
        JSON.parse(localStorage.getItem("meetings")) || [];

    let container = document.getElementById("meetingsContainer");
    let meetingCount = document.getElementById("meetingCount");

    container.innerHTML = "";

    let myMeetings = meetings.filter(meeting => {
        let participant = meeting.participants.find(
            p => p.userId === currentUser.id
        );

        return meeting.creatorId === currentUser.id || participant;
    });

    meetingCount.textContent =
        `${myMeetings.length} ${myMeetings.length === 1 ? "Meeting" : "Meetings"}`;

    if (myMeetings.length === 0) {
        container.innerHTML = "<p>No meetings found.</p>";
        return;
    }

    myMeetings.forEach(meeting => {
        let isCreator =
            meeting.creatorId === currentUser.id;

        let participant =
            meeting.participants.find(
                p => p.userId === currentUser.id
            );

        let card = document.createElement("div");
        card.className = "meeting-card";

        let html = `
            <h3>${meeting.title}</h3>
            <p><strong>Date:</strong> ${meeting.date}</p>
            <p><strong>Time:</strong> ${meeting.time}</p>
            <p><strong>Duration:</strong> ${meeting.duration} minutes</p>
            <p><strong>Created By:</strong> ${meeting.creatorName}</p>
        `;

        if (isCreator) {
            html += "<h4>Participants</h4>";

            meeting.participants.forEach(p => {
                html += `
                    <div class="participant">
                        <strong>${p.name}</strong>
                        <span class="${p.status}">
                            ${p.status}
                        </span>
                    </div>
                `;
            });

            let allAccepted =
                meeting.participants.every(
                    p => p.status === "accepted"
                );

            if (allAccepted) {
                html += `
                    <p class="accepted">
                        All participants accepted.
                    </p>

                    <button class="join"
                        onclick="joinMeeting('${meeting.roomName}')">
                        Join Meeting
                    </button>
                `;
            }
        }

        else {
            html += `
                <p>
                    <strong>Your Status:</strong>
                    <span class="${participant.status}">
                        ${participant.status}
                    </span>
                </p>
            `;

            if (participant.status === "pending") {
                html += `
                    <button class="accept"
                        onclick="updateMeetingStatus(${meeting.id}, 'accepted')">
                        Accept
                    </button>

                    <button class="reject"
                        onclick="updateMeetingStatus(${meeting.id}, 'rejected')">
                        Reject
                    </button>
                `;
            }

            else if (participant.status === "accepted") {
                html += `
                    <p class="accepted">
                        You accepted this meeting.
                    </p>

                    <button class="join"
                        onclick="joinMeeting('${meeting.roomName}')">
                        Join Meeting
                    </button>
                `;
            }

            else {
                html += `
                    <p class="rejected">
                        You rejected this meeting.
                    </p>
                `;
            }
        }

        card.innerHTML = html;
        container.appendChild(card);
    });
}

function updateMeetingStatus(meetingId, status) {
    let currentUser = getCurrentUser();

    let meetings =
        JSON.parse(localStorage.getItem("meetings")) || [];

    let meeting =
        meetings.find(m => m.id === meetingId);

    if (meeting) {
        let participant =
            meeting.participants.find(
                p => p.userId === currentUser.id
            );

        if (participant) {
            participant.status = status;
        }
    }

    localStorage.setItem(
        "meetings",
        JSON.stringify(meetings)
    );

    displayMeetings();
}

function joinMeeting(roomName) {
    window.open(
        "meetingRoom.html?room=" +
        encodeURIComponent(roomName),
        "_blank"
    );
}

function showNewMeeting() {
    document.getElementById("meetingModal").style.display = "flex";
    loadUsers();
}

function closeNewMeeting() {
    document.getElementById("meetingModal").style.display = "none";
}

document
    .getElementById("logoutButton")
    .addEventListener("click", function () {
        localStorage.removeItem("currentUser");
    });

window.onload = displayMeetings;