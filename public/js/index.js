var map;
var dropMode; // True if the user is trying to drop a cow.
var watchID; // Used to disable continuous tracking of user's location.

// Need to store to affect visibility later on.
var centerMarker;
var radiusMarker;

// Need to store to affect visibility later on.
var cowBtnText;
var addMsgContainer;
var deleteContainer;

var currentCow; // Location of cow whose message is currently expanded.

/**
 * Initializes the Google Map and geolocation settings.
 */
function initMap() {
    dropMode = false;
    $("#map-loading").fadeOut();
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 0.0,
            lng: 0.0
        },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false
    });

    // If geolocation services do not exist, this app should not do anything.
    if (navigator.geolocation) {
        getGeoPosition();
        initMapButtons();
    }
}

/**
 * Continuously tracks the user's location, and sets the map's current center
 * to the user's current location. Also initializes the markers required to
 * allow the user to see their location.
 */
function getGeoPosition() {
    // Create a marker for the map center.
    centerMarker = new google.maps.Marker({
        icon: 'img/self.png',
        map: map
    });

    // Create a marker that constantly surrounds the map center marker.
    radiusMarker = new google.maps.Circle({
        map: map,
        radius: 150,
        fillColor: 'rgba(30, 30, 30, 0.3)',
        strokeWeight: 4,
        strokeColor: 'rgba(45, 252, 142, 0.5)'
    });
    radiusMarker.bindTo('center', centerMarker, 'position');
    radiusMarker.setVisible(false);

    // Set listeners to allow for message drops on the markers.
    google.maps.event.addDomListener(centerMarker, 'click', function(event) {
        return dropClick(event.latLng);
    });
    google.maps.event.addDomListener(radiusMarker, 'click', function(event) {
        return dropClick(event.latLng);
    });

    // Radius marker should not be visible if zoomed out too much.
    google.maps.event.addDomListener(map, 'zoom_changed',
        function() {
            if (dropMode) {
                if (map.getZoom() < 17) {
                    radiusMarker.setVisible(false);
                    $("#guide-text").text("Too far zoomed out!");
                    $("#guide-text").css('color', 'rgba(209, 44, 29, 1)');
                } else {
                    radiusMarker.setVisible(true);
                    $("#guide-text").text("Drop a cow within the gray area.");
                    $("#guide-text").css('color', 'rgba(43, 132, 237, 1)');
                }
            }
        });

    // Setup the map listener for any clicks on the map.
    google.maps.event.addListener(map, 'click', function(event) {
        // If drop mode is enabled, there should not be clicks outside of radius.
        if (dropMode) {
            $("#guide-text").text("Incorrect area - select a place within the grey circle.");
            $("#guide-text").css('color', 'rgba(209, 44, 29, 1)');
        } else {
            if(currentCow != null) {
                shrinkMessage(locToString(currentCow.getPosition().lat(), currentCow.getPosition().lng()));
                currentCow = null;
            }
        }
    });

    // watchID can be used to disable continuous geolocation tracking.
    watchID = navigator.geolocation.watchPosition(function(position) {
        // Set the center of the map to the user's location.
        var currPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        map.setCenter(currPosition);
        centerMarker.setPosition(currPosition);
    });
}

/**
 * Calls respective functions to create custom buttons for the map.
 */
function initMapButtons() {
    initDropButton();
    initAddButton();
    initDeleteButton();
}

/**
 * Creates a custom map button to allow toggling of message-dropping
 * functionality.
 */
function initDropButton() {
    // Create a div that holds the cow-dropping button.
    var cowBtnContainer = document.createElement('div');

    // Set the CSS for the button's border.
    var cowBtnBorder = document.createElement('div');
    cowBtnBorder.style.backgroundColor = 'rgba(43, 132, 237, 1.0)';
    cowBtnBorder.style.cursor = 'pointer';
    cowBtnBorder.style.textAlign = 'center';
    cowBtnBorder.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
    cowBtnContainer.appendChild(cowBtnBorder);

    // Set the CSS for the button's interior content.
    cowBtnText = document.createElement('div');
    cowBtnText.style.color = '#fff';
    cowBtnText.style.fontFamily = 'Arial,sans-serif';
    cowBtnText.style.fontSize = '16px';
    cowBtnText.style.lineHeight = '38px';
    cowBtnText.style.paddingLeft = '10px';
    cowBtnText.style.paddingRight = '10px';
    cowBtnText.innerHTML = 'Drop a Cow!';
    cowBtnBorder.append(cowBtnText);

    // Inserts the finished button to the right-center area of the map.
    map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(cowBtnContainer);

    // Setup the map listener for the button.
    google.maps.event.addDomListener(cowBtnContainer, 'click', function() {
        return dropText();
    });
}

