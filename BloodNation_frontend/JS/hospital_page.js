const doctors = document.getElementById('doctorHos');
const donors = document.getElementById('donorHos');
const patients = document.getElementById('patientHos');
const bloodStocks = document.getElementById('bloodHos');
const bloodRequests = document.getElementById('requestHos');
const heading = document.querySelector('h2');

document.getElementById('logoutHos').addEventListener('click', logoutUser);


async function loadDashboard() {

    try {
        const response = await authFetch('/api/hospital/dashboard/', {
            method: "GET"
        });

        const result = await response.json();

        if (response.status == 200) {
            if (Array.isArray(result.doctors) && result.doctors.length > 0) {
                heading.innerHTML = result.name || result.hospital_name || 'None';
                doctors.innerHTML = result.doctors.map(doc => `
                    <h4>${doc.name}</h4>
                    <div class="docDivOne">
                    <div class="docDivTwo"><h5>Email</h5>${doc.email}</div>
                    <div class="docDivTwo"><h5>Specialization</h5>${doc.specialization}</div>
                    <div class="docDivTwo"><h5>Lisence Number</h5>${doc.license_number}</div>
                    <div class="docDivTwo"><h5>Blood Group</h5>${doc.current_blood_group}</div> 
                    </div>`
                ).join('');
            } else {
                doctors.innerHTML = "<h4>No Doctor is registered yet</h4>";
            }

            if (Array.isArray(result.donors) && result.donors.length > 0) {
                donors.innerHTML = result.donors.map(don => `
                    <h4>${don.name}</h4>
                    <div class="donDivOne">
                    <div class="donDivTwo"><h5>Email</h5>${don.email}</div>
                    <div class="donDivTwo"><h5>City</h5>${don.city || 'Not Provided'}</div>
                    <div class="donDivTwo"><h5>Last Donation Date</h5>${don.last_donation_date ? new Date(don.last_donation_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never Donated'}</div>
                    <div class="donDivTwo"><h5>Blood Group</h5>${don.blood_group}</div>
                    <div class="donDivTwo"><h5>Disease History</h5>${don.disease_history}</div>
                    <div class="donDivTwo"><h5>Is Eligible</h5>${don.is_eligible ? 'Yes' : 'No'}</div>
                    </div>`
                ).join('');
            } else {
                donors.innerHTML = "<h4>No Donor is registered yet</h4>";
            }

            if (Array.isArray(result.patients) && result.patients.length > 0) {
                patients.innerHTML = result.patients.map(pat => `
                    <h4>${pat.name}</h4>
                    <div class="patDivOne">
                    <div class="patDivTwo"><h5>Email</h5>${pat.email}</div>
                    <div class="patDivTwo"><h5>City</h5>${pat.city || 'Not Provided'}</div>
                    <div class="patDivTwo"><h5>Blood Group Required</h5>${pat.blood_group_required}</div>
                    <div class="patDivTwo"><h5>Disease History</h5>${pat.disease_history}</div>
                    </div>`
                ).join('');
            } else {
                patients.innerHTML = "<h4>No Patient is registered yet</h4>";
            }

            if (Array.isArray(result.blood_stock) && result.blood_stock.length > 0) {
                bloodStocks.innerHTML = result.blood_stock.map(blood => `
                    <h4>${blood.blood_group}</h4>
                    <div class="bloodDivOne">
                    <div class="bloodDivTwo"><h5>Quantity Units</h5>${blood.quantity_in_units}</div>
                    <div class="bloodDivTwo"><h5>Last Updated</h5>${new Date(blood.last_updated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>`
                ).join('');
            } else {
                bloodStocks.innerHTML = "<h4>No Blood is registered yet</h4>";
            }

            if (Array.isArray(result.blood_request) && result.blood_request.length > 0) {
                bloodRequests.innerHTML = result.blood_request.map(req => `
                    <h4>${req.blood_group_required}</h4>
                    <div class="reqDivOne">
                    <div class="reqDivTwo"><h5>Units</h5>${req.units_required}</div>
                    <div class="reqDivTwo"><h5>Patient Name</h5>${req.patient.name}</div>
                    <div class="reqDivTwo"><h5>Assigned Doctor</h5>${req.assigned_doctor.name}</div>
                    <div class="reqDivTwo"><h5>Donor Name</h5>${req.accepted_by_donor.name}</div>
                    <div class="reqDivTwo"><h5>Donation Location</h5>${req.donation_location}</div>
                    <div class="reqDivTwo"><h5>Status</h5>${req.status}</div>
                    </div>`
                ).join('');
            } else {
                bloodRequests.innerHTML = "<h4>No Blood Request is registered yet</h4>";
            }

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
