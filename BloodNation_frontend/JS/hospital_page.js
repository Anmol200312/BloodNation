const doctors = document.getElementById('doctorHos');
const donors = document.getElementById('donorHos');
const patients = document.getElementById('patientHos');
const bloodStocks = document.getElementById('bloodHos');
const bloodRequests = document.getElementById('requestHos');
const heading = document.querySelector('h2');

const totalDoc = document.getElementById('totalDoc');
const totalDon = document.getElementById('totalDon');
const totalPat = document.getElementById('totalPat');
const totalReq = document.getElementById('totalReq');
const completeReq = document.getElementById('completeReq');
const leftReq = document.getElementById('leftReq');

document.getElementById('logoutHos')?.addEventListener('click', logoutUser);

let allDoctors = [];
let allDonors = [];
let allPatients = [];
let allBloodStocks = [];
let allBloodRequests = [];

const inputDoc = document.getElementById('inputDoc');
const inputDon = document.getElementById('inputDon');
const inputPat = document.getElementById('inputPat');
const inputBlood = document.getElementById('inputBlood');
const inputReq = document.getElementById('inputReq');


function renderDoctors(data) {
    if (Array.isArray(data) && data.length > 0) {
        doctors.innerHTML = data.map(doc => `
            <h4>${doc.name}</h4>
            <div class="docDivOne">
                <div class="docDivTwo"><h5>Email</h5>${doc.email}</div>
                <div class="docDivTwo"><h5>Specialization</h5>${doc.specialization}</div>
                <div class="docDivTwo"><h5>License Number</h5>${doc.license_number}</div>
                <div class="docDivTwo"><h5>Blood Group</h5>${doc.current_blood_group || 'N/A'}</div> 
            </div>`
        ).join('');
    } else {
        doctors.innerHTML = "<h4>No Doctor is registered yet</h4>";
    }
}

function renderDonors(data) {
    if (Array.isArray(data) && data.length > 0) {
        donors.innerHTML = data.map(don => `
            <h4>${don.name}</h4>
            <div class="donDivOne">
                <div class="donDivTwo"><h5>Email</h5>${don.email}</div>
                <div class="donDivTwo"><h5>City</h5>${don.city || 'Not Provided'}</div>
                <div class="donDivTwo"><h5>Last Donation Date</h5>${don.last_donation_date ? new Date(don.last_donation_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never Donated'}</div>
                <div class="donDivTwo"><h5>Blood Group</h5>${don.blood_group}</div>
                <div class="donDivTwo"><h5>Disease History</h5>${don.disease_history || 'None'}</div>
                <div class="donDivTwo"><h5>Is Eligible</h5>${don.is_eligible ? 'Yes' : 'No'}</div>
            </div>`
        ).join('');
    } else {
        donors.innerHTML = "<h4>No Donor is registered yet</h4>";
    }
}

function renderPatients(data) {
    if (Array.isArray(data) && data.length > 0) {
        patients.innerHTML = data.map(pat => `
            <h4>${pat.name}</h4>
            <div class="patDivOne">
                <div class="patDivTwo"><h5>Email</h5>${pat.email}</div>
                <div class="patDivTwo"><h5>City</h5>${pat.city || 'Not Provided'}</div>
                <div class="patDivTwo"><h5>Blood Group Required</h5>${pat.blood_group_required}</div>
                <div class="patDivTwo"><h5>Disease History</h5>${pat.disease_history || 'None'}</div>
            </div>`
        ).join('');
    } else {
        patients.innerHTML = "<h4>No Patient is registered yet</h4>";
    }
}

function renderBloodStocks(data) {
    if (Array.isArray(data) && data.length > 0) {
        bloodStocks.innerHTML = data.map(blood => `
            <h4>${blood.blood_group}</h4>
            <div class="bloodDivOne">
                <div class="bloodDivTwo"><h5>Quantity Units</h5>${blood.quantity_in_units}</div>
                <div class="bloodDivTwo"><h5>Last Updated</h5>${new Date(blood.last_updated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>`
        ).join('');
    } else {
        bloodStocks.innerHTML = "<h4>No Blood is registered yet</h4>";
    }
}

