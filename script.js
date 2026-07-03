/* ===========================================================
   COMMUTE INTELLIGENCE DASHBOARD
   script.js
   PART 1
=========================================================== */

/* ===========================================================
   CONFIG
=========================================================== */

const CONFIG = {

    SHEET_URL:
        "https://script.google.com/macros/s/AKfycbxBpfm1yApsHwDVef9WD2gp0AQBIP8RAAZsDahHKK2qWi9x8co4cSAMD9Ll3_lQxLSKzA/exec",

    HOME: {

        lat: 12.9698,
        lng: 77.7499

    },

    OFFICE: {

        lat: 12.9352,
        lng: 77.6954

    }

};

/* ===========================================================
   APPLICATION STATE
=========================================================== */

const state = {

    rawData: [],

    filteredData: [],

    selectedDay: "Monday",

    map: null,

    directionsService: null,

    directionsRenderer: null,

    charts: {}

};

/* ===========================================================
   DOM HELPERS
=========================================================== */

const $ = id => document.getElementById(id);

const dom = {

    todayDate: $("todayDate"),

    trafficChart: $("trafficChart"),

    weeklyTrendChart: $("weeklyTrendChart"),

    historyChart: $("historyChart"),

    heatmap: $("heatmap"),

    map: $("map")

};

/* ===========================================================
   INITIALIZE
=========================================================== */

document.addEventListener("DOMContentLoaded", init);

async function init() {

    updateToday();

    bindWeekdayButtons();

    initializeMap();

    await loadData();

    renderDashboard();

}

/* ===========================================================
   TODAY DATE
=========================================================== */

function updateToday() {

    const today = new Date();

    dom.todayDate.textContent =
        today.toLocaleDateString("en-IN", {

            weekday: "long",

            day: "numeric",

            month: "long"

        });

}

/* ===========================================================
   WEEKDAY BUTTONS
=========================================================== */

function bindWeekdayButtons() {

    document
        .querySelectorAll(".weekday")
        .forEach(button => {

            button.addEventListener("click", () => {

                document
                    .querySelectorAll(".weekday")
                    .forEach(b => b.classList.remove("active"));

                button.classList.add("active");

                state.selectedDay =
                    button.dataset.day;

                filterWeekday();

                renderDashboard();

            });

        });

}

/* ===========================================================
   LOAD DATA
=========================================================== */

async function loadData() {

    try {

        const response =
            await fetch(CONFIG.SHEET_URL);

        const json =
            await response.json();

        state.rawData = json;
state.rawData = json.map(row => ({

    timestamp: row.Timestamp,

    weekday: row.Weekday,

    direction: row.Direction,

    eta: Number(row.ETA_Min),

    distance: Number(row.Distance_KM),

    hour: Number(row.Hour),

    min: Number(row.Minute),

    date: row.Date

}));
        console.log(
            "Loaded rows:",
            state.rawData.length
        );

        filterWeekday();

    }

    catch (error) {

        console.error(error);

        alert("Unable to load Google Sheet.");

    }

}

/* ===========================================================
   FILTER WEEKDAY
=========================================================== */

function filterWeekday() {

    const map = {

        Monday: "Mon",
        Wednesday: "Wed",
        Thursday: "Thu"

    };

    const sheetDay = map[state.selectedDay];

    state.filteredData =

        state.rawData.filter(

            row => row.weekday === sheetDay

        );

}

/* ===========================================================
   GOOGLE MAP
=========================================================== */

function initializeMap() {

    state.map = new google.maps.Map(

        dom.map,

        {

            zoom: 12,

            center: CONFIG.HOME,

            disableDefaultUI: true,

            styles: mapStyle

        }

    );

    state.directionsService =
        new google.maps.DirectionsService();

    state.directionsRenderer =
        new google.maps.DirectionsRenderer({

            map: state.map,

            suppressMarkers: false

        });

}

/* ===========================================================
   MAIN RENDER
=========================================================== */

