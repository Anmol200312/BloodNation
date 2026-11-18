const hospitals = document.getElementById('hospitalsAdmin');
const users = document.getElementById('usersAdmin');
const requests = document.getElementById('requestAdmin');
const donation = document.getElementById('donationAdmin');

const totalHos = document.getElementById('totalHos');
const totalDoc = document.getElementById('totalDoc');
const totalDon = document.getElementById('totalDon');
const totalPat = document.getElementById('totalPat');
const totalReq = document.getElementById('totalReq');
const completeReq = document.getElementById('completeReq');
const leftReq = document.getElementById('leftReq');

document.getElementById('logoutAdmin').addEventListener('click', logoutUser);


let allHospitals = [];
let allUsers = [];
let allRequests = [];
let allDonations = [];


function renderHos(data) {
    if (Array.isArray(data) && data.length > 0) {
        hospitals.innerHTML = data.map(hos => `
            <h4>${hos.name}</h4>
            <div class="hosDivOne">
                <div class="hosDivTwo"><h5>City</h5>${hos.city}</div>
                <div class="hosDivTwo"><h5>License</h5>${hos.license_number}</div>
                <div class="hosDivTwo"><h5>Address</h5>${hos.address}</div>
                <div class="hosDivTwo"><h5>Contact</h5>${hos.contact_number}</div>
                <div class="hosDivTwo"><h5>Verification</h5>${hos.is_verified ? 'Verified' : 'Pending Verification'}</div>
                <div class="hosDivTwo"><h5>Appointed Doctors</h5>${hos.doctors ? hos.doctors.length : 'No doctors appointed yet'}</div>
            </div>`
        ).join('');
    } else {
        hospitals.innerHTML = "<h4>No Hospital found</h4>";
    }
}

function renderUsers(data) {
    if (Array.isArray(data) && data.length > 0) {
        users.innerHTML = data.map(user => `
            <h4>${user.name}</h4>
            <div class="userDivOne">
                <div class="userDivTwo"><h5>Role</h5>${user.role.toUpperCase()}</div>
                <div class="userDivTwo"><h5>Email</h5>${user.email}</div>
                <div class="userDivTwo"><h5>Status</h5>${user.is_active ? 'Active' : 'Inactive'}</div>
                <div class="userDivTwo"><h5>Hospital</h5>${user.hospital || 'None'}</div>
            </div>`
        ).join('');
    } else {
        users.innerHTML = "<h4>No user found</h4>";
    }
}

function renderReq(data) {
    if (Array.isArray(data) && data.length > 0) {
        requests.innerHTML = data.map(blood => `
            <h4>${blood.patient_details?.name || 'Unknown'}</h4>
            <div class="requestDivOne">
                <div class="requestDivTwo"><h5>Email</h5>${blood.patient_details?.user?.email || 'N/A'}</div>
                <div class="requestDivTwo"><h5>City</h5>${blood.patient_details?.city || 'N/A'}</div>
                <div class="requestDivTwo"><h5>Blood Request</h5>${blood.blood_group_required}</div>
                <div class="requestDivTwo"><h5>Hospital</h5>${blood.hospital_details?.name || 'None'}</div>
                <div class="requestDivTwo"><h5>Status</h5>${blood.status}</div>
            </div>`
        ).join('');
    } else {
        requests.innerHTML = "<h4>No request found</h4>";
    }
}

function renderDon(data) {
    if (Array.isArray(data) && data.length > 0) {
        donation.innerHTML = data.map(blood => `
            <h4>${blood.donor_details?.name || 'Unknown'}</h4>
            <div class="donorDivOne">
                <div class="donorDivTwo"><h5>Email</h5>${blood.donor_details?.user?.email || 'N/A'}</div>
                <div class="donorDivTwo"><h5>City</h5>${blood.donor_details?.city || 'Null'}</div>
                <div class="donorDivTwo"><h5>Blood Group</h5>${blood.blood_group}</div>
                <div class="donorDivTwo"><h5>Hospital</h5>${blood.hospital_details?.name || 'None'}</div>
                <div class="donorDivTwo"><h5>Donation Status</h5>${blood.status ? 'Scheduled' : 'Pending'}</div>
            </div>`
        ).join('');
    } else {
        donation.innerHTML = "<h4>No donations found</h4>";
    }
}

