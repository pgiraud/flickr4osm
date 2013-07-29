flickr4osm.ui.Sidebar = function(context) {
    var photoList = flickr4osm.ui.PhotoList(context),
        photoEditor = flickr4osm.ui.PhotoEditor(context);

    function sidebar(selection) {
        //var featureListWrap = selection.append('div')
            //.attr('class', 'feature-list-pane')
            //.call(iD.ui.FeatureList(context));

        var inspectorWrap = selection.append('div')
            .attr('class', 'inspector-wrap fr');

        var $wrap = inspectorWrap.selectAll('.panewrap')
            .data([0]);

        var $enter = $wrap.enter().append('div')
            .attr('class', 'panewrap');

        $enter.append('div')
            .attr('class', 'photos-list-pane pane')
            .call(photoList);

        $enter.append('div')
            .attr('class', 'photo-editor-pane pane');

        var $listPane = $wrap.select('.photos-list-pane');
        var $editorPane = $wrap.select('.photo-editor-pane');

        photoList.on('choose', selectPhoto);
        photoEditor.on('close', showList);

        function showList(preset) {
            $wrap.transition()
                .style('right', '-100%');
        }

        function selectPhoto(photo) {
            $wrap.transition()
                .style('right', '0%');

            $editorPane.call(photoEditor
                .photoId(photo));
        }

        sidebar.addTag = function(tag) {
            photoEditor.addTag(tag);
        };
    }

    sidebar.editor = photoEditor;

    return sidebar;
};
