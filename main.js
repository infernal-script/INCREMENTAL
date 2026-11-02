import Decimal from "./break_eternity.js";

function format(num, p) {
    if (num.abs().gte(1e15)) {
        return num.toString();
    }

    return num.toFixed(p ?? 3).replace(/\.?0+$/, "");
}
let ascended = false;
let prestiged = false;
const player = {
	points: new Decimal("0e0"),
	gain: new Decimal("1e0"),
	ascendC: new Decimal("1e2"),
	ascendCM: new Decimal("1.12e0"),
	prestige: {
		cost: new Decimal("1e1"),
		mult: new Decimal("1e0")
	}
}
const elementDef = {
	points: document.getElementById("points"),
	gain: document.getElementById("gain"),
	gainbutton: document.getElementById("gainbutton"),
	ascendG: document.getElementById("ascendG"),
	ascendC: document.getElementById("ascendC"),
	ascendbutton: document.getElementById("ascendbutton"),
	prestigeG: document.getElementById("prestigeG"),
	prestigeC: document.getElementById("prestigeC"),
	prestigebutton: document.getElementById("prestigebutton")
}
const ascendDetails = [
    elementDef.ascendG,
    elementDef.ascendC,
    elementDef.ascendbutton
];

const prestigeDetails = [
    elementDef.prestigeG,
    elementDef.prestigeC,
    elementDef.prestigebutton
];

function ascReward(after, prestige) {
    if (prestige) {
        const reward = player.gain.lte(player.prestige.cost)
            ? new Decimal(0)
            : player.gain
                .sub(player.prestige.cost)
                .add(1)
                .ln();

        return after ? player.prestige.mult.add(reward) : reward;
    }

    const reward = player.points.lte(player.ascendC)
        ? new Decimal(0)
        : player.points.sub(player.ascendC)
            .add(player.gain)
            .log10()
            .mul(player.prestige.mult);

    return after ? player.gain.add(reward) : reward;
}

function upd() {
	// Hide blocked layers
	if (player.points.lt("1e2") && !ascended) {
		ascendDetails.forEach(el => {
			el.style.display = "none";
		});
	} else {
		ascendDetails.forEach(el => {
			el.style.display = "";
		});
	}
	if (player.gain.lt("1e1") && !prestiged) {
		prestigeDetails.forEach(el => {
			el.style.display = "none";
		});
	} else {
		prestigeDetails.forEach(el => {
			el.style.display = "";
		});
	}
	// Upgrade text
    elementDef.points.textContent = `Points: ${format(player.points)}`;
    elementDef.gain.textContent = `Gain: ${format(player.gain)}`;
	elementDef.ascendG.textContent = `Gain after Ascend: ${format(ascReward(true))}`;
	elementDef.ascendC.textContent = `Ascend Cost: ${format(player.ascendC)}`;
	elementDef.prestigeG.textContent = `Ascend Multiplier after Prestige: ${format(ascReward(true,true))}`;
	elementDef.prestigeC.textContent = `Gain required to Prestige: ${format(player.prestige.cost)}`;
}
function ascend() {
	var pgain = ascReward();
	if (pgain.gte(new Decimal("1e-1"))) {
		player.gain = player.gain.add(pgain);
		player.points = new Decimal("0e0");
		player.ascendC = player.ascendC.mul(player.ascendCM);
		ascended = true;
	}
}
function prestige() {
	var pgain = ascReward(false,true);
	if (pgain.gte(new Decimal("1e-1"))) {
		player.prestige.mult = player.prestige.mult.add(pgain);
		player.points = new Decimal("0e0");
		player.gain = new Decimal("1e0");
		player.ascendC = new Decimal("1e2");
		prestiged = true;
	}
}


elementDef.gainbutton.addEventListener("click", () => {
    player.points = player.points.add(player.gain);
});
elementDef.ascendbutton.addEventListener("click", () => {
    ascend();
});
elementDef.prestigebutton.addEventListener("click", () => {
    prestige();
});




window.player = player;
window.Decimal = Decimal;
setInterval(() => {
	upd();
},25)