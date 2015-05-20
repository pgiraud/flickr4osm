flickr4osm.ui.PhotoEditor = function(context) {
    var event = d3.dispatch('close'),
        photo,
        tags,
        layer,
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
                layer.selectAll('g.picture').data([]).exit().remove();
                event.close();
            });

        $enter.append('h3');

        var map = context.map();

        // create the flickr4osm layer
        var supersurface = context.container().select('#supersurface');
        var div = supersurface.selectAll('.layer-flickr4osm').data([0]);
        div.enter().insert('div')
            .attr('class', 'layer-layer layer-flickr4osm');
        var layer = div.selectAll('svg').data([0]);
        layer.enter().append('svg');
        layer.dimensions(map.dimensions());

        // resize the flickr4osm layer when window size changes
        d3.select(window).on('resize.editor', function() {
            layer.dimensions(map.dimensions());
        });


        var timeoutId;
        function queueRedraw() {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(function() { redraw(); }, 300);
        }

        function redraw() {
            layer.selectAll('g')
                .attr('transform', transform);
        }

        context.map().on('move', function() {
            queueRedraw();
        });

        // move the marker to actual location
        // also apply rotation if available
        function transform(picture) {
            if (!picture.location) {
                return '';
            }
            var point = [picture.location.longitude, picture.location.latitude];
            var t = 'translate(' + context.projection(point) + ')';
            if (picture.direction) t += 'rotate(' + picture.direction + ',0,0)';
            return t;
        }

        function loadPhoto(data) {
            context.flickr_connection().getExif(photo.id, function(exif) {
                exifLoaded(data, exif);
            });
        }

        function getDirection(exif) {
            exif = exif.exif;
            var direction;
            exif.every(function(item) {
                if (item.tag == "GPSDestBearing") {
                    direction  = item.raw._content;
                    return false;
                }
                return true;
            });
            return direction;
        }

        function exifLoaded(data, exif) {
            var $body = selection.selectAll('.inspector-body')
                .data([data], function(d) {return d.id;});

            // Enter
            $enter = $body.enter().append('div')
                .attr('class', 'inspector-body');

            var container = $enter.append('div')
                .attr('class', 'photo');

            container.append('img')
                .attr('src', flickr4osm.util.getPhotoUrl(data, 'n'))
                .style('cursor', 'pointer')
                .attr('title', 'Click to display in bigger size')
                .on('click', function(d) {
                    window.open(flickr4osm.util.getPhotoUrl(data, 'b'));
                });

            container.append('p')
                .append('a')
                .text('Edit in Flickr')
                .attr('href', flickr4osm.util.getPhotoPageUrl(data))
                .attr('target', '_blank');

            $enter.append('ul')
                .attr('id', 'tags')
                .attr('class', 'tags');

            tags = data.tags.tag;

            $enter.append('p')
                .text('Select an entity on the map to add a tag.');


            // display marker on map
            var marker = layer.selectAll('g.picture')
                .data([data], function(d) {return d.id;});

            if (data.location && data.location.longitude && data.location.latitude) {
                map.centerZoom([data.location.longitude,
                    data.location.latitude], 19);


                var enter = marker.enter().append('g')
                    .attr('class', 'picture');

                var direction = getDirection(exif);
                if (direction) {
                    data.direction = direction;

                    enter.append('path')
                            .attr('transform', 'translate(-8, -13)')
                            .attr('d', 'M 2,7 C 7,4 9,4 14,7 L 8,0 z');
                }

                enter.append('circle')
                    .attr('dx', '0')
                    .attr('dy', '0')
                    .attr('r', '6');
                marker.attr('transform', transform);
            } else {
                $enter.append('p')
                    .text('No location found for this photo');
            }

            context.enter(iD.modes.Browse(context));
            context.container().classed("mode-browse", true);

            showTags();

            marker.exit().remove();
        }

        photoEditor.unselect = function() {
            var $tag = tags_wrap.selectAll('li.new')
                .data([]);
            $tag.exit().remove();
        };

        photoEditor.select = function(entity) {
            var id = entity.id.substring(1);
            var tag = ["osm:", entity.type, '=', id].join(''),
                tags = [tag];

            // check if there's already a tag for this entity
            var existing = tags_wrap.selectAll('li')
                .filter(function(d) {return d.raw == tag;});
            if (!existing.empty()) {
                existing
                    .transition()
                    .style('opacity', 0)
                    .transition()
                    .style('opacity', 100)
                    .transition()
                    .style('opacity', 0)
                    .transition()
                    .style('opacity', 100);
                tags = [];
            }

            var $tag = tags_wrap.selectAll('li.new')
                .data(tags, function(d) {return d;});
            $tag.exit().remove();

            var li = $tag.enter()
                .insert('li', ':first-child')
                .attr('class', 'new')
                .style('opacity', 0)
                .text(function(d) {return d.substring(4);});
            li.insert('a')
                .attr('class', 'add')
                .on('click', function(d) {
                    var self = this;
                    d3.select(self.parentNode).classed('loading', true);
                    context.flickr_connection().addTag(photo.id, tag, function() {
                        d3.select(self.parentNode)
                            .classed('loading', false)
                            .classed('done', true);
                        window.setTimeout(function() {
                            d3.select(self).classed('new', false);
                            context.flickr_connection().getInfo(photo.id, function(data) {
                                d3.select(self.parentNode).remove();
                                loadPhoto(data);
                            });
                        }, 1000);
                        // update the photo so that tags are up-to-date in the list
                        photo.machine_tags.push(0);
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
                .data(tags, function(d) {return d.raw;});
            $tags.exit().remove();
            $tags.enter()
                .insert('li', ':first-child')
                .attr('class', 'old')
                .text(function(d) {return d.raw.substring(4);})
                .append('a')
                .attr('class', 'delete-x')
                .on('click', function(d) {
                    var self = this;
                    d3.select(self.parentNode).classed('loading', true);
                    context.flickr_connection().removeTag(d.id, function() {
                        d3.select(self.parentNode)
                            .transition()
                            .style('width', "0px")
                            .style('opacity', 0)
                            .remove();
                        // update the photo so that tags are up-to-date in the list
                        photo.machine_tags.pop();
                    });
                })
                .append('span')
                .text('[x]');

            $tags.filter(function(d) {
                return d.machine_tag === 0 ||
                    d.raw.indexOf('osm') == -1;
            }).remove();
        }

        var $body = selection.selectAll('.inspector-body')
            .data([], function(d) {return d.id;});
        $body.exit().remove();
        context.flickr_connection().getInfo(photo.id, loadPhoto);
    }

    photoEditor.photo = function(_) {
        photo = _;
        return photoEditor;
    };

    return d3.rebind(photoEditor, event, 'on');
};
