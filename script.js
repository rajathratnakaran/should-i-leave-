/* ============================================================
   COMMUTE INTELLIGENCE DASHBOARD
   script.js
   PART 1
   Configuration • State • Helpers
============================================================ */

/* ============================================================
   CONFIG
============================================================ */

const CONFIG = {

    SHEET_URL:
        "https://script.google.com/macros/s/AKfycbxBpfm1yApsHwDVef9WD2gp0AQBIP8RAAZsDahHKK2qWi9x8co4cSAMD9Ll3_lQxLSKzA/exec",

    DEFAULT_DAY: "Thursday",

    DEFAULT_DIRECTION: "A→B"

};


/* ============================================================
   APP STATE
============================================================ */

const state = {

    rawData: [],

    filteredData: [],

    selectedDay: CONFIG.DEFAULT_DAY,

    selectedDirection: CONFIG.DEFAULT_DIRECTION,

    recommendation: null,

    charts: {

        traffic: null,

        weekly: null,

        history: null

    },

    map: null

};


/* ============================================================
   DOM HELPERS
============================================================ */

function $(id) {

    return document.getElementById(id);

}

function $all(selector) {

    return Array.from(document.querySelectorAll(selector));

}


/* ============================================================
   NUMBER HELPERS
============================================================ */

function average(values) {

    if (!values.length) return 0;

    return values.reduce((a, b) => a + b, 0) / values.length;

}

function round(value, digits = 1) {

    return Number(Number(value).toFixed(digits));

}

function median(values) {

    if (!values.length) return 0;

    const sorted = [...values].sort((a, b) => a - b);

    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {

        return (sorted[mid - 1] + sorted[mid]) / 2;

    }

    return sorted[mid];

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


/* ============================================================
   TIME HELPERS
============================================================ */

function pad(value) {

    return String(value).padStart(2, "0");

}

function to12Hour(hour) {

    if (hour === 0) return 12;

    if (hour > 12) return hour - 12;

    return hour;

}

function formatTime(hour, minute) {

    const ampm = hour >= 12 ? "PM" : "AM";

    return `${to12Hour(hour)}:${pad(minute)} ${ampm}`;

}

function minuteKey(hour, minute) {

    return `${hour}:${pad(minute)}`;

}

function addMinutes(hour, minute, mins) {

    const total = (hour * 60) + minute + Math.round(mins);

    const h = Math.floor(total / 60) % 24;

    const m = total % 60;

    return formatTime(h, m);

}

function subtractMinutes(hour, minute, mins) {

    const total = (hour * 60) + minute - Math.round(mins);

    const h = ((Math.floor(total / 60) % 24) + 24) % 24;

    const m = ((total % 60) + 60) % 60;

    return formatTime(h, m);

}


/* ============================================================
   DATE HELPERS
============================================================ */

function todayString() {

    return new Date().toLocaleDateString(

        "en-IN",

        {

            weekday: "long",

            day: "numeric",

            month: "long"

        }

    );

}

function setTodayDate() {

    const el = $("todayDate");

    if (!el) return;

    el.textContent = todayString();

}


/* ============================================================
   WEEKDAY HELPERS
============================================================ */

function shortDay(day) {

    const map = {

        Monday: "Mon",

        Tuesday: "Tue",

        Wednesday: "Wed",

        Thursday: "Thu",

        Friday: "Fri",

        Saturday: "Sat",

        Sunday: "Sun"

    };

    return map[day];

}


/* ============================================================
   LOG
============================================================ */

console.log("✓ Script Part 1 Loaded");

/* ============================================================
   PART 2
   Load Data • Filter Data
============================================================ */

/* ============================================================
   LOAD DATA
============================================================ */

async function loadData() {

    try {

        console.log("Loading data...");

        const response = await fetch(CONFIG.SHEET_URL);

        if (!response.ok) {

            throw new Error(`HTTP ${response.status}`);

        }

        const json = await response.json();

        console.log(`Rows received: ${json.length}`);

        state.rawData = json.map(row => ({

            timestamp: new Date(row.Timestamp),

            weekday: row.Weekday,

            direction: row.Direction,

            eta: Number(row.ETA_Min),

            distance: Number(row.Distance_KM),

            apiCall: Number(row.API_Call_Number),

            status: row.Status,

            hour: Number(row.Hour),

            minute: Number(row.Minute),

            date: row.Date

        }));

        console.table(state.rawData.slice(0, 5));

        filterData();

        refreshDashboard();

    }

    catch (error) {

        console.error("Unable to load data");

        console.error(error);

    }

}


/* ============================================================
   FILTER DATA
============================================================ */

function filterData() {

    const day = shortDay(state.selectedDay);

    state.filteredData = state.rawData.filter(row => {

        return (

            row.weekday === day &&

            row.direction === state.selectedDirection &&

            row.status === "SUCCESS"

        );

    });

    state.filteredData.sort((a, b) => {

        const t1 = (a.hour * 60) + a.minute;

        const t2 = (b.hour * 60) + b.minute;

        return t1 - t2;

    });

    console.log(

        `Filtered ${state.filteredData.length} rows`

    );

}


/* ============================================================
   DASHBOARD PLACEHOLDER
============================================================ */

function refreshDashboard() {

    console.log(

        "Dashboard refresh",

        state.selectedDay,

        state.selectedDirection

    );

}
/* ============================================================
   PART 3
   UI EVENTS
============================================================ */

/* ============================================================
   WEEKDAY BUTTONS
============================================================ */

function initializeWeekdayButtons() {

    const buttons = $all(".weekday");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            buttons.forEach(b => {

                b.classList.remove("active");

            });

            button.classList.add("active");

            state.selectedDay =

                button.dataset.day;

            filterData();

            refreshDashboard();

        });

    });

}