function renderDashboard() {

    updateHeroCards();

    drawTrafficChart();

    drawWeeklyTrend();

    drawHeatmap();

    updateMetrics();

    updateScorecard();

}

/* ===========================================================
   HERO CARDS
=========================================================== */

function updateHeroCards() {

    if (!state.filteredData.length)
        return;

    const eta =
        state.filteredData.map(r => Number(r.eta));

    const min =
        Math.min(...eta);

    const max =
        Math.max(...eta);

    const avg =
        average(eta);

    $("currentETA").textContent =
        formatMinutes(avg);

    $("bestETA").textContent =
        formatMinutes(min);

    $("worstETA").textContent =
        formatMinutes(max);

    $("variation").textContent =
        formatMinutes(max - min);

}

/* ===========================================================
   HELPER FUNCTIONS
=========================================================== */

function average(values) {

    if (!values.length)
        return 0;

    return values.reduce(

        (sum, value) => sum + value,

        0

    ) / values.length;

}

function median(values) {

    if (!values.length)
        return 0;

    const sorted =
        [...values].sort((a, b) => a - b);

    const middle =
        Math.floor(sorted.length / 2);

    return sorted.length % 2

        ? sorted[middle]

        : (sorted[middle - 1] + sorted[middle]) / 2;

}

function formatMinutes(value) {

    return Number(value).toFixed(1) + " min";

}

function groupBy(array, property) {

    return array.reduce((groups, item) => {

        if (!groups[item[property]]) {

            groups[item[property]] = [];

        }

        groups[item[property]].push(item);

        return groups;

    }, {});

}

/* ===========================================================
   GOOGLE MAP STYLE
=========================================================== */

const mapStyle = [

    {

        elementType: "geometry",

        stylers: [

            { color: "#0f1418" }

        ]

    },

    {

        elementType: "labels.text.fill",

        stylers: [

            { color: "#d8e1e8" }

        ]

    },

    {

        elementType: "labels.text.stroke",

        stylers: [

            { color: "#0f1418" }

        ]

    },

    {

        featureType: "road",

        elementType: "geometry",

        stylers: [

            { color: "#27313a" }

        ]

    },

    {

        featureType: "water",

        elementType: "geometry",

        stylers: [

            { color: "#0b2436" }

        ]

    }

];

/* ===========================================================
   PART 2 STARTS BELOW
=========================================================== */

/*
Next Part Includes

✓ drawTrafficChart()

✓ drawWeeklyTrend()

✓ drawHistoryChart()

✓ drawHeatmap()

✓ Recommendation Engine

✓ Google Directions API

✓ Leave-by Calculator

✓ Monthly Scorecard

✓ Route Comparison

*/

/* ===========================================================
   PART 2A
   CHARTS
=========================================================== */

function destroyChart(name) {

    if (state.charts[name]) {

        state.charts[name].destroy();

    }

}

function chartDefaults() {

    return {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {

                labels: {

                    color: "#dce3ea",

                    font: {

                        family: "IBM Plex Mono"

                    }

                }

            }

        },

        scales: {

            x: {

                ticks: {

                    color: "#9aa7b2"

                },

                grid: {

                    color: "rgba(255,255,255,.05)"

                }

            },

            y: {

                ticks: {

                    color: "#9aa7b2"

                },

                grid: {

                    color: "rgba(255,255,255,.05)"

                }

            }

        }

    };

}

/* ===========================================================
   TRAFFIC CURVE
=========================================================== */

function drawTrafficChart() {

    destroyChart("traffic");

    if (!state.filteredData.length) return;

    const labels = state.filteredData.map(row => {

        return `${Number(row.Hour)}:${String(Number(row.Minute)).padStart(2, "0")}`;

    });

    const eta = state.filteredData.map(row => Number(Number(row.ETA_Min)));

    state.charts.traffic = new Chart(

        $("trafficChart"),

        {

            type: "line",

            data: {

                labels,

                datasets: [

                    {

                        label: "ETA",

                        data: eta,

                        borderColor: "#2dd4bf",

                        backgroundColor: "rgba(45,212,191,.18)",

                        borderWidth: 3,

                        fill: true,

                        pointRadius: 0,

                        tension: .35

                    }

                ]

            },

            options: chartDefaults()

        }

    );

}

