const APIUrl = 'http://127.0.0.1:8000/api/reset_password/';

const resetButton = document.getElementById('resetButton');
const resetEmail = document.getElementById('resetEmail');


document.getElementById('resetForm').addEventListener('submit', resetFormRequest);

async function resetFormRequest(e) {
    e.preventDefault();

    const emailValue = resetEmail.value.trim();

    if (emailValue === "") {
        alert("Please enter a valid email");
        return;
    }

    try {

        const payload = {
            email: emailValue
        };
        const response = await fetch(APIUrl, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.status === 200) {
            alert(result.message);
        }

        else if (response.status === 400) {
            alert(JSON.stringify(result, null, 2));
        }
        else {
            alert("Something went wrong on the server");
        }

    }
    catch (error) {
        console.log(error);
        alert("Problem occured connecting with server");
    }
    finally {
        if (resetButton) {
            resetButton.disabled = false;
        }
    }
}