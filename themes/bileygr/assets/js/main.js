import CalHeatmap from "cal-heatmap";
import LegendLite from "cal-heatmap/plugins/LegendLite";
import Tooltip from "cal-heatmap/plugins/Tooltip";
import CalendarLabel from "cal-heatmap/plugins/CalendarLabel";
const dummyData = [
  { date: "2020-01-15", value: 3 },
  { date: "2020-03-22", value: 9 },
  { date: "2020-06-10", value: 7 },
  { date: "2020-09-05", value: 14 },
  { date: "2020-12-20", value: 5 },

  { date: "2021-02-11", value: 8 },
  { date: "2021-04-18", value: 2 },
  { date: "2021-07-01", value: 10 },
  { date: "2021-09-27", value: 6 },
  { date: "2021-12-31", value: 12 },

  { date: "2022-01-10", value: 4 },
  { date: "2022-03-09", value: 15 },
  { date: "2022-05-22", value: 3 },
  { date: "2022-08-30", value: 9 },
  { date: "2022-11-14", value: 13 },

  { date: "2023-01-05", value: 11 },
  { date: "2023-03-16", value: 5 },
  { date: "2023-05-09", value: 14 },
  { date: "2023-07-24", value: 8 },
  { date: "2023-10-12", value: 1 },
  { date: "2023-12-29", value: 6 },

  { date: "2024-02-08", value: 7 },
  { date: "2024-04-14", value: 10 },
  { date: "2024-06-02", value: 3 },
  { date: "2024-08-18", value: 12 },
  { date: "2024-10-25", value: 5 },
  { date: "2024-12-20", value: 15 },

  { date: "2025-01-11", value: 2 },
  { date: "2025-03-05", value: 9 },
  { date: "2025-05-15", value: 4 },
  { date: "2025-07-28", value: 13 },
  { date: "2025-09-10", value: 8 },
  { date: "2025-10-14", value: 11 },
  { date: "2025-10-15", value: 1 },
];

async function fetchData(){
    try{
        const response = await fetch("/dates.json");
        if (!response){
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        data = await response.json();
        return data.dates;
    }catch(error){
        console.error("error fetching data: ", error)
    }
}
async function parseData(data, selectedYear){
    dates = data.filter(d => d.substring(0,4) === `${selectedYear}`);
    const counts = {};
    const result = [];

    dates.forEach(date => {
        counts[date] = (counts[date] || 0) + 1;
    });

    for (const date in counts) {
        if (counts.hasOwnProperty(date)) {
        result.push({ date: date, value: counts[date] });
        }
    }
    return result
}


let cal = new CalHeatmap();

async function renderCalendar(selectedYear) {
    const startDate = new Date(`${selectedYear}-01-01`);
    const endDate = new Date(`${selectedYear}-12-31`);
    const data = await fetchData();
    const dates = await parseData(data,selectedYear);
    await cal.paint(
    {
        theme: "dark",
        data: {
        source: dates,
        x: "date",
        y: "value",
        },
        itemSelector: "#cal-heatmap",
        type: "year",
        date: {
        start: startDate,
        min: startDate,
        max: endDate,
        },
        range: 12,
        scale: {
        color: {
            type: "threshold",
            range: ["#b9f8cf", "#86efac", "#22c55e", "#14532d"],
            domain: [0, 5, 10],
        },
        },
        domain: {
        type: "month",
        gutter: 4,
        label: { text: "MMM", textAlign: "start", position: "top" },
        },
        subDomain: {
        type: "ghDay",
        radius: 2,
        width: 11,
        height: 11,
        gutter: 4,
        },
    },
    [
        [
        LegendLite,
        {
            includeBlank: false,
            radius: 3,
            itemSelector: "#ex-ghDay-legend",
        },
        ],
        [
        Tooltip,
        {
            enabled: true,
            text: (date, value, dayjsDate) =>
            value
                ? `${value} ${value === 1 ? "Post" : "Posts"} on ${dayjsDate.format("dddd, MMMM D, YYYY")}`
                : `No Posts on ${dayjsDate.format("dddd, MMMM D, YYYY")}`,
        },
        ],
        [
        CalendarLabel,
        {
            width: 30,
            textAlign: "start",
            text: () => dayjs.weekdaysShort().map((d, i) => (i % 2 == 0 ? "" : d)),
            padding: [25, 0, 0, 0],
        },
        ],
    ]
    );
}

async function main(selectedYear) {
    const calContainer = document.getElementById("cal-heatmap");
    
    const currentHeight = calContainer.offsetHeight;
    if (currentHeight > 0) {
        calContainer.style.minHeight = currentHeight + "px";
    }
    
    const currentWidth = calContainer.offsetWidth;
    if (currentWidth > 0) {
        calContainer.style.minWidth = currentWidth + "px";
    }

    if (cal) {
        await cal.destroy();
    }

    cal = new CalHeatmap();

    await renderCalendar(selectedYear);
    requestAnimationFrame(() => {
        calContainer.style.minHeight = "";
        calContainer.style.minWidth = "";
    });
}

async function createYearButtons() {
    const data = await fetchData();
    const dates = data
    .map(d => d.substring(0,4))
    .map(Number)
    .sort((a,b)=>a-b);

    const beginYear = dates[0];
    const endYear = dates[dates.length - 1];


    const years = Array.from({ length: endYear - beginYear + 1 }, (_, i) => beginYear + i);
    const postsCountContainer = document.getElementById("contributionYear");
    postsCountContainer.innerHTML = years.length + (years.length === 1 ? " post ":" posts ") + "this year";    


    const radioDivContainer = document.getElementById("yearButtons");
    radioDivContainer.innerHTML = "";

    years.forEach((year, idx) => {
    const wrapper = document.createElement("div");
    wrapper.className = "relative";

    const radioDivButton = document.createElement("input");
    radioDivButton.type = "radio";
    radioDivButton.name = "radio-group";
    radioDivButton.id = `option-${year}`;
    radioDivButton.className = "sr-only peer";
    radioDivButton.value = year;
    if (idx === years.length - 1) radioDivButton.checked = true;

    const radioDivButtonLabel = document.createElement("label");
    radioDivButtonLabel.htmlFor = `option-${year}`;
    radioDivButtonLabel.className = `
        block w-full text-center px-4 py-2 rounded-md border border-transparent cursor-pointer
        text-gray-400 bg-transparent
        hover:bg-gray-700 peer-checked:bg-blue-400
        peer-checked:text-white
        peer-checked:hover:bg-blue-400
        transition-colors
    `;
    radioDivButtonLabel.textContent = year;

    radioDivButton.addEventListener("change", async (e) => {
        const selectedYear = parseInt(e.target.value);
        await main(selectedYear);
    });

    wrapper.appendChild(radioDivButton);
    wrapper.appendChild(radioDivButtonLabel);
    radioDivContainer.appendChild(wrapper);
    });
    await renderCalendar(endYear);
}

document.addEventListener("DOMContentLoaded", async () => {
  await createYearButtons();
});
