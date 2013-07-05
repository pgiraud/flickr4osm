flickr4osm.ui.PhotoList = function(context) {
    var connection = context.flickr_connection();

    function PhotoList(selection) {
        var $wrap = selection.selectAll('.panewrap')
            .data([0]);

        var $enter = $wrap.enter().append('div')
            .attr('class', 'panewrap');

        $enter.append('div')
            .attr('class', 'photos-list-pane pane');

        var $listPane = $wrap.select('.photos-list-pane');

        var listWrap = selection.append('div')
            .attr('class', 'inspector-body');

        //var list = listWrap.append('div')
            //.attr('class', 'preset-list fillL cf')
            //.call(drawList);
    }

    function drawList() {
        connection.getPhotos(function(photos) {
            console.log(photos);
            for (var i = 0; i < photos.length; i++) {
                var photo = photos[i];
                var img = $('<img />', {
                    src: getPhotoUrl(photo, 's')
                }).click($.proxy(function(photo) {
                    flickr.photos.setTags(photo, 'toto');
                }, null, photo));
                $('.photos-list-pane').append(img);
            }
        });
    }

    function format(string, data) {
        return string.replace(/{[^{}]+}/g, function(key){
            return data[key.replace(/[{}]+/g, "")] || "";
        });
    }

    /**
     * Utility function to build a flickr url for a photo
     *
     * Parameters:
     * photo - {Object} the photo
     * size - {String} Either 'm', 's', 't', 'z', 'b'. Size of the photo. See
     *     http://www.flickr.com/services/api/misc.urls.html
     */
    function getPhotoUrl(photo, size) {
        size = size || 's';
        var url = 'http://farm{farm}.staticflickr.com/{server}/{id}_{secret}_s.jpg';
        return format(url, photo);
    }

    connection.on('flickrauthenticated', function() {drawList();});

    return PhotoList;
};
