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
            google.maps.event.addDomListener(centerMarker, 'click', function() {
                return dropClick();
            });
            google.maps.event.addDomListener(radiusMarker, 'click', function() {
                return dropClick();
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
                })
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
            cursor: 'crosshair'
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
        return mapClick(event.latLng);
    });
}

function dropText(cowBtnText) {
    if (cowBtnText.innerHTML == "Drop a Cow!") {
        cowBtnText.innerHTML = "Cancel";
        dropMode = true;
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

function dropClick() {
    if (dropMode) {
        $("#guide-text").text('What\'s your next moove?');
        $("#guide-text").css('color', 'rgba(43, 132, 237, 1)');
        $('#cowModal').modal('show');
        $('#drop').unbind().click(function(event) {
            var name = document.getElementById("name");
            var comments = document.getElementById("comments");
            var type = document.getElementById("type");
            console.log(name.value);

            if (name != null && name != "") {
                addCowPin(location, map, name.value, comments.value, type.value)
            }
        });
    }
}

function eventColor() {
    document.getElementById("red").addEventListener("click", function(event) {
        color = "red"
        console.log(color)
    });
    document.getElementById("green").addEventListener("click", function(event) {
        color = "green"
        console.log(color)
    });
}


function mapClick(location) {
    if (dropMode) {
        $("#guide-text").text("Incorrect area - select a place within the grey circle.");
        $("#guide-text").css('color', 'rgba(209, 44, 29, 1)');
    }
}

var last_saved;
var last_marker;
var content = "";
var color = "";
var vote_text = "";

function addCowPin(location, map, text, comments, type) {

    var picture = {
        url: 'https://d30y9cdsu7xlg0.cloudfront.net/png/10680-200.png',
        size: new google.maps.Size(40, 40),
        scaledSize: new google.maps.Size(40, 40),
        labelOrigin: new google.maps.Point(20, 50),
    };

    var marker = new google.maps.Marker({
        position: location,
        map: map,
        label: text,
        icon: picture,
        vote_text: vote_text,
        text: content,
        type: type,
        count: 0
    });

    //  var infoWindow = new google.maps.InfoWindow({
    //          content: marker.text + '<button onclick="addComment()" id="commentBtn">New Comment</button>',
    //          height: '100px'
    //  });
    marker.vote_text = '<div class="vote roundrect"> <div class="increment up" onclick="upVote()"></div> <div class="increment down" onclick="downVote()"></div> <div class="count">' + marker.count + '</div> </div>'
    marker.text += '<div><p>' + comments + '</p></div><hr>'
    last_marker = marker;
    //last_saved = infoWindow;

    marker.addListener('click', function(event) {
        var infoWindow = new google.maps.InfoWindow({
            content: marker.vote_text + marker.text + '<button onclick="addComment()" id="commentBtn">New Comment</button>',
            height: '100px'
        });
        last_saved = infoWindow;
        last_marker = marker;
        infoWindow.open(map, marker);
    });
}

function addComment() {
    promp = prompt("Add a comment", "");
    last_marker.text += '<div><p>' + promp + '</p></div><hr>';
    //last_saved.setContent(last_marker.text + '</br>' + '<button onclick="addComment()">New Comment</button>')
    last_saved.close()
    //last_saved.setContent('<div><p>' + promp + '</p></div>' + '</br>' + last_saved.content);
    console.log(last_saved.content)
}

function upVote() {
    last_marker.count += 1;
    last_marker.vote_text = '<div class="vote roundrect"> <div class="increment up" onclick="upVote()"></div> <div class="increment down" onclick="downVote()"></div> <div class="count">' + last_marker.count + '</div> </div>'
}

function downVote() {
    last_marker.count -= 1;
    last_marker.vote_text = '<div class="vote roundrect"> <div class="increment up" onclick="upVote()"></div> <div class="increment down" onclick="downVote()"></div> <div class="count">' + last_marker.count + '</div> </div>'

}
$(function() {
    $(".increment").click(function() {
        console.log("yes")
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
});
