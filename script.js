var settings = {
  "version" : "v0.10.0",
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
      "info-size" : true,
      "info-month" : false,
      "info-time" : true
  }
};

var monthMap = ["January","February","March","April","May","June","July","August","September","October","November","December"];

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
  // reset settings only if minor version has changed, dont 
  let outdated = readSetting("version",true);
  if (outdated) outdated = outdated.split('.')[1] !== settings.version.split('.')[1];
  if (outdated) {
    console.log('updating caught critters array');
    importCaughtCritters(); //changes to format - convert old list
  }
  for (var i in settings) {
    if (readSetting(i,true) === null) {
      //write new setting in storage
      //console.log('init','write',i);
      writeSetting(i);
    }
    else if (outdated && i !== "caught") {
      //overwrite outdated setting in storage
      //console.log('init','over',i);
      writeSetting(i);
    }
    else if (i !== "version") {
      //read stored setting from storage, but dont import version
      //console.log('init','read',i);
      settings[i] = readSetting(i);
    }
  }
}

initStorage();

document.getElementById('version').innerHTML = settings.version;

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
  hour = d.getHours();
  month = d.getMonth();
  var monthName = monthMap[d.getMonth()];
  var dateString = '<h3 class="date">' + monthName + ' ' + d.getDate() + '</h3>';
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

function buildYear(critterMonths) {
  let yearNode = document.createElement('DIV');
  yearNode.classList.add('year');
  for (var i=0; i<12; i++) {
    var monthNode = document.createElement('DIV');
    monthNode.classList.add('month');
    if (getSeason(i) !== '') monthNode.classList.add(getSeason(i));
    if (critterMonths.indexOf(i)>=0) monthNode.classList.add('appear');
    if (i === month) monthNode.classList.add('current');
    //monthNode.innerText = (monthMap[i] === undefined) ? '' : monthMap[i][0];
    yearNode.appendChild(monthNode);
  }
  return yearNode.outerHTML;
}

