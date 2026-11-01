import Decimal from "./break_eternity.js";

function format(num,p) {
    return num.toFixed(p ?? 3).replace(/\.?0+$/, "");
}
let ascended = false;
const player = {
	points: new Decimal("1e0"),
	gain: new Decimal("1e0"),
	ascendC: new Decimal("1e2"),
	ascendCM: new Decimal("1.12e0"),
	rust: {
		amount = new Decimal("0e1"),
		
	}
}
const elementDef = {
	points: document.getElementById("points"),
	gain: document.getElementById("gain"),
	gainbutton: document.getElementById("gainbutton"),
	ascendG: document.getElementById("ascendG"),
	ascendC: document.getElementById("ascendC"),
	ascendbutton: document.getElementById("ascendbutton")
}
const ascendDetails = [
    elementDef.ascendG,
    elementDef.ascendC,
    elementDef.ascendbutton
];

function upd() {
	if (player.points.lt("1e2") && !ascended) {
		ascendDetails.forEach(el => {
			el.style.display = "none";
		});
	} else {
		ascendDetails.forEach(el => {
			el.style.display = "";
		});
	}
    elementDef.points.textContent = `Points: ${format(player.points)}`;
    elementDef.gain.textContent = `Gain: ${format(player.gain)}`;
	elementDef.ascendG.textContent = `Gain after Ascend: ${format(player.gain.add(player.points.lte(player.ascendC) ? new Decimal(0) : player.points.sub(player.ascendC).add(player.gain).log10()))}`;
	elementDef.ascendC.textContent = `Ascend Cost: ${format(player.ascendC)}`;
}
function ascend() {
	var pgain = player.points.lte(player.ascendC) ? new Decimal(0) : player.points.sub(player.ascendC).add(player.gain).log10();
	if (pgain.gte(new Decimal("1e-1"))) {
		player.gain = player.gain.add(pgain);
		player.points = new Decimal("1e0");
		player.ascendC = player.ascendC.mul(player.ascendCM);
		ascended = true;
	}
}


elementDef.gainbutton.addEventListener("click", () => {
    player.points = player.points.add(player.gain);
});
elementDef.ascendbutton.addEventListener("click", () => {
    ascend();
});




window.player = player;
window.Decimal = Decimal;
setInterval(() => {
	upd();
},25)