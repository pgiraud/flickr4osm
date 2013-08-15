flickr4osm.ui.PhotoList = function(context) {
    var event = d3.dispatch('choose'),
        photos = [],
        list,
        loading = false;

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
        var listLoading = listWrap.append('div')
            .attr('class', 'loading')
            .text('loading')
            .style('display', 'none');

        var page = 1;

        function drawList() {
            loading = true;
            connection.getPhotos(page, function(data) {
                listLoading.style('display', 'none');

                // convert misc machine_tags to osm aware machine_tags
                _.each(data.photo, function(photo) {
                    photo.machine_tags = _.filter(photo.machine_tags.split(','), function(tag) {
                        return tag.indexOf('osm') != -1;
                    });
                });

                photos = photos.concat(data.photo);

                var items = list.selectAll('.photo-list-item')
                    .data(photos, function(d) { return d.id; });

                var enter = items.enter().append('div')
                    .attr('class', 'photo-list-item')
                    .on('click', function(d) { event.choose(d); });

                var img = enter.append('img')
                    .attr('src', function(d) {
                        return flickr4osm.util.getPhotoUrl(d, 's');
                    });


                items.selectAll('img.geo').remove();
                items.filter(function(d) {
                    return d.longitude && d.latitude;
                }).append('img')
                    .attr('class', 'geo')
                    .attr('src', 'images/geo.png');

                items.selectAll('img.machine-tag').remove();
                items.filter(function(d) {
                    return d.machine_tags.length > 0;
                }).append('img')
                    .attr('class', 'machine-tag')
                    .attr('src', 'images/osm.png');

                loading = false;
            });
        }

        connection.on('flickrauthenticated', function() {drawList();});

        selection.on('scroll', function() {
            if (!loading) {
                if (this.scrollTop + this.offsetHeight >= this.scrollHeight) {
                    page++;
                    drawList();

                    window.setTimeout(function() {
                        listLoading.style('display', '');
                    }, 100);
                }
            }
        });
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
