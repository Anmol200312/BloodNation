const formChange = document.getElementById('formChange');
const buttonChange = document.getElementById('buttonChange');
const oldPassword = document.getElementById('oldChange');
const newPassword = document.getElementById('newChange');
const confirmPassword = document.getElementById('confirmChange');

formChange.addEventListener('submit', changeRequest);

async function changeRequest(e) {
    e.preventDefault();

    if (newPassword.value !== confirmPassword.value) {
        alert("Both password fields should match each other");
        return;
    }

    // Extraction of JWT token from browser local storage to pass the security barrier
    const token = localStorage.getItem('access_token');
    if (!token) {
        alert("Access Denied: Please login first.");
        logoutUser();
        return;
    }

    const formData = new FormData(formChange);
    const payload = Object.fromEntries(formData.entries());

    try {
        buttonChange.disabled = true;
        const response = await authFetch('/api/change_password/', {
            method: "POST",
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.status === 200) {
            alert(result.message);
            formChange.reset();

            const roleRedirects = {
                "doctor": "doctor_page.html",
                "donor": "donor_page.html",
                "patient": "patient_page.html",
                "admin": "admin_page.html"
            };

            const savedRole = localStorage.getItem('user_role');
            const targetDashboard = roleRedirects[savedRole] || 'home_page.html';
            window.location.href = targetDashboard;
        }

        else if (response.status === 400) {
            if (result.old_password) {
                alert(result.old_password[0]);
            }
        }
        else if (response.status === 403) {
            alert("Access Denied: Please login first");
            window.location.href = 'login.html';
        }
        else {
            alert(JSON.stringify(result, null, 2));
        }
    }
    catch (error) {
        console.log(error);
        alert("Connection failed with server");
    }
    finally {
        buttonChange.disabled = false;
        buttonChange.textContent = "Change Password";
    }

}