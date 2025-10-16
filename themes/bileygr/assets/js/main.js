import CalHeatmap from "cal-heatmap";
import LegendLite from "cal-heatmap/plugins/LegendLite";
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
    console.log(dates)
    const counts = dates.reduce((acc, date) => {
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});
    const data = Object.entries(counts).map(([date, value]) => ({ date, value }));
    console.log(data)

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
                    "#ecfdf5", // Tailwind bg-green-50
                    "#86efac", // Tailwind bg-green-300
                    "#22c55e", // Tailwind bg-green-500
                    "#14532d", // Tailwind bg-green-950 
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
                radius: 3,
                itemSelector: '#ex-ghDay-legend'
            }
        ]
    ]
    );
}

main()