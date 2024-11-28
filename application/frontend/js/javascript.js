var currentDate = new Date();
var eventList = {}; // Stores events by date in the format "YYYY-MM-DD"

// Fetch JSON file and populate events
fetch('../../../DB/sportData.json') // Adjust path as needed
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch JSON data");
        }
        return response.json();
    })
    .then(data => {
        populateEvents(data.data); // Extract `data` array from the JSON file
        loadFromLocalStorage(); // Load locally stored events
        drawCalendar(); // Render calendar after loading events
    })
    .catch(error => {
        console.error("Error fetching or processing JSON data:", error);
    });

// Populate events
function populateEvents(events) {
    events.forEach(event => {
        const dateKey = event.dateVenue?.trim(); // Format: YYYY-MM-DD
        if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) { // Prüfe auf korrektes Datumformat
            console.error(`Invalid date format for event:`, event);
            return; // Überspringe ungültige Einträge
        }

        if (!eventList[dateKey]) {
            eventList[dateKey] = [];
        }

        // Extract event details
        const homeTeam = event.homeTeam?.name || "TBD";
        const awayTeam = event.awayTeam?.name || "TBD";
        const competitionName = event.originCompetitionName || "Unknown Competition";

        // Add the event
        const eventObject = {
            title: `${homeTeam} vs. ${awayTeam}`,
            description: `Competition: ${competitionName}, Stage: ${event.stage.name || "Unknown Stage"}, Time: ${event.timeVenueUTC || "Unknown Time"}`
        };

        console.log(`Adding event:`, eventObject); // Debug
        eventList[dateKey].push(eventObject);
    });

    console.log("Final eventList:", eventList); // Debug
}

// Save data to Local Storage
function saveToLocalStorage() {
    localStorage.setItem("eventList", JSON.stringify(eventList));
}

// Load data from Local Storage
function loadFromLocalStorage() {
    var storedEvents = localStorage.getItem("eventList");
    if (storedEvents) {
        eventList = JSON.parse(storedEvents);
    }
}

// Draw calendar
function drawCalendar() {
    const cal = document.getElementById('calendar');
    const header = document.getElementById('monthYear');

    if (!cal || !header) {
        console.error("Missing calendar or header element");
        return;
    }

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    header.textContent = `${months[month]} ${year}`;
    // Clear previous calendar content except day names
    Array.from(cal.children).forEach(child => {
        if (!child.classList.contains('day-name')) {
            child.remove();
        }
    });
    

    const days = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    const offset = (startDay + 6) % 7;

    console.log(`Generating calendar for ${months[month]} ${year}`);

    // Empty days for alignment
    for (let i = 0; i < offset; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'day empty';
        cal.appendChild(emptyDiv);
    }

    // Actual days of the month
    for (let d = 1; d <= days; d++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        console.log(`Checking dateKey: ${dateKey}`, eventList[dateKey] ? "Match found!" : "No match.");

        const dayBox = document.createElement('div');
        dayBox.className = 'day';
        dayBox.textContent = d;

        // Highlight current day
        if (
            year === new Date().getFullYear() &&
            month === new Date().getMonth() &&
            d === new Date().getDate()
        ) {
            dayBox.style.border = "2px solid red";
        }

        // Highlight days with events
        if (eventList[dateKey]) {
            dayBox.classList.add('event');
        }

        dayBox.addEventListener('click', () => openPopup(dateKey));
        cal.appendChild(dayBox);
    }
}


// Change month
function changeMonth(diff) {
    currentDate.setMonth(currentDate.getMonth() + diff);
    drawCalendar();
}


