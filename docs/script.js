var settings = {
  "hemisphere" : "northern",
  "critter" : "fish",
  "sort" : ["location","d"],
  "caught" : [],
  "hide_caught" : false,
  "hide_time" : true,
  "offset" : 0
};

function readSetting(name) {
  if (localStorage.getItem(name) === null) {initStorage();}
  var value = JSON.parse(localStorage.getItem(name));
  return value;
}

function writeSetting(name, content) {
  var valueString = JSON.stringify(content);
  localStorage.setItem(name, valueString);
}

// initialize localstorage variables on first run
function initStorage() {
  for (var i in settings) {
    if (localStorage.getItem(i) === null) {
      localStorage.setItem(i, JSON.stringify(settings[i]));
    }
  }
}

initStorage();

//init toggle buttons
var toggleButtons = document.querySelectorAll('.toggleBtn');
toggleButtons.forEach((btn) => {
  if (readSetting(btn.id)) {
    btn.classList.toggle('enabled')
  }
});

var region = readSetting("hemisphere");
var hemisphereSwitch = document.getElementById("hemisphere");
//console.log(region);
hemisphereSwitch.innerHTML = region;

function changeHemisphere() {
  if (region === "northern") {
    region = "southern";
  } else {
    region = "northern";
  }
  hemisphere.innerHTML = region;
  writeSetting('hemisphere', region);
  buildList();
}

var critter = readSetting("critter");
var critterSwitch = document.getElementById("critter");
//console.log(critter);
critterSwitch.innerHTML = critter;

function changeCritterType() {
  if (critter === "fish") {
    critter = "bugs";
  } else {
    critter = "fish";
  }
  critterSwitch.innerHTML = critter;
  writeSetting('critter', critter);
  buildList();
}

function toggleButton(event) {
  var toggle_id = event.target.id;
  var hide = readSetting(toggle_id);
  hide = !hide;
  writeSetting(toggle_id, hide);
  event.target.classList.toggle('enabled');
  buildList();
}

function setTime() {
  var newTime = document.getElementById("datetime").value;
  if (newTime == "") {return;}
  offset = Date.parse(newTime) - Date.now();
  writeSetting("offset", offset);
  time();
  buildList();
}

function showOffset() {
  var offsetForm = document.getElementById("offset");
  offsetForm.classList.toggle('hidden');
}

var clock = document.getElementById('clock');

var month = 99;
var hour = 99;
var last_hour = 0;
var offset = readSetting("offset");;

function time() {
  var d = new Date();
  d.setTime(d.getTime() + offset);
  var s = d.getSeconds();
  var m = d.getMinutes();
  hour = d.getHours();
  month = d.getMonth();
  if (last_hour != hour) {buildList();}
  last_hour = hour;
  clock.textContent = d.toLocaleString();
}
time();
setInterval(time, 1000);

function filterCaught(filtered) {
  var caught = readSetting("caught");
  var result = filtered.filter(function(critter) {
    return caught.indexOf(critter.id) === -1;
  });
  return result;
}

function filterTime(filtered) {
  var result = filtered.filter(function(critter) {
    console.log(critter.months)
    return critter.hours.includes(hour) && critter[region].includes(month);
  });
  return result;
}

function filterValue(filtered,key,value) {
  var result = filtered.filter(function(critter) {
    return value === critter[key];
  });
  return result;
}

function buildList() {
  var tableHTML = '';
  var cols = {'fish': ['Name','Location','Size'], 'bugs':['Name','Location']}
  '<thead><tr></tr></thead><tbody>'
  '<th scope="col" id="name">Name</th><th scope="col" id="location">Location</th><th scope="col" id="size">Size</th>'
  var display = readSetting("critter");
  for (var i in cols[display]) {
    tableHTML += '<th id="' + cols[display][i] + '">' + cols[display][i] + '</th>'
  }
  tableHTML = '<thead><tr>' + tableHTML + '</tr></thead><tbody>'
  var hideCaught = readSetting("hide_caught");
  var hideTime = readSetting("hide_time");
  var filtered = critters;
  filtered = filterValue(filtered,'type',display);
  if (hideCaught) {filtered = filterCaught(filtered);}
  if (hideTime) {filtered = filterTime(filtered);}
  
  for (var i in filtered) {
    tableHTML += 
    '<tr id="' + filtered[i].id + '" class="' + (isCaught(filtered[i].id) ? 'checked' : '') + '">' + 
    '<td>' + filtered[i].name + '</td>' + 
    '<td>' + filtered[i].location + '</td>' + 
    '<td>' + filtered[i].size + '</td>' + 
    '</tr>';
  }
  document.getElementById("critterList").innerHTML = tableHTML+'<tbody>';
}

var list = document.querySelector('table');
list.addEventListener('click', function(ev) {
  if (ev.target.tagName === 'TD') {
  	var critter_id = ev.target.parentNode.id;
    toggleCaught(critter_id);
    console.log(critter_id);
    buildList()
  }
  //console.log(ev.target);
}, false);

function locateCaught(id) {
	return readSetting("caught").indexOf(id);
}

function isCaught(id) {
	return (locateCaught(id) > -1);
}

function toggleCaught(id) {
  var caught = readSetting("caught");
  if(isCaught(id)) {
    caught.splice(locateCaught(id),1);
  }
  else {
  	caught.push(id);
  }
  writeSetting("caught", caught);
}