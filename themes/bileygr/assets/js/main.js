import CalHeatmap from "cal-heatmap";
import LegendLite from "cal-heatmap/plugins/LegendLite";
import Tooltip from "cal-heatmap/plugins/Tooltip";
import CalendarLabel from "cal-heatmap/plugins/CalendarLabel";

async function fetchDates(){
    try{
        const response = await fetch("/dates.json");
        if (!response){
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        data = await response.json();
        return data.dates;
    }catch(error){
        console.error("error fetching dates: ", error)
    }
}

async function fetchData(){
    try{
        const response = await fetch("/feed.json");
        if(!response){
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        data = await response.json();
        return data;
    }catch(error){
        console.error("error fetching data: ",error)
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
    const data = await fetchDates();
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
    const data = await fetchDates();
    const dates = data
    .map(d => d.substring(0,4))
    .map(Number)
    .sort((a,b)=>a-b);

    const beginYear = dates[0];
    const endYear = dates[dates.length - 1];


    const years = Array.from({ length: endYear - beginYear + 1 }, (_, i) => beginYear + i);
  


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
    
    const postsCountContainer = document.getElementById("contributionYear");
    const postsPerYear = data
        .filter(d => Number(d.substring(0,4)) === endYear)
    postsCountContainer.innerHTML = postsPerYear.length + (postsPerYear.length === 1 ? " post ":" posts ") + "this year";    
    await renderCalendar(endYear);
    await renderPosts(endYear);
}

async function renderPosts(year){
    const dates = await fetchDates();
    const data = await fetchData();
    const postsPerMonthCount = {};
    for (const dateString of dates){
        const date = new Date(dateString);
        const month = date.getMonth();
        if (postsPerMonthCount[month]){
            postsPerMonthCount[month] ++;
        }else{
            postsPerMonthCount[month] = 1;
        }
    }


    const postsPerMonthCountAsNames = {};
    const monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    for (const monthAsNum in postsPerMonthCount){
        postsPerMonthCountAsNames[monthName[monthAsNum]] = postsPerMonthCount[monthAsNum];
    }

    const countPerMonthContainer = document.getElementById("countOfPostsPerMonth");
    countPerMonthContainer.className = "text-sm flex flex-col gap-1"

    for (monthKey in postsPerMonthCountAsNames){
        const dateDivContainer = document.createElement("div");
        dateDivContainer.className = "flex flex-row gap-1";
        const monthDiv = document.createElement("div");
        monthDiv.className = "text-white font-bold";
        monthDiv.innerHTML = monthKey;
        const yearDiv = document.createElement("div");
        yearDiv.className = "text-gray-400";
        yearDiv.innerHTML = year;
        dateDivContainer.appendChild(monthDiv);
        dateDivContainer.appendChild(yearDiv);
        const monthCountDiv = document.createElement("div");
        monthCountDiv.className = "text-xl text-gray-400";
        monthCountDiv.innerHTML = "Created " + postsPerMonthCountAsNames[monthKey] + (postsPerMonthCountAsNames[monthKey]>1?" posts":" post");
                
        countPerMonthContainer.appendChild(dateDivContainer);
        countPerMonthContainer.appendChild(monthCountDiv);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
  await createYearButtons();
});
