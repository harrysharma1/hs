import CalHeatmap from "cal-heatmap";
import LegendLite from "cal-heatmap/plugins/LegendLite";
import Tooltip from "cal-heatmap/plugins/Tooltip";
import CalendarLabel from "cal-heatmap/plugins/CalendarLabel";

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

async function main(){
    dates = await fetchData()
    const counts = dates.reduce((acc, date) => {
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});
    const data = Object.entries(counts).map(([date, value]) => ({ date, value }));
 

    const cal = new CalHeatmap();
    cal.paint({
        theme:"dark",
        data: { 
            source: data,
            x: 'date',
            y: 'value'
        },
        itemSelector: "#cal-heatmap",
        type: "year",
        date: { 
            start: new Date('2025-01-01'), 
            min: new Date('2025-01-01'),
            max: new Date ('2025-12-31')
        },
        range: 12,
        scale: {
            color: {
                type: 'threshold',
                range: [  
                    "#b9f8cf", // bg-green-200
                    "#86efac", // bg-green-300
                    "#22c55e", // bg-green-500
                    "#14532d", // bg-green-950 
                ],
                domain: [0,5,10],
            },
        },
        domain: {
            type: 'month',
            gutter: 4,
            label: { text: 'MMM', textAlign: 'start', position: 'top' },
        },
        subDomain: { 
            type: 'ghDay', 
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
                itemSelector: '#ex-ghDay-legend'
            }
        ],
        [
            Tooltip,
            {
                enabled: true,
                text: function (date, value, dayjsDate) {
                    console.log(value)
                    if (value){
                        if (value === 1){
                            return value + ' Post on ' + dayjsDate.format('dddd, MMMM D, YYYY');
                        }else{
                            return value + ' Posts on ' + dayjsDate.format('dddd, MMMM D, YYYY');
                        }
                    }else{
                        return 'No Posts on ' + dayjsDate.format('dddd, MMMM D, YYYY');
                    }
                },
            },
        ],
        [
            CalendarLabel,
            {
                width: 30,
                textAlign: "start",
                text: () => dayjs.weekdaysShort().map((d, i) => (i % 2 == 0 ? '' : d)),
                padding: [25, 0, 0, 0],
            },

        ], 
    ]
    );
}

async function getNumberOfPostsPerYear(year){
    dates = await fetchData();
    years = dates.map(str => str.slice(0,4));
    filteredYears = years.filter(y => y === year);
    document.getElementById("contributionYear").textContent = filteredYears.length + " posts in " + year;
}

async function getNumberOfPosts(){
    dates = await fetchData();
    years = dates.map(str => str.slice(0,4));
    document.getElementById("contributionYear").textContent = years.length + " posts in total"; 
}

document.addEventListener("DOMContentLoaded", async () =>{
    await getNumberOfPosts();
})

main()
