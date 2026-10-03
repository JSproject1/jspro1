let user = JSON.parse(localStorage.getItem("currentUser"));

let name = document.getElementById("name");
let email = document.getElementById("email");
let phone = document.getElementById("phone");
let address = document.getElementById("address");
let image = document.getElementById("image");

name.value = user.name;
email.value = user.email;
phone.value = user.phone;
address.value = user.address;
image.value = user.image;


let saveButton = document.getElementById("saveButton");

saveButton.addEventListener("click", function() {

    user.name = name.value;
    user.phone = phone.value;
    user.address = address.value;
    user.image = image.value;

    localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
    );

    if(user.role === "EMP"){
        window.location.href = "profile.html";
    }
    else{
        window.location.href = "HRProfile.html";
    }
    

});


let resetPasswordButton = document.getElementById("resetPasswordButton");
resetPasswordButton.addEventListener("click", function() {
    window.location.href = "reset-password.html";
});

