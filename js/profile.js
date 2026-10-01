let user = JSON.parse(localStorage.getItem("currentUser"));

let profileImage = document.getElementById("profileImage");

let name = document.getElementById("name");
let email = document.getElementById("email");
let position = document.getElementById("position");
let role = document.getElementById("role");
let department = document.getElementById("department");
let salary = document.getElementById("salary");
let phone = document.getElementById("phone");
let address = document.getElementById("address");


profileImage.src = user.image;

name.innerText = user.name;
email.innerText = user.email;
position.innerText = user.position;
role.innerText = user.role;
department.innerText = user.department;
salary.innerText = user.salary;
phone.innerText = user.phone;
address.innerText = user.address;


let editButton = document.getElementById("editButton");

editButton.addEventListener("click", function() {

    window.location.href = "edit-profile.html";

});