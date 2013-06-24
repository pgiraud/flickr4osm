var API_KEY = 'e67a11ef8aa80cb9eea71071d29783c3';
var SECRET = '72e7c46f724db031';
var FLICKR_REST_URL = "http://www.flickr.com/services/rest/?";
var user, auth_token;

var  auth = {};
// new MD5 instance
var MD5 = new Hashes.MD5();
auth.signature = function(o) {
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

auth.stringQs = function(str) {
    return str.split('&').reduce(function(obj, pair){
        var parts = pair.split('=');
        obj[decodeURIComponent(parts[0])] = (null === parts[1]) ?
            '' : decodeURIComponent(parts[1]);
        return obj;
    }, {});
};

auth.getFrob = function() {
    var o = {
        api_key: API_KEY,
        perms: 'write'
    };
    var signature = auth.signature(o);
    o.api_sig = MD5.hex(signature);

    window.open('http://www.flickr.com/services/auth/?' + $.param(o), '_blank');
};

auth.getToken = function(frob) {
    var o = {
        api_key: API_KEY,
        frob: frob,
        method: 'flickr.auth.getToken',
        format: 'json',
        nojsoncallback: 1
    };
    var signature = auth.signature(o);

    o.api_sig = MD5.hex(signature);

    $.getJSON(FLICKR_REST_URL + $.param(o), function(data) {
        if (data.stat == 'ok') {
            user = data.auth.user;
            auth_token = data.auth.token._content;
            flickr.photosets.getList();
            flickr.people.getPhotos();
        }
    });
};

var flickr = {};
flickr.photosets = {};
flickr.photosets.getList = function() {
    var o = {
        api_key: API_KEY,
        user_id: user.nsid,
        method: 'flickr.photosets.getList',
        format: 'json',
        nojsoncallback: 1
    };
    //var signature = auth.signature(o);
    //o.api_sig = MD5.hex(signature);

    $.getJSON(FLICKR_REST_URL + $.param(o), function(data) {
        var photosets = data.photosets.photoset;
        for (var i = 0; i < photosets.length; i++) {
            //console.log(photosets[i].title._content);
        }
        //if (data.stat == 'ok') {
            //user = data.auth.user;
            //auth_token = data.auth.token;
        //}
    });
};

flickr.people = {};
flickr.people.getPhotos = function() {
    var o = {
        api_key: API_KEY,
        auth_token: auth_token,
        user_id: user.nsid,
        per_page: 50,
        method: 'flickr.people.getPhotos',
        format: 'json',
        nojsoncallback: 1
    };
    var signature = auth.signature(o);
    o.api_sig = MD5.hex(signature);

    $.getJSON(FLICKR_REST_URL + $.param(o), function(data) {
        var photos = data.photos.photo;
        for (var i = 0; i < photos.length; i++) {
            var photo = photos[i];
            var img = $('<img />', {
                src: getPhotoUrl(photo, 's')
            }).click($.proxy(function(photo) {
                flickr.photos.setTags(photo, 'toto');
            }, null, photo));
            $('body').append(img);
        }
        //console.log(data);
    });
};

flickr.photos = {};
flickr.photos.setTags = function(photo, tags) {
    var o = {
        api_key: API_KEY,
        auth_token: auth_token,
        method: 'flickr.photos.setTags',
        photo_id: photo.id,
        tags: tags,
        format: 'json',
        nojsoncallback: 1
    };
    var signature = auth.signature(o);
    o.api_sig = MD5.hex(signature);

    $.post(FLICKR_REST_URL, o, function(data) {
        console.log(data);
    }, 'json');
}
flickr.photos.getCounts = function() {
    console.log(auth_token);
    var o = {
        api_key: API_KEY,
        auth_token: auth_token,
        method: 'flickr.photos.getCounts',
        format: 'json',
        nojsoncallback: 1
    };
    var signature = auth.signature(o);
    o.api_sig = MD5.hex(signature);

    $.getJSON(FLICKR_REST_URL + $.param(o), function(data) {
        console.log(data);
    });
};


$(function() {
    auth.getFrob();
});

function authComplete(href) {
    qs = auth.stringQs(href.split('?')[1]);
    auth.getToken(qs.frob);
}

function format(string, data) {
    return string.replace(/{[^{}]+}/g, function(key){
        return data[key.replace(/[{}]+/g, "")] || "";
    });
}

/**
 * Utility function to build a flickr url for a photo
 *
 * Parameters:
 * photo - {Object} the photo
 * size - {String} Either 'm', 's', 't', 'z', 'b'. Size of the photo. See
 *     http://www.flickr.com/services/api/misc.urls.html
 */
function getPhotoUrl(photo, size) {
    size = size || 's';
    var url = 'http://farm{farm}.staticflickr.com/{server}/{id}_{secret}_s.jpg';
    return format(url, photo);
}