/**
 * Creates a custom map button that allows the user to add comments to already
 * dropped messages.
 */
function initAddButton() {
    // Create a div that holds the add comment button.
    addMsgContainer = document.createElement('div');
    addMsgContainer.style.padding = "10px 10px 0px 0px";
    addMsgContainer.className = "options";

    // Set the CSS for the button's border.
    var addMsgBorder = document.createElement('div');
    addMsgBorder.style.backgroundColor = 'rgba(43, 132, 237, 1.0)';
    addMsgBorder.style.cursor = 'pointer';
    addMsgBorder.style.textAlign = 'center';
    addMsgBorder.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
    addMsgContainer.appendChild(addMsgBorder);

    // Set the CSS for the button's interior content.
    var addMsgImg = document.createElement('img');
    addMsgImg.setAttribute('src', 'img/new.png');
    addMsgBorder.appendChild(addMsgImg);

    // Inserts the finished button to the right-bottom area of the map.
    map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(addMsgContainer);

    // Setup the map listener for the button.
    google.maps.event.addDomListener(addMsgContainer, 'click', function() {
        return addComment();
    });
}

/**
 * Creates a custom map button that allows the user to delete their own
 * created messages.
 */
function initDeleteButton() {
    // Create a div that holds the delete message button.
    deleteContainer = document.createElement('div');
    deleteContainer.style.padding = "10px 10px 0px 0px";
    deleteContainer.className = "options";

    // Set the CSS for the button's border.
    var deleteBorder = document.createElement('div');
    deleteBorder.style.backgroundColor = 'rgba(43, 132, 237, 1.0)';
    deleteBorder.style.cursor = 'pointer';
    deleteBorder.style.textAlign = 'center';
    deleteBorder.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
    deleteContainer.appendChild(deleteBorder);

    // Set the CSS for the button's interior content.
    var deleteImg = document.createElement('img');
    deleteImg.setAttribute('src', 'img/delete.png');
    deleteBorder.appendChild(deleteImg);

    // Inserts the finished button to the right-bottom area of the map.
    map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(deleteContainer);

    // Setup the map listener for the button.
    google.maps.event.addDomListener(deleteContainer, 'click', function() {
        return deleteMessage();
    });
}

/**
 * Modifies the text of the message drop button, as well as the guide text.
 */
function dropText() {
    if (!dropMode) {
        enableDrop();
    } else {
        disableDrop();
    }
}

/**
 * Enables the message drop mode.
 */
function enableDrop() {
    cowBtnText.innerHTML = "Cancel";
    dropMode = true;

    // Only let the radius appear if the user is dropping a message.
    radiusMarker.setVisible(true);
    map.setCenter(centerMarker.position);
    map.setZoom(18);
    $("#guide-footer").addClass('active');
    $("#guide-text").text('Drop a cow within the gray area.');

    // Remove the add comment and delete pin functionality if drop mode is true.
    addMsgContainer.className = "options inactive";
    deleteContainer.className = "options inactive";
}

/**
 * Disables the message drop mode.
 */
function disableDrop() {
    cowBtnText.innerHTML = "Drop a Cow!";
    dropMode = false;
    radiusMarker.setVisible(false);
    $("#guide-footer").removeClass('active');

    // Add the add comment and delete pin functionality if drop mode is false.
    addMsgContainer.className = "options";
    deleteContainer.className = "options";
}

/**
 * Event listener for any clicks on the center or radius marker.
 * @param {object} location - Contains latitude and longitude coordinates.
 */
