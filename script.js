var settings = {
  "version" : "v0.9",
  "caught" : [],
  "offset" : 0,
  "filters" : {
    "caught" : false,
    "unavailable" : true
  },
  "order" : [
      ['name','asc'],
      ['name','asc'],
      ['name','asc']
  ],
  "toggles" : {
      "type" : "fish",
      "hemisphere" : "northern",
      "theme" : "light"
  },
  "info" : {
      "info-sprite" : true,
      "info-price" : false,
      "info-location" : true,
      "info-size" : true
  }
};


if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/critter-tracker/sw.js')
    .then(reg => console.log('service worker registered'))
    .catch(err => console.log('service worker not registered', err));
}

function readSetting(name,raw=false) {
  let itemString = "critter_tracker_" + name;
  var result = JSON.parse(localStorage.getItem(itemString));
  if (result === null && !raw) {
    result = settings[name];
  }
  return result;
}

function writeSetting(name) {
  let itemString = "critter_tracker_" + name;
  var valueString = JSON.stringify(settings[name]);
  localStorage.setItem(itemString, valueString);
}

function importCaughtCritters() {
  let current = readSetting("caught");
  let legacy1 = JSON.parse(localStorage.getItem("critter_caught"));
  let legacy2 = JSON.parse(localStorage.getItem("caught"));
  if (Array.isArray(legacy1)) {current = current.concat(legacy1);}
  if (Array.isArray(legacy2)) {current = current.concat(legacy2);}
  let tempObj = new Object();
  for (item of current) {
    let stripped = item.replace(/[^a-zA-Z]/g, "");
    if (stripped === "") {continue;}
    tempObj[stripped] = null;
  }
  settings.caught = Object.keys(tempObj);
  writeSetting("caught");
}

// initialize localstorage variables on first run
function initStorage() {
  // reset settings only if version has changed (to avoid malfunctions due to old bugs)
  let outdated = (readSetting("version",true) != settings.version);
  if (outdated) {
    console.log('updating caught critters array');
    importCaughtCritters(); //changes to format - convert old list
  }
  for (var i in settings) {
    if (readSetting(i,true) === null) {
      console.log('init','write',i);
      writeSetting(i);
    }
    else if (outdated && i != "caught") {
      console.log('init2','write',i);
      writeSetting(i);
    }
    else {
      console.log('init','read',i);
      settings[i] = readSetting(i);
    }
  }
}

initStorage();

function setTime() {
  var newTime = document.getElementById("datetime").value;
  if (newTime == "") {return;}
  offset = Date.parse(newTime) - Date.now();
  settings.offset = offset;
  writeSetting("offset");
  time();
}

function resetTime() {
  offset = 0;
  settings.offset = 0;
  writeSetting("offset");
  time();
}

var clock = document.getElementById('clock');
var month = 99;
var hour = 99;
var last_hour = 99; //for automatic update on the hour change
var offset = readSetting("offset");

function time() {
  var d = new Date();
  d.setTime(d.getTime() + offset);
  var tzoffset = d.getTimezoneOffset() * 60000;
  var s = d.getSeconds();
  var m = d.getMinutes();
  hour = d.getHours();
  month = d.getMonth();
  var mon = new Array();
  mon[0] = "January";
  mon[1] = "February";
  mon[2] = "March";
  mon[3] = "April";
  mon[4] = "May";
  mon[5] = "June";
  mon[6] = "July";
  mon[7] = "August";
  mon[8] = "September";
  mon[9] = "October";
  mon[10] = "November";
  mon[11] = "December";
  var n = mon[d.getMonth()];
  var dateString = '<h3 class="date">' + n + ' ' + d.getDate() + '</h3>';
  dateString += '<h3 class="time">' + d.toLocaleTimeString() + '</h3>';
  if (last_hour != hour) {buildList();}
  last_hour = hour;
  clock.innerHTML = dateString;
}

function setDatePlaceholder() {
  var localTime = new Date(Date.now() + offset);
  var localTimeISO = localTime.toLocaleString().slice(0, -1);
  var dateTimeInput = document.getElementById('datetime');
  console.log(Date.now())
  console.log(offset);
  console.log(localTime);
  console.log(localTimeISO);
  dateTimeInput.value = localTimeISO;//d.toISOString();
  console.log(dateTimeInput.value)
}

time();
setInterval(time, 1000);
//setDatePlaceholder()

function filterCaught(filtered) {
  var caught = readSetting("caught");
  var result = filtered.filter(function(critter) {
    return caught.indexOf(critter.id) === -1;
  });
  return result;
}

function filterTime(filtered,region="northern") {
  var result = filtered.filter(function(critter) {
    //console.log(month,critter[region]);
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

function compareValues(key, order = 'asc') {
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
  var order = readSetting('order');
  result = critterArray;
  for (var i = order.length-1; i >=0; i--) {
    result = result.sort(compareValues(order[i][0],order[i][1]));
  }
  return result;
}

function buildList() {
  window.scrollTo(0,0);
  var grid = document.getElementById("cards");
  var filters = readSetting("filters");
  var toggles = readSetting("toggles");
  var info = readSetting("info");
  var filtered = filterValue(critters,'type',toggles.type);
  if (filters.caught) {filtered = filterCaught(filtered);}
  if (filters.unavailable) {filtered = filterTime(filtered,toggles.hemisphere);}

  filtered = sortArrayByKey(filtered);
  
  var gridStr = ''
  for (critter of filtered) {
    var itemStr = '<article class="' + critter.type + (isCaught(critter.id) ? ' checked' : '') + '" id="' + critter.id + '">';
    itemStr += '<header class="critter-name"><h3>' + critter.name + '</h3></header>';
    if (info['info-sprite']) itemStr += '<div class="critter-image">' + '<img src="images/sprites/' + critter.type + '/' + critter.id + '.png"/>' + '</div>';
    if (info['info-price']) itemStr += '<div class="critter-info">' + critter.price.toLocaleString() + '</div>';
    if (info['info-location']) itemStr += '<div class="critter-info">' + critter.location + '</div>';
    if (info['info-size'] && toggles.type === "fish") itemStr += '<div class="critter-info">' + critter.size + '</div>';
    itemStr += '</article>';
    gridStr += itemStr;
  }
  grid.innerHTML = gridStr;
  updateCaught();
  document.querySelectorAll('article').forEach(item => {
    item.addEventListener('click', function(ev) {
      console.log(ev.target.id)
      toggleCaught(ev.target.id);
    })
  })
}

function updateCaught() {
  let c = settings.filters.caught ? 'hidden' : 'checked';
  document.querySelectorAll('.item').forEach(item => {
    if (isCaught(item.id)) {
      item.classList.add(c);
    }
    else {
      item.classList.remove('hidden','checked');
    }
  });
}

function locateCaught(id) {
	return settings.caught.indexOf(id);
}

function isCaught(id) {
	return (locateCaught(id) > -1);
}

function toggleCaught(id) {
  if(isCaught(id)) {
    settings.caught.splice(locateCaught(id),1);
  }
  else {
  	settings.caught.push(id);
  }
  let c = settings.filters.caught ? 'hidden' : 'checked';
  document.getElementById(id).classList.toggle(c);
  writeSetting("caught");
}

function toggleSettings() {
  var menu = document.getElementById("settings-menu");
  menu.classList.toggle('hidden');

}

function showOffset() {
  var offsetForm = document.getElementById("offset");
  if (offsetForm.classList.contains('hidden')) document.getElementById("settings-menu").classList.remove('hidden');
  offsetForm.classList.toggle('hidden');
}