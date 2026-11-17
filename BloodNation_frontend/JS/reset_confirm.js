document.addEventListener('DOMContentLoaded', resetConfirmRequest);

const URLParams = new URLSearchParams(window.location.search);
const uidb64 = URLParams.get('uidb64');
const token = URLParams.get('token');

async function resetConfirmRequest() {
    const confirmHeading = document.getElementById('confirmHeading');
    const confirmButton = document.getElementById('confirmButton');

    confirmButton.style.display = 'none';


    if (!uidb64 || !token) {
        confirmHeading.textContent = "The activation link appears to be broken or missing security credentials";
        return;
    }

    try {
        const APIUrl = `http://127.0.0.1:8000/api/reset_confirm/${uidb64}/${token}/`;

        const response = await fetch(APIUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();

        if (response.status === 200) {
            confirmButton.style.display = 'block';
            confirmHeading.textContent = "Update your password by filling the details below";
        }
        else if (response.status === 400) {
            confirmHeading.textContent = result.message;
            confirmButton.textContent = "Login";
            confirmButton.style.display = 'block';
            confirmButton.onclick = (e) => {
                e.preventDefault();
                window.location.href = 'login.html';
            }
        }
    }
    catch (error) {
        console.log(error);
        confirmHeading.textContent = "Network Timeout";
    }
}


document.getElementById('confirmForm').addEventListener('submit', submitConfirmRequest);

const newPassword = document.getElementById('newConfirmPassword');
const confirmPassword = document.getElementById('confirmConfirmPassword');
const confirmButton = document.getElementById('confirmButton');
const confirmForm = document.getElementById('confirmForm');
const confirmHeading = document.getElementById('confirmHeading');

async function submitConfirmRequest(e) {
    e.preventDefault();
    const APIUrl = `http://127.0.0.1:8000/api/reset_confirm/${uidb64}/${token}/`;

    if (newPassword.value !== confirmPassword.value) {
        alert("Both password fields should match");
        return;
    }

    const formData = new FormData(confirmForm);
    const payload = Object.fromEntries(formData.entries());

    try {
        confirmButton.disabled = true;
        const response = await fetch(APIUrl, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.status === 200) {
            alert("Your password has been updated successfully");
            confirmForm.reset();
            window.location.href = 'login.html';
        }

        else if (response.status === 400) {
            alert(JSON.stringify(result, null, 2));
        }
    }
    catch (error) {
        console.log(error);
        alert("Could not process request with authentication server");
    }
    finally {
        confirmButton.disabled = false;
        confirmButton.textContent = "Update Password";
    }
}