function dropClick(location) {
    if (dropMode) {
        $("#guide-text").text('What\'s your next moove?');
        $("#guide-text").css('color', 'rgba(43, 132, 237, 1)');
        $('#cowModal').modal('show');
        $('#drop').unbind().click(function(event) {
            var topic = document.getElementById("topic");
            var comments = document.getElementById("comments");
            var type = document.getElementById("type");

            // All fields must be filled to spawn a message.
            if (topic != null && topic != "" &&
                comments != null && comments != "" &&
                type != null && type != "") {
                addCowPin(location, topic.value, comments.value, type.value);
            }
        });

        // Reverts text if the model somehow exists.
        $("#cowModal").on('hidden.bs.modal', function() {
            $("#guide-text").text('Drop a cow within the gray area.');
            $("#guide-text").css('color', 'rgba(43, 132, 237, 1)');
        });
    }
}

var infoMap = new Object(); // Mapping of lat-lng (string) to message info.
var objectMap = new Object(); // Mapping of lat-lng (string) to marker and infobox.

/**
 * Adds a message pin to the clicked area.
 * @param {object} location - Contains latitude and longtitude coordinates.
 * @param {string} topic - Contains the topic for the message.
 * @param {string} comments - Contains the comments for the message.
 * @param {object} type - Contains the type of the message.
 */
function addCowPin(location, topic, comments, type) {
    // Initialize pin with visuals and text.
    var infoBox = new InfoBox({
        boxStyle: {
            borderRadius: "10px",
            border: "2px solid rgba(100, 100, 100, 0.5)",
            textAlign: "center",
            fontSize: "12pt",
            width: "200px",
            height: "200px",
            opacity: 1.0,
            backgroundColor: "rgba(255, 255, 255, 1.0)"
        },
        pixelOffset: new google.maps.Size(-100, -275),
        enableEventPropagation: true,
        closeBoxURL: "",
    });

    var previewBox = new InfoBox({
        boxStyle: {
            borderRadius: "10px",
            border: "2px solid rgba(100, 100, 100, 0.5)",
            textAlign: "center",
            fontSize: "12pt",
            width: "200px",
            height: "75px",
            opacity: 1.0,
            backgroundColor: "rgba(255, 255, 255, 1.0)"
        },
        pixelOffset: new google.maps.Size(-100, -150),
        enableEventPropagation: true,
        closeBoxURL: "",
    });

    var picture = {
        url: 'img/cow.png',
        size: new google.maps.Size(60, 60),
        scaledSize: new google.maps.Size(60, 60),
        labelOrigin: new google.maps.Point(20, 50),
    };

    var marker = new google.maps.Marker({
        position: location,
        map: map,
        icon: picture,
        animation: google.maps.Animation.DROP
    });

    loc_string = locToString(location.lat(), location.lng());

    // Create bounce animation when moving over cow marker.
    marker.addListener('mouseover', function() {
        if (marker.getAnimation() == null) {
            setTimeout(function() {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }, 150);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 2950);
        }

        // Increase opacity of preview.
        hoverPreviewIn(loc_string);
    });

    // Decrease opacity of preview when mousing out.
    marker.addListener('mouseout', function() {
        hoverPreviewOut(loc_string);
    });

    // Initialize the table element inside infoWindow to store comments.
    var init_text = '<h3>' + topic + '</h3>' + '<table>';
    init_text += parseComment(comments);
    init_text += '</table>';
    infoBox.setContent(init_text);

    // Initialize the preview window with just the topic.
    var preview_text = '<h3>' + topic + '</h3>';
    previewBox.setContent(preview_text);

    // Wait for animation to finish before opening infoWindow.
    window.setTimeout(function() {
        infoBox.open(map, marker);
    }, 600);

    // Attach preview to marker.
    previewBox.open(map, marker);

    // Disable drop mode.
    disableDrop();

    marker.addListener('click', function() {
        enlargeMessage(loc_string);
    });

    infoMap[loc_string] = {
        m_topic: topic,
        m_score: 0,
        m_comments: comments
    };

    // Map the position of the marker to the marker and infobox objects.
    objectMap[loc_string] = {
        m_marker: marker,
        m_infobox: infoBox,
        m_previewbox: previewBox
    };

    enlargeMessage(loc_string);
}

