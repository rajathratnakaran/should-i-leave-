/* ==========================================================
   COMMUTE INTELLIGENCE DASHBOARD
   Part 1
   Configuration + State + Utilities
========================================================== */

const CONFIG = {

    SHEET_URL:
        "https://script.google.com/macros/s/AKfycbxBpfm1yApsHwDVef9WD2gp0AQBIP8RAAZsDahHKK2qWi9x8co4cSAMD9Ll3_lQxLSKzA/exec",

    MAPS_API_KEY:
        "",

    DEFAULT_DAY:
        "Thursday",

    DEFAULT_DIRECTION:
        "A→B"

};

/* ==========================================================
   Global State
========================================================== */

const state = {

    rawData: [],

    filteredData: [],

    selectedDay:
        CONFIG.DEFAULT_DAY,

    selectedDirection:
        CONFIG.DEFAULT_DIRECTION,

    map: null,

    directionsService: null,

    directionsRenderer: null,

    charts: {

        traffic: null,

        weekly: null,

        history: null

    }

};

/* ==========================================================
   DOM Helpers
========================================================== */

function $(id) {

    return document.getElementById(id);

}

function $all(selector) {

    return [...document.querySelectorAll(selector)];

}

/* ==========================================================
   Number Helpers
========================================================== */

function round(value, decimals = 1) {

    return Number(value.toFixed(decimals));

}

function average(values) {

    if (!values.length) return 0;

    return values.reduce((a, b) => a + b, 0) / values.length;

}

function sum(values) {

    return values.reduce((a, b) => a + b, 0);

}

function median(values) {

    if (!values.length) return 0;

    const sorted = [...values].sort((a, b) => a - b);

    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {

        return (sorted[middle - 1] + sorted[middle]) / 2;

    }

    return sorted[middle];

}

function percentile(values, p) {

    if (!values.length) return 0;

    const sorted = [...values].sort((a, b) => a - b);

    const index = Math.ceil((p / 100) * sorted.length) - 1;

    return sorted[Math.max(index, 0)];

}

function standardDeviation(values) {

    if (!values.length) return 0;

    const avg = average(values);

    const variance = average(

        values.map(v => Math.pow(v - avg, 2))

    );

    return Math.sqrt(variance);

}

/* ==========================================================
   Time Helpers
========================================================== */

function to12Hour(hour) {

    if (hour === 0) return 12;

    if (hour > 12) return hour - 12;

    return hour;

}

function formatTime(hour, minute) {

    const ampm = hour >= 12 ? "PM" : "AM";

    return `${to12Hour(hour)}:${String(minute).padStart(2, "0")} ${ampm}`;

}

function addMinutes(hour, minute, minsToAdd) {

    const total = hour * 60 + minute + Math.round(minsToAdd);

    const h = Math.floor(total / 60) % 24;

    const m = total % 60;

    return formatTime(h, m);

}

function subtractMinutes(hour, minute, minsToSubtract) {

    const total = hour * 60 + minute - Math.round(minsToSubtract);

    const h = ((Math.floor(total / 60) % 24) + 24) % 24;

    const m = ((total % 60) + 60) % 60;

    return formatTime(h, m);

}

function minuteKey(hour, minute) {

    return `${hour}:${String(minute).padStart(2, "0")}`;

}

/* ==========================================================
   Date Helpers
========================================================== */

function getTodayString() {

    return new Date().toLocaleDateString(

        "en-IN",

        {

            weekday: "long",

            day: "numeric",

            month: "long"

        }

    );

}

function normalizeWeekday(day) {

    return day.substring(0, 3).toLowerCase();

}

/* ==========================================================
   Dashboard Helper
========================================================== */

function setTodayDate() {

    $("todayDate").textContent = getTodayString();

}

console.log("✓ Part 1 Loaded");

/* ==========================================================
   Part 2
   Load Google Sheet Data
========================================================== */

