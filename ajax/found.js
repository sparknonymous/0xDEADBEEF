/* Each time the client finds an item, the client must store it in the server. */
module.exports = {
    post: function (req, res) {
        /* Both req.body.lat and req.body.lng are initially stored as a string.
            Need to parse first. The body will be specified later on. */
        req.body.lat = parseFloat(req.body.lat);
        req.body.lng = parseFloat(req.body.lng);

        try {
            require("./data.json").push(req.body);
            res.success();  // No data is required to push.
        }
        catch (exception) {
            res.error(1, "Data not found.");
        }
    }
}