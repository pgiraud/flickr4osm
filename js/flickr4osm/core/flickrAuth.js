flickrAuth = function(o){

    var flickrAuth = {};

    var SECRET = '72e7c46f724db031';
    var user, auth_token;

    // new MD5 instance
    flickrAuth.signature = function(o) {
        var s = [SECRET];
        var keys = Object.keys(o);
        keys.sort();
        var i = 0,
            l = keys.length;
        for (i; i < l; i++) {
            s.push(keys[i]);
            s.push(o[keys[i]]);
        }
        return s.join('');
    };

    flickrAuth.stringQs = function(str) {
        return str.split('&').reduce(function(obj, pair){
            var parts = pair.split('=');
            obj[decodeURIComponent(parts[0])] = (null === parts[1]) ?
                '' : decodeURIComponent(parts[1]);
            return obj;
        }, {});
    };

    var serialize = function(obj) {
        var pairs = [];
        for (var prop in obj) {
            if (!obj.hasOwnProperty(prop)) {
                continue;
            }
            pairs.push(prop + '=' + obj[prop]);
        }
        return pairs.join('&');
    }


    flickrAuth.authenticate = function(callback) {

        // get the frob
        var params = {
            api_key: o.api_key,
            perms: 'write'
        };
        var signature = flickrAuth.signature(params);
        var MD5 = new Hashes.MD5();
        params.api_sig = MD5.hex(signature);

        window.open('http://www.flickr.com/services/auth/?' + serialize(params),
            '_blank');

        flickrAuth.getToken = function(frob) {
            var params = {
                api_key: o.api_key,
                frob: frob,
                method: 'flickr.auth.getToken',
                format: 'json',
                nojsoncallback: 1
            };
            var signature = flickrAuth.signature(params);

            var MD5 = new Hashes.MD5();
            params.api_sig = MD5.hex(signature);

            // TODO get rid of jquery
            $.getJSON(o.url + serialize(params), function(data) {
                if (data.stat == 'ok') {
                    user = data.auth.user;
                    auth_token = data.auth.token._content;
                    callback(null, {
                        user: user,
                        auth_token: auth_token
                    });
                    o.done();
                    //flickr.photosets.getList();
                    //flickr.people.getPhotos();
                }
            });
        };

        // Called by a function in a landing page, in the popup window. The
        // window closes itself.
        window.authComplete = function(href) {
            qs = flickrAuth.stringQs(href.split('?')[1]);
            flickrAuth.getToken(qs.frob);
            delete window.authComplete;
        };
    };

    return flickrAuth;
};