/* ============================================================
   DIRECTION BUTTONS
============================================================ */

function initializeDirectionButtons() {

    const buttons = $all(".direction");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            buttons.forEach(b => {

                b.classList.remove("active");

            });

            button.classList.add("active");

            state.selectedDirection =

                button.dataset.direction;

            filterData();

            refreshDashboard();

        });

    });

}


/* ============================================================
   INITIALIZE UI
============================================================ */

function initializeUI() {

    initializeWeekdayButtons();

    initializeDirectionButtons();

}


/* ============================================================
   APPLICATION START
============================================================ */

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        setTodayDate();

        initializeUI();

        await loadData();

    }

);

console.log(

    "✓ Script Part 3 Loaded"

);

/* ============================================================
   PART 4
   RECOMMENDATION ENGINE
============================================================ */

/* ============================================================
   CALCULATE BEST DEPARTURE
============================================================ */

function calculateRecommendation() {

    if (!state.filteredData.length) {

        state.recommendation = null;

        return null;

    }

    const minuteGroups = {};

    state.filteredData.forEach(row => {

        const key = minuteKey(row.hour, row.minute);

        if (!minuteGroups[key]) {

            minuteGroups[key] = [];

        }

        minuteGroups[key].push(row.eta);

    });

    let bestMinute = null;

    let bestETA = Number.MAX_VALUE;

    Object.entries(minuteGroups).forEach(([minute, values]) => {

        const avg = average(values);

        if (avg < bestETA) {

            bestETA = avg;

            bestMinute = minute;

        }

    });

    const confidence = Math.max(

        50,

        Math.min(

            99,

            Math.round(

                100 -

                standardDeviation(

                    state.filteredData.map(r => r.eta)

                ) * 4

            )

        )

    );

    state.recommendation = {

        minute: bestMinute,

        eta: round(bestETA),

        confidence

    };

    return state.recommendation;

}


/* ============================================================
   BEST WINDOW
============================================================ */

function recommendationWindow() {

    if (!state.recommendation) return "--";

    const parts = state.recommendation.minute.split(":");

    const hour = Number(parts[0]);

    const minute = Number(parts[1]);

    const start = formatTime(

        hour,

        Math.max(0, minute - 2)

    );

    const end = formatTime(

        hour,

        Math.min(59, minute + 2)

    );

    return `${start} – ${end}`;

}


