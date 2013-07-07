flickr4osm.ui.PhotoList = function(context) {
    var connection = context.flickr_connection();

    function PhotoList(selection) {
        //var $wrap = selection.selectAll('.panewrap')
            //.data([0]);

        var listWrap = selection.append('div')
            .attr('class', 'photos-body');

        var list = listWrap.append('div')
            .attr('class', 'photo-list cf');
        //var list = listWrap.append('div')
            //.attr('class', 'preset-list fillL cf')
            //.call(drawList);

        var pagesWrap = selection.append('div')
            .attr('class', 'photos-pagination');
        var pagination = pagesWrap.append('ul');

        var page = null;

        function drawList() {
            connection.getPhotos(page, function(photos) {
                console.log(photos[0]);

                var items = list.selectAll('.photo-list-item')
                    .data(photos.photo, function(d) { return d.id; });

                var enter = items.enter().append('div')
                    .attr('class', 'photo-list-item')
                    .on('click', function(d) { click(d.entity); });

                var img = enter.append('img')
                    .attr('src', function(d) {
                        return getPhotoUrl(d, 's');
                    });

                paginate(photos.page, photos.pages);
            });
        }

        function paginate(page, pages) {
            // still needs work
            var wrap = pagination.append('li');
            wrap.append('a')
                .text('«');
            wrap = pagination.append('li');
            wrap.append('a')
                .text('1');
            wrap = pagination.append('li');
            wrap.append('a')
                .text('2');
        }

        connection.on('flickrauthenticated', function() {drawList();});
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


    return PhotoList;
};
