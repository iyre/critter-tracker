var settings = {
  "critter_tracker_version" : "0.6",
  "critter_hemisphere" : "northern",
  "critter_type" : "fish",
  "critter_sort" : [["size","desc"],["location","desc"],["name","desc"]],
  "critter_caught" : [],
  "critter_hide_caught" : false,
  "critter_hide_time" : true,
  "critter_time_offset" : 0
};

function readSetting(name) {
  var result = JSON.parse(localStorage.getItem(name));
  if (result === null) {
    result = settings[name];
  }
  return result;
}

function writeSetting(name, content) {
  var valueString = JSON.stringify(content);
  localStorage.setItem(name, valueString);
  settings[name] = content;
}

// initialize localstorage variables on first run
function initStorage() {
  // reset settings only if version has changed (to avoid malfunctions due to old bugs)
  if (localStorage.getItem("critter_tracker_version") != settings["critter_tracker_version"]) {
    for (var i in settings) {
      if (i === "critter_caught") {continue;} //don't overwrite caught critters
      localStorage.setItem(i, JSON.stringify(settings[i]));
    }
  }
  // create any missing settings
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

var region = readSetting("critter_hemisphere");
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
  writeSetting('critter_hemisphere', region);
  buildList();
}

var critterType = readSetting("critter_type");
var critterSwitch = document.getElementById("critter");
//console.log(critter);
critterSwitch.innerHTML = critterType;

function changeCritterType() {
  if (critterType === "fish") {
    critterType = "bugs";
  } else {
    critterType = "fish";
  }
  critterSwitch.innerHTML = critterType;
  writeSetting('critter_type', critterType);
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
  writeSetting("critter_time_offset", offset);
  time();
}

function resetTime() {
  offset = 0;
  writeSetting("critter_time_offset", offset);
  time();
}

function showOffset() {
  var offsetForm = document.getElementById("offset");
  offsetForm.classList.toggle('hidden');
}

var clock = document.getElementById('clock');

var month = 99;
var hour = 99;
var last_hour = 99;
var offset = readSetting("critter_time_offset");;

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
  var caught = readSetting("critter_caught");
  var result = filtered.filter(function(critter) {
    return caught.indexOf(critter.id) === -1;
  });
  return result;
}

function filterTime(filtered) {
  var result = filtered.filter(function(critter) {
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

function compareValues(key, order = 'desc') {
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0;
    }

    const varA = (typeof a[key] === 'string')
      ? a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string')
      ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order === 'asc') ? (comparison * -1) : comparison
    );
  };
}

function sortArrayByKey(critterArray) {
  var sort = readSetting('critter_sort');
  result = critterArray;
  for (column of sort) {
    result = result.sort(compareValues(column[0],column[1]));
  }
  return result;
}

function buildList() {
  var tableHTML = '';
  var cols = {'fish': ['Name','Location','Size'], 'bugs':['Name','Location']}
  for (var i in cols[critterType]) {
    tableHTML += '<th id="' + cols[critterType][i].toLowerCase() + '">' + cols[critterType][i] + '</th>'
  }
  tableHTML = '<thead><tr>' + tableHTML + '</tr></thead><tbody>'
  var hideCaught = readSetting("critter_hide_caught");
  var hideTime = readSetting("critter_hide_time");
  var filtered = filterValue(critters,'type',critterType);

  if (hideCaught) {filtered = filterCaught(filtered);}
  if (hideTime) {filtered = filterTime(filtered);}

  filtered = sortArrayByKey(filtered);
  
  for (var i in filtered) {
    tableHTML += '<tr id="' + filtered[i].id + '" class="' + (isCaught(filtered[i].id) ? 'checked' : '') + '">';
    tableHTML += '<td>' + filtered[i].name + '</td>';
    tableHTML += '<td>' + filtered[i].location + '</td>';
    if (critterType === "fish") {tableHTML += '<td>' + filtered[i].size + '</td>';}
    tableHTML += '</tr>';
  }
  document.getElementById("critterList").innerHTML = tableHTML+'<tbody>';
}

var list = document.querySelector('table');
list.addEventListener('click', function(ev) {
  if (ev.target.tagName === 'TD') {
  	var critter_id = ev.target.parentNode.id;
    toggleCaught(critter_id);
    //console.log(critter_id);
    buildList()
  }
  if (ev.target.tagName === 'TH') {
    //console.log(ev.target.id);
    setSort(ev.target.id);
  }
}, false);

function setSort(column) {
  var sortSetting = readSetting('critter_sort');
  var lastSort = sortSetting.length-1;
  if (sortSetting[lastSort][0] === column) {
    sortSetting[lastSort][1] = sortSetting[lastSort][1] === 'desc' ? 'asc' : 'desc';
    //console.log('toggle',column,sortSetting[lastSort][1]);
  }
  else {
    for (var i=0; i<lastSort; i++) {
      sortSetting[i] = sortSetting[i+1]; 
    }
    sortSetting[lastSort] = [column.toLowerCase(),'desc'];
  }
  writeSetting('critter_sort',sortSetting);
  buildList();
}

function locateCaught(id) {
	return readSetting("critter_caught").indexOf(id);
}

function isCaught(id) {
	return (locateCaught(id) > -1);
}

function toggleCaught(id) {
  var caught = readSetting("critter_caught");
  if(isCaught(id)) {
    caught.splice(locateCaught(id),1);
  }
  else {
  	caught.push(id);
  }
  writeSetting("critter_caught", caught);
}
