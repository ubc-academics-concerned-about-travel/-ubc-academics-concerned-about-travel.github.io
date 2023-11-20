(function ($) {
  function getContentHTML(
    records,
    identifierField,
    identifierFieldValue,
    renderField,
    renderFieldUnits,
    unitBeforeValue,
    removeUnitSpace
  ) {
    item = records.find(
      (item) => item[identifierField] == identifierFieldValue
    );
    if (item.hasOwnProperty(renderField)) {
      // Attempt to format the value
      let value = item[renderField];
      const formattedValue = new Intl.NumberFormat().format(value);
      value = value === "NaN" ? value : formattedValue;
      const unitsHTML = `<span class="units">${renderFieldUnits}</span>`;
      const valueHTML = `<span class="value">${value}</span>`;
      // Control spacing and order for values and units
      let body = removeUnitSpace
        ? valueHTML + unitsHTML
        : valueHTML + " " + unitsHTML;
      if (unitBeforeValue) {
        body = removeUnitSpace
          ? unitsHTML + valueHTML
          : unitsHTML + " " + valueHTML;
      }
      return `<div class="fetched-value">${body}</div>`;
    }
    return "<div>Error.</div>";
  }

  function render(html, id) {
    $(`#${id}`).html(html);
  }

  function fetchData(url, successCallback) {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const isCKANFormat = data.result && Array.isArray(data.result.records);
        const isArrayFormat = Array.isArray(data);

        if (isCKANFormat) {
          return successCallback(data.result.records);
        }

        if (isArrayFormat) {
          return successCallback(data);
        }
        console.log("Accepted response formats: [] OR { result: records: [] }");
        console.log("Got response:");
        console.log(data);
      })
      .catch((error) => console.error(error));
  }

  function renderData(settings) {
    return (data) => {
      render(
        getContentHTML(
          data,
          settings.identifierField,
          settings.identifierFieldValue,
          settings.renderField,
          settings.renderFieldUnits,
          settings.unitBeforeValue,
          settings.removeUnitSpace
        ),
        settings.targetId
      );
    };
  }

  function getSettingsForItem(itemSelector) {
    return {
      dataSource: itemSelector.data("source"),
      targetId: itemSelector.data("target_id"),
      identifierField: itemSelector.data("identifier_field"),
      identifierFieldValue: itemSelector.data("identifier_field_value"),
      renderField: itemSelector.data("render_field"),
      renderFieldUnits: itemSelector.data("render_field_units"),
      unitBeforeValue: itemSelector.data("unit_before_value"),
      removeUnitSpace: itemSelector.data("remove_unit_space"),
    };
  }

  Drupal.behaviors.usiParagraphsDynamicValues = {
    attach: function (context, settings) {
      const selector = settings.usiParagraphsDynamicValues.itemSelector;
      $(selector).each(function () {
        const settings = getSettingsForItem($(this));
        fetchData(settings.dataSource, renderData(settings));
      });
    },
  };
})(jQuery);
;
Drupal.TBMegaMenu = Drupal.TBMegaMenu || {};

