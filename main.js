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
	DGain: new Decimal("1e0"),
	PGain: new Decimal("0e0"),
	ascendC: new Decimal("1e2"),
	ascendCM: new Decimal("1.12e0"),
	ascendCoins: new Decimal("0e0"),
	ascendMult: new Decimal("1e0"),
	prestige: {
		cost: new Decimal("1e1"),
		mult: new Decimal("1e0")
	},
	upgrades: {
		1: {
			name: "Accelerated Destruction", // h2
			description: "Increases ascend gain (x1.5)", // h3
			level: new Decimal("0e0"), // prepend to description, +" level/max, cost Ascend Coins"
			max: new Decimal("1e2"),
			cost: new Decimal("1e-1"),
			costMult: new Decimal("2e0"),
			onbuy: () => {
				player.ascendMult = player.ascendMult.mul("1.5e0");
			}
		},
		2: {
			name: "Head Start", // h2
			description: "Increases BASE gain (x1.5)", // h3
			level: new Decimal("0e0"), // prepend to description, +" level/max, cost Ascend Coins"
			max: new Decimal("1e2"),
			cost: new Decimal("1e0"),
			costMult: new Decimal("2.5e0"),
			onbuy: () => {
				player.DGain = player.DGain.mul("1.5e0");
			}
		},
		3: {
			name: "Extra Gain", // h2
			description: "Prestige adds extra gain (+0.1).", // h3
			level: new Decimal("0e0"), // prepend to description, +" level/max, cost Ascend Coins"
			max: new Decimal("5e0"),
			cost: new Decimal("1e0"),
			costMult: new Decimal("1e1"),
			onbuy: () => {
				player.PGain = player.PGain.add("1e-1");
			}
		}
	}
}
const elementDef = {
	points: document.getElementById("points"),
	gain: document.getElementById("gain"),
	gainbutton: document.getElementById("gainbutton"),
	ascendG: document.getElementById("ascendG"),
	ascendC: document.getElementById("ascendC"),
	ascendCoins:  document.getElementById("ascendCoins"),
	ascendbutton: document.getElementById("ascendbutton"),
	upgrades: document.getElementById("upgrades"), // <div>
	prestigeG: document.getElementById("prestigeG"),
	prestigeC: document.getElementById("prestigeC"),
	prestigebutton: document.getElementById("prestigebutton")
}
const ascendDetails = [
    elementDef.ascendG,
    elementDef.ascendC,
	elementDef.ascendCoins,
    elementDef.ascendbutton,
	elementDef.upgrades
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

    const reward = player.points.mul(player.prestige.mult).lte(player.ascendC)
        ? new Decimal(0)
        : player.points
			.mul(player.prestige.mult)
			.sub(player.ascendC)
            .add(player.gain)
            .log10()
            .mul(player.ascendMult)

    return after ? player.gain.add(reward) : reward;
}

const upgradeUI = {};

function buyUpgrade(id) {
	const u = player.upgrades[id];
	if (u.level.gte(u.max) || player.ascendCoins.lt(u.cost)) return;

	player.ascendCoins = player.ascendCoins.sub(u.cost);
	u.onbuy();
	u.level = u.level.add(1);
	u.cost = u.cost.mul(u.costMult);
}

function renderUpgrades() {
	for (const id in player.upgrades) {
		const u = player.upgrades[id];

		const row = document.createElement("div");
		row.className = "upgrade";

		const title = document.createElement("h2");
		title.textContent = u.name;

		const desc = document.createElement("h3");
		desc.textContent = u.description;

		const info = document.createElement("p");
		const btn = document.createElement("button");
		btn.addEventListener("click", () => buyUpgrade(id));

		row.append(title, desc, info, btn);
		elementDef.upgrades.append(row);

		upgradeUI[id] = { info, btn };
	}
}



renderUpgrades();

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
    elementDef.points.textContent = `Points: ${format(player.points)}`;
    elementDef.gain.textContent = `Gain: ${format(player.gain)}`;
	elementDef.ascendG.textContent = `Gain after Ascend: ${format(ascReward(true))}`;
	elementDef.ascendC.textContent = `Ascend Cost: ${format(player.ascendC)} (factually: ${player.ascendC.div(player.prestige.mult).toFixed(4)})`;
	elementDef.ascendCoins.textContent = `You will also gain this much Ascend Coins: ${format(ascReward().sqrt())} (currently: ${format(player.ascendCoins)})`;
	elementDef.prestigeG.textContent = `Ascend Multiplier after Prestige: ${format(ascReward(true,true))}`;
	elementDef.prestigeC.textContent = `Gain required to Prestige: ${format(player.prestige.cost)}`;
	
	for (const id in player.upgrades) {
		const u = player.upgrades[id];
		const ui = upgradeUI[id];

		if (u.level.gte(u.max)) {
			ui.info.textContent = `Level: ${format(u.level)}/${format(u.max)} | MAX`;
			ui.btn.textContent = "MAX";
			ui.btn.disabled = true;
		} else {
			ui.info.textContent = `Level: ${format(u.level)}/${format(u.max)} | Cost: ${format(u.cost)} Ascend Coins`;
			ui.btn.textContent = "Buy";
			ui.btn.disabled = player.ascendCoins.lt(u.cost);
		}
	}
}

function ascend() {
	var pgain = ascReward();
	if (pgain.gte(new Decimal("1e-1"))) {
		player.gain = player.gain.add(pgain);
		player.points = new Decimal("0e0");
		player.ascendC = player.ascendC.mul(player.ascendCM);
		player.ascendCoins = player.ascendCoins.add(pgain.sqrt())
		ascended = true;
	}
}
function prestige() {
	var pgain = ascReward(false,true);
	if (pgain.gte(new Decimal("1e-1"))) {
		player.prestige.mult = player.prestige.mult.add(pgain);
		player.points = new Decimal("0e0");
		player.gain = player.DGain.add(player.PGain); player.DGain=player.DGain.add(player.PGain)
		player.ascendC = new Decimal("1e2");
		player.ascendCoins = new Decimal("0e0");
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