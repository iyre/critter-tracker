var settings = {
	"hemisphere" : "northern",
  "sort" : ["location","d"],
  "caught" : [],
  "hide_caught" : false,
  "hide_time" : false,
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

function toggleButton(event) {
  var toggle_id = event.target.id;
  var hide = readSetting(toggle_id);
  hide = !hide;
  writeSetting(toggle_id, hide);
  event.target.classList.toggle('enabled');
  buildList(fish);
}

function setTime() {
  var newTime = document.getElementById("datetime").value;
  console.log(newTime);
  if (newTime == "") {return;}
  console.log(Date.now());
  console.log(Date.parse(newTime));
  offset = Date.parse(newTime) - Date.now();
  writeSetting("offset", offset);
}

function showOffset() {
  var offsetForm = document.getElementById("offset");
  offsetForm.classList.toggle('hidden');
}

var clock = document.getElementById('clock');

var month = 0;
var hour = 0;
var last_hour = 0;
var offset = readSetting("offset");;

function time() {
  var d = new Date();
  d.setTime(d.getTime() + offset);
  var s = d.getSeconds();
  var m = d.getMinutes();
  hour = d.getHours();
  month = d.getMonth();

  if (last_hour != hour) {buildList(fish);}
  last_hour = hour;
  clock.textContent = d.toLocaleString();
}
time();
setInterval(time, 1000);


function buildList(data) {    
  //document.write('<table>');
  var tableHTML = '<thead><tr><th scope="col" id="name">Name</th><th scope="col" id="location">Location</th><th scope="col" id="size">Size</th></tr></thead><tbody>';
  var hideCaught = readSetting("hide_caught");
  var hideTime = readSetting("hide_time");
  for (var i in data) {
    //console.log(isCaught(i));
    //console.log(settings['hide']);
    var region = readSetting("hemisphere");
    var d = new Date();
    var month = d.getMonth();
    var hour = d.getHours();
    var months = data[i][region];
    var hours = data[i].hours;
    //console.log(hideCaught && (!months.includes(month) || !hours.includes(hour)));
		if (isCaught(i) && hideCaught) {
			console.log('hide: ' + i);
    }
    
    else if (hideTime && (!months.includes(month) || !hours.includes(hour))) {
      //console.log('not available');
    }
    else {
      //console.log('available')
      tableHTML += 
      '<tr id="' + i + '" class="' + (isCaught(i) ? 'checked' : '') + '">' + 
      '<td>' + data[i].name + '</td>' + 
      '<td>' + data[i].location + '</td>' + 
      '<td>' + data[i].size + '</td>' + 
      '</tr>';
    }
  }
  document.getElementById("fishList").innerHTML = tableHTML+'<tbody>';
}

buildList(fish);


var list = document.querySelector('table');
list.addEventListener('click', function(ev) {
  if (ev.target.tagName === 'TD') {
  	var fishid = ev.target.parentNode.id;
    toggleCaught(fishid);
    console.log(fishid);
    //console.log(caught.fish)
    buildList(fish)
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