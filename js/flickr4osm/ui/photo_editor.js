flickr4osm.ui.PhotoEditor = function(context) {
    var event = d3.dispatch('close'),
        photo;

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

        var map = context.map();

        if (photo.longitude && photo.latitude) {
            map.centerZoom([photo.longitude, photo.latitude], 19);
        }
        context.enter(iD.modes.Browse(context));
        context.container().classed("mode-browse", true);
    }

    photoEditor.photoId = function(_) {
        photo = _;
        return photoEditor;
    };

    return d3.rebind(photoEditor, event, 'on');
};