// 2. Input Fields
const inputHos = document.getElementById('inputHos');
const inputUsers = document.getElementById('inputUsers');
const inputReq = document.getElementById('inputReq');
const inputDon = document.getElementById('inputDon');

// 3. Filter Event Listeners
inputHos?.addEventListener('input', (e) => {
    let value = e.target.value.toLowerCase().trim();
    let filteredData = allHospitals.filter(hos => {
        let verifyText = hos.is_verified ? 'verified' : 'pending verification';
        return (
            hos.name?.toLowerCase().includes(value) ||
            hos.city?.toLowerCase().includes(value) ||
            String(hos.contact_number || '').includes(value) ||
            verifyText.includes(value)
        );
    });
    renderHos(filteredData);
});

inputUsers?.addEventListener('input', (e) => {
    let value = e.target.value.toLowerCase().trim();
    let filteredData = allUsers.filter(user => {
        let statusText = user.is_active ? 'active' : 'inactive';
        return (
            user.name?.toLowerCase().includes(value) ||
            user.role?.toLowerCase().includes(value) ||
            user.email?.toLowerCase().includes(value) ||
            statusText.includes(value) ||
            String(user.hospital || '').toLowerCase().includes(value) ||
            user.role?.toLowerCase().includes(value));
    });
    renderUsers(filteredData);
});

inputReq?.addEventListener('input', (e) => {
    let value = e.target.value.toLowerCase().trim();
    let filteredData = allRequests.filter(pat =>
        pat.patient_details?.name?.toLowerCase().includes(value) ||
        pat.patient_details?.user?.email?.toLowerCase().includes(value) ||
        pat.patient_details?.city?.toLowerCase().includes(value) ||
        pat.hospital_details?.name?.toLowerCase().includes(value) ||
        pat.status?.toLowerCase().includes(value)
    );
    renderReq(filteredData);
});

inputDon?.addEventListener('input', (e) => {
    let value = e.target.value.toLowerCase().trim();
    let filteredData = allDonations.filter(blood => {
        let donStatus = blood.status ? 'scheduled' : 'pending';
        return (
            blood.donor_details?.name?.toLowerCase().includes(value) ||
            blood.hospital_details?.name?.toLowerCase().includes(value) ||
            blood.donor_details?.city?.toLowerCase().includes(value) ||
            donStatus.includes(value)
        );
    });
    renderDon(filteredData);
});

async function loadDashboard() {
    try {
        const response = await authFetch('/api/admin/dashboard/', {
            method: "GET"
        });

        const result = await response.json();

        if (response.status == 200) {
            totalHos.innerHTML = `<h5>All Hospitals</h5>${result.total_hospitals ?? 0}`;
            totalDoc.innerHTML = `<h5>All Doctors</h5>${result.total_doctors ?? 0}`;
            totalDon.innerHTML = `<h5>All Donors</h5>${result.total_donors ?? 0}`;
            totalPat.innerHTML = `<h5>All Patients</h5>${result.total_patients ?? 0}`;
            totalReq.innerHTML = `<h5>All Requests</h5>${result.total_blood_request ?? 0}`;
            completeReq.innerHTML = `<h5>Completed Requests</h5>${result.completed_requests ?? 0}`;
            leftReq.innerHTML = `<h5>Left Requests</h5>${result.left_requests ?? 0}`;

            allHospitals = result.hospitals || [];
            allDonations = result.blood_donations || [];
            allRequests = result.blood_requests || [];
            allUsers = result.all_users || [];


            renderHos(allHospitals);
            renderUsers(allUsers);
            renderReq(allRequests);
            renderDon(allDonations);
        }
        else if (response.status === 401 || response.status == 403) {
            alert(result.message);
            logoutUser();
        }
    }
    catch (error) {
        console.log(error);
        alert("Connection lost with server");
    }
}

loadDashboard();
