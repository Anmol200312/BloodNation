const profile = document.getElementById('profilePat');
const bloodStock = document.getElementById('bloodStockPat');
const myRequest = document.getElementById('requestPat');
const heading = document.querySelector('h2');


let allBloodStock = [];
let allMyRequest = [];


document.getElementById('logoutPat').addEventListener('click', logoutUser);

const inputBlood = document.getElementById('inputBlood');
const inputReq = document.getElementById('inputReq');


inputBlood.addEventListener('input', (e) => {
    let value = e.target.value.toLowerCase().trim();
    let filteredData = allBloodStock.filter(stock => {
        return (
            stock.blood_group?.toLowerCase().includes(value) ||
            String(stock.quantity_in_units).includes(value) ||
            String(stock.hospital_details?.contact_number).includes(value) ||
            stock.hospital_details?.address?.toLowerCase().includes(value)
        )
    });
    renderBloodStock(filteredData);
})

inputReq.addEventListener('input', (e) => {
    value = e.target.value.toLowerCase().trim();
    let filteredData = allMyRequest.filter(req => {
        return (
            req.blood_group_required.toLowerCase().includes(value) ||
            String(req.units_required).includes(value) ||
            req.patient_name?.name?.toLowerCase().includes(value) ||
            req.accepted_by_donor?.name?.toLowerCase().includes(value) ||
            req.donation_location.toLowerCase().includes(value) ||
            req.status.toLowerCase().includes(value)
        )
    });
    renderBloodRequest(filteredData);
})


function renderBloodStock(data) {
    if (Array.isArray(data) && data.length > 0) {
        bloodStock.innerHTML = data.map(blood => `
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
}

function renderBloodRequest(data) {
    if (Array.isArray(data) && data.length > 0) {
        myRequest.innerHTML = data.map(req => `
                    <h4>${req.blood_group_required}</h4>
                    <div class="reqDivOne">
                    <div class="reqDivTwo"><h5>Units</h5>${req.units_required}</div>
                    <div class="reqDivTwo"><h5>Patient Name</h5>${req.patient?.name}</div>
                    <div class="reqDivTwo"><h5>Donor Name</h5>${req.accepted_by_donor?.name || 'Not Accepted Yet'}</div>
                    <div class="reqDivTwo"><h5>Donation Location</h5>${req.donation_location}</div>
                    <div class="reqDivTwo"><h5>Status</h5>${req.status}</div>
                    </div>`
        ).join('');
    } else {
        myRequest.innerHTML = "<h4>No request is registered yet</h4>";
    }
}




async function loadDashboard() {
    try {
        const response = await authFetch('/api/patient/dashboard/', {
            method: "GET",
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
                    <div class="proDivTwo"><h5>Admit Hospital</h5>${pro.current_hospital?.name || pro.hospital_details?.name || 'None'}</div> 
                    <div class="proDivTwo"><h5>Disease History</h5>${pro.disease_history || 'None'}</div> 
                    </div>`
            }

            allBloodStock = result.hospital_blood_stock;
            allMyRequest = result.my_requests;


            renderBloodStock(allBloodStock);
            renderBloodRequest(allMyRequest);

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