/* ============================================================
   CURRENT STATISTICS
============================================================ */

function currentStatistics() {

    if (!state.filteredData.length) {

        return null;

    }

    const etas =

        state.filteredData.map(r => r.eta);

    return {

        current:

            state.filteredData[0],

        average:

            average(etas),

        minimum:

            Math.min(...etas),

        maximum:

            Math.max(...etas),

        variation:

            Math.max(...etas) -

            Math.min(...etas)

    };

}


/* ============================================================
   DASHBOARD REFRESH
============================================================ */

function refreshDashboard() {

    calculateRecommendation();

    console.log(

        "Dashboard refreshed"

    );

    console.log(

        state.recommendation

    );

}
/* ============================================================
   PART 5
   HERO CARDS
============================================================ */

/* ============================================================
   UPDATE HERO CARD
============================================================ */

function updateRecommendationCard() {

    if (!state.recommendation) return;

    const parts = state.recommendation.minute.split(":");

    const hour = Number(parts[0]);

    const minute = Number(parts[1]);

    if ($("leaveHour")) {

        $("leaveHour").textContent =

            `${to12Hour(hour)}:${pad(minute)}`;

    }

    const ampm = document.querySelector(".ampm");

    if (ampm) {

        ampm.textContent =

            hour >= 12 ? "PM" : "AM";

    }

    if ($("expectedETA")) {

        $("expectedETA").textContent =

            `${state.recommendation.eta} mins`;

    }

    if ($("arrivalTime")) {

        $("arrivalTime").textContent =

            addMinutes(

                hour,

                minute,

                state.recommendation.eta

            );

    }

    if ($("confidence")) {

        $("confidence").textContent =

            `${state.recommendation.confidence}%`;

    }

    if ($("bestWindow")) {

        $("bestWindow").textContent =

            recommendationWindow();

    }

}


/* ============================================================
   UPDATE TRAFFIC CARD
============================================================ */

function updateTrafficCard() {

    const stats = currentStatistics();

    if (!stats) return;

    if ($("currentETA")) {

        $("currentETA").textContent =

            `${round(stats.current.eta)} min`;

    }

    if ($("distance")) {

        $("distance").textContent =

            `${round(stats.current.distance,2)} km`;

    }

    const speed =

        stats.current.distance /

        (stats.current.eta / 60);

    if ($("avgSpeed")) {

        $("avgSpeed").textContent =

            `${round(speed)} km/h`;

    }

}


/* ============================================================
   UPDATE SUMMARY CARD
============================================================ */

function updateSummaryCard() {

    const stats = currentStatistics();

    if (!stats) return;

    if ($("bestETA")) {

        $("bestETA").textContent =

            `${round(stats.minimum)} min`;

    }

    if ($("worstETA")) {

        $("worstETA").textContent =

            `${round(stats.maximum)} min`;

    }

    if ($("variation")) {

        $("variation").textContent =

            `${round(stats.variation)} min`;

    }

    if ($("decisionWindow")) {

        $("decisionWindow").textContent =

            recommendationWindow();

    }

}


/* ============================================================
   UPDATE DECISION PANEL
============================================================ */

function updateDecisionPanel() {

    if (!state.filteredData.length) return;

    const under40 =

        state.filteredData.filter(

            row => row.eta <= 40

        ).length;

    if ($("probability")) {

        $("probability").textContent =

            `${Math.round(

                under40 /

                state.filteredData.length *

                100

            )}%`;

    }

    if ($("timeSaved")) {

        const current =

            state.filteredData[0].eta;

        const saved =

            Math.max(

                0,

                Math.round(

                    current -

                    state.recommendation.eta

                )

            );

        $("timeSaved").textContent =

            `${saved} min`;

    }

    if ($("commuteScore")) {

        const score =

            Math.max(

                1,

                Math.round(

                    100 -

                    average(

                        state.filteredData.map(

                            r => r.eta

                        )

                    )

                )

            );

        $("commuteScore").textContent =

            `${score}/100`;

    }

}


