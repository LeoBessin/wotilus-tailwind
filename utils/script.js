import moment from 'moment';
import 'moment/dist/locale/fr';
import { Chart, CategoryScale, TimeScale, BarController, BarElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

moment.locale('fr');

import 'chartjs-adapter-date-fns';
import { fr } from 'date-fns/locale';

let targetDiv;
let curState;
let position;
let history = [];
let startDate = new Date().getTime();
let timer = [];
let endDate;
let colours = "bg-purple-400/80 bg-green-400/80 bg-blue-400/80 " +
    "bg-purple-400/40 bg-green-400/40 bg-blue-400/40" +
    "bg-purple-600/80 bg-green-600/80 bg-blue-600/80";
let positions = "bottom-8 top-8 left-8 right-8";

const stateAttributes = {
    "drive": {
        "color": "purple",
        "icon": "life-buoy.svg"
    },
    "work": {
        "color": "green",
        "icon": "tool.svg"
    },
    undefined: {
        "color": "blue",
        "icon": "watch.svg"
    },
};

function onClick() {
    createScreen();
}

function init(id, positionArg = "bottom-right") {
    targetDiv = document.getElementById(id);
    if (!targetDiv) {
        throw new Error("Could not find mobilic target element");
    }
    position = positionArg;
    createStyle(positionArg);
}

function createStyle() {
    let positionValues = position.split("-");
    document.getElementById("mobilicButton")?.remove();
    let buttonElement = document.createElement("div");
    let notifElement2 = document.createElement("div");
    let notifElement = document.createElement("div");

    const button = `<button class='w-full h-full bg-${stateAttributes[curState].color}-400/80
 backdrop-blur-2xl rounded-3xl drop-shadow-xl ` +
        "flex justify-center items-center" +
        ` border-2 border-${stateAttributes[curState].color}-400/40 hover:scale-105 transition-all'>` +
        `<img class='w-2/3 h-2/3' alt='state' src='/${stateAttributes[curState].icon}'>` +
        "</button>";

    buttonElement.className = `w-16 h-16 absolute ${positionValues[0]}-8 ${positionValues[1]}-8`;
    buttonElement.innerHTML = button;
    notifElement.className = "w-1/6 h-1/6 bg-red-500 rounded-full absolute top-0 right-0 transition-all animate-ping";
    notifElement2.className = "w-1/6 h-1/6 scale-110 bg-red-500/50 rounded-full absolute top-0 right-0 " +
        "transition-all";
    buttonElement.id = "mobilicButton";
    if (timer[0]){
        buttonElement.appendChild(notifElement2);
        buttonElement.appendChild(notifElement);
    }
    targetDiv.appendChild(buttonElement);
    buttonElement.addEventListener("click", onClick);
}

function mapTime(timeArray) {
    if (timeArray.length === 0) {
        return -1;
    }
    let i = 1;
    let arrayToReturn = []
    timeArray.forEach((el) => {
        let date = new Date(el.time).getTime();
        let name = (el.state) ? (el.state === "work" ? "Travail" : "Conduite") : "Pause";
        let color = name === "Travail" ? "rgb(0,255,93)" : name === "Conduite" ? "rgb(126,0,255)" : "rgb(0,112,255)";
        let dateEnd;
        if (i === timeArray.length) {
            if(endDate){
                dateEnd = endDate
            }else{
                dateEnd = new Date().getTime();
            }
        } else {
            dateEnd = new Date(timeArray[i].time).getTime();
        }
        const data = name==="Travail"?[[date, dateEnd],[],[]]:name==="Conduite"?[[],[date, dateEnd],[]]:[[],[],[date, dateEnd]];
        arrayToReturn.push({ label: name, data: data, backgroundColor: color })
        i++;
    })
    console.log(arrayToReturn)
    return arrayToReturn
}

function historyScreen(){
    reset();
    let screenElement = document.createElement("div");
    let buttonElement = document.createElement("div");
    buttonElement.addEventListener("click", reset);
    buttonElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="text-white absolute right-6 top-6 ' +
        'hover:scale-105 transition-all cursor-pointer" width="32" height="32" viewBox="0 0 24 24" fill="#fff" ' +
        'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18"' +
        ' y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    screenElement.className = `w-full h-full bg-${stateAttributes[curState].color}-600/80 absolute top-0 left-0 
    flex flex-col justify-center items-center gap-4 backdrop-blur-sm`;
    screenElement.id = "wotilusScreen";
    screenElement.appendChild(buttonElement);
    targetDiv.appendChild(screenElement);

}


function createScreen() {
    let screenElement = document.createElement("div");
    let buttonElement = document.createElement("div");
    let choiceElement = document.createElement("div");
    let finishElement = document.createElement("div");
    let historyElement = document.createElement("div");
    let curStateElement = document.createElement("div");
    let chartElement = document.createElement("canvas");
    let validateElement = document.createElement("div");
    chartElement.id = "chart";
    chartElement.className = "w-full h-1/3 flex flex-col justify-center items-center text-white";
    buttonElement.addEventListener("click", reset);

    choiceElement.innerHTML = "<h2 class='text-white font-medium text-3xl'>Changer d'activité</h2>";
    finishElement.innerHTML = "<button class='text-white font-medium text-lg py-2 px-4 bg-red-400/90 rounded-xl" +
        " transition-all hover:scale-105'>Terminer la journée</button>";

    validateElement.innerHTML = "<button class='text-white font-medium text-lg py-2 px-4 bg-green-400/90 rounded-xl" +
        " transition-all hover:scale-105'>Valider la journée</button>";

    historyElement.innerHTML = "<h2 class='text-white font-medium text-3xl'>Historique</h2>";

    finishElement.addEventListener("click", () => {
        if (!endDate){
            endDate = moment.now();
            reset();
        }

    })

    validateElement.addEventListener("click", () => {
        history.push({name:`${moment(startDate).format("HH:mm:ss")}-${moment(endDate).format("HH:mm:ss")}`,timer:timer});
        fullReset();
    })

    if (curState !== "drive") {
        let choice1 = document.createElement("div");
        choice1.addEventListener("click", () => {
            curState = "drive";
            timer.push({ time: moment.now(), state: curState });
            reset();
        });
        choice1.innerHTML = "<button class='text-3xl text-white font-bold transition-all hover:scale-105'>- Conduite</button>";
        choiceElement.appendChild(choice1);

    }

    if (curState !== "work") {
        let choice2 = document.createElement("div");
        choice2.addEventListener("click", () => {
            curState = "work";
            timer.push({ time: moment.now(), state: curState });
            reset();
        });
        choice2.innerHTML = "<button class='text-3xl text-white font-bold transition-all hover:scale-105'>- Travail</button>";
        choiceElement.appendChild(choice2);
    }

    if (curState !== undefined) {
        let choice3 = document.createElement("div");
        choice3.addEventListener("click", () => {
            curState = undefined;
            timer.push({ time: moment.now(), state: curState });
            reset();
        })
        choice3.innerHTML = "<button class='text-3xl text-white font-bold transition-all hover:scale-105'>- Pause</button>";
        choiceElement.appendChild(choice3);
    }
    screenElement.className = `w-full h-full bg-${stateAttributes[curState].color}-600/80 absolute top-0 left-0 
    flex flex-col justify-center items-center gap-4 backdrop-blur-sm`;
    screenElement.id = "wotilusScreen";
    buttonElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="text-white absolute right-6 top-6 ' +
        'hover:scale-105 transition-all cursor-pointer" width="32" height="32" viewBox="0 0 24 24" fill="#fff" ' +
        'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18"' +
        ' y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'

    choiceElement.className = "flex flex-col gap-4 justify-center items-center";
    curStateElement.className = "w-1/2 flex justify-center";
    let curTimer;
    if (timer.length) {
        moment.locale('fr');
        curTimer = moment(timer[timer.length - 1].time);

    }
    let total = endDate?
        moment(moment(endDate).diff(moment(startDate))).subtract(1,"hours").format("HH:mm:ss"):
        moment(moment().diff(moment(startDate))).subtract(1,"hours").format("HH:mm:ss");
    curStateElement.innerHTML = `<div class="flex flex-col justify-center items-center gap-2">
                ${!endDate?`<img class='w-1/2 h-1/2' alt='state' src='/${stateAttributes[curState].icon}'>`+
                `<h2 class="text-white text-2xl text-center font-medium">`+
                `Activité en cours :<br/> ${curState === "work" ? "travail" : curState === "drive" ? "conduite" : "pause"}</h2>`:""}
                ${timer[0]? `<h3 class="text-white text-lg font-medium text-center">Début de la journée : ${moment(timer[0]?.time).format("HH:mm:ss")}</h3>`+
        `<h3 class="text-white text-lg font-medium text-center">Début de l'activité : ${moment(curTimer).format("HH:mm:ss")} (${curTimer.fromNow()})</h3>`+
        `<h3 class="text-white text-lg font-medium text-center">Durée totale : ${total}</h3>`:""}
        ${endDate?`<h3 class="text-white text-lg font-medium text-center">Fin de la journée : ${moment(endDate).format("HH:mm:ss")}</h3>`:""}`;

    screenElement.appendChild(buttonElement);
    screenElement.appendChild(curStateElement);
    if (timer[0]){
        screenElement.appendChild(chartElement);
        if (!endDate){
            screenElement.appendChild(finishElement);
        }else{
            screenElement.appendChild(validateElement);

        }
    }
    if(!endDate) {
        screenElement.appendChild(choiceElement);
    }
    if(history[0] && !endDate && !timer[0]){
        historyElement.innerHTML = `<div class="flex flex-col justify-center gap-2">
<h2 class="text-xl text-white font-medium text-center">Historique</h2>
${history.map((el)=>`<h3 class="text-xl text-white text-center">- ${el.name}</h3>`).join("")}</div>`
        screenElement.appendChild(historyElement);
    }
    targetDiv.appendChild(screenElement);

    Chart.register(CategoryScale, TimeScale, BarController, BarElement, ChartDataLabels);
    const labels = ["Travail", "Conduite", "Pause"];
    const date = new Date().getTime();
    const modelData = {
        labels: labels,
        datasets: mapTime(timer)
    };
    if (timer[0]){
        new Chart(document.getElementById("chart"), {
            type: 'bar',
            data: modelData,
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        type: 'time',
                        ticks:{
                            color: "white",
                            source: 'data',
                            callback: function(value, index, values) {
                                return moment(value).format("HH:mm:ss");
                            },
                            maxRotation: 60,
                            minRotation: 60
                        },
                        adapters: {
                            date: {
                                locale: fr
                            },
                        },
                        min: timer.length?timer[0].time:startDate,
                    },
                    y:{
                        stacked:true,
                        ticks:{
                            color: "white",
                        }
                    },
                },
                plugins: {
                    datalabels: {
                        formatter: (value, context) => {
                            let date1 = moment(value[0]);
                            let date2 = moment(value[1]);
                            return moment(date2.diff(date1)).subtract(1,"hours").format("HH:mm:ss");
                        },
                        color: "white",
                    },
                },
                animation: {
                    duration: 500
                },
                responsive: true,
            }
        });

    }
}

function reset() {
    let screenElement = document.getElementById("wotilusScreen");
    targetDiv.removeChild(screenElement);
    init(targetDiv.id, position);
}

function fullReset(){
    timer = [];
    curState = undefined;
    endDate = undefined;
    startDate = new Date().getTime();
    reset();
}

export { init };
