function setCookie(name, value, days = 1) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get the value of a cookie
function getCookie() {
  var cookies = document.cookie.split(";");
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i].trim();
    // Check if the cookie is not empty
    if (cookie) {
      return cookie.split("=")[0];
    }
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const username = document.getElementById("usernameInput").value;
    const password = document.getElementById("passwordInput").value;

    try {
      const response = await login(username, password);
      if (getCookie() != null) {
        return;
      }
      if (response.message === "Cookie is set on the browser") {
        setCookie(response.Token, response.Token);
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
  const response = await fetch("https://cif-portal.dhruvadeep.cloud/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  return response.json();
}

async function logout() {
  const token = getCookie();
  if (token == null) {
    console.log("no active session");
    return;
  }
  const response = await fetch("https://cif-portal.dhruvadeep.cloud/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });
  const response_data = await response.json();
  console.log(response_data);
  deleteCookie(token);
  alert(response_data.message);
  window.location.href = "login.html";
}

async function show_current_user() {
  const token = getCookie();
  const response = await fetch(
    "https://cif-portal.dhruvadeep.cloud/current_user",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    }
  );
  const response_data = await response.json();
  // console.log(response_data)
  // alert(response_data.message)
  // <div class="current-user">show current user:-</div>
  // Write the current user to the page
  const currentUser = document.querySelector(".current-user");
  currentUser.textContent = `User: ${response_data.message}`;
}
async function fetchAndDisplayEquipments() {
  try {
    const token = getCookie();
    const response = await fetch(
      "https://cif-portal.dhruvadeep.cloud/show_all_equipments",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch equipment data");
    }

    const data = await response.json();
    const equipmentList = data.message; // Array of objects with `equipment_name`

    // Get the table body element
    const tableBody = document.getElementById("equipmentTableBody");
    tableBody.innerHTML = ""; // Clear any existing rows

    // Loop through the equipment objects and create rows
    equipmentList.forEach((item) => {
      const row = document.createElement("tr");

      // Equipment name cell
      const nameCell = document.createElement("td");
      nameCell.textContent = item.equipment_name.toUpperCase(); // Capitalize the name
      nameCell.style.border = "1px solid #333";
      nameCell.style.padding = "8px";
      nameCell.style.fontWeight = "bold"; // Bold the name
      row.appendChild(nameCell);

      // Book button cell
      const buttonCell = document.createElement("td");
      buttonCell.style.border = "1px solid #333";
      buttonCell.style.padding = "8px";

      const button = document.createElement("button");
      button.textContent = "Book";
      button.style.padding = "5px 10px";
      button.style.marginLeft = "10px"; // Add some spacing between name and button
      button.onclick = () => bookEquipment(item.equipment_name); // Replace with actual booking logic
      buttonCell.appendChild(button);

      row.appendChild(buttonCell);
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching equipment data:", error);
    alert("Failed to fetch equipment data. Please try again later.");
  }
}

// Placeholder function for booking logic
function bookEquipment(equipmentName) {
  //   go to the booking page
  window.location.href = "booking.html?equipment=" + equipmentName;
}

function trackRequest() {
  const token = getCookie();
  const requestIdInput = document.getElementById("requestIdInput");
  const requestId = requestIdInput.value;

  // Clear previous results
  document.getElementById("reqId").textContent = "";
  document.getElementById("reqDate").textContent = "";
  document.getElementById("reqApproved").textContent = "";

  if (!requestId) {
    alert("Please enter a Request ID.");
    return;
  }

  const requestData = {
    token: token,
    request_id: parseInt(requestId),
  };

  // Fetch data from the server
  fetch("https://cif-portal.dhruvadeep.cloud/check_status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "ERROR") {
        const requestInfoDiv = document.getElementById("requestInfo");
        requestInfoDiv.classList.add("hidden");
        alert("Error fetching request status.");
      } else {
        const requestInfoDiv = document.getElementById("requestInfo");
        requestInfoDiv.classList.remove("hidden");
        // console.log(data.message[0].status);
        // Update the DOM with fetched data
        document.getElementById("reqId").textContent = requestId;
        document.getElementById("reqDate").textContent =
          new Date().toLocaleDateString();
        document.getElementById("reqApproved").textContent =
          data.message[0].status;
      }
    })
    .catch((error) => {
      alert("An error occurred while fetching request status.");
      console.error(error);
    });
}

// for supervisor show all pendng requests
// <div id="showPendingSuper"></div>
function showPendingRequestsSuper() {
  const token = getCookie();
  const requestData = {
    token: token,
  };

  fetch("https://cif-portal.dhruvadeep.cloud/show_requests_supervisor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())

    .then((data) => {
      console.log(data);
      const container = document.getElementById("showPendingSuper");
      container.innerHTML = "";
      data.message.forEach((request) => {
        const requestDiv = document.createElement("div");
        requestDiv.classList.add("request-item");

        const requestIdPara = document.createElement("p");
        requestIdPara.textContent = `Request ID: ${request.request_id}`;

        const slotIdPara = document.createElement("p");
        slotIdPara.textContent = `Slot ID: ${request.slot_id}`;

        const equipmentIdPara = document.createElement("p");
        equipmentIdPara.textContent = `Equipment Name: ${request.equipment_name}`;

        const slotTimePara = document.createElement("p");
        slotTimePara.textContent = `Slot Time: ${request.slot_time}`;

        requestDiv.appendChild(requestIdPara);
        requestDiv.appendChild(slotIdPara);
        requestDiv.appendChild(equipmentIdPara);
        requestDiv.appendChild(slotTimePara);

        container.appendChild(requestDiv);

        // add two buttons to approve or reject the request
        const approveButton = document.createElement("button");
        approveButton.textContent = "Approve";
        approveButton.style = `
            padding: 8px 16px;
            background-color: green;
            color: #fff;
            border: none;
            cursor: pointer;
            margin-top: 10px;
            margin-right: 10px;
            margin-bottom: 10px;
          `;
        requestDiv.appendChild(approveButton);
        approveButton.addEventListener("click", () => {
          approveRequest(request.request_id);
        });

        const rejectButton = document.createElement("button");
        rejectButton.textContent = "Reject";
        rejectButton.style = `
            padding: 8px 16px;
            background-color: red;
            color: #fff;
            border: none;
            cursor: pointer;
            margin-top: 10px;
          `;
        requestDiv.appendChild(rejectButton);
        rejectButton.addEventListener("click", () => {
          rejectRequest(request.request_id);
        });
      });
    });
}

function approveRequest(requestId) {
  const token = getCookie();
  const requestData = {
    token: token,
    request_id: requestId,
    decision: "approved",
  };

  fetch("https://cif-portal.dhruvadeep.cloud/decide_by_super_visor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Request approved successfully.");
      showPendingRequestsSuper();
    })
    .catch((error) => {
      alert("An error occurred while approving the request.");
      console.error(error);
    });
}

function rejectRequest(requestId) {
  const token = getCookie();
  const requestData = {
    token: token,
    request_id: requestId,
    decision: "rejected",
  };

  fetch("https://cif-portal.dhruvadeep.cloud/decide_by_super_visor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Request rejected successfully.");
      showPendingRequestsSuper();
    })
    .catch((error) => {
      alert("An error occurred while approving the request.");
      console.error(error);
    });
}

