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

function createRow(headerText, cellText) {
	let tr = document.createElement("tr");
	let header = document.createElement("th");
	header.setAttribute("scope", "row");
	header.textContent = headerText; 
	let cell = document.createElement("td");
	cell.textContent = cellText
	tr.append(header);
	tr.append(cell);
	return tr
}

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

async function grabActivities(bill) {
	const response = await fetch(`https://api.congress.gov/v3/bill/119/${bill["Bill Type"].toLowerCase()}/${bill["Bill Number"]}/actions?format=json&api_key=hKFfR1PceFsoUsZBZ70sE3YfOEbnHrIxbWah4036`);
	return response.json();
}

async function grabText(bill) {
	const response = await fetch(`https://api.congress.gov/v3/bill/119/${bill["Bill Type"].toLowerCase()}/${bill["Bill Number"]}/text?format=json&api_key=hKFfR1PceFsoUsZBZ70sE3YfOEbnHrIxbWah4036`);
	return response.json();
}

async function createPage() {
	let nav = document.getElementById("mainNav");
	let main = document.getElementById("main");

	for await (id of Object.keys(people)) {
		let person = people[id];
		let link = document.createElement("a");
		link.setAttribute("href", `#${person}`);
		link.textContent = person;
		nav.append(link);

		let div = document.createElement("div");
		div.setAttribute("id", `${person}`);
		div.setAttribute("class", "person");
		let header = document.createElement("h3");
		header.textContent = person;
		div.append(header);
		let bills = data["bills"]
			.filter(item => item.CongressPerson === person)
			.sort((a, b) => new Date(b["Introduced Date"]) - new Date(a["Introduced Date"]));
		for await (const bill of bills) {
			let date = new Date(bill["Introduced Date"]);
			let newdate = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();

			
			let button = document.createElement("button");
			button.setAttribute("class", "collapsible");
			button.textContent = `${bill["Bill Type"]}${bill["Bill Number"]}`;
			let content = document.createElement("div");
			content.setAttribute("class", "content");
			let table = document.createElement("table");
			let tbody = document.createElement("tbody");
			tbody.append(createRow("Title:", bill["Title"]));
			tbody.append(createRow("Sponsor Type:", `${bill["SponsorType"]} (Introduced ${newdate})`));
			
			let tr = document.createElement("tr");
			let header = document.createElement("th");
			header.setAttribute("scope", "row");
			header.textContent = "Activities:"; 
			let cell = document.createElement("td");
			let activities = await grabActivities(bill);
			for await (const action of activities["actions"]) {
				let li = document.createElement("li");
				li.textContent = `${action["text"]} - (${action["actionDate"]})`;
				cell.append(li);
			}

			tr.append(header);
			tr.append(cell);
			tbody.append(tr);

			tr = document.createElement("tr");
			header = document.createElement("th");
			header.setAttribute("scope", "row");
			header.textContent = "Text:"; 
			cell = document.createElement("td");
			let anchor = document.createElement("a");
			anchor.textContent = "No Text Yet";
			let billText = await grabText(bill);
			if (billText["textVersions"].length > 0) {
				anchor.setAttribute("class", "billText");
				anchor.setAttribute("href", billText["textVersions"][0]["formats"][0]["url"]);
				anchor.textContent = billText["textVersions"][0]["formats"][0]["url"];
			}
			cell.append(anchor);

			tr.append(header);
			tr.append(cell);
			tbody.append(tr);
			
			table.append(tbody);
			content.append(table);
			div.append(button);
			div.append(content);
		


		}
		main.append(div);

	}

	let coll = document.getElementsByClassName("collapsible");

	for (let i = 0; i < coll.length; i++) {
		coll[i].addEventListener("click", function() {
                        this.classList.toggle("active");
                        let content = this.nextElementSibling;
                        if (content.style.maxHeight) {
                                content.style.maxHeight = null;
                        } else {
                                content.style.maxHeight = content.scrollHeight + "px";
                        }
                });

	}
	
}

load();
createPage();
