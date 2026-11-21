BACKEND_URL = 'http://127.0.0.1:8000';

async function authFetch(endpoints, options = {}) {  // endpoints is the url of the api path and options is the object that contains all the info of api
    let accessToken = localStorage.getItem('access_token'); // taking the access_token form localStorage and storing in var

    options.headers = {  // from options object taking header object
        ...options.headers,  // unpacking all the objects of headers
        'Authorization': `Bearer ${accessToken}`  // putting the accessToken in Authorization
    };

    if (!(options.body instanceof FormData)) {
        options.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(BACKEND_URL + endpoints, options);  // getting the accessToken header from  the endpoint
    if (response.status == 401) {  // if accessToken is expired 
        const refreshToken = localStorage.getItem('refresh_token');  // find the refresh_token

        if (!refreshToken) {  // if not refreshToken
            logoutUser();
            return response;
        }

        const refreshResponse = await fetch(`${BACKEND_URL}/api/token/refresh/`, {   // sending the refreshToken to the refresh api to create new access_token
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh: refreshToken })
        });

        if (refreshResponse.status == 200) {
            const data = await refreshResponse.json();
            localStorage.setItem('access_token', data.access); // updating access_token with the response's data object access key

            if (data.refresh) {
                localStorage.setItem('refresh_token', data.refresh)
            }

            options.headers['Authorization'] = `Bearer ${data.access}`; // update the options objectAuthorization with new access_token
            const responseBackend = await fetch(BACKEND_URL + endpoints, options);  // send the options object to the endpoint api
            return responseBackend;
        }
        else {
            alert("Session expired.Please login again");
            logoutUser();
            return refreshResponse;
        }
    }
    return response;
}


function logoutUser() {
    localStorage.clear();
    window.location.href = 'login.html';
}