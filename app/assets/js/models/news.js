'use strict';

define([
    'underscore',
    'backbone'
], function (_, Backbone) {

    var News = Backbone.Model.extend({
        defaults: {
            image: '',
            title: '',
            summary: '',
            url: '#'
        }
    });

    var NewsCollection = Backbone.Collection.extend({
        model: News
    });

    return {
        Model: News,
        Collection: NewsCollection
    };
});