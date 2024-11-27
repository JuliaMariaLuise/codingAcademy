var currentDate = new Date();
var eventList = {}; // Stores events by date in the format "YYYY-MM-DD"

document.addEventListener("DOMContentLoaded", function () {
    function drawCalendar() {
        var cal = document.getElementById('calendar');
        var header = document.getElementById('monthYear');

        if (!cal || !header) {
            console.log("Something's missing: calendar or header");
            return;
        }

        var year = currentDate.getFullYear();
        var month = currentDate.getMonth();
        var months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        header.textContent = months[month] + " " + year;

        while (cal.firstChild) {
            cal.removeChild(cal.firstChild);
        }

        var days = new Date(year, month + 1, 0).getDate();
        var startDay = new Date(year, month, 1).getDay();
        var offset = (startDay + 6) % 7;

        for (var i = 0; i < offset; i++) {
            var empty = document.createElement('div');
            empty.className = 'day empty';
            cal.appendChild(empty);
        }

        for (var d = 1; d <= days; d++) {
            var dayBox = document.createElement('div');
            dayBox.className = 'day';
            dayBox.textContent = d;

            var dateKey = year + "-" + String(month + 1).padStart(2, '0') + "-" + String(d).padStart(2, '0');

            if (
                year === new Date().getFullYear() &&
                month === new Date().getMonth() &&
                d === new Date().getDate()
            ) {
                dayBox.style.border = "2px solid red";
            }

            if (eventList[dateKey]) {
                dayBox.style.border = "2px solid green";
            }

            dayBox.addEventListener('click', function () {
                openPopup(dateKey);
            });
            cal.appendChild(dayBox);
        }
    }

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

        popupDate.textContent = "Events for " + dateKey;
        popupEvents.innerHTML = "";

        var events = eventList[dateKey] || [];

        if (events.length === 0) {
            var noEvents = document.createElement('div');
            noEvents.textContent = "No events for this day.";
            noEvents.style.fontStyle = "italic";
            popupEvents.appendChild(noEvents);
        } else {
            for (var i = 0; i < events.length; i++) {
                var ev = events[i];
                var evDiv = document.createElement('div');
                evDiv.textContent = (i + 1) + ". " + ev.title;

                var descDiv = document.createElement('div');
                descDiv.textContent = ev.description;
                descDiv.style.fontStyle = "italic";
                descDiv.style.marginLeft = "10px";

                var editBtn = document.createElement('button');
                editBtn.textContent = "Edit";
                editBtn.style.marginLeft = "10px";
                editBtn.addEventListener('click', function () {
                    var newTitle = prompt("Edit title:", ev.title);
                    var newDesc = prompt("Edit description:", ev.description);
                    if (newTitle && newDesc) {
                        ev.title = newTitle;
                        ev.description = newDesc;
                        drawCalendar();
                        openPopup(dateKey);
                    }
                });

                var delBtn = document.createElement('button');
                delBtn.textContent = "Delete";
                delBtn.style.marginLeft = "10px";
                delBtn.addEventListener('click', function () {
                    events.splice(i, 1);
                    if (events.length === 0) delete eventList[dateKey];
                    drawCalendar();
                    openPopup(dateKey);
                });

                evDiv.appendChild(descDiv);
                evDiv.appendChild(editBtn);
                evDiv.appendChild(delBtn);
                popupEvents.appendChild(evDiv);
            }
        }

        var addEventBtn = document.createElement('button');
        addEventBtn.textContent = "Add Event";
        addEventBtn.style.marginTop = "10px";
        addEventBtn.addEventListener('click', function () {
            popupEvents.style.display = "none";
            form.style.display = "flex";
            closeBtn.style.display = "none";
        });

        popupEvents.appendChild(addEventBtn);

        cancelBtn.addEventListener('click', function () {
            form.style.display = "none";
            popupEvents.style.display = "block";
            closeBtn.style.display = "block";
        });

        form.onsubmit = function (e) {
            e.preventDefault();
            var title = eventName.value.trim();
            var desc = eventDesc.value.trim();
            if (title && desc) {
                if (!eventList[dateKey]) eventList[dateKey] = [];
                eventList[dateKey].push({ title: title, description: desc });
                eventName.value = "";
                eventDesc.value = "";
                drawCalendar();
                openPopup(dateKey);
            }
        };

        popup.style.display = "block";
        popupEvents.style.display = "block";
        form.style.display = "none";
        closeBtn.style.display = "block";
    }

    document.getElementById('closePopup').addEventListener('click', function () {
        document.getElementById('eventPopup').style.display = "none";
    });

    drawCalendar();

    document.querySelector('.button.prev').addEventListener('click', function () {
        changeMonth(-1);
    });

    document.querySelector('.button.next').addEventListener('click', function () {
        changeMonth(1);
    });
});
