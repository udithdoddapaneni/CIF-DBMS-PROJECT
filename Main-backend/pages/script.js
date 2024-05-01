
function setCookie(name, value, days = 1) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get the value of a cookie
function getCookie() {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        // Check if the cookie is not empty
        if (cookie) {
            return cookie.split('=')[0];
        }
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent default form submission

    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;

    try {
        const response = await login(username, password);
        if (getCookie() != null){
            return;
        }
        if (response.message === "Cookie is set on the browser") {
            setCookie(response.Token, response.Token)
            window.location.href = "main.html"; // Redirect to main page or any other page
        } else {
            alert("Login failed. Please check your credentials.");
        }
    } catch (error) {
        console.error("Error occurred during login:", error);
        alert("An error occurred during login. Please try again later.");
    }
});

async function login(username, password) {
    const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });
    return response.json();
}

async function logout(){
    const token = getCookie();
    if (token == null){
        console.log("no active session")
        return
    }
    const response = await fetch('http://127.0.0.1:8000/logout',{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
    })
    const response_data = await response.json()
    console.log(response_data)
    deleteCookie(token)
    alert(response_data.message)
    window.location.href = "login.html"
}

async function show_current_user(){
    const token = getCookie();
    const response = await fetch('http://127.0.0.1:8000/current_user',{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
    })
    const response_data = await response.json()
    // console.log(response_data)
    // alert(response_data.message)
    // <div class="current-user">show current user:-</div>
    // Write the current user to the page
    const currentUser = document.querySelector('.current-user');
    currentUser.textContent = `User: ${response_data.message}`;


}

async function fetchAndDisplayEquipments() {
    try {
        const token = getCookie();
        const response = await fetch('http://127.0.0.1:8000/show_all_equipments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        if (!response.ok) {
            throw new Error("Failed to fetch equipment data");
        }

        const data = await response.json();
        const equipmentList = data.message; // Array of objects with `equipment_name`

        // Get the table body element
        const tableBody = document.getElementById('equipmentTableBody');
        tableBody.innerHTML = ''; // Clear any existing rows

        // Loop through the equipment objects and create rows
        equipmentList.forEach(item => {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.textContent = item.equipment_name;
            cell.style.border = '1px solid #333';
            cell.style.padding = '8px';
            row.appendChild(cell);
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error fetching equipment data:', error);
        alert('Failed to fetch equipment data. Please try again later.');
    }
}
