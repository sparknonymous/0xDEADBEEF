$("footer > tab").click(function() {
    $(this).addClass("active").siblings().removeClass("active");
    $("#" + $(this).attr("id") + "-section").addClass("active").siblings().removeClass("active");
});

$("#found-form").submit(function() {
    postFound();
    return false;
});

function ajax(option) {
    var originalSuccess = option.success;
    option.success = function(result) {
        var data = JSON.parse(result);
        if (data.code == 0) {
            originalSuccess(data.content);
        } else {
            alert("Error " + data.code + ": " + data.msg);
        }
    };
    option.error = function() {
        alert("Internet connection error");
    };
    $.ajax(option);
}

var map;

function initMap() {
    $("#map-loading").fadeOut();
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 0.0,
            lng: 0.0
        },
        zoom: 15
    });

    if (navigator.geolocation) {
        getGeoPosition();
    }
}

function getGeoPosition() {
    navigator.geolocation.getCurrentPosition(function(position) {
        var currPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        map.setCenter(currPosition);
    });
}