function openPopup(dateKey) {
    var popup = document.getElementById('eventPopup');
    var popupDate = document.getElementById('popupDate');
    var popupEvents = document.getElementById('popupEvents');
    var form = document.getElementById('addEventForm');
    var eventName = document.getElementById('newEvent');
    var eventDesc = document.getElementById('newEventDescription');
    var cancelBtn = document.getElementById('cancelEvent');
    var closeBtn = document.getElementById('closePopup');

    // Set the date header in the popup
    popupDate.textContent = "Events for " + dateKey;

    // Clear the popup content
    popupEvents.innerHTML = "";

    // Retrieve events for the selected date
    var events = eventList[dateKey] || [];
    console.log(`Events for ${dateKey}:`, events); // Debugging output

    // If no events exist, show a placeholder message
    if (events.length === 0) {
        var noEvents = document.createElement('div');
        noEvents.textContent = "No events for this day.";
        noEvents.style.fontStyle = "italic";
        noEvents.className = "no-events";
        popupEvents.appendChild(noEvents);
    } else {
        // Loop through events and display them
        events.forEach((event, index) => {
            var eventDiv = document.createElement('div');
            eventDiv.className = 'event-item';
            eventDiv.style.marginBottom = "10px";

            // Event Title
            var titleDiv = document.createElement('div');
            titleDiv.textContent = `${index + 1}. ${event.title}`;
            titleDiv.style.fontWeight = "bold";

            // Event Description
            var descDiv = document.createElement('div');
            descDiv.textContent = event.description;
            descDiv.style.fontStyle = "italic";

            // Delete Button
            var delBtn = document.createElement('button');
            delBtn.textContent = "Delete";
            delBtn.style.marginLeft = "10px";
            delBtn.style.backgroundColor = "#FF4C4C";
            delBtn.style.color = "#FFFFFF";
            delBtn.style.border = "none";
            delBtn.style.padding = "5px 10px";
            delBtn.style.cursor = "pointer";
            delBtn.style.borderRadius = "5px";
            delBtn.addEventListener('click', function () {
                // Remove the event and refresh the popup
                events.splice(index, 1);
                if (events.length === 0) delete eventList[dateKey];
                saveToLocalStorage();
                drawCalendar();
                openPopup(dateKey);
            });

            // Append elements to the event container
            eventDiv.appendChild(titleDiv);
            eventDiv.appendChild(descDiv);
            eventDiv.appendChild(delBtn);

            // Add the event to the popup
            popupEvents.appendChild(eventDiv);
        });
    }

    // Add "Add Event" Button
    var addEventBtn = document.createElement('button');
    addEventBtn.textContent = "Add Event";
    addEventBtn.style.marginTop = "10px";
    addEventBtn.style.backgroundColor = "#00FF66";
    addEventBtn.style.color = "#101010";
    addEventBtn.style.border = "none";
    addEventBtn.style.padding = "5px 10px";
    addEventBtn.style.cursor = "pointer";
    addEventBtn.style.borderRadius = "5px";
    addEventBtn.addEventListener('click', function () {
        // Show the form and hide the event list
        popupEvents.style.display = "none";
        form.style.display = "flex";
        closeBtn.style.display = "none";
    });

    popupEvents.appendChild(addEventBtn);

    // Cancel button logic
    cancelBtn.onclick = function () {
        form.style.display = "none"; // Hide the form
        popupEvents.style.display = "block"; // Show the events list
        closeBtn.style.display = "block"; // Show the close button
    };

    // Form submission logic
    form.onsubmit = function (e) {
        e.preventDefault();
        var title = eventName.value.trim();
        var desc = eventDesc.value.trim();
        if (title && desc) {
            if (!eventList[dateKey]) eventList[dateKey] = [];
            eventList[dateKey].push({ title: title, description: desc });
            saveToLocalStorage();
            eventName.value = "";
            eventDesc.value = "";
            drawCalendar();
            openPopup(dateKey);
        }
    };

    // Show the popup
    popup.style.display = "block";
    popupEvents.style.display = "block"; // Ensure the events list is visible
    form.style.display = "none"; // Ensure the form is hidden
    closeBtn.style.display = "block"; // Ensure the close button is visible
}


// Helper to create an element with styles
function createElement(tag, textContent, attributes = {}) {
    var element = document.createElement(tag);
    if (textContent) element.textContent = textContent;
    Object.assign(element, styles);
    return element;
}
// View Event Details: Generate and display event list grouped by month
function generateEventDetails() {
    const eventDetailContainer = document.getElementById("eventDetailContainer");
    const viewDetailsButton = document.getElementById("viewEventDetails");

    // Toggle visibility of the event detail container
    if (eventDetailContainer.style.display === "block") {
        eventDetailContainer.style.display = "none";
        viewDetailsButton.textContent = "View Event Details";
        return;
    }

    // Clear previous content
    eventDetailContainer.innerHTML = "";

    // Month names for grouping
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Group events by month
    const eventsByMonth = {};
    Object.entries(eventList).forEach(([dateKey, events]) => {
        const [year, month] = dateKey.split("-");
        const monthYear = `${months[parseInt(month) - 1]} ${year}`;
        if (!eventsByMonth[monthYear]) eventsByMonth[monthYear] = [];
        eventsByMonth[monthYear].push({ date: dateKey, events });
    });

    // Create event detail structure
    Object.entries(eventsByMonth).forEach(([monthYear, events]) => {
        const monthSection = createElement("div", "", { className: "month-section" });
        const monthHeader = createElement("h3", monthYear, { className: "month-headline" });
        monthSection.appendChild(monthHeader);

        events.forEach(({ date, events: dayEvents }) => {
            const eventDate = createElement("h4", `Date: ${date}`);
            monthSection.appendChild(eventDate);

            dayEvents.forEach(event => {
                const eventItem = createElement("div", `${event.title} - ${event.description}`, { className: "event-detail-item" });
                monthSection.appendChild(eventItem);
            });
        });

        eventDetailContainer.appendChild(monthSection);
    });

    // Show the container and update button text
    eventDetailContainer.style.display = "block";
    viewDetailsButton.textContent = "Hide Event Details";
}

// Helper function to create elements with text and attributes
function createElement(tag, text, attributes = {}) {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    Object.assign(element, attributes);
    return element;
}


// Attach "View Event Details" button functionality
document.getElementById("viewEventDetails").addEventListener("click", generateEventDetails);

// Initial render
document.addEventListener("DOMContentLoaded", drawCalendar);

// Helper to create a button with consistent styles
function createButton(text, color, onClick) {
    var button = createElement('button', text, {
        style: `background-color: ${color === 'green' ? '#00FF66' : '#FF4C4C'}; 
                color: #FFFFFF; border: none; padding: 5px 10px; 
                cursor: pointer; border-radius: 5px; margin-left: 5px;`
    });
    button.addEventListener('click', onClick);
    return button;
}

// Event listeners for navigation buttons
document.getElementById('closePopup').addEventListener('click', () => {
    document.getElementById('eventPopup').style.display = "none";
});
document.querySelector('.button.prev').addEventListener('click', () => changeMonth(-1));
document.querySelector('.button.next').addEventListener('click', () => changeMonth(1));

// Initial render
document.addEventListener("DOMContentLoaded", drawCalendar);