async function loadData() {

    try {

        console.log("Loading commute data...");

        const response = await fetch(CONFIG.SHEET_URL);

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        const json = await response.json();

        console.log(
            "Rows received:",
            json.length
        );

       state.rawData = json.map(...);

filterData();

initializeUI();

refreshDashboard();

}

    catch(err){

        console.error(
            "Unable to load data",
            err
        );

    }

}

/* ==========================================================
   Filter Dataset
========================================================== */

function filterData(){

    const dayMap={

        Monday:"Mon",

        Tuesday:"Tue",

        Wednesday:"Wed",

        Thursday:"Thu",

        Friday:"Fri",

        Saturday:"Sat",

        Sunday:"Sun"

    };

    const shortDay=
        dayMap[state.selectedDay];

    state.filteredData=
        state.rawData.filter(row=>

            row.weekday===shortDay &&

            row.direction===state.selectedDirection &&

            row.status==="SUCCESS"

        );

    state.filteredData.sort((a,b)=>{

        return (

            a.hour*60+a.minute

        )-

        (

            b.hour*60+b.minute

        );

    });

    console.log(
        "Selected Day:",
        state.selectedDay
    );

    console.log(
        "Direction:",
        state.selectedDirection
    );

    console.log(
        "Filtered Rows:",
        state.filteredData.length
    );

    if(state.filteredData.length){

        console.log(
            state.filteredData[0]
        );

    }

}

/* ==========================================================
   Dashboard Refresh
========================================================== */

function refreshDashboard(){

    if(!state.filteredData.length){

        console.warn("No data");

        return;

    }

    updateRecommendationCard();

    updateHeroCards();

    updateDecisionPanel();

    renderTrafficChart();

    renderWeeklyTrend();

    renderHeatmap();

    updateReliability();

    updateMonthlyStats();

}

/* ==========================================================
   Start App
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        setTodayDate();

        loadData();

    }

);

console.log("✓ Part 2 Loaded");

/* ==========================================================
   Part 3
   UI Events
========================================================== */

function setupWeekdayButtons() {

    const buttons =
        $all(".weekday");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            buttons.forEach(btn =>
                btn.classList.remove("active")
            );

            button.classList.add("active");

            state.selectedDay =
                button.dataset.day;

            filterData();

            refreshDashboard();

        });

    });

}

function setupDirectionButtons() {

    const buttons =
        $all(".direction");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            buttons.forEach(btn =>
                btn.classList.remove("active")
            );

            button.classList.add("active");

            state.selectedDirection =
                button.dataset.direction;

            filterData();

            refreshDashboard();

        });

    });

}

/* ==========================================================
   Initialize UI
========================================================== */

function initializeUI() {

    setupWeekdayButtons();

    setupDirectionButtons();

}

/* ==========================================================
   Update loadData()
========================================================== */

/*
Inside loadData()

Replace

    filterData();

with

    filterData();

    initializeUI();

    refreshDashboard();

*/

/* ==========================================================
   Console
========================================================== */

console.log("✓ Part 3 Loaded");

/* ==========================================================
   Part 4
   Recommendation Engine
========================================================== */

