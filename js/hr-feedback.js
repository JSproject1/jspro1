let currentUser = getCurrentUser();

if (currentUser == null) {
  window.location.href = "login.html";
}
else if (currentUser.role !== "EMP") {
  window.location.href = "login.html";
}

let feedbackForm = document.getElementById("feedbackForm");
let formAlert = document.getElementById("formAlert");
let messageInput = document.getElementById("message");
let messageCounter = document.getElementById("messageCounter");

const MAX_MESSAGE_LENGTH = 500;
let fields = ["name", "email", "category", "rating", "subject", "message"];

function fillUserData() {
  document.getElementById("name").value = currentUser.name || "";
  document.getElementById("email").value = currentUser.email || "";
}

function updateCounter() {
  messageCounter.textContent = messageInput.value.length + " / " + MAX_MESSAGE_LENGTH;
}

function showError(field, message) {
  document.getElementById(field + "Error").textContent = message;

  if (field !== "rating") {
    document.getElementById(field).className = message ? "input-error" : "";
  }
}

function clearErrors() {
  for (let i = 0; i < fields.length; i++) {
    showError(fields[i], "");
  }
}

function showAlert(type, text) {
  formAlert.textContent = text;
  formAlert.className = "form-alert " + type;
}

function hideAlert() {
  formAlert.className = "form-alert hidden";
}

function validateForm(values) {
  let isValid = true;
  clearErrors();

  let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (values.name.length < 3) {
    showError("name", "Name must be at least 3 characters.");
    isValid = false;
  }

  if (!emailPattern.test(values.email)) {
    showError("email", "Please enter a valid email.");
    isValid = false;
  }

  if (values.category === "") {
    showError("category", "Please choose a category.");
    isValid = false;
  }

  if (values.subject.length < 3) {
    showError("subject", "Subject must be at least 3 characters.");
    isValid = false;
  }

  if (values.rating === "") {
    showError("rating", "Please select a rating.");
    isValid = false;
  }

  if (values.message.length < 10) {
    showError("message", "Message must be at least 10 characters.");
    isValid = false;
  } else if (values.message.length > MAX_MESSAGE_LENGTH) {
    showError("message", "Message must be less than " + MAX_MESSAGE_LENGTH + " characters.");
    isValid = false;
  }

  return isValid;
}

function clearForm() {
  document.getElementById("category").value = "";
  document.getElementById("subject").value = "";
  messageInput.value = "";

  let stars = document.querySelectorAll('input[name="rating"]');
  for (let i = 0; i < stars.length; i++) {
    stars[i].checked = false;
  }

  fillUserData();
  updateCounter();
}

feedbackForm.addEventListener("submit", function (event) {
  event.preventDefault();
  hideAlert();

  let selectedRating = document.querySelector('input[name="rating"]:checked');

  let values = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    category: document.getElementById("category").value,
    subject: document.getElementById("subject").value.trim(),
    rating: selectedRating ? selectedRating.value : "",
    message: messageInput.value.trim()
  };

  if (!validateForm(values)) {
    showAlert("error", "Please fix the errors and try again.");
    return;
  }

  addFeedback(values);
  clearForm();
  showAlert("success", "Thank you! Your feedback was sent to the HR team.");
});

feedbackForm.addEventListener("reset", function (event) {
  event.preventDefault();
  clearErrors();
  hideAlert();
  clearForm();
});

messageInput.addEventListener("input", updateCounter);

fillUserData();
updateCounter();