function buildDay(critterHours) {
  let dayNode = document.createElement('DIV');
  dayNode.classList.add('day');
  for (var i=0; i<24; i++) {
    var hourNode = document.createElement('DIV');
    hourNode.classList.add('hour');
    hourNode.classList.add((i>5 && i<18) ? 'daytime' : 'nighttime');
    if (critterHours.indexOf(i)>=0) hourNode.classList.add('appear');
    if (i === hour) hourNode.classList.add('current');
    dayNode.appendChild(hourNode);
  }
  return dayNode.outerHTML;
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
    if (info['info-sprite']) itemStr += '<div class="critter-image" style="background:url(&apos;images/sprites/' + critter.type + '.png&apos;) 0 -' + (critter.index * 64)  + 'px;background-size:100%;"></div>';
    if (info['info-price']) itemStr += '<div class="critter-info">' + critter.price.toLocaleString() + '</div>';
    if (info['info-location']) itemStr += '<div class="critter-info">' + critter.location + '</div>';
    if (info['info-size'] && toggles.type === "fish") itemStr += '<div class="critter-info">' + critter.size + '</div>';
    if (info['info-month']) itemStr += '<div class="critter-info">' + buildYear(critter[toggles.hemisphere]) + '</div>';
    if (info['info-time']) itemStr += '<div class="critter-info">' + buildDay(critter.hours) + '</div>';
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

function getSeason(month) {
  let result = '';
  let hem = (hemisphere === 'northern');
  switch(true) {
    case (month == 11 || month < 2):
      result = hem ? 'winter' : 'summer';
      break;
    case (month < 5):
      result = hem ? 'spring' : 'fall';
      break;
    case (month < 8):
      result = hem ? 'summer' : 'winter';
      break;
    case (month < 11):
      result = hem ? 'fall' : 'spring';
      break;
    default:
      console.log('unrecognized month');
  }
  return result;
}


/* Control for settings menu */
document.querySelectorAll('.sort').forEach(item => {
  item.addEventListener('click', function(ev) {
      setSortingOrder(ev.target.id);
  });
});

document.querySelectorAll('.filter').forEach(item => {
  item.addEventListener('click', function(ev) {
      updateSetting("filters",ev.target.id,true);
  });
  updateSetting("filters",item.id);
});

document.querySelectorAll('.toggle').forEach(item => {
  item.addEventListener('click', function(ev) {
      updateSetting("toggles",ev.target.id,true);
  });
  updateSetting("toggles",item.id);
});

document.querySelectorAll('.info').forEach(item => {
  item.addEventListener('click', function(ev) {
      updateSetting("info",ev.target.id,true);
  });
  updateSetting("info",item.id);
});

function setSortingOrder(column) {
  if (column === settings["order"][0][0]) {
      settings["order"][0][1] = settings["order"][0][1] === 'asc' ? 'desc' : 'asc';
  } else {
      for (var i = settings["order"].length-1; i>0; i--) {
          console.log(settings["order"][i][0],settings["order"][i-1][0]);
          settings["order"][i] = settings["order"][i-1];
      }
      settings["order"][0] = [column,'desc'];
  }
  writeSetting("order");
  updateSortingBadges();
  buildList();
}

function updateSortingBadges() {
  document.querySelectorAll('.sort .badge').forEach(item => {
      let column = item.parentNode.id;
      let s = ' ';
      for (var i = 0; i < settings["order"].length; i++) {
          if (settings["order"][i][0] === column) {
              s = i+1;
              if (settings["order"][i][1] === 'desc') {
                  s += '*';
              }
              break;
          }
      }
      item.innerHTML = s;
  });
}
updateSortingBadges();

function updateSetting(library,setting,clicked=false) {
  switch(library) {
      case "toggles":
          switch(setting) {
              case "type":
                  switch(settings[library][setting]) {
                      case "fish":
                          if (clicked) {
                              settings[library][setting] = "bugs";
                              updateSetting(library,setting);
                          } else {
                              setBadgeContent(setting,"🐟");
                          }
                          break;
                      case "bugs":
                          if (clicked) {
                              settings[library][setting] = "fish";
                              updateSetting(library,setting);
                          } else {
                              setBadgeContent(setting,"🦋");
                          }
                          break;
                      default:
                          console.log("Invalid setting:",setting,"[",settings[library][setting],"]");
                          return;
                  }
                  buildList();
                  break;
              case "hemisphere":
                  switch(settings[library][setting]) {
                      case "northern":
                          if (clicked) {
                              settings[library][setting] = "southern";
                              updateSetting(library,setting);
                          } else {
                              setBadgeContent(setting,"N");
                          }
                          break;
                      case "southern":
                          if (clicked) {
                              settings[library][setting] = "northern";
                              updateSetting(library,setting);
                          } else {
                              setBadgeContent(setting,"S");
                          }
                          break;
                      default:
                          console.log("Invalid setting:",setting,"[",settings[library][setting],"]");
                          return;
                  }
                  buildList();
                  break;
              case "theme":
                  switch(settings[library][setting]) {
                      case "light":
                          if (clicked) {
                              settings[library][setting] = "dark";
                              updateSetting(library,setting);
                          } else {
                              setBadgeContent(setting,"☀️");
                          }
                          break;
                      case "dark":
                          if (clicked) {
                              settings[library][setting] = "light";
                              updateSetting(library,setting);
                          } else {
                              setBadgeContent(setting,"🌘");
                          }
                          break;
                      default:
                          console.log("Invalid setting:",setting,"[",settings[library][setting],"]");
                          return;
                  }
                  document.getElementsByTagName("BODY")[0].setAttribute("data-theme",settings[library][setting]);
                  break;
              default:
                  console.log("Couldn't find",setting,"in",library);
                  return;
          }
          writeSetting(library);
          break;
      case "filters":
          switch(settings[library][setting]) {
              case true:
                  if (clicked) {
                      settings[library][setting] = !settings[library][setting];
                      updateSetting(library,setting);
                  } else {
                      setBadgeContent(setting,"✅");
                  }
                  break;
              case false:
                  if (clicked) {
                      settings[library][setting] = !settings[library][setting];
                      updateSetting(library,setting);
                  } else {
                      setBadgeContent(setting,"❌");
                  }
                  break;
              default:
                  console.log("Invalid setting:",setting,"[",settings[library][setting],"]");
                  return;
          }
          writeSetting(library);
          buildList();
          break;
      case "info":
          switch(settings[library][setting]) {
              case true:
                  if (clicked) {
                      settings[library][setting] = !settings[library][setting];
                      updateSetting(library,setting);
                  } else {
                      setBadgeContent(setting,"✅");
                  }
                  break;
              case false:
                  if (clicked) {
                      settings[library][setting] = !settings[library][setting];
                      updateSetting(library,setting);
                  } else {
                      setBadgeContent(setting,"❌");
                  }
                  break;
              default:
                  console.log("Invalid setting:",setting,"[",settings[library][setting],"]");
                  return;
          }
          writeSetting(library);
          buildList();
          break;
      default:
          console.log("Invalid settings library:",library);
  }
}

function setBadgeContent(setting,content) {
  document.querySelector('#' + setting + ' .badge').innerHTML = content;
}