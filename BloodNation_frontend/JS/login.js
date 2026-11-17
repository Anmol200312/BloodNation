const regAPIUrls = {
    doctor: 'http://127.0.0.1:8000/api/register/doctor/',
    donor: 'http://127.0.0.1:8000/api/register/donor/',
    patient: 'http://127.0.0.1:8000/api/register/patient/'
};

// select role
const roleSelect = document.getElementById('roleSelect');

const forms = {
    doctor: document.getElementById('regFormDoctor'),
    patient: document.getElementById('regFormPatient'),
    donor: document.getElementById('regFormDonor')
};

if (roleSelect) {
    roleSelect.addEventListener('change', (e) => {
        const selectedRole = e.target.value; //put the changed role key like doctor in selectedRole

        Object.values(forms).forEach(elements => {  // Object.values(forms) collects the object form values into array
            if (elements) {
                elements.style.display = 'none';
            }
        });

        if (selectedRole && forms[selectedRole]) { // if donor and forms[donor]
            forms[selectedRole].style.display = 'flex';
        }
    });
}

// register form
async function handleRegistrationSubmit(e, role, formElements, buttonElement) {
    e.preventDefault();

    const formData = new FormData(formElements); // it converts the name and input value of every field into key value pair
    const rawData = Object.fromEntries(formData.entries()); // entties convert it into dynamic list and then into  js object

    const { email, password, confirm_password, ...otherFields } = rawData;

    Object.keys(otherFields).forEach(key => {
        if (otherFields[key] === "") {
            otherFields[key] = null;
        }
    });

    const payload = {
        user: {
            email: email,
            password: password,
            confirm_password: confirm_password
        },
        ...otherFields
    };

    try {
        buttonElement.disabled = true;

        const response = await fetch(regAPIUrls[role], {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (response.status == 201) {
            alert(result.message);
            formElements.reset();
            roleSelect.value = '';
            Object.values(forms).forEach(elements => {
                if (elements) {
                    elements.style.display = 'none';
                }
            })
        }
        else {
            alert(JSON.stringify(result, null, 2));
        }
    }
    catch (error) {
        console.log(error)
        alert("Connection error");
    }
    finally {
        buttonElement.disabled = false;
        buttonElement.textContent = "Register";
    }
}

const regFormDoctor = document.getElementById('regFormDoctor');
const regFormDonor = document.getElementById('regFormDonor');
const regFormPatient = document.getElementById('regFormPatient');

const regButtonDoctor = document.getElementById('regButtonDoctor');
const regButtonDonor = document.getElementById('regButtonDonor');
const regButtonPatient = document.getElementById('regButtonPatient');


if (regFormDoctor) {
    regFormDoctor.addEventListener('submit', (e) => handleRegistrationSubmit(e, 'doctor', regFormDoctor, regButtonDoctor));
}
if (regFormDonor) {
    regFormDonor.addEventListener('submit', (e) => handleRegistrationSubmit(e, 'donor', regFormDonor, regButtonDonor));
}
if (regFormPatient) {
    regFormPatient.addEventListener('submit', (e) => handleRegistrationSubmit(e, 'patient', regFormPatient, regButtonPatient));
}





// login form

const loginAPIUrl = 'http://127.0.0.1:8000/api/login/'

const loginForm = document.getElementById('loginForm');
const loginButton = document.getElementById('loginButton');

if (loginForm) {
    loginForm.addEventListener('submit', loginRequest);
}

async function loginRequest(e) {
    e.preventDefault();

    const formData = new FormData(loginForm);
    const payload = Object.fromEntries(formData.entries());

    loginButton.disabled = true;
    try {
        const response = await fetch(loginAPIUrl, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.status === 200) {
            localStorage.setItem('access_token', result.access);
            localStorage.setItem('refresh_token', result.refresh);
            localStorage.setItem('user_role', result.role);
            localStorage.setItem('user_email', result.email);

            console.log(result.message);
            window.location.href = result.redirect_to;
            alert(result.message);
        }
        else if (response.status === 400 || response.status === 401 || response.status === 403) {
            if (result.message) {
                alert(result.message);
                if (result.redirect_to) {
                    loginForm.reset();
                    window.location.href = result.redirect_to;
                }
            }
            else {
                alert(JSON.stringify(result, null, 2));
            }

        }
        else {
            alert("Something went wrong on the server");
        }
    }
    catch (error) {
        console.log(error)
        alert("Problem occured in connecting with server");
    }
    finally {
        loginButton.disabled = false;
        loginButton.textContent = "Login";
    }

}

