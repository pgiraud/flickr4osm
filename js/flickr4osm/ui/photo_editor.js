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
                event.close();
            });

        $enter.append('h3');

        var $body = selection.selectAll('.inspector-body')
            .data([photo], function(d) {return d.id;});
        $body.exit().remove();

        // Enter
        $enter = $body.enter().append('div')
            .attr('class', 'inspector-body');

        $enter.append('div')
            .text(function(d) {return d.id;});

        var img = $enter.append('img')
            .attr('src', flickr4osm.util.getPhotoUrl(photo, 'n'));
    }

    photoEditor.photoId = function(_) {
        photo = _;
        return photoEditor;
    };

    return d3.rebind(photoEditor, event, 'on');
};