/* ===========================================================
   WEEKLY TREND
=========================================================== */

function drawWeeklyTrend() {

    destroyChart("weekly");

    const grouped = groupBy(

        state.filteredData,

        "date"

    );

    const labels = [];

    const averages = [];

    Object.keys(grouped).forEach(date => {

        labels.push(date);

        averages.push(

            average(

                grouped[date].map(

                    r => Number(r.eta)

                )

            )

        );

    });

    state.charts.weekly = new Chart(

        $("weeklyTrendChart"),

        {

            type: "bar",

            data: {

                labels,

                datasets: [

                    {

                        label: "Average ETA",

                        data: averages,

                        backgroundColor: "#4f8cff"

                    }

                ]

            },

            options: chartDefaults()

        }

    );

}

/* ===========================================================
   HISTORY
=========================================================== */

function drawHistoryChart() {

    destroyChart("history");

    const grouped = groupBy(

        state.filteredData,

        "date"

    );

    const labels = Object.keys(grouped);

    const mins = [];

    const maxs = [];

    labels.forEach(date => {

        const values = grouped[date]

            .map(r => Number(r.eta));

        mins.push(Math.min(...values));

        maxs.push(Math.max(...values));

    });

    state.charts.history = new Chart(

        $("historyChart"),

        {

            type: "line",

            data: {

                labels,

                datasets: [

                    {

                        label: "Best",

                        data: mins,

                        borderColor: "#22c55e",

                        fill: false,

                        tension: .3

                    },

                    {

                        label: "Worst",

                        data: maxs,

                        borderColor: "#ff6b6b",

                        fill: false,

                        tension: .3

                    }

                ]

            },

            options: chartDefaults()

        }

    );

}
/* ===========================================================
   PART 2B
   HEATMAP + RECOMMENDATION ENGINE
=========================================================== */

function drawHeatmap() {

    const container = $("heatmap");

    if (!container) return;

    container.innerHTML = "";

    if (!state.filteredData.length) return;

    const grouped = groupBy(state.filteredData, "date");

    Object.keys(grouped).forEach(date => {

        grouped[date].forEach(row => {

            const cell = document.createElement("div");

            cell.className = "heatmap-cell";

            const eta = Number(Number(row.ETA_Min));

            if (eta <= 30) cell.classList.add("level-1");
            else if (eta <= 35) cell.classList.add("level-2");
            else if (eta <= 40) cell.classList.add("level-3");
            else if (eta <= 45) cell.classList.add("level-4");
            else if (eta <= 50) cell.classList.add("level-5");
            else if (eta <= 55) cell.classList.add("level-6");
            else cell.classList.add("level-7");

            cell.title =
                `${date}
${Number(row.Hour)}:${String(Number(row.Minute)).padStart(2,"0")}
ETA ${eta.toFixed(1)} min`;

            container.appendChild(cell);

        });

    });

}

/* ===========================================================
   BEST DEPARTURE WINDOW
=========================================================== */

function calculateRecommendation() {

    if (!state.filteredData.length) return null;

    const minuteGroups = {};

    state.filteredData.forEach(row => {

        const key =
            `${Number(row.Hour)}:${String(Number(row.Minute)).padStart(2,"0")}`;

        if (!minuteGroups[key]) {

            minuteGroups[key] = [];

        }

        minuteGroups[key].push(Number(Number(row.ETA_Min)));

    });

    let bestMinute = null;

    let bestAverage = Infinity;

    Object.entries(minuteGroups).forEach(([minute, values]) => {

        const avg = average(values);

        if (avg < bestAverage) {

            bestAverage = avg;

            bestMinute = minute;

        }

    });

    return {

        minute: bestMinute,

        eta: bestAverage

    };

}

