/*let now = Math.floor(Date.now());
let future = new Date();
future.setDate(future.getDate() + 1);
console.log(future);
console.log(now);

let timeleft = future - now;
timeleft = Math.ceil(((timeleft / 1000) / 60) / 60); */

// document.getElementById("lastupdated").innerHTML = new Date(now);
const people = {
	"M001218": "McCormick",
	"O000174": "Ossoff",
	"W000790": "Warnock"
};
let data = null;

async function load() {
	if (localStorage.getItem('data') !== null) {
		console.log("Pulling from LocalStorage");
		data = JSON.parse(localStorage.getItem('data'));
	} else {
		console.log("Pulling from database");
		const response = await fetch("https://script.google.com/macros/s/AKfycbxl4CQQlaNGjXbtxxpU_dUjQpcM0c_pjwGZ8rgFXIkwiwaSLoKBiUFq5M6uafqdXVP_/exec");
		data = await response.json();
		localStorage.setItem('data', JSON.stringify(data));
	}
	
	document.getElementById("lastupdated").innerHTML = new Date(data.lastUpdated);
}

async function createPage() {
	let nav = document.getElementById("mainNav");
	let main = document.getElementById("main");

	Object.keys(people).forEach(function(id) {
		let person = people[id];
		let link = document.createElement("a");
		link.setAttribute("href", `#${person}`);
		link.textContent = person;
		nav.append(link);

		let div = document.createElement("div");
		div.setAttribute("id", `${person}`);
		let header = document.createElement("h3");
		header.textContent = person;
		div.append(header);
		let bills = data["bills"]
			.filter(item => item.CongressPerson === person)
			.sort((a, b) => new Date(b["Introduced Date"]) - new Date(a["Introduced Date"]));
		bills.forEach(function(bill) {
			let text = document.createElement("p");
			text.textContent = JSON.stringify(bill);	
			div.append(text);
		});
		main.append(div);

	});
	
}

load();
createPage();
