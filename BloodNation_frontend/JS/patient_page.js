const profile = document.getElementById('profilePat');
const bloodStock = document.getElementById('bloodStockPat');
const myRequest = document.getElementById('requestPat');
const heading = document.querySelector('h2');

document.getElementById('logoutPat').addEventListener('click', logoutUser);


async function loadDashboard() {
    try {
        const response = await authFetch('/api/patient/dashboard/', {
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
                    <div class="proDivTwo"><h5>Address</h5>${pro.city || 'Not Provided'}</div>
                    <div class="proDivTwo"><h5>Blood Group</h5>${pro.blood_group_required}</div>
                    <div class="proDivTwo"><h5>Admit Hospital</h5>${pro.current_hospital.name || pro.hospital_details?.name || 'None'}</div> 
                    <div class="proDivTwo"><h5>Disease History</h5>${pro.disease_history || 'None'}</div> 
                    </div>`
            }

            if (Array.isArray(result.hospital_blood_stock) && result.hospital_blood_stock.length > 0) {
                bloodStock.innerHTML = result.hospital_blood_stock.map(blood => `
                    <h4>${blood.blood_group}</h4>
                    <div class="bloodDivOne"> 
            <div class="bloodDivTwo"><h5>Units</h5>${blood.quantity_in_units}</div>
            <div class="bloodDivTwo"><h5>Hospital</h5>${blood.hospital_details?.name || blood.hospital?.name || blood.hospital || 'N/A'}</div>
            <div class="bloodDivTwo"><h5>Contact</h5>${blood.hospital_details?.contact_number || blood.hospital?.contact_number || 'N/A'}</div>
            <div class="bloodDivTwo"><h5>Address</h5>${blood.hospital_details?.address || blood.hospital?.address || 'N/A'}</div>
                    </div>`
                ).join('');
            } else {
                bloodStock.innerHTML = "<h4>No stock is available</h4>";
            }

            if (Array.isArray(result.my_requests) && result.my_requests.length > 0) {
                myRequest.innerHTML = result.my_requests.map(req => `
                    <h4>${req.blood_group_required}</h4>
                    <div class="reqDivOne">
                    <div class="reqDivTwo"><h5>Units</h5>${req.units_required}</div>
                    <div class="reqDivTwo"><h5>Hospital</h5>${req.hospital_details?.name || req.hospital?.name || 'N/A'}</div>
                    <div class="reqDivTwo"><h5>Contact</h5>${req.hospital_details?.contact_number || req.hospital?.contact_number || 'N/A'}</div>
                    <div class="reqDivTwo"><h5>Address</h5>${req.hospital_details?.address || req.hospital?.address || 'N/A'}</div>
                    <div class="reqDivTwo"><h5>Doctor</h5>${req.assigned_doctor?.name || 'Not Assigned'}</div>
                    <div class="reqDivTwo"><h5>Donor</h5>${req.accepted_by_donor?.name || 'Waiting for Donor'}</div>
                    <div class="reqDivTwo"><h5>Date</h5>${req.patient_delivery_date ? new Date(req.patient_delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not Scheduled'}</div>
                    <div class="reqDivTwo"><h5>Status</h5>${req.status}</div>
                    </div>`
                ).join('');
            } else {
                myRequest.innerHTML = "<h4>No request is registered yet</h4>";
            }
        }

        else if (response.status == 401 || response.status == 403) {
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