/* ============================================================
   REFRESH DASHBOARD
============================================================ */

function refreshDashboard() {

    calculateRecommendation();

    updateRecommendationCard();

    updateTrafficCard();

    updateSummaryCard();

    updateDecisionPanel();

    console.log(

        "Dashboard updated."

    );

}

console.log(

    "✓ Script Part 5 Loaded"

);

/* ============================================================
   PART 6
   TRAFFIC CHART
============================================================ */

/* ============================================================
   TRAFFIC CHART
============================================================ */

function renderTrafficChart() {

    const canvas = $("trafficChart");

    if (!canvas) return;

    if (!state.filteredData.length) return;

    if (state.charts.traffic) {

        state.charts.traffic.destroy();

    }

    const labels = state.filteredData.map(row =>

        `${pad(row.hour)}:${pad(row.minute)}`

    );

    const eta = state.filteredData.map(row => row.eta);

    state.charts.traffic = new Chart(

        canvas,

        {

            type: "line",

            data: {

                labels,

                datasets: [

                    {

                        label: "ETA",

                        data: eta,

                        borderColor: "#2dd4bf",

                        backgroundColor:

                            "rgba(45,212,191,.15)",

                        borderWidth: 3,

                        tension: .35,

                        fill: true,

                        pointRadius: 2,

                        pointHoverRadius: 6

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: false

                    },

                    tooltip: {

                        callbacks: {

                            label(context) {

                                return `${context.parsed.y.toFixed(1)} mins`;

                            }

                        }

                    }

                },

                interaction: {

                    mode: "index",

                    intersect: false

                },

                scales: {

                    x: {

                        grid: {

                            color: "rgba(255,255,255,.05)"

                        },

                        ticks: {

                            color: "#94a3b8",

                            maxTicksLimit: 10

                        }

                    },

                    y: {

                        beginAtZero: false,

                        grid: {

                            color: "rgba(255,255,255,.05)"

                        },

                        ticks: {

                            color: "#94a3b8",

                            callback(value) {

                                return value + "m";

                            }

                        }

                    }

                }

            }

        }

    );

}


/* ============================================================
   WEEKLY TREND
============================================================ */

