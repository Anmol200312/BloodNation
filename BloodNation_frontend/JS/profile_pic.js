const Cropper = window.Cropper;

const profileDiv = document.getElementById('profileDiv');
const profileInput = document.getElementById('profileInput');
const profileContainer = document.getElementById('profileContainer');
const closePic = document.getElementById('closePic');
const profileForm = document.getElementById('profileForm');
const picButton = document.getElementById('picButton');

const cropBox = document.getElementById('cropBox');
const previewImage = document.getElementById('previewImage');
let cropper = null;

profileDiv.addEventListener('click', () => {
    profileContainer.style.display = 'flex';
    profileDiv.style.display = 'none';
    profileForm.style.display = 'flex';
});

closePic.addEventListener('click', () => {
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    if (cropBox) cropBox.style.display = 'none';
    profileInput.value = '';
    profileContainer.style.display = 'none';
    profileDiv.style.display = 'flex';
});


profileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        previewImage.src = event.target.result;
        cropBox.style.display = 'block';

        if (cropper) {
            cropper.destroy();
        }
        cropper = new Cropper(previewImage, {
            aspectRatio: 1,
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 0.9,
            guides: false,
            center: false,
            background: false
        });
    };
    reader.readAsDataURL(file);
});

profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = profileInput.files[0];  // to get the uploaded file from input form

    if (!file || !cropper) {
        alert("Please select a pic");
        return;
    }

    cropper.getCroppedCanvas({ width: 300, height: 300 }).toBlob(async (blob) => {
        // in json we cant send files,pdf,image 
        const formData = new FormData(); // create formData object 
        formData.append('profile_pic', blob, file.name); // pack object with the exact bakend name and a selected file from the input form

        try {
            const response = await authFetch('/api/profile_pic/', {
                method: "PATCH",
                body: formData
            });

            const result = await response.json();

            if (response.status === 200) {
                console.log(result.message);
                cropper.destroy();
                cropper = null;
                cropBox.style.display = 'none';
                profileContainer.style.display = 'none';
                profileDiv.style.display = 'flex';
                profileInput.value = '';

                if (result.profile_pic) {
                    profileDiv.innerHTML = `<img src="${result.profile_pic}" alt="Profile Pic">`;
                }
            }
            else {
                alert("Upload Failed");
            }
        }
        catch (error) {
            console.log(error);
            alert("Failed to upload the profile pic, try after some time");
        }
    }, 'image/jpeg', 0.9);
});


async function checkProfileRequest() {
    try {
        const response = await authFetch('/api/profile_pic/', {
            method: "GET"
        });

        const result = await response.json();
        if (response.status === 200) {
            console.log(result.message);
            profileDiv.style.display = 'flex';
            profileContainer.style.display = 'none';

            if (result?.profile_pic) {
                profileDiv.innerHTML = `<img src="${result.profile_pic}" alt="Profile Pic">`;
            }

        }
    }
    catch (error) {
        console.log(error.message);
    }
}


checkProfileRequest();