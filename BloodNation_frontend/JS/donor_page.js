const profile = document.getElementById('profileDon');
const matchRequest = document.getElementById('matchDon');
const myDonation = document.getElementById('donationDon');
const heading = document.querySelector('h2');

document.getElementById('logoutDon').addEventListener('click', logoutUser);


async function loadDashboard() {
    try {
        const response = await authFetch('/api/donor/dashboard/', {
            method: "GET"
        });

        const result = await response.json();

        if (response.status == 200) {
            heading.textContent = `${result.profile.name} Dashboard`;
            const pro = Array.isArray(result.profile) ? result.profile[0] : result.profile;
            if (pro) {
                profile.innerHTML = `
                    <h4>${pro.name}</h4>
                    <div class="proDivOne">
                    <div class="proDivTwo"><h5>Email</h5>${pro.email || 'N/A'}</div>
                    <div class="proDivTwo"><h5>Address</h5>${pro.address || 'Not Provided'}</div>
                    <div class="proDivTwo"><h5>Blood Group</h5>${pro.blood_group}</div>
                    <div class="proDivTwo"><h5>Admit Hospital</h5>${pro.hospital_details?.name || 'None'}</div> 
                    <div class="proDivTwo"><h5>Disease History</h5>${pro.disease_history || 'None'}</div> 
                    <div class="proDivTwo"><h5>Is eligible</h5>${pro.is_eligible ? 'Yes' : 'No'}</div> 
                    <div class="proDivTwo"><h5>Last Donation</h5>${pro.last_donation_date || 'Never'}</div> 
                    </div>`
            }

            if (Array.isArray(result.matching_requests) && result.matching_requests.length > 0) {
                matchRequest.innerHTML = result.matching_requests.map(req => `
                    <h4>${req.blood_group_required}</h4>
                    <div class="reqDivOne">
                    <div class="reqDivTwo"><h5>Units</h5>${req.units_required}</div>
                    <div class="reqDivTwo"><h5>Patient Name</h5>${req.patient.name || 'N/A'}</div>
                    <div class="reqDivTwo"><h5>Hospital</h5>${req.hospital?.name || req.hospital || 'N/A'}</div>
                    <div class="reqDivTwo"><h5>Donation Location</h5>${req.donation_location}</div>
                    <div class="reqDivTwo"><h5>Status</h5>${req.status}</div>
                    </div>`
                ).join('');
            } else {
                matchRequest.innerHTML = "<h4>No request is registered yet</h4>";
            }

            if (Array.isArray(result.my_accepted_donations) && result.my_accepted_donations.length > 0) {
                myDonation.innerHTML = result.my_accepted_donations.map(my => `
                    <h4>${my.blood_group_required} ${my.units_required}</h4>
                    <div class="myDivOne">
                    <div class="myDivTwo"><h5>Hospital</h5>${my.hospital.name}</div>
                    <div class="myDivTwo"><h5>Hospital Contact</h5>${my.hospital?.contact_number || 'N/A'}</div>
                    <div class="myDivTwo"><h5>Donation Location</h5>${my.donation_location}</div>
                    <div class="myDivTwo"><h5>Patient Name</h5>${my.patient.name}</div>
                    <div class="myDivTwo"><h5>Assigned Doctor</h5>${my.assigned_doctor?.name || 'Not Assigned'}</div>
                    <div class="myDivTwo"><h5>Donation Type</h5>${my.donation_location === 'home' ? 'Home Collection' : 'Hospital'}</div>
                    <div class="reqDivTwo"><h5>Appointment Date</h5>${my.donor_appointment_date ? new Date(my.donor_appointment_date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Not Scheduled Yet'}</div>
                    </div>`
                ).join('');
            } else {
                myDonation.innerHTML = "<h4>No request is registered yet</h4>";
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