/* ===========================================================
   HERO RECOMMENDATION
=========================================================== */

function updateRecommendationCard() {

    const rec = calculateRecommendation();

    if (!rec) return;

    const parts = rec.minute.split(":");

    const hour = Number(parts[0]);

    const minute = parts[1];

    const ampm = hour >= 12 ? "PM" : "AM";

    const displayHour =
        hour > 12 ? hour - 12 : hour;

    $("leaveHour").textContent =
        `${displayHour}:${minute}`;

    document.querySelector(".ampm").textContent =
        ampm;

    $("expectedETA").textContent =
        `${rec.eta.toFixed(1)} mins`;

    const arrival =
        addMinutes(hour, Number(minute), rec.eta);

    $("arrivalTime").textContent =
        arrival;

    $("bestWindow").textContent =
        buildWindow(rec.minute);

}

/* ===========================================================
   ARRIVAL TIME
=========================================================== */

function addMinutes(hour, minute, eta) {

    const d = new Date();

    d.setHours(hour);

    d.setMinutes(minute);

    d.setSeconds(0);

    d.setMinutes(d.getMinutes() + Math.round(eta));

    return d.toLocaleTimeString(

        "en-IN",

        {

            hour: "numeric",

            minute: "2-digit"

        }

    );

}

/* ===========================================================
   BEST WINDOW
=========================================================== */

function buildWindow(time) {

    const p = time.split(":");

    const hour = Number(p[0]);

    const minute = Number(p[1]);

    const start =
        new Date(0,0,0,hour,minute-2);

    const end =
        new Date(0,0,0,hour,minute+2);

    const format = d =>
        d.toLocaleTimeString(

            "en-IN",

            {

                hour:"2-digit",

                minute:"2-digit"

            }

        );

    return `${format(start)} - ${format(end)}`;

}

/* ===========================================================
   METRICS
=========================================================== */

function updateMetrics() {

    if (!state.filteredData.length) return;

    const eta =
        state.filteredData.map(r => Number(r.eta));

    $("avgEtaMetric").textContent =
        formatMinutes(average(eta));

    $("medianEtaMetric").textContent =
        formatMinutes(median(eta));

    $("p95Metric").textContent =
        formatMinutes(percentile(eta,95));

    $("stdMetric").textContent =
        standardDeviation(eta).toFixed(2);

    $("confidenceMetric").textContent =
        confidenceScore(eta) + "%";

    updateRecommendationCard();

}

/* ===========================================================
   PERCENTILE
=========================================================== */

function percentile(values,p){

    const sorted =
        [...values].sort((a,b)=>a-b);

    const index =
        Math.ceil((p/100)*sorted.length)-1;

    return sorted[index];

}

/* ===========================================================
   STANDARD DEVIATION
=========================================================== */

function standardDeviation(values){

    const avg =
        average(values);

    const variance =
        average(

            values.map(

                x => Math.pow(x-avg,2)

            )

        );

    return Math.sqrt(variance);

}

/* ===========================================================
   CONFIDENCE SCORE
=========================================================== */

function confidenceScore(values){

    const sd =
        standardDeviation(values);

    let score =
        100-(sd*5);

    score =
        Math.max(40,score);

    score =
        Math.min(99,score);

    return Math.round(score);

}

/* ===========================================================
   PART 2C
   GOOGLE MAPS + LEAVE BY CALCULATOR + SCORECARD
=========================================================== */

/* ===========================================================
   ROUTE
=========================================================== */

