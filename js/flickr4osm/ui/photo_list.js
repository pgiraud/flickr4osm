flickr4osm.ui.PhotoList = function(context) {
    var event = d3.dispatch('choose'),
        photos = [],
        list;

    function photoList(selection) {
        var connection = context.flickr_connection();
        //var $wrap = selection.selectAll('.panewrap')
            //.data([0]);

        var listWrap = selection.append('div')
            .attr('class', 'photos-body');

        list = listWrap.append('div')
            .attr('class', 'photo-list cf');
        //var list = listWrap.append('div')
            //.attr('class', 'preset-list fillL cf')
            //.call(drawList);

        var page = null;

        function drawList() {
            connection.getPhotos(page, function(data) {

                photos = data.photo;

                // convert misc machine_tags to osm aware machine_tags
                _.each(photos, function(photo) {
                    photo.machine_tags = _.filter(photo.machine_tags.split(','), function(tag) {
                        return tag.indexOf('osm') != -1;
                    });
                });
                var items = list.selectAll('.photo-list-item')
                    .data(photos, function(d) { return d.id; });

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
            });
        }

        connection.on('flickrauthenticated', function() {drawList();});
    }

    function updateList() {
        var items = list.selectAll('.photo-list-item')
            .data(photos, function(d) { return d.id; });
        items.filter(function(d) {
            return d.machine_tags.length > 0;
        }).append('img')
            .attr('class', 'machine-tag')
            .attr('src', 'images/osm.png');
        items.filter(function(d) {
            return d.machine_tags.length === 0;
        }).select('img.machine-tag').remove();
    }

    photoList.updateList = updateList;

    return d3.rebind(photoList, event, 'on');
};
