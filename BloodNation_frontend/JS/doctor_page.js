const profile = document.getElementById('profileDoc');
const bloodStock = document.getElementById('bloodStockDoc');
const bloodRequest = document.getElementById('requestDoc');
const handleRequest = document.getElementById('handleReqDoc');
const title = document.querySelector('h2');


let allBloodStock = [];
let allBloodRequest = [];
let allHandleRequest = [];


document.getElementById('logoutDoc').addEventListener('click', logoutUser);

const inputStock = document.getElementById('inputStock');
const inputReq = document.getElementById('inputReq');
const inputHand = document.getElementById('inputHand');

inputStock.addEventListener('input', (e) => {
    let value = e.target.value.toLowerCase().trim();
    let filteredData = allBloodStock.filter(stock => {
        let formattedDate = new Date(stock.last_updated).toLocaleDateString('en-IN', { 'day': 'numeric', month: 'short', 'year': 'numeric' })
        return (
            stock.blood_group?.toLowerCase().includes(value) ||
            String(stock.quantity_in_units).includes(value) ||
            formattedDate.toLowerCase().includes(value)
        )
    });
    renderBloodStock(filteredData);
})

inputReq.addEventListener('input', (e) => {
    value = e.target.value.toLowerCase().trim();
    let filteredData = allBloodRequest.filter(req => {
        return (
            req.blood_group_required.toLowerCase().includes(value) ||
            String(req.units_required).includes(value) ||
            req.patient_name.toLowerCase().includes(value) ||
            req.accepted_by_donor?.name.toLowerCase().includes(value) ||
            req.donation_location.toLowerCase().includes(value)
        )
    });
    renderBloodRequest(filteredData);
})

inputHand.addEventListener('input', (e) => {
    value = e.target.value.toLowerCase().trim();
    let filteredData = allBloodRequest.filter(hand => {
        return (
            hand.blood_group_required.toLowerCase().includes(value) ||
            hand.patient?.name.toLowerCase().includes(value) ||
            hand.accepted_by_donor?.name.toLowerCase().includes(value) ||
            String(hand.units_required).includes(value)
        )
    });
    renderHandleRequest(filteredData);
})


function renderBloodStock(data) {
    if (Array.isArray(data) && data.length > 0) {
        bloodStock.innerHTML = data.map(blood => `
                    <h4>${blood.blood_group}</h4>
                    <div class="bloodDivOne">
                    <div class="bloodDivTwo"><h5>Quantity Units</h5>${blood.quantity_in_units}</div>
                    <div class="bloodDivTwo"><h5>Last Updated</h5>${new Date(blood.last_updated).toLocaleDateString('en-IN', { 'day': 'numeric', month: 'short', 'year': 'numeric' })}</div>
                    </div>`
        ).join('');
    } else {
        bloodStock.innerHTML = "<h4>No blood is registered yet</h4>";
    }
}

function renderBloodRequest(data) {
    if (Array.isArray(data) && data.length > 0) {
        bloodRequest.innerHTML = data.map(req => `
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
        bloodRequest.innerHTML = "<h4>No request is registered yet</h4>";
    }
}

function renderHandleRequest(data) {
    if (Array.isArray(data) && data.length > 0) {
        handleRequest.innerHTML = data.map(hand => `
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

            allBloodRequest = result.hospital_requests;
            allBloodStock = result.hospital_blood_stock;
            allHandleRequest = result.my_handled_requests;

            renderBloodStock(allBloodStock);
            renderBloodRequest(allBloodRequest);
            renderHandleRequest(allHandleRequest);

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







