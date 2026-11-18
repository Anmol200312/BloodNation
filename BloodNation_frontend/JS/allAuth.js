BACKEND_URL = 'http://127.0.0.1:8000';

const navlistOne = document.getElementById('navlistOne');
const navlistTwo = document.getElementById('navlistTwo');
const dashboardLink = document.getElementById('dashboardLink')
const logoutButton = document.getElementById('logoutButton');

allRoles = {
    "doctor": "doctor_page.html",
    "donor": "donor_page.html",
    "patient": "patient_page.html",
    "admin": "admin_page.html",
    "hospital": "hospital_page.html"
}

async function authorization(endpoints, options = {}) {
    const accessToken = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');

    if (!accessToken || !userRole) {
        navlistOne.style.display = "flex";
        navlistTwo.style.display = "none";
        return;
    }

    options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    };

    try {
        const response = await fetch(BACKEND_URL + endpoints, options);
        if (response.status === 401) {
            localStorage.clear();
            navlistOne.style.display = "flex";
            navlistTwo.style.display = "none";
        }

        else if (response.status === 200) {
            const userRole = localStorage.getItem('user_role');
            const foundRole = allRoles[userRole.toLowerCase()];
            if (foundRole) {
                if (logoutButton) {
                    logoutButton.onclick = () => {
                        localStorage.clear();
                        window.location.href = 'login.html';
                    }
                }
                if (dashboardLink) {
                    dashboardLink.innerHTML = `<a href="${foundRole}">Dashboard</a>`
                }
                navlistOne.style.display = "none";
                navlistTwo.style.display = "flex";
            }
        }

        else {
            navlistOne.style.display = "flex";
            navlistTwo.style.display = "none";
        }
        return response;
    }
    catch (error) {
        console.log(error);
        navlistOne.style.display = "flex";
        navlistTwo.style.display = "none";
    }
}