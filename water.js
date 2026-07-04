
let totalWater = 0;
const goal = 2000;

let alarmInterval;
let snoozeTimeout;
let goalTriggered = false;
let lastAdded = 0;
const glassCount=document.getElementById("glassCount");
const streak=document.getElementById("streak");
const badge=document.getElementById("badge");
const historyList=document.getElementById("historyList");

const sounds = {
    click: new Audio("universfield-sound-of-a-drop-of-water-131023.mp3"),      // plays on +250/+500/+1000/undo/reset
    alarm: new Audio("mixkit-classic-alarm-995.wav"),      // plays when reminder time hits
    goal: new Audio("puyopuyomegafan1234-winner-game-sound-404167.mp3"), // plays when daily goal is reached
};

function playSound(type) {
    const sound = sounds[type];
    if (!sound) return;
    sound.currentTime = 0; 
    sound.play().catch(() => {
        
    });
}

const waterAmount = document.getElementById("waterAmount");
const percentage = document.getElementById("percentage");
const totalIntake = document.getElementById("totalIntake");
const remainingWater = document.getElementById("remainingWater");
const progressCircle = document.querySelector(".progress");


function getTodayKey() {
    // e.g. "2026-07-03" - unique per calendar day
    return new Date().toISOString().split("T")[0];
}



function loadData() {
    const savedDate = localStorage.getItem("waterDate");
    const today = getTodayKey();

    if (savedDate === today) {
        // Same day → restore saved intake
        totalWater = parseInt(localStorage.getItem("water")) || 0;
    } else {
        // New day → save yesterday's total into weekly history, then reset
        if (savedDate) {
            const previousTotal = parseInt(localStorage.getItem("water")) || 0;
            saveWeeklyData(new Date(savedDate), previousTotal);
        }
        totalWater = 0;
        localStorage.setItem("waterDate", today);
        localStorage.setItem("water", 0);
    }
}

/* =========================
   SAVE WEEKLY DATA
========================= */

function saveWeeklyData(dateObj = new Date(), amount = totalWater) {
    const day = dateObj.getDay();
    const weekly = JSON.parse(localStorage.getItem("weeklyWater")) || [0, 0, 0, 0, 0, 0, 0];

    weekly[day] = amount;

    localStorage.setItem("weeklyWater", JSON.stringify(weekly));
    return weekly;
}
function addHistory(amount){

    let li=document.createElement("li");

    let time=new Date().toLocaleTimeString([],{
        hour:"2-digit",
        minute:"2-digit"
    });

    li.textContent=`${time}  +${amount} ml`;

    historyList.prepend(li);

}



function updateUI() {

    let percent = (totalWater / goal) * 100;
    if (percent > 100) percent = 100;

    waterAmount.textContent = totalWater + " ml";
    percentage.textContent = Math.floor(percent) + "%";

    totalIntake.textContent = totalWater + " ml";
    remainingWater.textContent = Math.max(goal - totalWater, 0) + " ml";
    glassCount.textContent = Math.floor(totalWater / 250) + " / 8";
    if (totalWater >= goal) {
    goalStatus.textContent = "✅ Completed";
    } else {
    goalStatus.textContent = "❌ In Progress";
    }

    const offset = 565 - (565 * percent) / 100;
    progressCircle.style.strokeDashoffset = offset;
    glassCount.textContent=Math.floor(totalWater/250)+" / 8";
    // Persist today's intake
    localStorage.setItem("water", totalWater);
    localStorage.setItem("waterDate", getTodayKey());

    const weekly = saveWeeklyData(new Date(), totalWater);
    updateChart(weekly);

    if (totalWater >= goal && !goalTriggered) {
        goalTriggered = true;
        document.querySelector(".goal-card").classList.add("goal-complete");
        launchConfetti();
        playSound("goal");
    }

    if (totalWater < goal) {
        goalTriggered = false;
        document.querySelector(".goal-card").classList.remove("goal-complete");
    }
}