function calculateRecommendation() {

    if (!state.filteredData.length) {

        return null;

    }

    const minuteGroups = {};

    state.filteredData.forEach(row => {

        const key = minuteKey(

            row.hour,

            row.minute

        );

        if (!minuteGroups[key]) {

            minuteGroups[key] = [];

        }

        minuteGroups[key].push(row.eta);

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

        eta: round(bestAverage),

        confidence: Math.min(

            99,

            Math.round(

                100 -

                (

                    standardDeviation(

                        state.filteredData.map(r => r.eta)

                    ) * 4

                )

            )

        )

    };

}

/* ==========================================================
   Best Window
========================================================== */

function buildWindow(minuteString) {

    const parts = minuteString.split(":");

    const h = Number(parts[0]);

    const m = Number(parts[1]);

    const start = formatTime(h, Math.max(0, m - 1));

    const end = formatTime(h, Math.min(59, m + 2));

    return `${start} – ${end}`;

}

/* ==========================================================
   Hero Card
========================================================== */

function updateRecommendationCard() {

    const rec = calculateRecommendation();

    if (!rec) {

        return;

    }

    const parts = rec.minute.split(":");

    const hour = Number(parts[0]);

    const minute = Number(parts[1]);

    $("leaveHour").textContent =

        `${to12Hour(hour)}:${String(minute).padStart(2, "0")}`;

    document.querySelector(".ampm").textContent =

        hour >= 12 ? "PM" : "AM";

    $("expectedETA").textContent =

        `${rec.eta} mins`;

    $("arrivalTime").textContent =

        addMinutes(

            hour,

            minute,

            rec.eta

        );

    $("confidence").textContent =

        `${rec.confidence}%`;

    $("bestWindow").textContent =

        buildWindow(rec.minute);

}

/* ==========================================================
   Current Metrics
========================================================== */

function updateHeroCards() {

    if (!state.filteredData.length) {

        return;

    }

    const etas =

        state.filteredData.map(r => r.eta);

    const current =

        state.filteredData[0];

    $("currentETA").textContent =

        `${round(current.eta)} min`;

    $("distance").textContent =

        `${round(current.distance,2)} km`;

    const avgSpeed =

        current.distance /

        (current.eta / 60);

    $("avgSpeed").textContent =

        `${round(avgSpeed)} km/h`;

    $("bestETA").textContent =

        `${round(Math.min(...etas))} min`;

    $("worstETA").textContent =

        `${round(Math.max(...etas))} min`;

    $("variation").textContent =

        `${round(

            Math.max(...etas) -

            Math.min(...etas)

        )} min";

}

/* ==========================================================
   Decision Panel
========================================================== */

function updateDecisionPanel() {

    const rec = calculateRecommendation();

    if (!rec) return;

    $("decisionWindow").textContent =

        buildWindow(rec.minute);

    const under40 =

        state.filteredData.filter(

            r => r.eta <= 40

        ).length;

    $("probability").textContent =

        `${Math.round(

            under40 /

            state.filteredData.length *

            100

        )}%`;

    const current =

        state.filteredData[0].eta;

    $("timeSaved").textContent =

        `${Math.max(

            0,

            Math.round(current - rec.eta)

        )} min`;

    $("commuteScore").textContent =

        `${Math.round(

            100 -

            average(

                state.filteredData.map(r=>r.eta)

            )

        )}/100`;

}

console.log("✓ Part 4 Loaded");

/* ==========================================================
   Part 5
   Traffic Curve Chart
========================================================== */

function renderTrafficChart() {

    if (!state.filteredData.length) {

        return;

    }

    const labels = state.filteredData.map(row =>

        `${row.hour}:${String(row.minute).padStart(2,"0")}`

    );

    const values = state.filteredData.map(row => row.eta);

    const ctx = $("trafficChart").getContext("2d");

    if (state.charts.traffic) {

        state.charts.traffic.destroy();

    }

    state.charts.traffic = new Chart(ctx, {

        type: "line",

        data: {

            labels,

            datasets: [

                {

                    label: "ETA (mins)",

                    data: values,

                    borderColor: "#2dd4bf",

                    backgroundColor: "rgba(45,212,191,.15)",

                    borderWidth: 3,

                    pointRadius: 0,

                    pointHoverRadius: 5,

                    tension: .35,

                    fill: true

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            interaction: {

                intersect: false,

                mode: "index"

            },

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                x: {

                    ticks: {

                        color: "#94a3b8",

                        maxTicksLimit: 12

                    },

                    grid: {

                        color: "rgba(255,255,255,.05)"

                    }

                },

                y: {

                    beginAtZero: false,

                    ticks: {

                        color: "#94a3b8"

                    },

                    grid: {

                        color: "rgba(255,255,255,.05)"

                    }

                }

            }

        }

    });

}

/* ==========================================================
   Weekly Trend
========================================================== */

function renderWeeklyTrend() {

    const weekdays = [

        "Mon",

        "Wed",

        "Thu"

    ];

    const averages = weekdays.map(day => {

        const rows = state.rawData.filter(r =>

            r.weekday === day &&

            r.direction === state.selectedDirection

        );

        if (!rows.length) return 0;

        return average(

            rows.map(r => r.eta)

        );

    });

    const ctx = $("weeklyTrendChart").getContext("2d");

    if (state.charts.weekly) {

        state.charts.weekly.destroy();

    }

    state.charts.weekly = new Chart(ctx, {

        type: "bar",

        data: {

            labels: [

                "Monday",

                "Wednesday",

                "Thursday"

            ],

            datasets: [

                {

                    data: averages,

                    backgroundColor: [

                        "#2dd4bf",

                        "#60a5fa",

                        "#f59e0b"

                    ]

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                y: {

                    ticks: {

                        color:"#94a3b8"

                    },

                    grid:{

                        color:"rgba(255,255,255,.05)"

                    }

                },

                x:{

                    ticks:{

                        color:"#94a3b8"

                    },

                    grid:{

                        display:false

                    }

                }

            }

        }

    });

}

console.log("✓ Part 5 Loaded");

/* ==========================================================
   Part 6
   Traffic Heatmap
========================================================== */

function renderHeatmap() {

    const container = $("heatmap");

    if (!container) return;

    container.innerHTML = "";

    if (!state.filteredData.length) {

        container.innerHTML =
            "<div class='heatmap-empty'>No data available</div>";

        return;

    }

    const minETA = Math.min(

        ...state.filteredData.map(r => r.eta)

    );

    const maxETA = Math.max(

        ...state.filteredData.map(r => r.eta)

    );

    state.filteredData.forEach(row => {

        const cell = document.createElement("div");

        cell.className = "heat-cell";

        const ratio =

            (row.eta - minETA) /

            (maxETA - minETA || 1);

        let color;

        if (ratio < .15) {

            color = "#10b981";

        }

        else if (ratio < .30) {

            color = "#34d399";

        }

        else if (ratio < .45) {

            color = "#84cc16";

        }

        else if (ratio < .60) {

            color = "#facc15";

        }

        else if (ratio < .75) {

            color = "#fb923c";

        }

        else if (ratio < .90) {

            color = "#f97316";

        }

        else {

            color = "#ef4444";

        }

        cell.style.background = color;

        cell.title =

            `${row.hour}:${String(row.minute).padStart(2,"0")}
ETA ${row.eta.toFixed(1)} mins`;

        container.appendChild(cell);

    });

}

/* ==========================================================
   Part 7
   Reliability Metrics
========================================================== */

function updateReliability() {

    if (!state.filteredData.length) {

        return;

    }

    const etas =

        state.filteredData.map(r => r.eta);

    const avg = average(etas);

    const med = median(etas);

    const p95 = percentile(etas,95);

    const std = standardDeviation(etas);

    const confidence = Math.max(

        50,

        Math.min(

            99,

            Math.round(

                100 - std * 4

            )

        )

    );

    $("avgEtaMetric").textContent =

        `${round(avg)} min`;

    $("medianEtaMetric").textContent =

        `${round(med)} min`;

    $("p95Metric").textContent =

        `${round(p95)} min`;

    $("stdMetric").textContent =

        `${round(std)} min`;

    $("confidenceMetric").textContent =

        `${confidence}%`;

}


/* ==========================================================
   Monthly Statistics
========================================================== */

function updateMonthlyStats() {

    if (!state.filteredData.length) {

        return;

    }

    const etas =

        state.filteredData.map(r => r.eta);

    const avg = average(etas);

    const best = Math.min(...etas);

    const worst = Math.max(...etas);

    $("tripCount").textContent =

        state.filteredData.length;

    $("monthlyAverage").textContent =

        `${round(avg)} min`;

    $("monthlyBest").textContent =

        `${round(best)} min`;

    $("monthlyWorst").textContent =

        `${round(worst)} min`;

    const saved =

        (worst - avg) *

        state.filteredData.length;

    $("timeSavedMonth").textContent =

        `${Math.round(saved)} min`;

    const score = Math.max(

        1,

        Math.round(

            100 -

            avg

        )

    );

    $("overallScore").textContent =

        `${score}/100`;

}

/* ==========================================================
   Part 8
   History • Calculator • Insights
========================================================== */

/* ==========================================================
   Historical Comparison
========================================================== */

function updateHistoryChart() {

    const canvas = $("historyChart");

    if (!canvas) return;

    if (state.charts.history) {

        state.charts.history.destroy();

    }

    const groups = {};

    state.filteredData.forEach(row => {

        if (!groups[row.date]) {

            groups[row.date] = [];

        }

        groups[row.date].push(row.eta);

    });

    const labels = Object.keys(groups).sort();

    const values = labels.map(date =>

        average(groups[date])

    );

    state.charts.history = new Chart(

        canvas,

        {

            type: "line",

            data: {

                labels,

                datasets: [

                    {

                        label: "Average ETA",

                        data: values,

                        borderColor: "#2dd4bf",

                        backgroundColor:

                            "rgba(45,212,191,.12)",

                        borderWidth: 3,

                        fill: true,

                        tension: .35,

                        pointRadius: 4

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: false

                    }

                }

            }

        }

    );

}

/* ==========================================================
   Leave By Calculator
========================================================== */

function calculateDeparture() {

    const input = $("arrivalInput");

    if (!input) return;

    const value = input.value;

    if (!value) return;

    const parts = value.split(":");

    const arrivalHour = Number(parts[0]);

    const arrivalMinute = Number(parts[1]);

    const rec = calculateRecommendation();

    if (!rec) return;

    const departure = subtractMinutes(

        arrivalHour,

        arrivalMinute,

        rec.eta

    );

    $("recommendedDeparture").textContent =

        departure;

}

function setupCalculator() {

    const button = $("calculateButton");

    if (!button) return;

    button.addEventListener(

        "click",

        calculateDeparture

    );

}

/* ==========================================================
   AI Insights
========================================================== */

function updateAIInsights() {

    if (!state.filteredData.length) return;

    const etas =

        state.filteredData.map(r => r.eta);

    const avg = average(etas);

    const best = Math.min(...etas);

    const worst = Math.max(...etas);

    const save = Math.round(worst - best);

    console.log({

        average: avg,

        best,

        worst,

        possibleSaving: save

    });

}

/* ==========================================================
   Route Summary
========================================================== */

function updateRouteCards() {

    if (!state.filteredData.length) return;

    const current = state.filteredData[0];

    if ($("routeDuration")) {

        $("routeDuration").textContent =

            `${round(current.eta)} min`;

    }

    if ($("routeName")) {

        $("routeName").textContent =

            state.selectedDirection === "A→B"

                ? "Home → Office"

                : "Office → Home";

    }

    if ($("trafficDelay")) {

        $("trafficDelay").textContent =

            `${Math.max(

                0,

                round(

                    current.eta -

                    Math.min(

                        ...state.filteredData.map(r=>r.eta)

                    )

                )

            )} min`;

    }

}

/* ==========================================================
   Dashboard Refresh
========================================================== */

const originalRefresh = refreshDashboard;

refreshDashboard = function(){

    if(!state.filteredData.length){

        return;

    }

    updateRecommendationCard();

    updateHeroCards();

    updateDecisionPanel();

    renderTrafficChart();

    renderWeeklyTrend();

    renderHeatmap();

    updateReliability();

    updateMonthlyStats();

    updateHistoryChart();

    updateAIInsights();

    updateRouteCards();

};

/* ==========================================================
   Initialize App
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        setTodayDate();

        setupCalculator();

    }

);

console.log("✓ Part 8 Loaded");
