flickr4osm.ui.PhotoEditor = function(context) {
    var event = d3.dispatch('close'),
        photo,
        tags,
        tags_wrap;

    function photoEditor(selection) {
        var $header = selection.selectAll('.header')
            .data([0]);

        var $enter = $header.enter().append('div')
            .attr('class', 'header fillL cf');

        $enter.append('button')
            .attr('class', 'fr preset-close')
            .append('span')
            .attr('class', 'icon close');

        $header.select('.preset-close')
            .on('click', function() {
                // make sure we exit the select mode
                context.enter(iD.modes.Browse(context));
                // it would be better to have a better browse mode
                iD.modes.Browse(context).exit();
                context.container().classed("mode-browse", false);
                event.close();
            });

        $enter.append('h3');

        function loadPhoto(photo) {
            var $body = selection.selectAll('.inspector-body')
                .data([photo], function(d) {return d.id;});
            $body.exit().remove();

            // Enter
            $enter = $body.enter().append('div')
                .attr('class', 'inspector-body');

            var container = $enter.append('div')
                .attr('class', 'photo');

            var img = container.append('img')
                .attr('src', flickr4osm.util.getPhotoUrl(photo, 'n'));

            $enter.append('ul')
                .attr('id', 'tags')
                .attr('class', 'tags');

            tags = photo.tags.tag;

            var map = context.map();

            if (photo.longitude && photo.latitude) {
                map.centerZoom([photo.longitude, photo.latitude], 19);
            }
            context.enter(iD.modes.Browse(context));
            context.container().classed("mode-browse", true);

            showTags();
        }

        photoEditor.select = function(entity) {
            var id = entity.id.substring(1);
            var tag = ["osm:", entity.type, '=', id].join('');
            var $tag = tags_wrap.selectAll('li.new')
                .data([tag], function(d) {return d;});
            $tag.exit().remove();

            var li = $tag.enter()
                .insert('li', ':first-child')
                .attr('class', 'new')
                .style('opacity', 0)
                .text(function(d) {return d;});
            li.insert('a')
                .attr('class', 'add')
                .on('click', function(d) {
                    var self = this;
                    d3.select(self).classed('loading', true);
                    context.flickr_connection().addTag(photo.id, tag, function() {
                        d3.select(self)
                            .classed('loading', false)
                            .classed('done', true);
                        window.setTimeout(function() {
                            d3.select(self.parentNode).remove();
                            context.flickr_connection().getInfo(photo.id, loadPhoto);
                        }, 1000);
                    });
                })
                .append('span')
                .text('[+]');

            li.transition()
              .delay(250)
              .duration(500)
              .style('opacity', 100);
        };

        function showTags() {
            tags_wrap = d3.select('.inspector-body ul#tags');
            var $tags = tags_wrap.selectAll('li.old')
                .data(tags, function(d) {return d.id;});
            $tags.exit().remove();
            $tags.enter()
                .insert('li', ':first-child')
                .attr('class', 'old')
                .text(function(d) {return d.raw;})
                .append('a')
                .attr('class', 'delete-x')
                .on('click', function(d) {
                    console.log(d);
                })
                .append('span')
                .text('[x]');
        }

        context.flickr_connection().getInfo(photo.id, loadPhoto);
    }

    photoEditor.photoId = function(_) {
        photo = _;
        return photoEditor;
    };

    return d3.rebind(photoEditor, event, 'on');
};
