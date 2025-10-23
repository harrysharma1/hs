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
                ? `${value} ${value === 1 ? "Item" : "Items"} on ${dayjsDate.format("dddd, MMMM D, YYYY")}`
                : `No Items on ${dayjsDate.format("dddd, MMMM D, YYYY")}`,
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
    
    const contentsCountContainer = document.getElementById("contributionYear");
    const contentsPerYear = data
        .filter(d => Number(d.substring(0,4)) === endYear)
    contentsCountContainer.innerHTML = contentsPerYear.length + (contentsPerYear.length === 1 ? " item ":" items ") + "this year";    
    await renderCalendar(endYear);
    await renderContents(endYear);
}

async function renderContents(year) {
    const data = await fetchData(); // JSON feed with items
    const postsByMonth = {};

    // Group posts by month
    for (const item of data.items) {
        const date = new Date(item.date_published);
        if (date.getFullYear() !== year) continue;
        const month = date.getMonth();
        if (!postsByMonth[month]) postsByMonth[month] = [];
        postsByMonth[month].push(item);
    }

    const monthName = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];
    const shortMonth = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    const container = document.getElementById("countOfItemsPerMonth");
    container.innerHTML = "";
    container.className = "p-5";

    // Timeline container
    const ol = document.createElement("ol");
    ol.className = "relative border-s border-gray-200 dark:border-gray-700";

    for (let monthNum = 0; monthNum < 12; monthNum++) {
        const monthItems = postsByMonth[monthNum];
        if (!monthItems || monthItems.length === 0) continue;

        const li = document.createElement("li");
        li.className = "relative ps-6 mb-10";

        // Circle marker
        const circle = document.createElement("div");
        circle.className =
            "absolute -start-[7px] mt-1.5 h-3 w-3 rounded-full border border-white bg-gray-200 dark:border-gray-900 dark:bg-gray-700";
        li.appendChild(circle);

        // Month label
        const timeEl = document.createElement("time");
        timeEl.className =
            "mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500 block";
        timeEl.textContent = `${monthName[monthNum]} ${year}`;
        li.appendChild(timeEl);

        // Container for post links
        const linksWrapper = document.createElement("div");
        linksWrapper.className = "flex flex-col gap-1";

        monthItems.forEach((post, i) => {
            const date = new Date(post.date_published);
            const formatted = `${shortMonth[date.getMonth()]} ${date.getDate()}`;

            const wrapper = document.createElement("div");
            wrapper.className = `${i > 0 ? "hidden" : ""}`;

            const a = document.createElement("a");
            a.href = post.url;
            a.rel = "noopener noreferrer";
            a.className =
                "text-base font-normal text-blue-600 dark:text-blue-400 hover:underline";
            a.textContent = post.title;

            // date badge
            const small = document.createElement("span");
            small.className = "ml-2 text-sm text-gray-400 dark:text-gray-500";
            small.textContent = `· ${formatted}`;

            wrapper.appendChild(a);
            wrapper.appendChild(small);

            linksWrapper.appendChild(wrapper);
        });

        li.appendChild(linksWrapper);

        // Toggle button if more than one post
        if (monthItems.length > 1) {
            const toggleBtn = document.createElement("button");
            toggleBtn.textContent = "See more";
            toggleBtn.className =
                "rounded-md border border-gray-300 dark:border-gray-700 px-2 py-1 mt-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition";

            toggleBtn.addEventListener("click", () => {
                const links = linksWrapper.querySelectorAll("div");
                links.forEach((link, i) => {
                    if (i > 0) link.classList.toggle("hidden");
                });
                toggleBtn.textContent =
                    toggleBtn.textContent === "See more" ? "See less" : "See more";
            });

            li.appendChild(toggleBtn);
        }

        ol.appendChild(li);
    }

    container.appendChild(ol);
}





document.addEventListener("DOMContentLoaded", async () => {
  await createYearButtons();
});
