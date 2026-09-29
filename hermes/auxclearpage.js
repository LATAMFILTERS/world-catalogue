define([
    'jquery'
], function($) {
    $( document ).ready(function(){
        let year = localStorage.getItem('finder-year');
        let make = localStorage.getItem('finder-make');
        let model = localStorage.getItem('finder-model');
        let engine = localStorage.getItem('finder-engine');
        let product = localStorage.getItem('finder-product-id');
        let url = "/partFinder/search/index?year=" + year + "&make=" + make + "&model=" + model + '&engine' + engine + "&product=" + product;
        $("#clear-page").attr('href', url);
    });
});