/* =========================
   ADD WATER
========================= */

document.querySelectorAll(".addWater").forEach(btn => {
    btn.addEventListener("click", () => {
        lastAdded = parseInt(btn.dataset.value);
        totalWater += lastAdded;
        playSound("click");
        addHistory(lastAdded);

        updateUI();
    });
});

/* =========================
   UNDO
========================= */

document.getElementById("undoBtn").addEventListener("click", () => {
    totalWater -= lastAdded;
    if (totalWater < 0) totalWater = 0;
    playSound("click");
    updateUI();
});



document.getElementById("resetBtn").addEventListener("click", () => {
    totalWater = 0;
    lastadded=0;
    historyList.innerHTML = "";
    playSound("click");
    updateUI();
});



const themeBtn = document.getElementById("themebtn");

function applyTheme() {
    const isDark = localStorage.getItem("darkMode") === "true";
    document.body.classList.toggle("dark", isDark);
}

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
});

/* =========================
   DATE DISPLAY
========================= */

document.getElementById("currentdate").textContent =
    new Date().toDateString();

/* =========================
   TIPS
========================= */

const tips = [
    "Drink water before meals 💧",
    "Stay hydrated for glowing skin ✨",
    "Water improves focus 🧠",
    "Hydration boosts energy ⚡",
    "Drink 8–10 glasses daily 🚰"
];

setInterval(() => {
    document.getElementById("tip").textContent =
        tips[Math.floor(Math.random() * tips.length)];
}, 5000);


function launchConfetti() {

    let canvas = document.createElement("canvas");
    document.body.appendChild(canvas);

    canvas.style.position = "fixed";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "999";
    canvas.style.pointerEvents = "none";

    let ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let pieces = [];

    for (let i = 0; i < 120; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 6 + 2
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#38bdf8";

        pieces.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });

        pieces.forEach(p => {
            p.y += 3;
            if (p.y > canvas.height) p.y = 0;
        });
    }

    let interval = setInterval(draw, 30);

    setTimeout(() => {
        clearInterval(interval);
        canvas.remove();
    }, 4000);
}

/* =========================
   ALARM
========================= */

document.getElementById("setAlarm").addEventListener("click", () => {
    let time = document.getElementById("alarmTime").value;

    clearInterval(alarmInterval);
    clearTimeout(snoozeTimeout);

    if (time === "") {
        alert("Please pick a time first");
        return;
    }

    alarmInterval = setInterval(() => {
        let now = new Date();

        let current =
            String(now.getHours()).padStart(2, '0') + ":" +
            String(now.getMinutes()).padStart(2, '0');

        if (current === time) {
            playSound("alarm");
            alert("💧 Drink Water!");
        }
    }, 60000);

    alert("Alarm Set");
});

document.getElementById("stopAlarm").addEventListener("click", () => {
    clearInterval(alarmInterval);
    clearTimeout(snoozeTimeout);
    alert("Alarm Stopped");
});

document.getElementById("snoozeAlarm").addEventListener("click", () => {
    const minutes = parseInt(document.getElementById("interval").value) || 10;

    clearInterval(alarmInterval);
    clearTimeout(snoozeTimeout);

    snoozeTimeout = setTimeout(() => {
        playSound("alarm");
        alert("💧 Snooze over — Drink Water!");
    }, minutes * 60000);

    alert(`Snoozed for ${minutes} minute(s)`);
});


let chartCtx = document.getElementById("waterChart").getContext("2d");
let weeklyInit = JSON.parse(localStorage.getItem("weeklyWater")) || [0, 0, 0, 0, 0, 0, 0];

let waterChart = new Chart(chartCtx, {
    type: "bar",
    data: {
        labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        datasets: [{
            label: "Intake (ml)",
            data: weeklyInit,
            backgroundColor: "#38bdf8"
        }]
    }
});

function updateChart(weeklyData) {
    waterChart.data.datasets[0].data = weeklyData;
    waterChart.update();
}


loadData();
applyTheme();
updateUI();