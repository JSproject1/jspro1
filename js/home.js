const services=[
    {
        icon:"👤",
        title:"Employee Profile",
        description:"Manage your personal information and employee details."
    },
    {
        icon:"🏖️",
        title:"Leave Management",
        description:"Submit and track your leave requests."
    },
    {
        icon:"✅",
        title:"Task Management",
        description:"Create and manage your tasks."
    },
    {
        icon:"📄",
        title:"Company Policies",
        description:"View company policies and HR guidelines."
    },
    {
        icon:"💬",
        title:"Feedback",
        description:"Send your feedback to HR."
    },
    {
        icon:"🎯",
        title:"Meetings",
        description:"View upcoming meetings and meeting links."
    }
];

const servicesContainer=document.getElementById("servicesContainer");

const cards=services.map(function(service){
    return `
        <div class="col-lg-4 col-md-6">
            <div class="service-card">
                <div class="service-icon">${service.icon}</div>
                <h5>${service.title}</h5>
                <p>${service.description}</p>
                <a href="services.html">Learn More →</a>
            </div>
        </div>
    `;
});

servicesContainer.innerHTML=cards.join("");


/* Login Status */

const currentUser=localStorage.getItem("currentUser");

if(currentUser){

    const user=JSON.parse(currentUser);

    document.getElementById("guestArea").classList.add("d-none");

    document.getElementById("userArea").classList.remove("d-none");

    document.getElementById("sideBar").classList.remove("d-none");

    document.body.classList.add("logged-in");

    document.getElementById("navUsername").textContent=user.name;

    if(user.image){
        document.getElementById("profileImage").src=user.image;
    }
}


/* Logout */

document.getElementById("logoutBtn").addEventListener("click",function(){

    localStorage.removeItem("currentUser");

    window.location.href="../html/home2.html";

});