document.addEventListener('DOMContentLoaded', accountActivateRequest)

async function accountActivateRequest() {
    const statusHeading = document.getElementById('statusHeading');
    const statusMessage = document.getElementById('statusMessage');
    const loginRedirectButton = document.getElementById('loginRedirectButton');

    loginRedirectButton.style.display = 'none';
    const urlParams = new URLSearchParams(window.location.search);
    const uidb64 = urlParams.get("uidb64");
    const token = urlParams.get("token");

    if (!uidb64 || !token) {
        statusHeading.textContent = "Link Error";
        statusMessage.textContent = "The activation link appears to be broken or missing security credentials";
        return;
    }

    try {
        const APIUrl = `http://127.0.0.1:8000/api/activate/${uidb64}/${token}/`;

        const response = await fetch(APIUrl, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();

        if (response.status === 200) {
            statusHeading.textContent = "Account already active";
            statusMessage.textContent = "Your account is already activated. Redirecting to login."
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);

        }

        else if (response.status === 200) {
            statusHeading.textContent = "Verified Successfully";
            statusMessage.textContent = "Thank you for activating your account.To go on login page click button below."

            loginRedirectButton.style.display = 'block';
            loginRedirectButton.onclick = () => {
                window.location.href = 'login.html'
            };
        }

        else if (response.status === 400) {
            statusHeading.textContent = "Verification Failed";
            statusMessage.textContent = result.message;

            loginRedirectButton.style.display = 'block';
            loginRedirectButton.textContent = "Register";
            loginRedirectButton.onclick = () => {
                window.location.href = 'login.html';
            }

        }
    }

    catch (error) {
        console.log(error);
        statusHeading.textContent = "Network Timeout";
        statusMessage.textContent = "Could not estabilish secure connection with server"
    }
}