'use strict';

/*global require*/
require.config({
    shim: {
    },
    paths: {
        jquery: '../../bower_components/jquery/dist/jquery',
        backbone: '../../bower_components/backbone/backbone',
        underscore: '../../bower_components/lodash/dist/lodash',
        tap: '../../bower_components/tap/dist/tap'
    }
});

require([
    'jquery',
    'underscore',
    'backbone',
    'models/news',
    'views/NewsView'
], function ($, _, Backbone, News, NewsView) {
    var app = {};
    var $appContainer = $('.js-app');

    app.init = function(){
        this.newsCollection = new News.Collection();
        this.newsView = new NewsView({
            collection: this.newsCollection
        });
    };

    app.prepareCollection = function(data){
        var newsArr = data.value.items;

        if (Array.isArray(newsArr)) {
            var dataForCollection = [];

            newsArr.forEach(function(item){
                // Get news image, or leave a stub
                var imageUrl = item['media:content'] && item['media:content'][0].url ? item['media:content'][0].url : 'http://placekitten.com/g/1024/576';

                // Clear some image params, as they could shrink image preview
                if (imageUrl.split('?').length > 1) {
                    var splitImg = imageUrl.split('?');
                    splitImg.pop();
                    imageUrl = splitImg.join('');
                }

                // Get only text from description filed, and strip `Read More` text from the end
                var description = $(item.description).text().trim().replace(/\.[^.]+Read More$/,'.');

                dataForCollection.push(new News.Model({
                    image: imageUrl,
                    title: item.title,
                    summary: description,
                    url: item.link
                }));
            });

            // Reset collection of first add
            this.newsCollection.reset(dataForCollection);
        } else {
            $appContainer.text('Error fetching data from server.');
        }
    };

    // Get data from server
    $.ajax({
		dataType: 'jsonp',

        // I'm using custom pipe, that sends only 10 latest news
        url: 'http://pipes.yahoo.com/pipes/pipe.run?_id=e55c7d495044ab63ac0119b2161f96f1&_render=json&page=1&_callback=?'

//        Testing data
//        url: 'http://localhost:7777/api/data?callback=?'
    }).done(function (data) {
        app.init();
        app.prepareCollection(data);
    }).fail(function () {
        $appContainer.text('Error fetching data from server.');
    });

    Backbone.history.start();
});