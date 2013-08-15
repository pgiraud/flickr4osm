window.flickr4osm = function () {

    

    window.locale.en = iD.data.en;
    window.locale.current('en');

    var context = {},
        storage;

    // https://github.com/systemed/iD/issues/772
    // http://mathiasbynens.be/notes/localstorage-pattern#comment-9
    try { storage = localStorage; } catch (e) {}
    storage = storage || {};

    context.storage = function(k, v) {
        if (arguments.length === 1) return storage[k];
        else if (v === null) delete storage[k];
        else storage[k] = v;
    };

    var history = iD.History(context),
        dispatch = d3.dispatch('enter', 'exit', 'toggleFullscreen'),
        mode,
        container,
        ui = flickr4osm.ui(context),
        connection = iD.Connection(),
        flickr_connection = flickr4osm.Connection(),
        locale = iD.detect().locale,
        localePath;


    if (locale && iD.data.locales.indexOf(locale) === -1) {
        locale = locale.split('-')[0];
    }

    connection.on('load.context', function loadContext(err, result) {
        history.merge(result.data, result.extent);
    });

    context.preauth = function(options) {
        connection.switch(options);
        return context;
    };

    context.locale = function(_, path) {
        locale = _;
        localePath = path;
        return context;
    };

    context.loadLocale = function(cb) {
        if (locale && locale !== 'en' && iD.data.locales.indexOf(locale) !== -1) {
            localePath = localePath || context.assetPath() + 'locales/' + locale + '.json';
            d3.json(localePath, function(err, result) {
                window.locale[locale] = result;
                window.locale.current(locale);
                cb();
            });
        } else {
            cb();
        }
    };

    /* Straight accessors. Avoid using these if you can. */
    context.ui = function() { return ui; };
    context.connection = function() { return connection; };
    context.flickr_connection = function() { return flickr_connection; };
    context.history = function() { return history; };

    /* History */
    context.graph = history.graph;
    context.perform = history.perform;
    context.replace = history.replace;
    context.pop = history.pop;
    context.undo = history.undo;
    context.redo = history.redo;
    context.changes = history.changes;
    context.intersects = history.intersects;

    context.flush = function() {
        history.reset();
        connection.flush();
        map.redraw();
        return context;
    };

    /* Graph */
    context.hasEntity = function(id) {
        return history.graph().hasEntity(id);
    };

    context.entity = function(id) {
        return history.graph().entity(id);
    };

    context.childNodes = function(way) {
        return history.graph().childNodes(way);
    };

    context.geometry = function(id) {
        return context.entity(id).geometry(history.graph());
    };

    /* Modes */
    context.enter = function(newMode) {
        if (mode) {
            mode.exit();
            dispatch.exit(mode);
        }

        mode = newMode;
        mode.enter();
        dispatch.enter(mode);
    };

    context.mode = function() {
        return mode;
    };

    context.selectedIDs = function() {
        if (mode && mode.selectedIDs) {
            return mode.selectedIDs();
        } else {
            return [];
        }
    };

    /* Behaviors */
    context.install = function(behavior) {
        context.surface().call(behavior);
    };

    context.uninstall = function(behavior) {
        context.surface().call(behavior.off);
    };

    /* Projection */
    context.projection = d3.geo.mercator()
        .scale(512 / Math.PI)
        .precision(0);

    /* Background */
    var background = iD.Background(context);
    context.background = function() { return background; };

    /* Map */
    var map = iD.Map(context);
    context.map = function() { return map; };
    context.layers = function() { return map.layers; };
    context.surface = function() { return map.surface; };
    context.mouse = map.mouse;
    context.extent = map.extent;
    context.pan = map.pan;
    context.zoomIn = map.zoomIn;
    context.zoomOut = map.zoomOut;

    /* Presets */
    var presets = iD.presets()
        .load(iD.data.presets);

    context.presets = function() {
        return presets;
    };

    context.container = function(_) {
        if (!arguments.length) return container;
        container = _;
        container.classed('id-container', true);
        return context;
    };

    var embed = false;
    context.embed = function(_) {
        if (!arguments.length) return embed;
        embed = _;
        return context;
    };

    var assetPath = '';
    context.assetPath = function(_) {
        if (!arguments.length) return assetPath;
        assetPath = _;
        return context;
    };

    context.imagePath = function(_) {
        return assetPath + 'img/' + _;
    };

    context.toggleFullscreen = function() {
        dispatch.toggleFullscreen();
    };

    d3.select('#flickr_connect')
        .on('click', function() {
            flickr_connection.authenticate();
        });

    return d3.rebind(context, dispatch, 'on');
};