async function loadRoute() {

    if (!state.directionsService) return;

    const request = {

        origin: CONFIG.HOME,

        destination: CONFIG.OFFICE,

        travelMode: google.maps.TravelMode.DRIVING,

        drivingOptions: {

            departureTime: new Date(),

            trafficModel: "bestguess"

        }

    };

    state.directionsService.route(

        request,

        (result, status) => {

            if (status !== "OK") return;

            state.directionsRenderer.setDirections(result);

            const leg = result.routes[0].legs[0];

            $("routeName").textContent =
                result.routes[0].summary || "Primary Route";

            $("routeDuration").textContent =
                leg.duration_in_traffic
                    ? leg.duration_in_traffic.text
                    : leg.duration.text;

            const normal =
                leg.duration.value / 60;

            const traffic =
                leg.duration_in_traffic
                    ? leg.duration_in_traffic.value / 60
                    : normal;

            $("trafficDelay").textContent =
                `${Math.round(traffic - normal)} min`;

            updateRouteCards(result);

        }

    );

}

/* ===========================================================
   ROUTE CARDS
=========================================================== */

function updateRouteCards(result) {

    const routes = result.routes;

    ["A", "B", "C"].forEach((letter, index) => {

        if (!routes[index]) return;

        const leg = routes[index].legs[0];

        const duration =

            leg.duration_in_traffic
                ? leg.duration_in_traffic.text
                : leg.duration.text;

        $(`route${letter}Name`).textContent =
            routes[index].summary || `Route ${letter}`;

        $(`route${letter}ETA`).textContent =
            duration;

    });

}

/* ===========================================================
   LEAVE BY CALCULATOR
=========================================================== */

const calculateButton =
    $("calculateButton");

if (calculateButton) {

    calculateButton.addEventListener(

        "click",

        calculateLeaveTime

    );

}

function calculateLeaveTime() {

    const input =
        $("arrivalInput").value;

    if (!input) return;

    const parts =
        input.split(":");

    const hour =
        Number(parts[0]);

    const minute =
        Number(parts[1]);

    const recommendation =
        calculateRecommendation();

    if (!recommendation) return;

    const eta =
        Math.round(recommendation.eta);

    const arrival =
        new Date();

    arrival.setHours(hour);

    arrival.setMinutes(minute);

    arrival.setSeconds(0);

    arrival.setMinutes(

        arrival.getMinutes() - eta

    );

    $("recommendedDeparture").textContent =
        arrival.toLocaleTimeString(

            "en-IN",

            {

                hour: "numeric",

                minute: "2-digit"

            }

        );

}

/* ===========================================================
   SCORECARD
=========================================================== */

function updateScorecard() {

    if (!state.filteredData.length) return;

    const eta =
        state.filteredData.map(

            r => Number(r.eta)

        );

    const avg =
        average(eta);

    const best =
        Math.min(...eta);

    const worst =
        Math.max(...eta);

    $("tripCount").textContent =
        new Set(

            state.filteredData.map(

                r => r.date

            )

        ).size;

    $("monthlyAverage").textContent =
        formatMinutes(avg);

    $("monthlyBest").textContent =
        formatMinutes(best);

    $("monthlyWorst").textContent =
        formatMinutes(worst);

    const saved =
        (worst - avg) *
        Number($("tripCount").textContent);

    $("timeSavedMonth").textContent =
        `${Math.round(saved)} min`;

    const score =
        Math.max(

            0,

            Math.round(

                100 -
                (avg - best) * 3

            )

        );

    $("overallScore").textContent =
        `${score}/100`;

}

/* ===========================================================
   AUTO REFRESH
=========================================================== */

setInterval(async () => {

    await loadData();

    renderDashboard();

    loadRoute();

}, 60000);

/* ===========================================================
   INITIAL ROUTE
=========================================================== */

setTimeout(() => {

    loadRoute();

}, 1000);

/* ===========================================================
   WINDOW RESIZE
=========================================================== */

window.addEventListener(

    "resize",

    () => {

        Object.values(state.charts)

            .forEach(chart => {

                if (chart)

                    chart.resize();

            });

    }

);
