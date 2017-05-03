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
var dropMode; // True if the user is trying to drop a cow.

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

    if (navigator.geolocation) {
        getGeoPosition();
        initMapButton();
    }
}

function initMapButton() {
    // Create a div that holds the cow-dropping button.
    var cowBtnContainer = document.createElement('div');

    // Set the CSS for the button's border.
    var cowBtnBorder = document.createElement('div');
    cowBtnBorder.style.backgroundColor = '#fff';
    cowBtnBorder.style.cursor = 'pointer';
    cowBtnBorder.style.textAlign = 'center';
    cowBtnBorder.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
    cowBtnContainer.appendChild(cowBtnBorder);

    // Set the CSS for the button's interior content.
    var cowBtnText = document.createElement('div');
    cowBtnText.style.color = '#77d1ff';
    cowBtnText.style.fontFamily = 'Arial,sans-serif';
    cowBtnText.style.fontSize = '16px';
    cowBtnText.style.lineHeight = '38px';
    cowBtnText.style.paddingLeft = '10px';
    cowBtnText.style.paddingRight = '10px';
    cowBtnText.innerHTML = 'Drop a Cow!';
    cowBtnBorder.append(cowBtnText);

    map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(cowBtnContainer);

    // Setup the map listener for the button.
    google.maps.event.addDomListener(cowBtnContainer, 'click', function() {
        return dropCow(cowBtnText);
    });

    // Setup the map listener for any clicks on the map.
    google.maps.event.addListener(map, 'click', function(event) {
        return mapClick(event.latLng);
    });
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
        
function dropCow(cowBtnText) {
    console.log(cowBtnText.innerHTML)   

    if (cowBtnText.innerHTML == "Drop a Cow!") {
        cowBtnText.innerHTML = "Cancel Drop!";
        dropMode = true;
        map.setOptions({
            draggable: false
        });

    } else {
        cowBtnText.innerHTML = "Drop a Cow!";
        dropMode = false;
        map.setOptions({
            draggable: true
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
        console.log("hello")
        //var promptResult = prompt("Name of Cow!", "Heif-Heif");
        $('#cowModal').modal('show');
        $('#drop').unbind().click(function(event) {
            var name = document.getElementById("name");
            var comments = document.getElementById("comments");
            var type = document.getElementById("type");
            console.log(name.value);
          
            if(name != null && name != "") {
                addCowPin(location, map, name.value, comments.value, type.value)
            }
        });

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
    marker.text += '<div><p>' + comments + '</p></div>'
    last_marker = marker;
    //last_saved = infoWindow;

    marker.addListener('click', function(event) {
        var infoWindow = new google.maps.InfoWindow({
            content: marker.vote_text + marker.text + '<button onclick="addComment()" id="commentBtn">New Comment</button>' + '<button onclick="deletePin()" id="dltpn">Delete Cow</button>' ,
            height: '100px'
        });
        last_saved = infoWindow;
        last_marker = marker;
        infoWindow.open(map, marker);
    });
}

function addComment() {
    promp = prompt("Add a comment", "");
    last_marker.text += '<div><p>' + promp + '</p></div>';
    //last_saved.setContent(last_marker.text + '</br>' + '<button onclick="addComment()">New Comment</button>')
    last_saved.close()
    //last_saved.setContent('<div><p>' + promp + '</p></div>' + '</br>' + last_saved.content);
    console.log(last_saved.content)
}

function deletePin() {
    last_marker.setMap(null);
}

function upVote() {
    last_marker.count += 1;
    last_marker.vote_text = '<div class="vote roundrect"> <div class="increment up" onclick="upVote()"></div> <div class="increment down" onclick="downVote()"></div> <div class="count">' + last_marker.count + '</div> </div>'
}

function downVote() {
    last_marker.count -= 1;
    last_marker.vote_text = '<div class="vote roundrect"> <div class="increment up" onclick="upVote()"></div> <div class="increment down" onclick="downVote()"></div> <div class="count">' + last_marker.count + '</div> </div>'

}
$(function(){
  $(".increment").click(function(){
    console.log("yes")
    var count = parseInt($("~ .count", this).text());
    
    if($(this).hasClass("up")) {
      var count = count + 1;
      
       $("~ .count", this).text(count);
    } else {
      var count = count - 1;
       $("~ .count", this).text(count);     
    }
    
    $(this).parent().addClass("bump");
    
    setTimeout(function(){
      $(this).parent().removeClass("bump");    
    }, 400);
  });
});