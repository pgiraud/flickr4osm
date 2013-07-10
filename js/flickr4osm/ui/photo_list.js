flickr4osm.ui.PhotoList = function(context) {
    var event = d3.dispatch('choose');

    function photoList(selection) {
        var connection = context.flickr_connection();
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
                    .on('click', function(d) { event.choose(d); });

                var img = enter.append('img')
                    .attr('src', function(d) {
                        return flickr4osm.util.getPhotoUrl(d, 's');
                    });

                items.filter(function(d) {
                    return d.longitude && d.latitude;
                }).append('img')
                    .attr('class', 'geo')
                    .attr('src', 'images/geo.png');

                items.filter(function(d) {
                    return d.machine_tags.length > 0;
                }).append('img')
                    .attr('class', 'machine-tag')
                    .attr('src', 'images/osm.png');

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

    return d3.rebind(photoList, event, 'on');
};
