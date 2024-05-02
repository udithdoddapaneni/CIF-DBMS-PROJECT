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

// get the value of urk parameter ?equipment=something
function getURLParameter(name) {
  return (
    decodeURIComponent(
      (new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(
        location.search
      ) || [null, ""])[1].replace(/\+/g, "%20")
    ) || null
  );
}

// console.log(getURLParameter("equipment"));

function trackRequest() {
  const token = getCookie();

  const requestData = {
    token: token,
    name: getURLParameter("equipment"),
  };
  console.log(JSON.stringify(requestData));

  // Fetch data from the server
  fetch("http://10.128.6.196:8000/get_ids_by_equipment_name", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())
    .then((data) => {
      /*
    response format:{
  "message": [
    {
      "equipment_id": "c0101",
      "location": "computer lab 1"
    },
    {
      "equipment_id": "c0102",
      "location": "computer lab 1"
    },
    {
      "equipment_id": "c0201",
      "location": "computer lab 2"
    },
    {
      "equipment_id": "c0202",
      "location": "computer lab 2"
    }
  ]
}
        */
      //    div name is books put a cool looking table
      const table = document.getElementById("books");
      const message = data.message;
      message.forEach((element) => {
        // add a div with the equipment id and location and a button to request with proper padding and styling
        const div = document.createElement("div");
        div.classList.add("book");
        div.innerHTML = `
        <h3>Equipment ID: ${element.equipment_id}</h3>
        <p>Location: ${element.location}</p>
        <button class="request-button" style="
            padding: 8px 16px;
            background-color: #333;
            color: #fff;
            border: none;
            cursor: pointer;
            margin-top: 10px;
          ">Show Slots</button>
          <div id="slots" ></div>
        `;
        table.appendChild(div);

        // add event listener to the button
        const button = div.querySelector("button");
        button.addEventListener("click", () => {
          // send a request to the server to book the equipment
          const requestData = {
            token: token,
            ID: element.equipment_id,
          };
          fetch("http://10.128.6.196:8000/show_available_slots_equipment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          })
            .then((response) => response.json())
            .then((data) => {
              const message = data.message;
              const slots = div.querySelector("#slots");
              slots.innerHTML = "";
              //  show Slot id and slot time and a button to book
              message.forEach((slot) => {
                const slotDiv = document.createElement("div");
                slotDiv.classList.add("slot");
                slotDiv.innerHTML = `
                    <p>Slot ID: ${slot.slot_id}</p>
                    <p>Slot Time: ${slot.slot_time}</p>`;
                // add a input field for the project id
                const input = document.createElement("input");
                input.placeholder = "Project ID";
                input.style = `
                    padding: 8px 16px;
                    margin-top: 10px;
                    width: 97%;

                  `;
                slotDiv.appendChild(input);

                slots.appendChild(slotDiv);
                const slotButton = document.createElement("button");
                slotButton.classList.add("request-button");
                slotButton.textContent = "Book";
                slotButton.style = `
                    padding: 8px 16px;
                    background-color: #333;
                    color: #fff;
                    border: none;
                    cursor: pointer;
                    margin-top: 10px;
                  `;
                slotDiv.appendChild(slotButton);
                slotButton.addEventListener("click", () => {
                  const project_id = input.value;
                  const requestData = {
                    // {
                    //   "token": "string",
                    //   "slot_ID": 0,
                    //   "project_ID": "string"
                    // }
                    token: token,
                    slot_ID: slot.slot_id,
                    project_ID: project_id,
                  };

                  console.log(JSON.stringify(requestData));
                  fetch("http://10.128.6.196:8000/request_a_slot_for_project", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestData),
                  })
                    .then((response) => response.json())
                    .then((data) => {
                      if (data.message === "success") {
                        alert("Request sent successfully");
                        // REDIRECT TO THE MAIN PAGE
                        window.location.href = "main.html";
                      } else {
                        alert("Failed to book slot");
                      }
                    })
                    .catch((error) => {
                      alert("An error occurred while sending the request.");
                      console.error(error);
                    });
                });
              });
            })
            .catch((error) => {
              alert("An error occurred while sending the request.");
              console.error(error);
            });
        });
      });
    })
    .catch((error) => {
      alert("An error occurred while fetching request status.");
      console.error(error);
    });
}

trackRequest();