function showPendingRequestsIn() {
  const token = getCookie();
  const requestData = {
    token: token,
  };

  fetch("https://cif-portal.dhruvadeep.cloud/show_requests_faculty_incharge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())

    .then((data) => {
      console.log(data);
      const container = document.getElementById("showPendingIn");
      container.innerHTML = "";
      data.message.forEach((request) => {
        const requestDiv = document.createElement("div");
        requestDiv.classList.add("request-item");

        const requestIdPara = document.createElement("p");
        requestIdPara.textContent = `Request ID: ${request.request_id}`;

        const slotIdPara = document.createElement("p");
        slotIdPara.textContent = `Slot ID: ${request.slot_id}`;

        const equipmentIdPara = document.createElement("p");
        equipmentIdPara.textContent = `Equipment Name: ${request.equipment_name}`;

        const slotTimePara = document.createElement("p");
        slotTimePara.textContent = `Slot Time: ${request.slot_time}`;

        requestDiv.appendChild(requestIdPara);
        requestDiv.appendChild(slotIdPara);
        requestDiv.appendChild(equipmentIdPara);
        requestDiv.appendChild(slotTimePara);

        container.appendChild(requestDiv);

        // add two buttons to approve or reject the request
        const approveButton = document.createElement("button");
        approveButton.textContent = "Approve";
        approveButton.style = `
            padding: 8px 16px;
            background-color: green;
            color: #fff;
            border: none;
            cursor: pointer;
            margin-top: 10px;
            margin-right: 10px;
            margin-bottom: 10px;
          `;
        requestDiv.appendChild(approveButton);
        approveButton.addEventListener("click", () => {
          approveRequestIN(request.request_id);
        });

        const rejectButton = document.createElement("button");
        rejectButton.textContent = "Reject";
        rejectButton.style = `
            padding: 8px 16px;
            background-color: red;
            color: #fff;
            border: none;
            cursor: pointer;
            margin-top: 10px;
          `;
        requestDiv.appendChild(rejectButton);
        rejectButton.addEventListener("click", () => {
          rejectRequestIN(request.request_id);
        });
      });
    });
}

function approveRequestIN(requestId) {
  const token = getCookie();
  const requestData = {
    token: token,
    request_id: requestId,
    decision: "approved",
  };

  fetch("https://cif-portal.dhruvadeep.cloud/decide_by_faculty_incharge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Request approved successfully.");
      showPendingRequestsIn();
    })
    .catch((error) => {
      alert("An error occurred while approving the request.");
      console.error(error);
    });
}

