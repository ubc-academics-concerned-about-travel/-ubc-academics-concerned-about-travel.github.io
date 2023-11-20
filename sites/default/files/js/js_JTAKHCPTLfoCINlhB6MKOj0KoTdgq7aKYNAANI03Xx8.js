// Custom Javascript if necessary
(function(e){e(document).ready(function(){})})(jQuery);!function(e){"use strict";var t='[data-dismiss="alert"]',n=function(n){e(n).on("click",t,this.close)};n.prototype.close=function(t){function s(){i.trigger("closed").remove()}var n=e(this),r=n.attr("data-target"),i;if(!r){r=n.attr("href");r=r&&r.replace(/.*(?=#[^\s]*$)/,"")}i=e(r);t&&t.preventDefault();i.length||(i=n.hasClass("alert")?n:n.parent());i.trigger(t=e.Event("close"));if(t.isDefaultPrevented())return;i.removeClass("in");e.support.transition&&i.hasClass("fade")?i.on(e.support.transition.end,s):s()};e.fn.alert=function(t){return this.each(function(){var r=e(this),i=r.data("alert");i||r.data("alert",i=new n(this));typeof t=="string"&&i[t].call(r)})};e.fn.alert.Constructor=n;e(function(){e("body").on("click.alert.data-api",t,n.prototype.close)})}(window.jQuery);;
"use strict";
/**
 * SUBC2019 Drupal behavious
 */

(function($, Drupal) {
  // Template: Demo Behaviour
  // Drupal.behaviors.subc2019Test = {
  //   attach: function(context, settings) {
  //     $(context).find('body').once('abbt-test').each(function () {
  //       console.log('Hello there'); // eslint-disable-line
  //     });
  //   }
  // };

  /* Main menu toggle behaviour on mobile */
  Drupal.behaviors.subc2019MainNavToggle = {
    attach: function(context, settings) {
      /* eslint-disable-line no-unused-vars */
      $("#tb-menu-toggle", context).once(
        "subc2019-main_nav_toggle",
        function() {
          const $TBMenuButton = $(".tb-megamenu-main-menu .tb-megamenu-button");
          const $Menu = $TBMenuButton.siblings(".nav-collapse");

          $(this).click(function() {
            if (parseInt($Menu.height())) {
              $Menu.css({ display: "none", height: 0, overflow: "hidden" });
              $(this).addClass("collapsed");
              Drupal.TBMegaMenu.displayedMenuMobile = false;
            } else {
              $Menu.css({
                display: "block",
                height: "auto",
                overflow: "visible"
              });
              $(this).removeClass("collapsed");
              Drupal.TBMegaMenu.displayedMenuMobile = true;
            }

            return false;
          });
        }
      );
    }
  };

  /* Toggle behaviour for Accordions */
  Drupal.behaviors.subc2019Accordion = {
    attach: function(context) {
      $(context)
        .find(".accordion")
        .once("subc2019--accordion", function() {
          $(".accordion-toggle", this).on("click", function() {
            $(this).toggleClass("expanded");
            $(this)
              .next()
              .slideToggle("fast");
          });
        });
    }
  };

  /* Ajax calls for nodes displays as Call to Action */
  Drupal.behaviors.subc2019CtaAjax = {
    attach: function(context, settings) {
      /* eslint-disable-line no-unused-vars */
      $(".paragraphs-item-node .view-mode-call_to_action", context).once(
        "subc2019-cta_ajax",
        function() {
          const $parent = $(this).closest(".paragraphs-item-node");
          const $link = $(".field-name-node-link a", this);
          const contentLoaded = "ajax-content--loaded";
          const contentExpanded = "ajax-content--expanded";
          const contentCollapsed = "ajax-content--collapsed";

          $(".field a", this).click(function() {
            if (!$parent.hasClass(contentLoaded)) {
              // Load content for first time
              let url = $link.attr("href");
              url += " #block-system-main > .node"; // load only content;
              $parent.append(
                $(
                  '<div class="cta__ajax-content"><div class="loader"></div></div>'
                ).load(url, function(response, status, xhr) {
                  if (status === "error") {
                    const msg = "Sorry but there was an error: ";
                    $("#error").html(msg + xhr.status + " " + xhr.statusText);
                  } else {
                    // Since we are not loading the entire page we have to add the Display Suite styles manually
                    const childrenClasses = $parent
                      .children(".cta__ajax-content")
                      .children(".node")
                      .attr("class")
                      .split(" ");
                    let result;

                    for (let i = 0; i < childrenClasses.length; ++i) {
                      if (childrenClasses[i].substring(0, 3) === "ds-") {
                        result = childrenClasses[i];
                        break;
                      }
                    }

                    if (result) {
                      result = result.replace(/-/g, "_");
                      $("<link/>", {
                        rel: "stylesheet",
                        type: "text/css",
                        href:
                          "/sites/all/modules/contrib/ds/layouts/" +
                          result +
                          "/" +
                          result +
                          ".css"
                      }).appendTo("head");
                    }
                    // End of: Display Suite styles

                    $parent
                      .addClass(contentLoaded + " " + contentExpanded)
                      .removeClass(contentCollapsed);
                    $link.text("Show Less").addClass("subc2019--toggled");
                  }
                })
              );
            } else {
              // Toggle display of previously loaded content
              const $ajaxContent = $parent.children(".cta__ajax-content");

              if ($parent.hasClass(contentCollapsed)) {
                $ajaxContent.slideDown(function() {
                  $parent
                    .removeClass(contentCollapsed)
                    .addClass(contentExpanded);
                  $link.text("Show Less").addClass("subc2019--toggled");
                });
              } else {
                $ajaxContent.slideUp(function() {
                  $parent
                    .removeClass(contentExpanded)
                    .addClass(contentCollapsed);
                  $link.text("Show More").removeClass("subc2019--toggled");
                });
              }
            }

            $(this).blur();
            return false;
          });
        }
      );
    }
  };

  /* Add icon to identify videos on the Slick navigation */
  Drupal.behaviors.subc2019SlickVideoIcon = {
    attach: function(context) {
      $(context)
        .find(".slick-wrapper")
        .once("subc2019--slick-video", function() {
          const Wrapper = this;
          $(".slick--display--main .slide--video", this).each(function() {
            let slide = $(this).data("slick-index");
            // $('.slick--display--thumbnail .slide[data-slick-index="' + slide + '"]', Wrapper).addClass('slide--video');
            $(".slick--display--thumbnail .slide--" + slide, Wrapper).addClass(
              "slide--video"
            );
          });
        });
    }
  };

  /* Reset views filter */
  Drupal.behaviors.subc2019ResetFilters = {
    attach: function(context, settings) {
      $("body")
        .find(".view-toolkit-search .views-exposed-widgets")
        .each(function() {
          if ($(".reset-fields").length === 0) {
            $(this).after(
              '<div class="reset-fields"><a href="#" >Reset fields</a></div>'
            );
          }
        });

      $("body").on("click", ".reset-fields a", function() {
        const $Container = $(".view-toolkit-search .views-exposed-widgets");
        $Container.find('input[type="checkbox"]').prop("checked", false);
        $Container.find('input[type="text"]').prop("value", "");
        // $Container.find(".form-submit").trigger("click");
        $(this).attr("href", window.location.href);
        // return false;
      });
    }
  };

  // Exposed Form Reset button Inherits the page display URL when using as a block and AJAX
  // https://www.drupal.org/project/drupal/issues/1109980#comment-10421063
  Drupal.behaviors.subc2019FixResetButton = {
    attach: function(context, settings) {
      $(document).delegate(
        ".views-reset-button .form-submit",
        "click",
        function(event) {
          window.location = window.location.href.split("?")[0];
          return false;
        }
      );
    }
  };
})(jQuery, Drupal);


;
