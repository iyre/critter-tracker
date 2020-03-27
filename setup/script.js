var settings = {
	"hemisphere" : "northern",
  "sort" : ["location","d"],
  "hide" : false,
  "offset" : 0
};
var caught = [];

function toggleHide() {
	settings.hide = !settings.hide;
  document.getElementById("hide").innerHTML = (settings.hide ? 'Show Caught' : 'Hide Caught');
  buildList(fish);
}

function buildList(data) {    
  //document.write('<table>');
  var tableHTML = '<thead><tr><th scope="col" id="name">Name</th><th scope="col" id="location">Location</th><th scope="col" id="size">Size</th></tr></thead><tbody>';
  
  for (var i in data) {
    //console.log(isCaught(i));
    //console.log(settings['hide']);
		if (isCaught(i) && settings['hide']) {
			console.log('hide: ' + i);
    }
    else {
      tableHTML += 
      '<tr id="' + i + '" class="' + (isCaught(i) ? 'checked' : '') + '">' + 
      '<td>' + data[i].name + '</td>' + 
      '<td>' + data[i].location + '</td>' + 
      '<td>' + data[i].size + '</td>' + 
      '</tr>';
    }
  }
  document.getElementById("fishList").innerHTML = tableHTML+'<tbody>';
  //sortable();
  //console.log(caught);
}

buildList(fish);


var list = document.querySelector('table');
list.addEventListener('click', function(ev) {
  if (ev.target.tagName === 'TD') {
  	var fishid = ev.target.parentNode.id;
    toggleCaught(fishid);
    console.log(fishid);
    console.log(caught.fish)
    buildList(fish)
  }
  //console.log(ev.target);
}, false);

function locateCaught(id) {
	return caught.indexOf(id);
}

function isCaught(id) {
	return (locateCaught(id) > -1);
}

function toggleCaught(id) {
  if(isCaught(id)) {
  	caught.splice(locateCaught(id),1);
  }
  else {
  	caught.push(id);
  }
}