// ======================================
// Get Current User
// ======================================

function getCurrentUser() {

    let user = localStorage.getItem("currentUser");

    if (user == null) {
        return null;
    }

    return JSON.parse(user);
}


// ======================================
// Load Users From JSON
// ======================================

function loadUsers() {

    let currentUser = getCurrentUser();

    if (currentUser == null) {

        alert("Please login first.");

        return;
    }

    fetch("../JSON/employee.json")
        .then(response => response.json())

        .then(users => {

            let container =
                document.getElementById("usersContainer");

            container.innerHTML = "";

            for (let i = 0; i < users.length; i++) {

                // Don't show current user
                if (users[i].id === currentUser.id) {
                    continue;
                }

                let div =
                    document.createElement("div");

                div.className = "user";

                div.innerHTML = `

                    <label>

                        <input
                            type="checkbox"
                            value="${users[i].id}"
                            data-name="${users[i].name}"
                            class="participant"
                        >

                        <strong>
                            ${users[i].name}
                        </strong>

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


// ======================================
// Create Meeting
// ======================================

function createMeeting() {

    let currentUser = getCurrentUser();

    if (currentUser == null) {

        alert("Please login first.");

        return;
    }

    let title =
        document.getElementById("meetingTitle").value;

    let date =
        document.getElementById("meetingDate").value;

    let time =
        document.getElementById("meetingTime").value;

    let duration =
        document.getElementById("meetingDuration").value;


    // Validation

    if (
        title === "" ||
        date === "" ||
        time === ""
    ) {

        alert("Please fill all meeting information.");

        return;
    }


    // Get selected users

    let checkboxes =
        document.querySelectorAll(".participant:checked");


    if (checkboxes.length === 0) {

        alert("Please select at least one participant.");

        return;
    }


    // Participants array

    let participants = [];

    for (
        let i = 0;
        i < checkboxes.length;
        i++
    ) {

        participants.push({

            userId: Number(
                checkboxes[i].value
            ),

            name: checkboxes[i].dataset.name,

            status: "pending"

        });

    }


    // Unique meeting ID

    let meetingId = Date.now();


    // Jitsi room

    let roomName =
        "CompanyMeeting_" + meetingId;


    // Meeting object

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


    // Get existing meetings

    let meetings =
        JSON.parse(
            localStorage.getItem("meetings")
        ) || [];


    meetings.push(meeting);


    // Save meetings

    localStorage.setItem(
        "meetings",
        JSON.stringify(meetings)
    );


    alert("Meeting request sent successfully!");


    // Clear form

    document.getElementById("meetingTitle").value = "";

    document.getElementById("meetingDate").value = "";

    document.getElementById("meetingTime").value = "";


    // Uncheck users

    for (
        let i = 0;
        i < checkboxes.length;
        i++
    ) {

        checkboxes[i].checked = false;

    }


    // Close modal

    closeNewMeeting();


    // Display meetings

    displayMeetings();

}


// ======================================
// Display Meetings
// ======================================

function displayMeetings() {

    let currentUser =
        getCurrentUser();

    if (currentUser == null) {
        return;
    }


    let meetings =
        JSON.parse(
            localStorage.getItem("meetings")
        ) || [];


    let container =
        document.getElementById(
            "meetingsContainer"
        );


    container.innerHTML = "";


    if (meetings.length === 0) {

        container.innerHTML = `
            <p>No meetings found.</p>
        `;

        return;
    }


    for (
        let i = 0;
        i < meetings.length;
        i++
    ) {

        let meeting =
            meetings[i];


        // Is current user the creator?

        let isCreator =
            meeting.creatorId === currentUser.id;


        // Is current user a participant?

        let participant =
            meeting.participants.find(
                p =>
                    p.userId === currentUser.id
            );


        // Don't show unrelated meetings

        if (!isCreator && !participant) {
            continue;
        }


        let card =
            document.createElement("div");

        card.className = "meeting-card";


        // Basic meeting information

        let html = `

            <h3>
                ${meeting.title}
            </h3>

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

            <p>
                <strong>Created By:</strong>
                ${meeting.creatorName}
            </p>

        `;


        // ==================================
        // Creator
        // ==================================

        if (isCreator) {

            html += `

                <h4>
                    Participants
                </h4>

            `;


            for (
                let j = 0;
                j < meeting.participants.length;
                j++
            ) {

                let p =
                    meeting.participants[j];


                html += `

                    <div class="participant">

                        <strong>
                            ${p.name}
                        </strong>

                        -

                        <span class="${p.status}">
                            ${p.status}
                        </span>

                    </div>

                `;

            }


            // Check if everyone accepted

            let allAccepted =
                meeting.participants.every(
                    p =>
                        p.status === "accepted"
                );


            if (allAccepted) {

                html += `

                    <p class="accepted">
                        All participants accepted.
                    </p>

                    <button
                        class="join"
                        onclick="joinMeeting('${meeting.roomName}')">

                        Join Meeting

                    </button>

                `;

            }

        }


        // ==================================
        // Participant
        // ==================================

        else {

            html += `

                <p>

                    <strong>
                        Your Status:
                    </strong>

                    <span class="${participant.status}">
                        ${participant.status}
                    </span>

                </p>

            `;


            // Pending

            if (
                participant.status === "pending"
            ) {

                html += `

                    <button
                        class="accept"
                        onclick="updateMeetingStatus(
                            ${meeting.id},
                            'accepted'
                        )">

                        Accept

                    </button>


                    <button
                        class="reject"
                        onclick="updateMeetingStatus(
                            ${meeting.id},
                            'rejected'
                        )">

                        Reject

                    </button>

                `;

            }


            // Accepted

            else if (
                participant.status === "accepted"
            ) {

                html += `

                    <p class="accepted">
                        You accepted this meeting.
                    </p>

                    <button
                        class="join"
                        onclick="joinMeeting('${meeting.roomName}')">

                        Join Meeting

                    </button>

                `;

            }


            // Rejected

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

    }

}


// ======================================
// Accept / Reject
// ======================================

function updateMeetingStatus(
    meetingId,
    status
) {

    let currentUser =
        getCurrentUser();


    let meetings =
        JSON.parse(
            localStorage.getItem("meetings")
        ) || [];


    for (
        let i = 0;
        i < meetings.length;
        i++
    ) {

        if (
            meetings[i].id === meetingId
        ) {

            for (
                let j = 0;
                j < meetings[i].participants.length;
                j++
            ) {

                if (
                    meetings[i]
                        .participants[j]
                        .userId ===
                    currentUser.id
                ) {

                    meetings[i]
                        .participants[j]
                        .status =
                        status;

                }

            }

        }

    }


    localStorage.setItem(
        "meetings",
        JSON.stringify(meetings)
    );


    displayMeetings();

}


// ======================================
// Join Meeting
// ======================================

function joinMeeting(roomName) {

    window.location.href =
        "meetingRoom.html?room=" +
        encodeURIComponent(roomName);

}


// ======================================
// Page Load
// ======================================

window.onload = function () {

    loadUsers();

    displayMeetings();

};


// ======================================
// Show New Meeting
// ======================================

function showNewMeeting() {

    document.getElementById(
        "meetingModal"
    ).style.display = "flex";

    loadUsers();

}


// ======================================
// Close New Meeting
// ======================================

function closeNewMeeting() {

    document.getElementById(
        "meetingModal"
    ).style.display = "none";

}