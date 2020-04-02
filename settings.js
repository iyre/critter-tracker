document.querySelectorAll('.sort').forEach(item => {
    item.addEventListener('click', function(ev) {
        setSortingOrder(ev.target.id);
    });
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
                if (settings["order"][i][1] === 'asc') {
                    s += '*';
                }
                break;
            }
        }
        item.innerHTML = s;
    });
}
updateSortingBadges();

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