/* Module.exports is how the client communicates with the server. */
module.exports = {
    /* Get is a handler, handlers can have multiple actions. This particular handler
        has two parameters. */
    get: function (req, res) {
        try {
            /* Addresses are relative to this file's current location. */
            var data = require("./data.json");  // Obtain the JSON info from this file.
            res.success(data);  // This will return the data to the client side.
        }
        catch (exception) {
            // Error handling if an error happens in the try block.
            res.error(1, "Data not found.");    /* Error code: 0 = success. */
        }
    }
}