function hoverPreviewIn(location) {
    console.log("herer");
    objectMap[location].m_previewbox.setOptions({
        boxStyle: {
            borderRadius: "10px",
            border: "2px solid rgba(100, 100, 100, 0.5)",
            textAlign: "center",
            fontSize: "12pt",
            width: "200px",
            height: "75px",
            opacity: 0.80,
            backgroundColor: "rgba(255, 255, 255, 1.0)"
        }
    });
}

function hoverPreviewOut(location) {
    console.log("hello!");
    objectMap[location].m_previewbox.setOptions({
        boxStyle: {
            borderRadius: "10px",
            border: "2px solid rgba(100, 100, 100, 0.5)",
            textAlign: "center",
            fontSize: "12pt",
            width: "200px",
            height: "75px",
            opacity: 0.30,
            backgroundColor: "rgba(255, 255, 255, 1.0)"
        }
    });
}

function locToString(latitude, longitude) {
    return parseFloat(latitude) + " " + parseFloat(longitude);
}

function shrinkMessage(location) {
    objectMap[location].m_infobox.setOptions({
        boxStyle: {
            borderRadius: "10px",
            border: "2px solid rgba(100, 100, 100, 0.5)",
            textAlign: "center",
            fontSize: "12pt",
            width: "200px",
            height: "200px",
            opacity: 0.0,
            backgroundColor: "rgba(255, 255, 255, 1.0)"
        }
    });

    objectMap[location].m_previewbox.setOptions({
        boxStyle: {
            borderRadius: "10px",
            border: "2px solid rgba(100, 100, 100, 0.5)",
            textAlign: "center",
            fontSize: "12pt",
            width: "200px",
            height: "75px",
            opacity: 0.5,
            backgroundColor: "rgba(255, 255, 255, 1.0)"
        }
    });
}

function enlargeMessage(location) {
    // Shrink the contents of the previously opened message, if available.
    if (currentCow != null) {
        shrinkMessage(locToString(currentCow.getPosition().lat(), currentCow.getPosition().lng()));
    }

    currentCow = objectMap[location].m_marker;

    objectMap[location].m_infobox.setOptions({
        boxStyle: {
            borderRadius: "10px",
            border: "2px solid rgba(100, 100, 100, 0.5)",
            textAlign: "center",
            fontSize: "12pt",
            width: "200px",
            height: "200px",
            opacity: 1.0,
            backgroundColor: "rgba(255, 255, 255, 1.0)"
        }
    });

    objectMap[location].m_previewbox.setOptions({
        boxStyle: {
            borderRadius: "10px",
            border: "2px solid rgba(100, 100, 100, 0.5)",
            textAlign: "center",
            fontSize: "12pt",
            width: "200px",
            height: "75px",
            opacity: 0.0,
            backgroundColor: "rgba(255, 255, 255, 1.0)"
        }
    });
}

/**
 * Takes in a string, and converts it to a table element for the info window.
 * @param {string} comments - The details of the message.
 * @return {string} The HTML that contains the message details.
 */
function parseComment(comments) {
    var content = '<tr>' + '<th>' +
        '<div class="vote roundrect">' +
        '<div class="increment up">' + '</div>' +
        '<div class="increment down">' + '</div>' +
        '<div class="count">' + 0 + '</div>' + '</div>' +
        '</th>' + '<th>' + '<div class="comment">' + comments +
        '</div>' + '</th>' + '</tr>';
    return content;
}


function addComment() {
    if(currentCow != null) {
        promp = prompt("Add a comment", "");
        last_marker.text += '<div><p>' + promp + '</p></div><hr>';
        last_text += '<div class="vote roundrect"> <div class="increment up"> </div> <div class="increment down"> </div> <div class="count">' + 0 + '</div> </div>' + '<div><p>' + promp + '</p></div><hr>';
        last_saved.setContent(last_text + button_text);
    }
    else {

    }
}

function deleteMessage() {
    if(currentCow != null) {
        currentCow.setMap(null);
    }
}

$(document).on('click', '.increment', function() {
    var count = parseInt($("~ .count", this).text());

    if ($(this).hasClass("up")) {
        var count = count + 1;

        $("~ .count", this).text(count);
    } else {
        var count = count - 1;
        $("~ .count", this).text(count);
    }

    $(this).parent().addClass("bump");

    setTimeout(function() {
        $(this).parent().removeClass("bump");
    }, 400);
});
