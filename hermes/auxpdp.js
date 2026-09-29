define([
    'jquery',
    'underscore',
    'Concentrix_PartFinder/js/applicableCar',
    'jquery/ui',
    'datatable'
], function($, _, applicableCar) {
    return function(config) {
        function capitalizeFirst(word) {

            if (word === null) {
                return "";
            }

            const words = word.trim().split(" ");

            for (let i = 0; i < words.length; i++) {
                if (words[i] !== "") {
                    words[i] = words[i][0].toUpperCase() + words[i].slice(1).toLowerCase();
                }
            }

            return words.join(" ");
        }

        this.config;

        $(document).ready(function () {
            //  if we are on cabin air filter page
            if (window.location.href.indexOf("cabin-air-filter") > -1) {

                setTimeout(function () {
                    //  if there is an application set
                    let year = capitalizeFirst(localStorage.getItem('finder-year-text'));
                    let make = capitalizeFirst(localStorage.getItem('finder-make-text'));
                    let model = capitalizeFirst(localStorage.getItem('finder-model-text'));

                }, 500);
            }

            $('.tab-nav').children('li').first().children('a').addClass('active')
                .next().addClass('is-open').show();

            $('.tab-nav').on('click', 'li > a', function () {

                if (!$(this).hasClass('active')) {

                    $('.tab-nav .is-open').removeClass('is-open').hide();
                    $(this).next().toggleClass('is-open').toggle();

                    $('.tab-nav').find('.active').removeClass('active');
                    $(this).addClass('active');
                } else if ($(window).width() < 992) {
                    $('.tab-nav .is-open').removeClass('is-open').hide();
                    $(this).removeClass('active');
                }
            });

            let showApplicableCar = document.referrer.includes('partFinder/search/index');
            let selectedProductList = localStorage.getItem('finder-products-list');
            let clear = localStorage.getItem('clear');
            let productNumber = $('input[name=product_id]').val();

            /* Create Shell info*/
            if (showApplicableCar && selectedProductList.includes(productNumber) && !Number(clear) && applicableCar().showApplicableCar()) {
                let carTypes = {
                    'car-truck': 'Car & Truck',
                    'mh-duty': 'Med/Heavy Duty',
                    'power-sports': 'Power Sports',
                    'lawn-garden': 'Lawn & Garden',
                    'others': 'Others'
                }, searchTerms = {
                    carType: carTypes[localStorage.getItem('finder-car-type-text')],
                    type: capitalizeFirst(localStorage.getItem('finder-type-text')),
                    year: localStorage.getItem('finder-year-text'),
                    make: localStorage.getItem('finder-make-text'),
                    model: localStorage.getItem('finder-model-text'),
                    engine: localStorage.getItem('finder-engine-text')
                }, htmlInfo = '';

                htmlInfo += '<div class="headband">';
                htmlInfo += ' <span class="icon"><i class="fa fa-check-circle"></i></span>';
                htmlInfo += ' <span class="prefix">This product fits your :</span>';
                htmlInfo += ' <span class="criteria">';

                for (let term in searchTerms) {
                    if (!searchTerms.hasOwnProperty(term) || _.isEmpty(searchTerms[term]) ||
                        (searchTerms[term].includes('All') && searchTerms[term].length === 3 )
                        || searchTerms[term].includes('Any')
                    ) {
                        continue;
                    }

                    htmlInfo += '<span class="field">' + searchTerms[term] + '</span>';
                }

                htmlInfo += '</div>';

                $('#maincontent').prepend(htmlInfo);
            }

            /* Create dynamic tables */
            $('#applicationsTable thead tr')
                .clone(true)
                .addClass('filters applicationsTable')
                .appendTo('#applicationsTable thead');

            $('#competitorTable thead tr')
                .clone(true)
                .addClass('filters competitorTable')
                .appendTo('#competitorTable thead');

            var table = $('#applicationsTable, #competitorTable').DataTable({
                language: {
                    info: 'Page _PAGE_ of _PAGES_',
                    paginate: {
                        "first": "First",
                        "last": "Last",
                        "next": "Next »",
                        "previous": "« Prev"
                    },
                },
                orderCellsTop: true,
                fixedHeader: false,
                initComplete: function () {
                    var api = this.api();
                    var workTable = $(this).attr('id');
                    // For each column
                    api
                        .columns()
                        .eq(0)
                        .each(function (colIdx) {
                            // Set the header cell to contain the input element
                            var cell = $('.filters.' + workTable + ' th').eq(
                                $(api.column(colIdx).header()).index()
                            );
                            var title = $(cell).text();

                            if (title == "COMPETITOR NAME") {
                                title = "Brand";
                            }

                            if (title == "COMPETITOR PART #") {
                                title = "Interchange";
                            }

                            $(cell).html('<input type="text" placeholder="Search ' + title + '" />');

                            // On every keypress in this input
                            $(
                                'input',
                                $('.filters.' + workTable + ' th').eq($(api.column(colIdx).header()).index())
                            )
                                .off('keyup change')
                                .on('change', function (e) {
                                    // Get the search value
                                    $(this).attr('title', $(this).val());
                                    var regexr = '({search})'; //$(this).parents('th').find('select').val();

                                    var cursorPosition = this.selectionStart;
                                    // Search the column for that value
                                    api
                                        .column(colIdx)
                                        .search(
                                            this.value != '' ?
                                                regexr.replace('{search}', '(((' + this.value + ')))') :
                                                '',
                                            this.value != '',
                                            this.value == ''
                                        )
                                        .draw();
                                })
                                .on('keyup', function (e) {
                                    e.stopPropagation();

                                    $(this).trigger('change');
                                    $(this)
                                        .focus()[0]
                                        .setSelectionRange(cursorPosition, cursorPosition);
                                });
                        });
                },
            });
        });
    }
});