function rejectRequestIN(requestId) {
  const token = getCookie();
  const requestData = {
    token: token,
    request_id: requestId,
    decision: "rejected",
  };

  fetch("https://cif-portal.dhruvadeep.cloud/decide_by_faculty_incharge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Request rejected successfully.");
      showPendingRequestsIn();
    })
    .catch((error) => {
      alert("An error occurred while approving the request.");
      console.error(error);
    });
}

// Staff
function showPendingRequestsStaff() {
  const token = getCookie();
  const requestData = {
    token: token,
  };

  fetch("https://cif-portal.dhruvadeep.cloud/show_requests_staff_incharge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())

    .then((data) => {
      console.log(data);
      const container = document.getElementById("showPendingStaff");
      container.innerHTML = "";
      data.message.forEach((request) => {
        const requestDiv = document.createElement("div");
        requestDiv.classList.add("request-item");

        const requestIdPara = document.createElement("p");
        requestIdPara.textContent = `Request ID: ${request.request_id}`;

        const slotIdPara = document.createElement("p");
        slotIdPara.textContent = `Slot ID: ${request.slot_id}`;

        const equipmentIdPara = document.createElement("p");
        equipmentIdPara.textContent = `Equipment Name: ${request.equipment_name}`;

        const slotTimePara = document.createElement("p");
        slotTimePara.textContent = `Slot Time: ${request.slot_time}`;

        requestDiv.appendChild(requestIdPara);
        requestDiv.appendChild(slotIdPara);
        requestDiv.appendChild(equipmentIdPara);
        requestDiv.appendChild(slotTimePara);

        container.appendChild(requestDiv);

        // add two buttons to approve or reject the request
        const approveButton = document.createElement("button");
        approveButton.textContent = "Approve";
        approveButton.style = `
            padding: 8px 16px;
            background-color: green;
            color: #fff;
            border: none;
            cursor: pointer;
            margin-top: 10px;
            margin-right: 10px;
            margin-bottom: 10px;
          `;
        requestDiv.appendChild(approveButton);
        approveButton.addEventListener("click", () => {
          approveRequestStaff(request.request_id);
        });

        const rejectButton = document.createElement("button");
        rejectButton.textContent = "Reject";
        rejectButton.style = `
            padding: 8px 16px;
            background-color: red;
            color: #fff;
            border: none;
            cursor: pointer;
            margin-top: 10px;
          `;
        requestDiv.appendChild(rejectButton);
        rejectButton.addEventListener("click", () => {
          rejectRequestStaff(request.request_id);
        });
      });
    });
}

function approveRequestStaff(requestId) {
  const token = getCookie();
  const requestData = {
    token: token,
    request_id: requestId,
    decision: "approved",
  };

  fetch("https://cif-portal.dhruvadeep.cloud/decide_by_staff_incharge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Request approved successfully.");
      showPendingRequestsStaff();
    })
    .catch((error) => {
      alert("An error occurred while approving the request.");
      console.error(error);
    });
}

