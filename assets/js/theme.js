// dependencies
require('jquery');
require('flexslider');
require('algoliasearch/dist/algoliasearch.jquery');
require('autocomplete.js/dist/autocomplete.jquery');
require('tooltipster');
require('magnific-popup');

let ClipboardJs = require('clipboard')

// Add ClipboardJs to enable copy button functionality
new ClipboardJs('.copy-button', {
    target: function(trigger) {
        return trigger.previousElementSibling;
    }
}).on('success', function(e) {
    e.clearSelection()
});

$(function () {

    // Add copy button and tooltip to each highlight block
    $('.highlight').each(function () {
        $(this).append('<button class="copy-button tooltip" title="COPIED"><i class="far fa-clipboard"></i></button>')
    });

    $('.tooltip').tooltipster({
        animationDuration: 1,
        theme: 'tooltipster-light',
        side: 'bottom',
        delay: [200, 0],
        distance: 0,
        trigger: 'custom',
        triggerOpen: {
            click: true,
            tap: true
        },
        triggerClose: {
            click: true,
            tap: true,
            mouseleave: true
        }
    });

    // Nav-Toggle
    $(".toggler").on("click", function () {
        $("nav").slideToggle();
        $("#search").autocomplete("val", "");
    });

    // Giscus support to block search focus when hitting the S key
    blockSearchFocusGiscus = false;

    $('#giscus').on("focusin", function() {
        blockSearchFocusGiscus = true;
    });

    $('#giscus').on("focusout", function() {
        blockSearchFocusGiscus = false;
    });

    // Keyboard-Support
    $(document).on("keyup", function (e) {
        if (e.code == "Escape") {
            if (!$("nav").hasClass('permanentTopNav'))
                $("nav").slideUp();
            $("#search").autocomplete("val", "");
        }
        else if (e.code == "KeyS" && !blockSearchFocusGiscus) {
            if (!$("nav").hasClass('permanentTopNav'))
                $("nav").slideDown();
            $("#search").trigger("focus");
        }
    })

    // Flexslider
    $('.flexslider').flexslider({
        animation: "slide",
        prevText: "",
        nextText: "",
        pauseOnHover: true,
    });

    // Magnific Popup for images within articles to zoom them
    // Rendered with Markdown
    $('zoomable').magnificPopup({
        type: "image",
        image: {
            verticalFit: true,
            titleSrc: 'alt'
        },
        zoom: {
            enabled: true
        },
        callbacks: {
            // Get the src directly from the img-tag instead of an additional tag
            elementParse: function(item) {
              // Function will fire for each target element
              // "item.el" is a target DOM element (if present)
              // "item.src" is a source that you may modify

              item.src = item.el.attr('src')
            }
        },
        // https://github.com/dimsemenov/Magnific-Popup/pull/1017
        // Enabled popup only when image size is greater than content area
        disableOn: function(e) {
            let img = e.target;
            return img.naturalWidth > img.clientWidth;
        }
    });

    // Magnific Popup for images within articles to zoom them
    // Rendered with Asciidoc
    $('.image-block>img').magnificPopup({
        type: "image",
        image: {
            verticalFit: true,
            titleSrc: function (item) {
                return item.el.parent().find('figcaption').text();
            }
        },
        zoom: {
            enabled: true
        },
        callbacks: {
            elementParse: function(item) {
                item.src = item.el.attr('src')
            }
        },
        // https://github.com/dimsemenov/Magnific-Popup/pull/1017
        // Enabled popup only when image size is greater than content area
        disableOn: function(e) {
            let img = e.target;
            return img.naturalWidth > img.clientWidth;
        }
    });

    // Magnific Popup for images within articles to zoom them
    // Rendered with Asciidoc
    $('.image-block').magnificPopup({
        type: "image",
        delegate: "a",
        image: {
            titleSrc: function (item) {
                return item.el.parent().find('figcaption').text();
            },
            verticalFit: true
        },
        zoom: {
            enabled: true
        }
    });

    // Algolia-Search
    if ($('#activate-algolia-search').length) {
        let client = algoliasearch($('#algolia-search-appId').val(), $('#algolia-search-apiKey').val());
        let index = client.initIndex($('#algolia-search-indexName').val());

        let autocompleteSource = $.fn.autocomplete.sources.hits(index, { hitsPerPage: 10 });
        if ($('#algolia-search-currentLanguageOnly').length) {
            autocompleteSource = $.fn.autocomplete.sources.hits(index, { hitsPerPage: 5, filters: 'language: ' + $('html').attr('lang') });
        }

        $('#search').autocomplete({ hint: false, autoselect: true, debug: false },
            [
                {
                    source: autocompleteSource,
                    displayKey: function (suggestion) {
                        return suggestion.title || suggestion.author
                    },
                    templates: {
                        suggestion: function (suggestion) {
                            return "<span class='entry " + suggestion.type + "'>"
                                + "<span class='title'>" + suggestion.title + "</span>"
                                + "<span class='fas fa-fw " + suggestion.iconClass + "'></span>"
                                + "</span>"
                                ;
                        },
                        empty: function () {
                            return "<span class='empty'>" + $('#algolia-search-noSearchResults').val() + "</span>"
                        },
                        footer: function () {
                            return '<div class="branding">Powered by <img src="' + $('meta[name=siteBaseUrl]').attr("content") + '/images/logos/algolia-logo-light.svg" alt="algolia" /></div>'
                        }
                    },
                }
            ])
            .on('autocomplete:selected', function (suggestion) {
                window.location = (suggestion.url);
            })
            .keypress(function (event, suggestion) {
                if (event.code == "Enter") {
                    window.location = (suggestion.url);
                }
            });
    }
});