(function ($) {
  Drupal.TBMegaMenu.oldWindowWidth = 0;
  Drupal.TBMegaMenu.displayedMenuMobile = false;
  Drupal.TBMegaMenu.supportedScreens = [980];
  Drupal.TBMegaMenu.menuResponsive = function () {
    var windowWidth = window.innerWidth ? window.innerWidth : $(window).width();
    var navCollapse = $('.tb-megamenu').children('.nav-collapse');
    if (windowWidth < Drupal.TBMegaMenu.supportedScreens[0]) {
      navCollapse.addClass('collapse');
      if (Drupal.TBMegaMenu.displayedMenuMobile) {
        navCollapse.css({height: 'auto', overflow: 'visible'});
      } else {
        navCollapse.css({height: 0, overflow: 'hidden'});
      }
    } else {
      // If width of window is greater than 980 (supported screen).
      navCollapse.removeClass('collapse');
      if (navCollapse.height() <= 0) {
        navCollapse.css({height: 'auto', overflow: 'visible'});
      }
    }
  };

  Drupal.TBMegaMenu.focusNextPrevElement = function (direction) {
    // Add all the elements we want to include in our selection
    var focusableElements = 'a:not([disabled]), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), details:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
    var $current = $(document.activeElement);

    if ($current.length) {
      var $focusable = $(focusableElements).filter(function() {
        var $this = $(this);
        return $this.closest('.tb-megamenu-subnav').length === 0 && $this.is(':visible');
      })

      var index = $focusable.index($current);
      if (index > -1) {
        if (direction === 'next') {
          var nextElement = $focusable[index + 1] || $focusable[0];
        }
        else {
          var nextElement = $focusable[index - 1] || $focusable[0];
        }

        nextElement.focus();
      }
    }
  }


  Drupal.behaviors.tbMegaMenuAction = {
    attach: function(context) {

      /* Keyboard Control Setup */
      // Semi-Global Variables
      $('.tb-megamenu').once('tb-megamenu', function() {

        var navParent = document.querySelector('.tb-megamenu'),
            linkArray = new Array(),
            curPos = new Array(-1,-1,-1);

        // Each Top-Level Link
        $('.tb-megamenu').find('.level-1').children('a').not('.mobile-only').each(function(i,toplink) {
          linkArray[i] = new Array();

          // Add Link to Array
          linkArray[i][-1] = toplink;

          // Determine Coordinates
          $(toplink).data({ coordinate: [i, -1] });

          // Each Column
          $(toplink).next().children().children().children('.mega-col-nav').each(function(j,column) {
            linkArray[i][j] = new Array();

            // Each Link
            $(column).find('a').each(function(k,sublink) {

              // Add Link to Array
              linkArray[i][j][k] = sublink;

              // Determine Coordinates
              $(sublink).data({ coordinate: [i, j, k] });
            }); // each link

          }); // each column

        }); // each top-level link

        // Update Position on Focus
        $('.tb-megamenu').find('a').focus(function() {
          curPos = $(this).data('coordinate');
        });

        /* Event Listener */
        // On Keydown
        if (navParent !== null) {
          navParent.addEventListener('keydown',keydownEvent);
        }

        // Key Pressed
        function keydownEvent(k) {
          // Determine Key
          switch(k.keyCode) {

            // TAB
            case 9:
              k.preventDefault();
              nav_tab(k);
              break;

            // RETURN
            case 13:
              nav_open_link();
              break;

            // ESC
            case 27:
              nav_esc();
              break;

            // LEFT
            case 37:
              k.preventDefault();
              nav_left();
              break;

            // UP
            case 38:
              k.preventDefault();
              nav_up();
              break;

            // RIGHT
            case 39:
              k.preventDefault();
              nav_right();
              break;

            // DOWN
            case 40:
              k.preventDefault();
              nav_down();
              break;

            // HOME
            case 36:
              nav_home();
              break;

            // END
            case 35:
              nav_end();
              break;

            // Else
            default:
              // Do nothing

          } // determine key
        } // keydownEvent

      /* Keypress Functions */
        // Tab
        function nav_tab(k) {
          if(nav_is_toplink()) {
            if(k.shiftKey) {
              nav_prev_toplink();
            } else {
              nav_next_toplink();
            }
          } else {
            if(k.shiftKey) {
              nav_up();
            } else {
              nav_down();
            }
          }
        }

        // Open Link
        function nav_open_link() {
          linkArray[curPos[0]][curPos[1]][curPos[2]].click();
        }

        // Escape
        function nav_esc() {
          nav_close_megamenu();
        }

        // Left
        function nav_left() {
          if(nav_is_toplink()) {
            nav_prev_toplink();
          } else {
            nav_prev_column();
          }
        }

        // Right
        function nav_right() {
          if(nav_is_toplink()) {
            nav_next_toplink();
          } else {
            nav_next_column();
          }
        }

        // Up
        function nav_up() {
          if(nav_is_toplink()) {
            nav_prev_toplink();
          } else {
            if(linkArray[curPos[0]][curPos[1]][curPos[2] - 1]) {
              linkArray[curPos[0]][curPos[1]][curPos[2] - 1].focus();
            } else {
              nav_prev_column();
            }
          }
        }

        // Down
        function nav_down() {
          if(nav_is_toplink()) {
            nav_next_column();
          } else {
            if(linkArray[curPos[0]][curPos[1]][curPos[2] + 1]) {
              linkArray[curPos[0]][curPos[1]][curPos[2] + 1].focus();
            } else {
              nav_next_column();
            }
          }
        }

        // Home Button
        function nav_home() {
          if(nav_is_toplink()) {
            linkArray[0][-1].focus();
          } else {
            linkArray[curPos[0]][0][0].focus();
          }
        }

        // End Button
        function nav_end() {
          if(nav_is_toplink()) {
            linkArray.slice(-1)[0][-1].focus();
          } else {
            linkArray[curPos[0]].slice(-1)[0].slice(-1)[0].focus();
          }
        }

      /* Helper Functions */
        // Determine Link Level
        function nav_is_toplink() {
          return (curPos[1] < 0);
        }

        // Close Mega Menu
        function nav_close_megamenu() {
          $('.tb-megamenu .open').removeClass('open');
          $('.tb-megamenu-item.dropdown-submenu.open').removeClass('open');
          ariaCheck();
        }

        // Next Toplink
        function nav_next_toplink() {
          if(linkArray[curPos[0] + 1]) {
            linkArray[curPos[0] + 1][-1].focus();
          } else {
            nav_close_megamenu();

            // Focus on the next element.
            Drupal.TBMegaMenu.focusNextPrevElement('next');
          }
        }

        // Previous Toplink
        function nav_prev_toplink() {
          if(linkArray[curPos[0] - 1]) {
            linkArray[curPos[0] - 1][-1].focus();
          } else {
            // Focus on the previous element.
            Drupal.TBMegaMenu.focusNextPrevElement('prev');
          }
        }

        // Previous Column
        function nav_prev_column() {
          if(linkArray[curPos[0]][curPos[1] - 1][0]) {
            linkArray[curPos[0]][curPos[1] - 1][0].focus();
          } else {
            nav_parent_toplink();
          }
        }

        // Next Column
        function nav_next_column() {
          if(linkArray[curPos[0]][curPos[1] + 1]) {
            linkArray[curPos[0]][curPos[1] + 1][0].focus();
          } else {
            nav_parent_toplink();
          }
        }

        // Go to Parent Toplink
        function nav_parent_toplink() {
          linkArray[curPos[0]][-1].focus();
        }

        var ariaCheck = function() {
          $("li.tb-megamenu-item").each(function () {
            if ($(this).is('.mega-group')) {
              // Mega menu item has mega class (it's a true mega menu)
              if(!$(this).parents().is('.open')) {
                // Mega menu item has mega class and its ancestor is closed, so apply appropriate ARIA attributes
                $(this).children().attr('aria-expanded', 'false');
              }
              else if ($(this).parents().is('.open')) {
                // Mega menu item has mega class and its ancestor is open, so apply appropriate ARIA attributes
                $(this).children().attr('aria-expanded', 'true');
              }
            }
            else if ($(this).is('.dropdown') || $(this).is('.dropdown-submenu')) {
              // Mega menu item has dropdown (it's a flyout menu)
              if (!$(this).is('.open')) {
                // Mega menu item has dropdown class and is closed, so apply appropriate ARIA attributes
                $(this).children().attr('aria-expanded', 'false');
              }
              else if ($(this).is('.open')) {
                // Mega menu item has dropdown class and is open, so apply appropriate ARIA attributes
                $(this).children().attr('aria-expanded', 'true');
              }
            }
            else {
              // Mega menu item is neither a mega or dropdown class, so remove ARIA attributes (it doesn't have children)
              $(this).children().removeAttr('aria-expanded');
            }
          });
        };

        var showMenu = function ($subMenu, mm_timeout) {
          // console.log("showMenu");
          if ($subMenu.hasClass('mega')) {
            $subMenu.addClass('animating');
            clearTimeout($subMenu.data('animatingTimeout'));
            $subMenu.data('animatingTimeout', setTimeout(function () {
              $subMenu.removeClass('animating')
            }, mm_timeout));
            clearTimeout($subMenu.data('hoverTimeout'));
            $subMenu.data('hoverTimeout', setTimeout(function () {
              $subMenu.addClass('open');
              ariaCheck();
            }, 100));
          }
          else {
            clearTimeout($subMenu.data('hoverTimeout'));
            $subMenu.data('hoverTimeout',
                setTimeout(function () {
                  $subMenu.addClass('open');
                  ariaCheck();
                }, 100));
          }
        };
        var hideMenu = function ($subMenu, mm_timeout) {
          // console.log("hideMenu");
          $subMenu.children('.dropdown-toggle').attr('aria-expanded', 'false');
          if ($subMenu.hasClass('mega')) {
            $subMenu.addClass('animating');
            clearTimeout($subMenu.data('animatingTimeout'));
            $subMenu.data('animatingTimeout', setTimeout(function () {
              $subMenu.removeClass('animating')
            }, mm_timeout));
            clearTimeout($subMenu.data('hoverTimeout'));
            $subMenu.data('hoverTimeout', setTimeout(function () {
              $subMenu.removeClass('open');
              ariaCheck();
            }, 100));
          }
          else {
            clearTimeout($subMenu.data('hoverTimeout'));
            $subMenu.data('hoverTimeout', setTimeout(function () {
              $subMenu.removeClass('open');
              ariaCheck();
            }, 100));
          }
        };

        $('.tb-megamenu-button', context).once('menuIstance', function () {
          var This = this;
          $(This).click(function() {
            if(parseInt($(this).parent().children('.nav-collapse').height())) {
              $(this).parent().children('.nav-collapse').css({height: 0, overflow: 'hidden'});
              Drupal.TBMegaMenu.displayedMenuMobile = false;
            }
            else {
              $(this).parent().children('.nav-collapse').css({height: 'auto', overflow: 'visible'});
              Drupal.TBMegaMenu.displayedMenuMobile = true;
            }
          });
        });

        
        var isTouch = window.matchMedia('(pointer: coarse)').matches;
        if (!isTouch) {
          $(document).ready(function ($) {
            var mm_duration = 0;
            $('.tb-megamenu', context).each(function () {
              if ($(this).data('duration')) {
                mm_duration = $(this).data('duration');
              }
            });

            var mm_timeout = mm_duration ? 100 + mm_duration : 500;
            $('.nav > li, li.mega', context).bind('mouseenter', function (event) {
              showMenu($(this), mm_timeout);
            });
            $('.nav > li > .dropdown-toggle, li.mega > .dropdown-toggle', context).bind('focus', function (event) {
              var $this = $(this);
              var $subMenu = $this.closest('li');
              // console.log("showMenu call");
              showMenu($subMenu, mm_timeout);
              // If the focus moves outside of the subMenu, close it.
              $(document).bind('focusin', function (event) {
                if ($subMenu.has(event.target).length) {
                  return;
                }
                $(document).unbind(event);
                // console.log("hideMenu call");
                hideMenu($subMenu, mm_timeout);
              });
            });
            $('.nav > li, li.mega', context).bind('mouseleave', function (event) {
              hideMenu($(this), mm_timeout);
            });
          });

          /**
           * Allow tabbing by appending the open class.
           * Works in tandem with CSS changes that utilize opacity rather than
           * display none
           */
          // If the selected anchor is not in the TB Megamenu, remove all "open"
          // class occurrences
          $('a').focus(function (event) {
            if (!$(this).parent().hasClass('tb-megamenu-item') && !$(this).parents('.tb-megamenu-block').length) {
              nav_close_megamenu();
            }
          });

          $('.nav > li > a, li.mega > a').focus(function (event) {
            // Remove all occurrences of "open" from other menu trees
            var siblings = $(this).parents('.tb-megamenu-item').siblings();
            // var siblings = $(this).closest('.tb-megamenu-item.level-1').siblings();
            $.each(siblings, function (i, v) {
              var cousins = $(v).find('.open');
              $.each(cousins, function (index, value) {
                $(value).removeClass('open');
                ariaCheck($(this));
              });
              $(v).removeClass('open');
              ariaCheck();
            });
            // Open the submenu if the selected item has one
            if ($(this).next(".tb-megamenu-submenu").length > 0) {
              if (!$(this).parent().hasClass("open")) {
                $(this).parent().addClass("open");
              }
            }
            // If the anchor's top-level parent is not open, open it
            if (!$(this).closest('.tb-megamenu-item.dropdown').hasClass('open') && $(this).closest('.tb-megamenu-item.dropdown').find('.tb-megamenu-submenu').length > 0) {
              $(this).closest('.tb-megamenu-item.dropdown').addClass('open');
              ariaCheck();
            }
            // If anchor's parent submenus are not open, open them
            var parents = $(this).parents('.tb-megamenu-item.dropdown-submenu');
            $.each(parents, function (i, v) {
              if (!$(v).hasClass('open')) {
                $(v).addClass('open');
                ariaCheck();
              }
            });
          });
        }

        $(window).resize(function() {
          var windowWidth = window.innerWidth ? window.innerWidth : $(window).width();
          if(windowWidth != Drupal.TBMegaMenu.oldWindowWidth){
            Drupal.TBMegaMenu.oldWindowWidth = windowWidth;
            Drupal.TBMegaMenu.menuResponsive();
          }
        });

      });
    },
  }
})(jQuery);
;
Drupal.TBMegaMenu = Drupal.TBMegaMenu || {};

