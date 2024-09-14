const today = new Date();
// Create a new Date object for tomorrow by adding 1 day (in milliseconds) to today's date
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

const openings = [];

const getAvailableReservations = async (courtID, date) => {
  return await fetch(`https://api.rec.us/v1/locations/${courtID}/schedule?startDate=${date.toLocaleDateString("en-CA")}`, {
    headers: {
      accept: "application/json",
    },
    referrer: "https://www.rec.us/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "omit",
  })
    .then((data) => data.json())
    .then((data) => {
      const openings = [];
      const key = date.toLocaleDateString("en-CA").replaceAll("-", "");
      const datedData = data.dates[key];
      if (datedData) {
        datedData.forEach(({ sports, courtNumber, schedule }) => {
          if (Array.isArray(sports) && sports.some((sport) => sport.name === "Tennis")) {
            const info = {};
            info.courtName = courtNumber;
            if (schedule) {
              const entries = Object.entries(schedule);
              const windows = entries.reduce((accum, [window, rezzy]) => {
                const isReserveable = rezzy?.referenceType === "RESERVABLE";
                if (isReserveable && !isTimePassed(window, date)) accum.push(formatRangeTo12Hour(window));
                return accum;
              }, []);
              if (windows.length <= 0) return;
              info.windows = windows;
              openings.push(info);
            }
          }
        });
      }
      return openings;
    })
    .catch((err) => console.error(err));
};

function formatTo12Hour(hours, minutes) {
  const period = hours >= 12 ? "PM" : "AM";
  const adjustedHours = hours % 12 || 12; // Convert to 12-hour format
  const formattedMinutes = minutes.toString().padStart(2, "0"); // Ensure two-digit minutes
  return `${adjustedHours}:${formattedMinutes} ${period}`;
}

function formatRangeTo12Hour(timeStr) {
  // Split the input string into start and end times
  const [startTime, endTime] = timeStr.split(",").map((time) => time.trim());

  // Convert times to hours and minutes
  const toHoursMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return { hours, minutes };
  };

  const { hours: startHours, minutes: startMinutes } = toHoursMinutes(startTime);
  const { hours: endHours, minutes: endMinutes } = toHoursMinutes(endTime);

  // Format to 12-hour time
  const formattedStartTime = formatTo12Hour(startHours, startMinutes);
  const formattedEndTime = formatTo12Hour(endHours, endMinutes);

  return `${formattedStartTime} - ${formattedEndTime}`;
}

function isTimePassed(input, date) {
  const now = new Date();
  // Check if the provided date is today
  const isToday =
    date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();

  if (!isToday) {
    return false; // Early exit if the date is not today
  }

  // Get the current time
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Split the input string into individual times
  const times = input.split(",").map((time) => time.trim());

  // Convert each time to hours and minutes and compare with the current time
  return times.some((time) => {
    const [hour, minute] = time.split(":").map(Number);
    if (hour < currentHour || (hour === currentHour && minute < currentMinute)) {
      return true; // Time has passed
    }
    return false; // Time has not passed
  });
}

const courts = {
  alicemarble: {
    id: "81cd2b08-8ea6-40ee-8c89-aeba92506576",
    name: "Alice Marble",
  },
  balboa: {
    id: "c41c7b8f-cb09-415a-b8ea-ad4b82d792b9",
    name: "Balboa Park",
  },
  buenavista: {
    id: "3f842b1e-13f9-447d-ab12-62b62d954d3e",
    name: "Buena Vista",
  },
  crockeramazon: {
    id: "779905bd-4c2b-45b3-abd0-48140998bca1",
    name: "Crocker Amazon",
  },
  dolores: {
    id: "95745483-6b38-4e99-8ba2-a3e23cda8587",
    name: "Dolores Park",
  },
  dupont: {
    id: "d3fc78ce-0617-40dc-b7f7-d41ba95f09ef",
    name: "Dupont",
  },
  fulton: {
    id: "070037ab-f407-486a-9f88-989905be1039",
    name: "Fulton Playground",
  },
  glencanyon: {
    id: "16fdf80f-4e50-452a-843f-63d159c798e2",
    name: "Glen Park",
  },
  hamilton: {
    id: "8c3b9b04-a149-4080-b648-e3ff8365bbee",
    name: "Hamilton",
  },
  jpmurphy: {
    id: "8c3b9b04-a149-4080-b648-e3ff8365bbee",
    name: "J.P. Murphy",
  },
  jackson: {
    id: "8c3b9b04-a149-4080-b648-e3ff8365bbee",
    name: "Jackson Playground",
  },
  joedimaggio: {
    id: "8f8e510f-e0d8-4364-8531-a9a0d0d6b2b8",
    name: "Joe DiMaggio",
  },
  lafayette: {
    id: "c4fc2b3e-d1bc-47d9-b920-76d00d32b20b",
    name: "Lafayette Park",
  },
  mclaren: {
    id: "c4fc2b3e-d1bc-47d9-b920-76d00d32b20b",
    name: "McLaren Park",
  },
  minnielovieward: {
    id: "c4fc2b3e-d1bc-47d9-b920-76d00d32b20b",
    name: "Minnie & Lovie",
  },
  miraloma: {
    id: "5a52a5e8-2e9f-4976-8a5c-0bc53d51afe9",
    name: "Miraloma Park",
  },
  moscone: {
    id: "fb0d16b1-5f9f-465f-8ebf-fccf5d400c47",
    name: "Moscone",
  },
  mountainlake: {
    id: "af2cd971-0c10-479d-a12e-ca63d55f71be",
    name: "Mountain Lake Park",
  },
  parkside: {
    id: "5a0b8fa6-11db-433e-9314-bafb956d8622",
    name: "Parkside Square",
  },
  potrerohill: {
    id: "032e605f-6065-4794-9675-b1bbebe18159",
    name: "Potrero Hill",
  },
  presidiowall: {
    id: "c2f20478-83d8-48c9-af3d-065d7ba22d60",
    name: "Presidio Wall",
  },
  richmond: {
    id: "95f7e887-5096-463b-834a-09d67889557e",
    name: "Richmond Playground",
  },
  rossi: {
    id: "ad9e28e1-2d02-4fb5-b31d-b75f63841814",
    name: "Rossi Park",
  },
  stmarys: {
    id: "25eafd72-ca31-4df7-8850-79c05edf3796",
    name: "St. Mary's",
  },
  sunset: {
    id: "fe61cfdb-abf7-4f52-8ce4-45feb58f10b7",
    name: "Sunset Rec",
  },
  uppernoe: {
    id: "2a18ef67-333c-4d9c-a86c-e0709f07f5c3",
    name: "Upper Noe",
  },
};

