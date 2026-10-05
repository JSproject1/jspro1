let currentUser = getCurrentUser();

if (currentUser == null || currentUser.role !== "HR") {

    window.location.href = "login.html";
}


let feedbackList =
    document.getElementById("feedbackList");

let searchInput =
    document.getElementById("searchInput");

let statusFilter =
    document.getElementById("statusFilter");

let categoryFilter =
    document.getElementById("categoryFilter");

let statTotal =
    document.getElementById("statTotal");

let statNew =
    document.getElementById("statNew");

let statAvg =
    document.getElementById("statAvg");


function getFeedbacks() {

    return JSON.parse(
        localStorage.getItem("feedbacks")
    ) || [];
}


function saveFeedbacks(feedbacks) {
    localStorage.setItem(
        "feedbacks",
        JSON.stringify(feedbacks)
    );
}
function displayFeedbacks() {

    let feedbacks = getFeedbacks();

    let search =
        searchInput.value.toLowerCase();

    let status =
        statusFilter.value;

    let category =
        categoryFilter.value;
    let filtered = [];
    for (let i = 0; i < feedbacks.length; i++) {

        let feedback = feedbacks[i];

        let matchesSearch =
            feedback.name.toLowerCase().includes(search) ||
            feedback.email.toLowerCase().includes(search) ||
            feedback.subject.toLowerCase().includes(search);
        let matchesStatus =
            status === "" ||
            feedback.status === status;
        let matchesCategory =
            category === "" ||
            feedback.category === category;

        if (
            matchesSearch &&
            matchesStatus &&
            matchesCategory
        ) {

            filtered.push(feedback);
        }
    }

    feedbackList.innerHTML = "";


    if (filtered.length === 0) {

        feedbackList.innerHTML =
            "<p>No feedback found.</p>";
        updateStats(feedbacks);

        return;
    }


    for (let i = 0; i < filtered.length; i++) {

        let feedback = filtered[i];

        let card =
            document.createElement("div");
        card.className = "feedback-card";

        card.innerHTML = `

            <h3>${feedback.subject}</h3>
            <p>
                <strong>Name:</strong>
                ${feedback.name}
            </p>

            <p>
                <strong>Email:</strong>
                ${feedback.email}
            </p>

            <p>
                <strong>Category:</strong>
                ${feedback.category}
            </p>

            <p>
                <strong>Rating:</strong>
                ${feedback.rating} / 5
            </p>

            <p>
                <strong>Message:</strong>
                ${feedback.message}
            </p>

            <p>
                <strong>Status:</strong>
                ${feedback.status}
            </p>

            <button onclick="changeStatus(${feedback.id}, 'read')">
                Mark as Read
            </button>

            <button onclick="changeStatus(${feedback.id}, 'resolved')">
                Resolve
            </button>

            <button onclick="deleteFeedback(${feedback.id})">
                Block
            </button>

        `;

        feedbackList.appendChild(card);
    }
    updateStats(feedbacks);
}

function updateStats(feedbacks) {

    statTotal.textContent =
        feedbacks.length;

    let newCount = 0;

    let totalRating = 0;

    for (let i = 0; i < feedbacks.length; i++) {

        if (feedbacks[i].status === "new") {

            newCount++;
        }

        totalRating += feedbacks[i].rating;
    }

    statNew.textContent =
        newCount;
    if (feedbacks.length === 0) {

        statAvg.textContent = "-";

    } else {

        statAvg.textContent =
            (totalRating / feedbacks.length)
                .toFixed(1);
    }
}

function changeStatus(id, status) {

    let feedbacks = getFeedbacks();

    for (let i = 0; i < feedbacks.length; i++) {

        if (feedbacks[i].id === id) {

            feedbacks[i].status = status;
        }
    }

    saveFeedbacks(feedbacks);

    displayFeedbacks();
}

function deleteFeedback(id) {

    let feedbacks = getFeedbacks();

    let newFeedbacks = [];

    for (let i = 0; i < feedbacks.length; i++) {

        if (feedbacks[i].id !== id) {

            newFeedbacks.push(feedbacks[i]);
        }
    }

    saveFeedbacks(newFeedbacks);

    displayFeedbacks();
}

searchInput.addEventListener(
    "input",
    displayFeedbacks
);
statusFilter.addEventListener(
    "change",
    displayFeedbacks
);

categoryFilter.addEventListener(
    "change",
    displayFeedbacks
);
displayFeedbacks();