function rejectRequestStaff(requestId) {
  const token = getCookie();
  const requestData = {
    token: token,
    request_id: requestId,
    decision: "rejected",
  };

  fetch("https://cif-portal.dhruvadeep.cloud/decide_by_staff_incharge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Request rejected successfully.");
      showPendingRequestsStaff();
    })
    .catch((error) => {
      alert("An error occurred while approving the request.");
      console.error(error);
    });
}

// Show all requests of the current user
// Show all requests of the current user
async function showRequestsAll() {
  const token = getCookie();
  const requestData = {
    token: token,
  };

  try {
    // Fetch data from the server
    const response = await fetch(
      "https://cif-portal.dhruvadeep.cloud/show_requests_student",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch requests data");
    }

    const data = await response.json();

    // Get the container where the request information will be displayed
    const container = document.getElementById("requestInfo2");

    // Clear any existing content
    container.innerHTML = "";

    // Loop through each request item and create a div for it
    data.message.forEach((request) => {
      const requestDiv = document.createElement("div");
      requestDiv.classList.add("request-item");

      const requestIdPara = document.createElement("p");
      requestIdPara.textContent = `Request ID: ${request.request_id}`;

      const slotIdPara = document.createElement("p");
      slotIdPara.textContent = `Slot ID: ${request.slot_id}`;

      const equipmentIdPara = document.createElement("p");
      equipmentIdPara.textContent = `Equipment ID: ${request.equipment_id}`;

      const projIdPara = document.createElement("p");
      projIdPara.textContent = `Project ID: ${request.proj_id}`;

      const slotTimePara = document.createElement("p");
      slotTimePara.textContent = `Slot Time: ${request.slot_time}`;

      // Append all paragraphs to the requestDiv
      requestDiv.appendChild(requestIdPara);
      requestDiv.appendChild(slotIdPara);
      requestDiv.appendChild(equipmentIdPara);
      requestDiv.appendChild(projIdPara);
      requestDiv.appendChild(slotTimePara);

      // Append the requestDiv to the container
      container.appendChild(requestDiv);
    });
  } catch (error) {
    console.error("Error fetching request data:", error);
    alert("Failed to fetch request data. Please try again later.");
  }
}

async function checkUser() {
  const token = getCookie();

  //   const response = fetch("http://10.32.9.245:8000/is_member_of", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ token }),
  //   });

  //   const data = response.json();
  //   const message = data.message;
  //   console.log(message);
  try {
    const response = await fetch(
      "https://cif-portal.dhruvadeep.cloud/is_member_of",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      }
    );
    const data = await response.json();
    const message = data.message;
    console.log(message);
    if (message === "faculty") {
      window.location.href = "faculty.html";
    } else if (message === "staff") {
      window.location.href = "staff.html";
    }

    // if (message === "student") {
    //     window.location.href = "student.html";
    // } else if (message === "faculty") {
    //     window.location.href = "faculty.html";
    // } else if (message === "admin") {
    //     window.location.href = "admin.html";
    // } else {
    //     window.location.href = "login.html";
    // }
  } catch (error) {
    console.error("Error occurred during login:", error);
    alert("An error occurred during login. Please try again later.");
  }
}

checkUser();