(function ($) {
  Drupal.TBMegaMenu.createTouchMenu = function(items) {
    items.children('a, .tb_nolink').each( function() {
      var $item = $(this);
      var tbitem = $(this).parent();

      $item.click( function(event){
        if ($item.hasClass('tb-megamenu-clicked')) {
          var $uri = $item.attr('href');
          if ($uri && $uri !== '#') {
            window.location.href = $uri;
          }
        }
        else {
          event.preventDefault();
          $item.addClass('tb-megamenu-clicked');
          if(!tbitem.hasClass('open')){	
            tbitem.addClass('open');
          }

          // Find any parent siblings that are open and close them.
          tbitem.siblings('.open').find('.tb-megamenu-clicked').removeClass('tb-megamenu-clicked');
          tbitem.siblings('.open').removeClass('open');

          $('body').addClass('tb-megamenu-open');
        }
      });
    });
  }
  
  Drupal.TBMegaMenu.eventStopPropagation = function(event) {
    if (event.stopPropagation) {
      event.stopPropagation();
    }
    else if (window.event) {
      window.event.cancelBubble = true;
    }
  }

  Drupal.behaviors.tbMegaMenuTouchAction = {
    attach: function(context) {
      var isTouch = window.matchMedia('(pointer: coarse)').matches;
      if(isTouch){
        $('html').addClass('touch');
        Drupal.TBMegaMenu.createTouchMenu($('.tb-megamenu ul.nav li.mega').has('.dropdown-menu'));

        // When the user touches anywhere outside of the open menu item, close
        // the open menu item.
        $(document).on('touchstart', function(event) {
          if ($('body').hasClass('tb-megamenu-open') && !$(event.target).closest('.mega.open').length) {
            $('.tb-megamenu ul.nav li.mega a, .tb-megamenu ul.nav li.mega .tb_nolink').removeClass('tb-megamenu-clicked');
            $('.tb-megamenu ul.nav li.mega').removeClass('open');
            $('body').removeClass('tb-megamenu-open');
         }
       });
      }
    }
  }
})(jQuery);
;
(function ($) {

Drupal.googleanalytics = {};

$(document).ready(function() {

  // Attach mousedown, keyup, touchstart events to document only and catch
  // clicks on all elements.
  $(document.body).bind("mousedown keyup touchstart", function(event) {

    // Catch the closest surrounding link of a clicked element.
    $(event.target).closest("a,area").each(function() {

      // Is the clicked URL internal?
      if (Drupal.googleanalytics.isInternal(this.href)) {
        // Skip 'click' tracking, if custom tracking events are bound.
        if ($(this).is('.colorbox') && (Drupal.settings.googleanalytics.trackColorbox)) {
          // Do nothing here. The custom event will handle all tracking.
          //console.info("Click on .colorbox item has been detected.");
        }
        // Is download tracking activated and the file extension configured for download tracking?
        else if (Drupal.settings.googleanalytics.trackDownload && Drupal.googleanalytics.isDownload(this.href)) {
          // Download link clicked.
          gtag('event', Drupal.googleanalytics.getDownloadExtension(this.href).toUpperCase(), {
            event_category: 'Downloads',
            event_label: Drupal.googleanalytics.getPageUrl(this.href),
            transport_type: 'beacon'
          });
        }
        else if (Drupal.googleanalytics.isInternalSpecial(this.href)) {
          // Keep the internal URL for Google Analytics website overlay intact.
          // @todo: May require tracking ID
          var target = this;
          $.each(Drupal.settings.googleanalytics.account, function () {
            gtag('config', this, {
              page_path: Drupal.googleanalytics.getPageUrl(target.href),
              transport_type: 'beacon'
            });
          });
        }
      }
      else {
        if (Drupal.settings.googleanalytics.trackMailto && $(this).is("a[href^='mailto:'],area[href^='mailto:']")) {
          // Mailto link clicked.
          gtag('event', 'Click', {
            event_category: 'Mails',
            event_label: this.href.substring(7),
            transport_type: 'beacon'
          });
        }
        else if (Drupal.settings.googleanalytics.trackOutbound && this.href.match(/^\w+:\/\//i)) {
          if (Drupal.settings.googleanalytics.trackDomainMode !== 2 || (Drupal.settings.googleanalytics.trackDomainMode === 2 && !Drupal.googleanalytics.isCrossDomain(this.hostname, Drupal.settings.googleanalytics.trackCrossDomains))) {
            // External link clicked / No top-level cross domain clicked.
            gtag('event', 'Click', {
              event_category: 'Outbound links',
              event_label: this.href,
              transport_type: 'beacon'
            });
          }
        }
      }
    });
  });

  // Track hash changes as unique pageviews, if this option has been enabled.
  if (Drupal.settings.googleanalytics.trackUrlFragments) {
    window.onhashchange = function() {
      $.each(Drupal.settings.googleanalytics.account, function () {
        gtag('config', this, {
          page_path: location.pathname + location.search + location.hash
        });
      });
    };
  }

  // Colorbox: This event triggers when the transition has completed and the
  // newly loaded content has been revealed.
  if (Drupal.settings.googleanalytics.trackColorbox) {
    $(document).bind("cbox_complete", function () {
      var href = $.colorbox.element().attr("href");
      if (href) {
        $.each(Drupal.settings.googleanalytics.account, function () {
          gtag('config', this, {
            page_path: Drupal.googleanalytics.getPageUrl(href)
          });
        });
      }
    });
  }

});

/**
 * Check whether the hostname is part of the cross domains or not.
 *
 * @param string hostname
 *   The hostname of the clicked URL.
 * @param array crossDomains
 *   All cross domain hostnames as JS array.
 *
 * @return boolean
 */
Drupal.googleanalytics.isCrossDomain = function (hostname, crossDomains) {
  /**
   * jQuery < 1.6.3 bug: $.inArray crushes IE6 and Chrome if second argument is
   * `null` or `undefined`, https://bugs.jquery.com/ticket/10076,
   * https://github.com/jquery/jquery/commit/a839af034db2bd934e4d4fa6758a3fed8de74174
   *
   * @todo: Remove/Refactor in D8
   */
  if (!crossDomains) {
    return false;
  }
  else {
    return $.inArray(hostname, crossDomains) > -1 ? true : false;
  }
};

/**
 * Check whether this is a download URL or not.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isDownload = function (url) {
  var isDownload = new RegExp("\\.(" + Drupal.settings.googleanalytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
  return isDownload.test(url);
};

/**
 * Check whether this is an absolute internal URL or not.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isInternal = function (url) {
  var isInternal = new RegExp("^(https?):\/\/" + window.location.host, "i");
  return isInternal.test(url);
};

/**
 * Check whether this is a special URL or not.
 *
 * URL types:
 *  - gotwo.module /go/* links.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isInternalSpecial = function (url) {
  var isInternalSpecial = new RegExp("(\/go\/.*)$", "i");
  return isInternalSpecial.test(url);
};

/**
 * Extract the relative internal URL from an absolute internal URL.
 *
 * Examples:
 * - https://mydomain.com/node/1 -> /node/1
 * - https://example.com/foo/bar -> https://example.com/foo/bar
 *
 * @param string url
 *   The web url to check.
 *
 * @return string
 *   Internal website URL
 */
Drupal.googleanalytics.getPageUrl = function (url) {
  var extractInternalUrl = new RegExp("^(https?):\/\/" + window.location.host, "i");
  return url.replace(extractInternalUrl, '');
};

/**
 * Extract the download file extension from the URL.
 *
 * @param string url
 *   The web url to check.
 *
 * @return string
 *   The file extension of the passed url. e.g. "zip", "txt"
 */
Drupal.googleanalytics.getDownloadExtension = function (url) {
  var extractDownloadextension = new RegExp("\\.(" + Drupal.settings.googleanalytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
  var extension = extractDownloadextension.exec(url);
  return (extension === null) ? '' : extension[1];
};

})(jQuery);
;
