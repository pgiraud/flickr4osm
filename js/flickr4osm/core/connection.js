flickr4osm.Connection = function() {

    var event = d3.dispatch('flickrauthenticated', 'flickrauth'),
        connection = {},
        API_KEY = 'e67a11ef8aa80cb9eea71071d29783c3',
        FLICKR_REST_URL = "http://www.flickr.com/services/rest/?",
        MD5 = new Hashes.MD5(),
        auth = flickrAuth({
            api_key: API_KEY,
            url: FLICKR_REST_URL,
            done: authenticated
        }),
        auth_token,
        user;

    function authenticated() {
        event.flickrauthenticated();
    }

    connection.authenticate = function(callback) {
        function done(err, res) {
            auth_token = res.auth_token;
            user = res.user;
            event.flickrauth();
            d3.select('#flickr_connect').remove();
            if (callback) callback(err, res);
        }
        return auth.authenticate(done);
    };

    connection.getPhotos = function(page, callback) {
        page = page || 1;
        var params = {
            api_key: API_KEY,
            auth_token: auth_token,
            user_id: user.nsid,
            per_page: 48,
            page: page,
            method: 'flickr.people.getPhotos',
            format: 'json',
            extras: 'geo,machine_tags',
            nojsoncallback: 1
        };
        var signature = auth.signature(params);
        params.api_sig = MD5.hex(signature);

        $.getJSON(FLICKR_REST_URL + $.param(params), function(data) {
            callback(data.photos);
        });
    };

    connection.getInfo = function(photo, callback) {
        var o = {
            api_key: API_KEY,
            auth_token: auth_token,
            method: 'flickr.photos.getInfo',
            photo_id: photo,
            format: 'json',
            nojsoncallback: 1
        };
        var signature = auth.signature(o);
        o.api_sig = MD5.hex(signature);

        $.getJSON(FLICKR_REST_URL + $.param(o), function(data) {
            callback(data.photo);
        });
    };

    connection.addTag = function(photo, tag, callback) {
        var o = {
            api_key: API_KEY,
            auth_token: auth_token,
            method: 'flickr.photos.addTags',
            photo_id: photo,
            tags: tag,
            format: 'json',
            nojsoncallback: 1
        };
        var signature = auth.signature(o);
        o.api_sig = MD5.hex(signature);

        $.post(FLICKR_REST_URL, o, function(data) {
            callback(data);
        }, 'json');
    };

    connection.removeTag = function(tag, callback) {
        var o = {
            api_key: API_KEY,
            auth_token: auth_token,
            method: 'flickr.photos.removeTag',
            tag_id: tag,
            format: 'json',
            nojsoncallback: 1
        };
        var signature = auth.signature(o);
        o.api_sig = MD5.hex(signature);

        $.getJSON(FLICKR_REST_URL + $.param(o), function(data) {
            callback();
        });
    };

    return d3.rebind(connection, event, 'on');
};
