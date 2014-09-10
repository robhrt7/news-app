'use strict';

define([
    'jquery',
    'underscore',
    'backbone',
    'tap'
], function ($, _, Backbone) {
    var $appContainer = $('.js-app');

    var NewsView = Backbone.View.extend({
        template: _.template($('#news-template').html()),
        render: function () {
            $('.js-loading').remove();

            if ($('.news').length === 0) {
                $appContainer.append(this.template());
            }
            // Setting element after appending it from template
            this.setElement('.news');

            this.addAll();

            return this; // enable chained calls
        },
        initialize: function () {
            this.collection.on('reset', this.render, this);
        },
        addOne: function (model, noWrite) {
            var view = new NewsItem({model: model});
            var rendered = view.render().el;

            if (!noWrite) {
                this.$('.js-news-list').append(rendered);
            }

            return rendered;
        },
        addAll: function () {
            var renderedList = [];

            this.collection.each(function(model){
                renderedList.push(this.addOne(model, true));
            }, this);

            // Optimizing DOM write count
            $('.js-news-list').append(renderedList);
        },
        events: {
            'tap .card': 'tap'
        },
        tap: function (e) {
            $(e.target).toggleClass('__active');
        }
    });


    var NewsItem = Backbone.View.extend({
        template: _.template($('#news-item-template').html()),
        render: function () {
            this.setElement(this.template(this.model.toJSON()));
            return this; // enable chained calls
        }
    });


    return NewsView;
});