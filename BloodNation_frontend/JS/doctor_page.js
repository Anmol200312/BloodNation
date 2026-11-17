const profile = document.getElementById('profileDoc');
const bloodStock = document.getElementById('bloodStockDoc');
const bloodRequest = document.getElementById('requestDoc');
const handleRequest = document.getElementById('handleReqDoc');
const title = document.querySelector('h2');


document.getElementById('logoutDoc').addEventListener('click', logoutUser);



async function loadDashboard() {
    try {
        const response = await authFetch('/api/doctor/dashboard/', {
            method: "GET",
        });

        const result = await response.json();

        if (response.status == 200) {
            title.textContent = `${result.profile.name} Dashboard`;
            const pro = Array.isArray(result.profile) ? result.profile[0] : result.profile;
            if (pro) {
                profile.innerHTML = `
                    <h4>${pro.name}</h4>
                    <div class="proDivOne">
                    <div class="proDivTwo"><h5>Email</h5>${pro.email}</div>
                    <div class="proDivTwo"><h5>Specialization</h5>${pro.specialization}</div>
                    <div class="proDivTwo"><h5>Lisence Number</h5>${pro.license_number}</div>
                    <div class="proDivTwo"><h5>Hospital</h5>${pro.hospital_details?.name}</div> 
                    </div>`
                    ;
            } else {
                profile.innerHTML = "<h4>Your profile is not registered yet</h4>";
            }

            if (Array.isArray(result.hospital_blood_stock) && result.hospital_blood_stock.length > 0) {
                bloodStock.innerHTML = result.hospital_blood_stock.map(blood => `
                    <h4>${blood.blood_group}</h4>
                    <div class="bloodDivOne">
                    <div class="bloodDivTwo"><h5>Quantity Units</h5>${blood.quantity_in_units}</div>
                    <div class="bloodDivTwo"><h5>Last Updated</h5>${new Date(blood.last_updated).toLocaleDateString('en-IN', { 'day': 'numeric', month: 'short', 'year': 'numeric' })}</div>
                    </div>`
                ).join('');
            } else {
                bloodStock.innerHTML = "<h4>No blood is registered yet</h4>";
            }

            if (Array.isArray(result.hospital_requests) && result.hospital_requests.length > 0) {
                bloodRequest.innerHTML = result.hospital_requests.map(req => `
                    <h4>${req.blood_group_required}</h4>
                    <div class="reqDivOne">
                    <div class="reqDivTwo"><h5>Units</h5>${req.units_required}</div>
                    <div class="reqDivTwo"><h5>Patient Name</h5>${req.patient.name}</div>
                    <div class="reqDivTwo"><h5>Donor Name</h5>${req.accepted_by_donor.name}</div>
                    <div class="reqDivTwo"><h5>Donation Location</h5>${req.donation_location}</div>
                    <div class="reqDivTwo"><h5>Status</h5>${req.status}</div>
                    </div>`
                ).join('');
            } else {
                bloodRequest.innerHTML = "<h4>No request is registered yet</h4>";
            }

            if (Array.isArray(result.my_handled_requests) && result.my_handled_requests.length > 0) {
                handleRequest.innerHTML = result.my_handled_requests.map(hand => `
                    <h4>${hand.patient.name}</h4>
                    <div class="handDivOne">
                    <div class="handDivTwo"><h5>Required Blood Group</h5>${hand.blood_group_required}</div>
                    <div class="handDivTwo"><h5>Required Units</h5>${hand.units_required}</div>
                    <div class="handDivTwo"><h5>Accepted Donor</h5>${hand.accepted_by_donor?.name || 'Not accepted yet'}</div>
                    <div class="handDivTwo"><h5>Status</h5>${hand.status}</div> 
                    </div>`
                ).join('');
            } else {
                handleRequest.innerHTML = "<h4>No requests is handled  yet</h4>";
            }

        }

        else if (response.status === 401 || response.status == 403) {
            alert(result.message);
            // logoutUser();
        }
    }

    catch (error) {
        console.log(error);
        alert("Connection lost with server");
    }
}

loadDashboard(); // When page starts to load fetch the data