/**
 * Copyright © Concentrix. All rights reserved.
 */
define([
    'uiComponent',
    'jquery',
    'mage/url',
    'ko'
], function (Component, $, urlBuilder, ko) {
    'use strict';

    return Component.extend({
        defaults: {
            baseUrl: urlBuilder.setBaseUrl(BASE_URL),
            filterAction: ''
        },

        initialize: function () {
            return this._super();
        },

        filter: function (elem, event) {
            let element = event.target;
            let filter = element.id.split('~');
            let url = '';

            if (element.className === 'filter-add') {
                url = this.addFilterValue(filter);
            } else {
                url = this.removeFilterValue(filter);
            }

            window.location = url;
            return true;
        },

        addFilterValue: function (filter) {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);

            //if url already has a filter value selected
            if (urlParams.has(filter[0])) {
                //Append new value to old one
                let newFilter = urlParams.get(filter[0]) + '~' + filter[1];
                urlParams.set(filter[0], newFilter);
            } else {
                urlParams.append(filter[0], filter[1]);
            }

            return this.filterAction + '?' + urlParams.toString();
        },

        removeFilterValue: function (filter) {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);

            //if filter is in url
            if (urlParams.has(filter[0])) {
                //Get selected values of that filter
                let selectedValues = urlParams.get(filter[0]).split('~');
                let newValues = selectedValues.filter(function (value, index, arr) {
                    return value !== filter[1];
                });

                //remove all values first
                urlParams.delete(filter[0]);

                if (newValues.length) {
                    //create them again with new options
                    urlParams.append(filter[0], newValues.join('~'));
                }
            }

            return this.filterAction + '?' + urlParams.toString();
        },

        clearFilters: function () {
            let carType = localStorage.getItem('finder-car-type').replace(' ','+');
            let type = localStorage.getItem('finder-type').replace(' ','+');
            let year = localStorage.getItem('finder-year').replace(' ','+');
            let make = localStorage.getItem('finder-make').replace(' ','+');
            let model = localStorage.getItem('finder-model').replace(' ','+');
            let engine = localStorage.getItem('finder-engine').replace(' ','+');

            window.location = this.baseUrl + "/partFinder/search/index?type=" + type + "&year=" + year + "&make=" + make + "&model=" + model + "&engine=" + engine+ "&car-type=" + carType;
            return true;
        },

        clearFiltersSearch: function () {
            const params = new URLSearchParams(window.location.search);
            console.log(params);
            let search = '';
            if (params.has('q')) {
                search = params.get('q');
            }
            console.log(search);
            window.location = "/partFinder/page/index?q=" +search;
            return true;
        }
    });
});

