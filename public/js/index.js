$("footer > tab").click(function () {
    $(this).addClass("active").siblings().removeClass("active");
    $("#" + $(this).attr("id") + "-section").addClass("active").siblings().removeClass("active");
});

$("#found-form").submit(function () {
    postFound();
    return false;
});

function ajax(option) {
    var originalSuccess = option.success;
    option.success = function (result) {
        var data = JSON.parse(result);
        if (data.code == 0) {
            originalSuccess(data.content);
        }
        else {
            alert("Error " + data.code + ": " + data.msg);
        }
    };
    option.error = function () {
        alert("Internet connection error");
    };
    $.ajax(option);
}