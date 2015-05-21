flickr4osm.ui = function(context) {
    function render(container) {
        var map = context.map();

        if (iD.detect().opera) container.classed('opera', true);

        var hash = iD.behavior.Hash(context);

        hash();

        if (!hash.hadHash) {
            map.centerZoom([-77.02271, 38.90085], 20);
        }

        container.append('svg')
            .attr('id', 'defs')
            .call(iD.svg.Defs(context));

        var sidebar = d3.select('#sidebar');
        sidebar.call(ui.sidebar);

        var content = container.append('div')
            .attr('id', 'content');

        var m = content.append('div')
            .attr('id', 'map')
            .call(map);

        content.append('div')
            .attr('class', 'map-in-map')
            .style('display', 'none')
            .call(iD.ui.MapInMap(context));

        content.append('div')
            .attr('class', 'spinner')
            .call(iD.ui.Spinner(context));

        var controls = content.append('div')
            .attr('class', 'map-controls');

        controls.append('div')
            .attr('class', 'map-control background-control')
            .call(iD.ui.Background(context));

        controls.append('div')
            .attr('class', 'map-control map-data-control')
            .call(iD.ui.MapData(context));

        controls.append('div')
            .attr('class', 'map-control zoombuttons')
            .call(iD.ui.Zoom(context));

        //if (!context.embed()) {
            //controls.append('div')
                //.attr('class', 'map-control geocode-control')
                //.call(iD.ui.Geocoder(context));
        //}

        //var about = content.append('div')
            //.attr('class','col12 about-block fillD');

        //about.append('div')
            //.attr('class', 'api-status')
            //.call(iD.ui.Status(context));

        //if (!context.embed()) {
            //about.append('div')
                //.attr('class', 'account')
                //.call(iD.ui.Account(context));
        //}

        d3.select(window).on('resize.editor', function() {
            map.dimensions(m.dimensions());
        });

        //function pan(d) {
            //return function() {
                //context.pan(d);
            //};
        //}

        //// pan amount
        //var pa = 5;

        //var keybinding = d3.keybinding('main')
            //.on('⌫', function() { d3.event.preventDefault(); })
            //.on('←', pan([pa, 0]))
            //.on('↑', pan([0, pa]))
            //.on('→', pan([-pa, 0]))
            //.on('↓', pan([0, -pa]));

        //d3.select(document)
            //.call(keybinding);

        //context.enter(iD.modes.Browse(context));

        //context.container()
            //.call(iD.ui.Splash(context))
            //.call(iD.ui.Restore(context))
            //.classed("mode-browse", true);

        //var authenticating = iD.ui.Loading(context)
            //.message(t('loading_auth'));
    }

    function ui(container) {
        context.container(container);
        context.loadLocale(function() {
            render(container);
        });
    }

    ui.sidebar = flickr4osm.ui.Sidebar(context);

    return ui;
};

iD.ui.tooltipHtml = function(text, key) {
    var s = '<span>' + text + '</span>';
    if (key) {
        s += '<div class="keyhint-wrap">' +
            '<span> ' + (t('tooltip_keyhint')) + ' </span>' +
            '<span class="keyhint"> ' + key + '</span></div>';
    }
    return s;
};
