const $ = require('jquery');

module.exports = {
    init: function () {
        $('#g-body').on('click', '.f-fl', function () {
            console.log("dj dj")
        });
        
    }
}