const getAllOpenings = async (courts, date) => {
  const openings = {};
  console.log("getting for date", date);
  for (const [name, info] of Object.entries(courts)) {
    const todayWindows = await getAvailableReservations(info.id, date);
    if (todayWindows.length > 0) {
      openings[name] = {
        ...info,
        openings: todayWindows,
        reserveLink: getReserveLink(name),
        mapsLink: `https://www.google.com/maps?output=search&q=${encodeURIComponent(
          info.name.split(" ").join("+")
        )}+tennis+courts+sf`,
      };
    }
  }
  return openings;
};

function generateCourtHTML(court) {
  return `
        <div class="court-container">
            <h2>${court.name}</h2>
            <ul>
                ${court.openings
                  .map(
                    (opening) => `
                    <li>
                        <strong>${opening.courtName}:</strong>
                        <ul>
                            ${opening.windows.map((window) => `<li>${window.replace(", ", " - ")}</li>`).join("")}
                        </ul>
                    </li>
                `
                  )
                  .join("")}
            </ul>
            <a href="${court.reserveLink}" target="_blank">Reserve</a>
            <br>
            <a href="${court.mapsLink}" target="_blank">View on Map</a>
        </div>
    `;
}

let allCourts = {}; // To store all court data for filtering

// Function to display courts based on the selected date and search query
function displayCourts(courtListNode, searchQuery) {
  courtListNode.innerHTML = "";

  // Filter and display courts based on the search query
  Object.values(allCourts).forEach((court) => {
    if (court.name.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery) {
      courtListNode.innerHTML += generateCourtHTML(court);
    }
  });
}

// script.js
document.addEventListener("DOMContentLoaded", () => {
  const datePicker = document.getElementById("datePicker");

  const normalized = new Date().toISOString().split("T")[0];
  datePicker.value = normalized;
  const courtList = document.getElementById("courtList");
  const searchField = document.getElementById("searchField");

  const updateWithData = async (date, searchQuery) => {
    console.log("updating for date", date);
    await getAllOpenings(courts, date)
      .then((openings) => {
        // console.log("openings", openings);
        // Get the container element
        courtList.textContent = ""; // clear loading state

        allCourts = openings;

        displayCourts(courtList, searchQuery);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  updateWithData(today, searchField.value);

  datePicker.addEventListener("change", async (event) => {
    const selectedDate = event.target.value;
    courtList.textContent = "Loading...";

    await updateWithData(parseLocalDate(selectedDate), searchField.value);
  });

  // Add event listener for search field changes
  searchField.addEventListener("input", (event) => {
    const searchQuery = event.target.value;
    displayCourts(courtList, searchQuery);
  });
});

function parseLocalDate(dateStr) {
  // Extract year, month, and day from the input string
  const [year, month, day] = dateStr.split("-").map(Number);

  // Create a Date object in local time zone using the extracted values
  // Note: JavaScript months are 0-indexed (0 = January, 8 = September)
  return new Date(year, month - 1, day);
}

const getReserveLink = (courtName) => `https://rec.us/${courtName}`;
