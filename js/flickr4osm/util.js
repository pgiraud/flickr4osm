flickr4osm.util = {
    format: function(string, data) {
        return string.replace(/{[^{}]+}/g, function(key){
            return data[key.replace(/[{}]+/g, "")] || "";
        });
    },

    /**
     * Utility function to build a flickr url for a photo
     *
     * Parameters:
     * photo - {Object} the photo
     * size - {String} Either 'm', 's', 't', 'z', 'b'. Size of the photo. See
     *     http://www.flickr.com/services/api/misc.urls.html
     */
    getPhotoUrl: function(photo, size) {
        var url = 'http://farm{farm}.staticflickr.com/{server}/{id}_{secret}_{size}.jpg';
        photo.size = size || 's';
        return flickr4osm.util.format(url, photo);
    }
};
