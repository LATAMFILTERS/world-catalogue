define([
    'jquery'
], function($) {
    $( document ).ready(function(){
        if($('.move-column-aux').length > 0) {
        	$('.sidebar.sidebar-main').css('display','none');
            $('.partfinder-page-index.page-layout-2columns-left .column.main').css('float','left');
        }

        $('.apasearchform').submit(function(){
            $('input[name="q"]').val($.trim($('input[name="q"]').val()));
        });
    });
});

