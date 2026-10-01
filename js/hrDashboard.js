fetch("../JSON/employee.json")
    .then(response => response.json())
    .then(data => {

        // نجيب الموظفين فقط، بدون HR
        let employees = data.filter(user => user.role === "EMP");


        // ==============================
        // Total Employees
        // ==============================

        document.getElementById("totalEmployees").textContent = employees.length;


        // ==============================
        // Recent Employees
        // ==============================

        let recentEmployees = document.getElementById("recentEmployees");

        for (let i = 0; i < employees.length; i++) {

            recentEmployees.innerHTML += `
                <div class="employee-item">

                    <div class="employee-avatar">
                        ${employees[i].name.charAt(0)}
                    </div>

                    <div class="employee-info">
                        <h4>${employees[i].name}</h4>
                        <p>${employees[i].email}</p>
                    </div>

                    <div class="employee-department">
                        ${employees[i].department}
                    </div>

                </div>
            `;
        }

    })

    .catch(error => {
        console.log("Error loading employees:", error);
    });