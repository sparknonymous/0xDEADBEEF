var map;
var dropMode; // True if the user is trying to drop a cow.
var watchID; // Used to disable continuous tracking of user's location.
var centerMarker;
var radiusMarker;

/**
 * Initializes the Google Map and geolocation settings.
 */
function initMap() {
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
        initMapButton();
    }
}

/**
 * Continuously tracks the user's location, and sets the map's current center
 * to the user's current location. Also initializes the markers required to
 * allow the user to see their location.
 */
function getGeoPosition() {
    // watchID can be used to disable continuous geolocation tracking.
    watchID = navigator.geolocation.watchPosition(function(position) {
        // Set the center of the map to the user's location.
        var currPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        map.setCenter(currPosition);

        // Only create new markers if they haven't existed before.
        if (centerMarker == null || radiusMarker == null) {
            // Create a marker for the map center.
            centerMarker = new google.maps.Marker({
                position: currPosition,
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

            /* Setup the markers such that the cursor can change, based on if the user is
             * currently in message drop mode or not. */
            google.maps.event.addDomListener(centerMarker, 'mousemove',
                function() {
                    return markerEvent(centerMarker);
                });
            google.maps.event.addDomListener(radiusMarker, 'mousemove',
                function() {
                    return markerEvent(radiusMarker);
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
        }
        // Otherwise, update the locations of the markers.
        else {
            // Set the center of the map to the user's location.
            var currPosition = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            centerMarker.setPosition(currPosition);
            map.setCenter(currPosition);
        }
    });
}

/**
 * Sets the cursor, depending on the drop mode.
 */
function markerEvent(marker) {
    if (dropMode) {
        marker.setOptions({
            cursor: 'url(img/crosshair.png), auto'
        });
    } else {
        marker.setOptions({
            cursor: ''
        });
    }
}

/**
 * Creates a custom map button to allow toggling of message-dropping
 * functionality.
 */
function initMapButton() {
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
    var cowBtnText = document.createElement('div');
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
        return dropText(cowBtnText);
    });

    // Setup the map listener for any clicks on the map.
    google.maps.event.addListener(map, 'click', function(event) {
        // If drop mode is enabled, there should not be clicks outside of radius.
        if (dropMode) {
            $("#guide-text").text("Incorrect area - select a place within the grey circle.");
            $("#guide-text").css('color', 'rgba(209, 44, 29, 1)');
        }
    });
}

/**
 * Modifies the text of the message drop button, as well as the guide text.
 * @param {object} cowBtnText - A div containing the text of the button.
 */
function dropText(cowBtnText) {
    if (cowBtnText.innerHTML == "Drop a Cow!") {
        cowBtnText.innerHTML = "Cancel";
        dropMode = true;
        // Only let the radius appear if the user is dropping a message.
        radiusMarker.setVisible(true);
        map.setCenter(centerMarker.position);
        map.setZoom(18);
        $("#guide-footer").addClass('active');
        $("#guide-text").text('Drop a cow within the gray area.');
    } else {
        cowBtnText.innerHTML = "Drop a Cow!";
        dropMode = false;
        radiusMarker.setVisible(false);
        $("#guide-footer").removeClass('active');
    }
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

var pinMap = {}; // Dictionary of markers mapping to the info they hold.

/**
 * Adds a message pin to the clicked area.
 * @param {object} location - Contains latitude and longtitude coordinates.
 * @param {string} topic - Contains the topic for the message.
 * @param {string} comments - Contains the comments for the message.
 * @param {object} type - Contains the type of the message.
 */
function addCowPin(location, topic, comments, type) {
    // Initialize pin with visuals and text.
    var infoWindow = new google.maps.InfoWindow({
        height: '200px'
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

    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    });

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
    });

    // Wait for animation to finish before opening infoWindow.
    window.setTimeout(function() {
        infoWindow.open(map, marker);
    }, 600);

    // Initialize the table element inside infoWindow to store comments.
    var init_text = '<h3>' + topic + '</h3>' + '<table>';
    init_text += parseComment(comments);
    init_text += '</table>';
    infoWindow.setContent(init_text);
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
    promp = prompt("Add a comment", "");
    last_marker.text += '<div><p>' + promp + '</p></div><hr>';
    last_text += '<div class="vote roundrect"> <div class="increment up"> </div> <div class="increment down"> </div> <div class="count">' + 0 + '</div> </div>' + '<div><p>' + promp + '</p></div><hr>';
    last_saved.setContent(last_text + button_text);
}

function deletePin() {
    last_marker.setMap(null);
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