function renderBloodRequests(data) {
    if (Array.isArray(data) && data.length > 0) {
        bloodRequests.innerHTML = data.map(req => `
            <h4>${req.blood_group_required}</h4>
            <div class="reqDivOne">
                <div class="reqDivTwo"><h5>Units</h5>${req.units_required}</div>
                <div class="reqDivTwo"><h5>Patient Name</h5>${req.patient?.name || 'N/A'}</div>
                <div class="reqDivTwo"><h5>Assigned Doctor</h5>${req.assigned_doctor?.name || 'Not Assigned'}</div>
                <div class="reqDivTwo"><h5>Donor Name</h5>${req.accepted_by_donor?.name || 'Not Accepted Yet'}</div>
                <div class="reqDivTwo"><h5>Donation Location</h5>${req.donation_location || 'N/A'}</div>
                <div class="reqDivTwo"><h5>Status</h5>${req.status}</div>
            </div>`
        ).join('');
    } else {
        bloodRequests.innerHTML = "<h4>No Blood Request is registered yet</h4>";
    }
}

// --- 2. Search Filter Event Listeners ---
inputDoc?.addEventListener('input', (e) => {
    let value = e.target.value.toLowerCase().trim();
    let filteredData = allDoctors.filter(doc =>
        doc.name?.toLowerCase().includes(value) ||
        doc.email?.toLowerCase().includes(value) ||
        doc.specialization?.toLowerCase().includes(value) ||
        doc.license_number?.toLowerCase().includes(value) ||
        doc.current_blood_group?.toLowerCase().includes(value)
    );
    renderDoctors(filteredData);
});

inputDon?.addEventListener('input', (e) => {
    let value = e.target.value.toLowerCase().trim();
    let filteredData = allDonors.filter(don => {
        let eligibleText = don.is_eligible ? 'yes' : 'no';
        return (
            don.name?.toLowerCase().includes(value) ||
            don.email?.toLowerCase().includes(value) ||
            don.city?.toLowerCase().includes(value) ||
            don.blood_group?.toLowerCase().includes(value) ||
            eligibleText.includes(value)
        );
    });
    renderDonors(filteredData);
});

inputPat?.addEventListener('input', (e) => {
    let value = e.target.value.toLowerCase().trim();
    let filteredData = allPatients.filter(pat =>
        pat.name?.toLowerCase().includes(value) ||
        pat.email?.toLowerCase().includes(value) ||
        pat.city?.toLowerCase().includes(value) ||
        pat.blood_group_required?.toLowerCase().includes(value)
    );
    renderPatients(filteredData);
});

inputBlood?.addEventListener('input', (e) => {
    let value = e.target.value.toLowerCase().trim();
    let filteredData = allBloodStocks.filter(blood => {
        let formattedDate = new Date(blood.last_updated)
            .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            .toLowerCase();
        return (
            blood.blood_group?.toLowerCase().includes(value) ||
            String(blood.quantity_in_units).includes(value) ||
            formattedDate.includes(value)
        );
    });
    renderBloodStocks(filteredData);
});

inputReq?.addEventListener('input', (e) => {
    let value = e.target.value.toLowerCase().trim();
    let filteredData = allBloodRequests.filter(req =>
        req.blood_group_required?.toLowerCase().includes(value) ||
        String(req.units_required).includes(value) ||
        req.patient?.name?.toLowerCase().includes(value) ||
        req.assigned_doctor?.name?.toLowerCase().includes(value) ||
        req.accepted_by_donor?.name?.toLowerCase().includes(value) ||
        req.donation_location?.toLowerCase().includes(value) ||
        req.status?.toLowerCase().includes(value)
    );
    renderBloodRequests(filteredData);
});


async function loadDashboard() {
    try {
        const response = await authFetch('/api/hospital/dashboard/', {
            method: "GET"
        });

        const result = await response.json();

        if (response.status === 200) {
            heading.textContent = `${result.name || result.hospital_name || 'Hospital'} Dashboard`;

            allDoctors = result.doctors || [];
            allDonors = result.donors || [];
            allPatients = result.patients || [];
            allBloodStocks = result.blood_stock || [];
            allBloodRequests = result.blood_request || result.blood_requests || [];


            if (totalDoc) totalDoc.textContent = allDoctors.length;
            if (totalDon) totalDon.textContent = allDonors.length;
            if (totalPat) totalPat.textContent = allPatients.length;
            if (totalReq) totalReq.textContent = allBloodRequests.length;
            if (completeReq) completeReq.textContent = allBloodRequests.filter(r => r.status === 'completed').length;
            if (leftReq) leftReq.textContent = allBloodRequests.filter(r => r.status !== 'completed').length;

            renderDoctors(allDoctors);
            renderDonors(allDonors);
            renderPatients(allPatients);
            renderBloodStocks(allBloodStocks);
            renderBloodRequests(allBloodRequests);
        } else if (response.status === 401 || response.status === 403) {
            alert(result.message);
            logoutUser();
        }
    } catch (error) {
        console.log(error);
        alert("Connection lost with server");
    }
}

loadDashboard();