function renderWeeklyTrend() {

    const canvas = $("weeklyTrendChart");

    if (!canvas) return;

    if (state.charts.weekly) {

        state.charts.weekly.destroy();

    }

    const days = [

        {

            name: "Monday",

            code: "Mon"

        },

        {

            name: "Wednesday",

            code: "Wed"

        },

        {

            name: "Thursday",

            code: "Thu"

        }

    ];

    const averages = days.map(day => {

        const rows = state.rawData.filter(row =>

            row.weekday === day.code &&

            row.direction === state.selectedDirection

        );

        if (!rows.length) return 0;

        return average(

            rows.map(r => r.eta)

        );

    });

    state.charts.weekly = new Chart(

        canvas,

        {

            type: "bar",

            data: {

                labels: days.map(d => d.name),

                datasets: [

                    {

                        data: averages,

                        backgroundColor: [

                            "#22c55e",

                            "#3b82f6",

                            "#f59e0b"

                        ],

                        borderRadius: 8

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

                    x: {

                        grid: {

                            display: false

                        },

                        ticks: {

                            color: "#94a3b8"

                        }

                    },

                    y: {

                        grid: {

                            color: "rgba(255,255,255,.05)"

                        },

                        ticks: {

                            color: "#94a3b8",

                            callback(value) {

                                return value + "m";

                            }

                        }

                    }

                }

            }

        }

    );

}


/* ============================================================
   REFRESH DASHBOARD
============================================================ */

function refreshDashboard() {

    calculateRecommendation();

    updateRecommendationCard();

    updateTrafficCard();

    updateSummaryCard();

    updateDecisionPanel();

    renderTrafficChart();

    renderWeeklyTrend();

    console.log(

        "Dashboard updated."

    );

}

console.log(

    "✓ Script Part 6 Loaded"

);

/* ============================================================
   PART 7
   HEATMAP + RELIABILITY
============================================================ */

/* ============================================================
   HEATMAP
============================================================ */

function renderHeatmap() {

    const container = $("heatmap");

    if (!container) return;

    container.innerHTML = "";

    if (!state.filteredData.length) return;

    const etas = state.filteredData.map(r => r.eta);

    const minETA = Math.min(...etas);

    const maxETA = Math.max(...etas);

    state.filteredData.forEach(row => {

        const cell = document.createElement("div");

        cell.className = "heat-cell";

        const ratio =

            (row.eta - minETA) /

            ((maxETA - minETA) || 1);

        let colour = "#22c55e";

        if (ratio > .20) colour = "#84cc16";

        if (ratio > .40) colour = "#facc15";

        if (ratio > .60) colour = "#fb923c";

        if (ratio > .80) colour = "#ef4444";

        cell.style.background = colour;

        cell.title =

            `${pad(row.hour)}:${pad(row.minute)}
ETA ${round(row.eta)} mins`;

        container.appendChild(cell);

    });

}


/* ============================================================
   RELIABILITY
============================================================ */

function updateReliability() {

    if (!state.filteredData.length) return;

    const eta =

        state.filteredData.map(r => r.eta);

    const avg = average(eta);

    const med = median(eta);

    const p95 = percentile(eta,95);

    const std = standardDeviation(eta);

    const confidence =

        Math.max(

            50,

            Math.min(

                99,

                Math.round(

                    100 - std * 4

                )

            )

        );

    if ($("avgEtaMetric")) {

        $("avgEtaMetric").textContent =

            `${round(avg)} min`;

    }

    if ($("medianEtaMetric")) {

        $("medianEtaMetric").textContent =

            `${round(med)} min`;

    }

    if ($("p95Metric")) {

        $("p95Metric").textContent =

            `${round(p95)} min`;

    }

    if ($("stdMetric")) {

        $("stdMetric").textContent =

            `${round(std)} min`;

    }

    if ($("confidenceMetric")) {

        $("confidenceMetric").textContent =

            `${confidence}%`;

    }

}


/* ============================================================
   MONTHLY SCORECARD
============================================================ */

function updateMonthlyScorecard() {

    if (!state.filteredData.length) return;

    const eta =

        state.filteredData.map(r => r.eta);

    const avg = average(eta);

    const best = Math.min(...eta);

    const worst = Math.max(...eta);

    if ($("tripCount")) {

        $("tripCount").textContent =

            state.filteredData.length;

    }

    if ($("monthlyAverage")) {

        $("monthlyAverage").textContent =

            `${round(avg)} min`;

    }

    if ($("monthlyBest")) {

        $("monthlyBest").textContent =

            `${round(best)} min`;

    }

    if ($("monthlyWorst")) {

        $("monthlyWorst").textContent =

            `${round(worst)} min`;

    }

    if ($("timeSavedMonth")) {

        const saved =

            Math.round(

                (worst - avg) *

                state.filteredData.length

            );

        $("timeSavedMonth").textContent =

            `${saved} min`;

    }

    if ($("overallScore")) {

        const score =

            Math.max(

                1,

                Math.round(

                    100 - avg

                )

            );

        $("overallScore").textContent =

            `${score}/100`;

    }

}

console.log(

    "✓ Script Part 7 Loaded"

);

/* ============================================================
   PART 8
   HISTORY • CALCULATOR • ROUTES • INSIGHTS
============================================================ */

/* ============================================================
   HISTORY CHART
============================================================ */

function renderHistoryChart() {

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

                        borderColor: "#38bdf8",

                        backgroundColor:

                            "rgba(56,189,248,.15)",

                        borderWidth: 3,

                        tension: .35,

                        fill: true,

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


/* ============================================================
   LEAVE BY CALCULATOR
============================================================ */

function calculateDepartureTime() {

    const input = $("arrivalInput");

    if (!input) return;

    if (!state.recommendation) return;

    const parts = input.value.split(":");

    const hour = Number(parts[0]);

    const minute = Number(parts[1]);

    $("recommendedDeparture").textContent =

        subtractMinutes(

            hour,

            minute,

            state.recommendation.eta

        );

}


/* ============================================================
   ROUTE SUMMARY
============================================================ */

function updateRouteCards() {

    if (!state.filteredData.length) return;

    const row = state.filteredData[0];

    if ($("routeDuration")) {

        $("routeDuration").textContent =

            `${round(row.eta)} min`;

    }

    if ($("routeName")) {

        $("routeName").textContent =

            state.selectedDirection === "A→B"

            ? "Home → Office"

            : "Office → Home";

    }

    if ($("trafficDelay")) {

        const best =

            Math.min(

                ...state.filteredData.map(

                    r => r.eta

                )

            );

        $("trafficDelay").textContent =

            `${round(row.eta-best)} min`;

    }

}


/* ============================================================
   AI INSIGHTS
============================================================ */

function updateAIInsights() {

    if (!state.filteredData.length) return;

    const eta =

        state.filteredData.map(

            r => r.eta

        );

    const avg = average(eta);

    const best = Math.min(...eta);

    const worst = Math.max(...eta);

    console.group(

        "AI Insight"

    );

    console.log(

        "Average ETA:",

        round(avg)

    );

    console.log(

        "Best ETA:",

        round(best)

    );

    console.log(

        "Worst ETA:",

        round(worst)

    );

    console.log(

        "Possible Saving:",

        round(worst-best),

        "mins"

    );

    console.groupEnd();

}


/* ============================================================
   CALCULATOR EVENTS
============================================================ */

function initializeCalculator() {

    const button = $("calculateButton");

    if (!button) return;

    button.addEventListener(

        "click",

        calculateDepartureTime

    );

}

console.log(

    "✓ Script Part 8 Loaded"

);

/* ============================================================
   PART 9
   MAPS • FINAL REFRESH • STARTUP
============================================================ */

/* ============================================================
   GOOGLE MAP
============================================================ */

function initializeMap() {

    if (!window.google) {

        console.warn("Google Maps not loaded.");

        return;

    }

    const mapElement = $("map");

    if (!mapElement) return;

    state.map = new google.maps.Map(

        mapElement,

        {

            zoom: 13,

            center: {

                lat: 12.9716,

                lng: 77.5946

            },

            mapTypeControl: false,

            streetViewControl: false,

            fullscreenControl: false

        }

    );

}


/* ============================================================
   UPDATE MAP
============================================================ */

function updateMap() {

    if (!state.map) return;

    console.log(

        "Map refreshed:",

        state.selectedDirection

    );

}


/* ============================================================
   ROUTE LABELS
============================================================ */

function updateRouteSummary() {

    if (!state.filteredData.length) return;

    const row = state.filteredData[0];

    if ($("routeDuration")) {

        $("routeDuration").textContent =

            `${round(row.eta)} min`;

    }

    if ($("routeName")) {

        $("routeName").textContent =

            state.selectedDirection === "A→B"

            ? "🏠 Home → Office"

            : "🏢 Office → Home";

    }

}


/* ============================================================
   FINAL DASHBOARD REFRESH
============================================================ */

function refreshDashboard() {

    if (!state.filteredData.length) {

        console.warn("No rows available.");

        return;

    }

    calculateRecommendation();

    updateRecommendationCard();

    updateTrafficCard();

    updateSummaryCard();

    updateDecisionPanel();

    renderTrafficChart();

    renderWeeklyTrend();

    renderHeatmap();

    updateReliability();

    updateMonthlyScorecard();

    renderHistoryChart();

    updateRouteCards();

    updateRouteSummary();

    updateAIInsights();

    updateMap();

}


/* ============================================================
   INITIALIZATION
============================================================ */

async function initializeDashboard() {

    setTodayDate();

    initializeUI();

    initializeCalculator();

    initializeMap();

    await loadData();

}


/* ============================================================
   APPLICATION START
============================================================ */

window.addEventListener(

    "load",

    initializeDashboard

);

console.log(

    "✓ Commute Intelligence Ready"

);
