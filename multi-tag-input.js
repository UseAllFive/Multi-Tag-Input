/* global __scope__: false */ //-- Linter config.

/**
 * @name window.multi_tag_input
 * @fileOverview SP.combined.js -- Main namespace.
 * @requires mod_include
 */
/*jslint indent: false */
;(function(parent_scope) {
    "use strict";
    var __scope__ = {};
    /*jslint indent: 4, devel: true */

    //-- Include modules here.

    /**
     * This is a simulator. This simulates the class being called and returning
     * data it needs
     *
     * @return {[type]} [description]
     */
    // (function() {
    //     var event_name = "DOMContentLoaded";

    //     var current_request;

    //     /**
    //      * Simulate receiving a request for suggested results
    //      * @param  {Function} callback Callback function to call when results are received
    //      */
    //     var load_suggested_results_callback = function(filter_text, callback) {
    //         console.log("load_suggested_results_callback");
    //         var title;
    //         var list = [
    //             "50 Great Fall Work Pieces--All Under $100",
    //             "Real Style: Everyday Animal Print",
    //             "easy"
    //         ];

    //         if (filter_text) {
    //             list.push(filter_text + " and stuff");
    //             title = "Search Results";
    //         } else {
    //             title = "Recently Tagged";
    //         }

    //         // setTimeout(function(title, list, filter_text) {
    //         callback(title, list, filter_text);
    //         // }, Math.random() * 1800 + 200, title, list, filter_text);
    //     };

    //     var select_tag_callback = function(text) {
    //         console.log("select_tag_callback, name=", text);
    //     };

    //     var new_tag_callback = function(text) {
    //         console.log("new_tag_callback, text=", text);
    //     };

    //     var remove_tag_callback = function(text) {
    //         console.log("remove_tag_callback, text=", text);
    //     };

    //     var listener = function(event, callback) {
    //         var targets;
    //         var i;
    //         var max;

    //         // Remove event listener
    //         document.removeEventListener(event_name, listener);

    //         // Find targets
    //         targets = document.getElementsByClassName("multi-tag-input");

    //         for (i = 0, max = targets.length; i < max; i += 1) {
    //             if (targets.hasOwnProperty(i)) {
    //                 var new_input = multi_tag_input({
    //                     target: targets[i],
    //                     load_suggested_results_callback: load_suggested_results_callback,
    //                     new_tag_callback: new_tag_callback,
    //                     remove_tag_callback: remove_tag_callback,
    //                     select_tag_callback: select_tag_callback
    //                 });

    //                 new_input.set_tags(["tag 1", "tag 2"]);
    //             }
    //         }
    //     };
    //     document.addEventListener(event_name, listener, false);
    // })();

    /**
     * Take a div and make it a Multi Tag Input
     * @param  {[type]} parameters [description]
     * @return {[type]}            [description]
     */
    var multi_tag_input = function(parameters) {
        // DOM element containing the selected tag list and the input box
        var content_box;

        // Text saved after last change to the input box. This is saved to check if
        // the text changed on an key_up. Only then should an event be fired
        var input_text_before_key_up;

        // Keep track if we actually lost the focus. When the input has the focus
        // and something in the tag select list is clicked, we don't want to respond
        // to the lost focus.
        var lost_focus = true;

        var dropdown_tag_list;
        var selected_tag_container;
        var dropdown_tag_list_container;
        var target;
        var text_input;
        var title_element;

        // The command sent to the server that we are waiting on
        var waiting_for;

        /**
         * Load the suggested results
         */
        var load_suggested_results = function() {
            var callback_name = "load_suggested_results_callback";
            var text = text_input.value;

            waiting_for = callback_name;
            parameters[callback_name](text, function(title, list, filter_text) {
                if (filter_text === text_input.value) {
                    callback_data_received(callback_name, title, list);
                }
            });
            // }
        };

        /**
         * The text box received the focus. Load suggested results
         *
         * @param  {Event} event Event received
         */
        var focus = function(event) {
            load_suggested_results();
        };

        /**
         * Callback data was received from a list request. Make sure we are still waiting
         * for this callback before invoking the modify_dropdown_tag_list function.
         *
         * @param  {String} request The request that was made that resulted in this callback. Used
         *                          to make sure we only handle the callback if we're still waiting
         *                          for this response
         * @param  {String} title   Title to display in the selectable tag list
         * @param  {Array}  list    List of tags to display in the selectable tag list
         */
        var callback_data_received = function(request, title, list) {
            if (request === waiting_for) {
                modify_dropdown_tag_list(title, list);
            }
        };

        /**
         * Blur event handler for input text box
         * @param  {Event} event
         */
        var blur = function(event) {
            setTimeout(function() {
                if (true === lost_focus) {
                    modify_dropdown_tag_list("", []);
                    waiting_for = undefined;
                } else {
                    text_input.focus();
                }

                lost_focus = true;
            }, 200);
        };


        /**
         * Find the index of a tag in the selectable tag list. This will
         * perform a case insensitive search.
         * @param  {String} text Text to look for in the selectable tag list
         * @return {Integer} Index of the tag. -1 if none is found
         */
        var get_selectable_tag_index = function(text) {
            var tags = js_helper.unordered_list_to_array(dropdown_tag_list);
            var lowercase_tags = tags.slice(0);
            js_helper.each(lowercase_tags, function(index, value) {
                lowercase_tags[index] = value.toLowerCase();
            });

            var index = lowercase_tags.indexOf(text.toLowerCase());

            return index;
        };


        /**
         */
        var list = function() {
            var tags = js_helper.unordered_list_to_array(dropdown_tag_list);
            return tags;
        };

        /**
         * Event handler for input box keyup.
         *
         * If the event.keyCode is = 13 (return), and the input
         * text is not empty, this should be considered either an
         * add or a select. See if the text typed in exists in the
         * list. If it does, consider this a select. If it doesn't,
         * consider it a create.
         *
         * The comparison is case insensitive.
         *
         * @param  {Event} event Event details
         */
        var key_up = function(event) {
            var input_text = text_input.value;

            if (input_text_before_key_up === input_text) {
                // Do nothing if this was a command or arrow or something

                return;
            } else if (13 === event.keyCode && "" !== input_text) {
                var index = get_selectable_tag_index(input_text);
                var match_found = index > -1;

                if (true === match_found) {
                    // This is in the list, just select it

                    select_tag_list_element(input_text);
                }
                else {
                    // This tag is not in the list, create it and call the new_tag_callback

                    create_selected_tag_element(input_text);
                    parameters.new_tag_callback(input_text);
                }
            } else {
                load_suggested_results();
            }

            input_text_before_key_up = input_text;
        };

        /**
         * Validate the parmameters for invoking this plugin. This will make sure that there
         * are no parameters we don't expect, and that the required parmaeters are all included.
         */
        var validate_parameters = function() {
            var accepted_parameters = {};
            var all_parameters;
            var error_messages = [];
            var key;
            var missing_required_parameters = [];
            var optional_parameters = [];
            var required_parameters = ["target", "load_suggested_results_callback", "new_tag_callback", "remove_tag_callback", "select_tag_callback"];
            var unrecognized_parameters = [];
            var value;

            // Check for all required parameters
            for (key in required_parameters) {
                if (required_parameters.hasOwnProperty(key)) {
                    value = required_parameters[key];
                    if ("undefined" === typeof parameters[value]) {
                        missing_required_parameters.push(value);
                    }
                }
            }

            // Create a hash of all the accepted parameters
            all_parameters = [].concat(required_parameters).concat(optional_parameters);
            for (key in all_parameters) {
                if (all_parameters.hasOwnProperty(key)) {
                    value = all_parameters[key];
                    accepted_parameters[value] = 1;
                }
            }

            // Go through all parameters and see if they are all recognized
            for (key in parameters) {
                if (parameters.hasOwnProperty(key)) {
                    if (undefined === accepted_parameters[key]) {
                        unrecognized_parameters.push(key);
                    }
                }
            }

            if (unrecognized_parameters.length > 0) {
                error_messages.push("    Unrecognized parameters: " + unrecognized_parameters.join(", "));
            }

            if (missing_required_parameters.length > 0) {
                error_messages.push("    Missing required parameters: " + missing_required_parameters.join(", "));
            }

            if (error_messages.length > 0) {
                console.log("Error validaging multi_tag_input inputs:\n" + error_messages.join("\n"));
            }

            return;
        };

        /**
         * The x was clicked to remove a tag from the selected list.
         * Remove the event listener, find the tag to be removed,
         * remote it, and execute a callback
         * @param  {Event} event
         */
        var remove_tag_clicked = function(event) {
            var parent;
            var tag_text;
            var target;

            target = event.currentTarget;
            parent = target.parentNode;

            target.removeEventListener("click", remove_tag_clicked);

            // Move up the DOM until we find the tag element
            while(dom_helper.has_class(target, "existing-tag") === false) {
                target = parent;
                parent = target.parentNode;
            }

            // Save the tag text for the callback
            tag_text = target.getAttribute("tag-value");

            // Remove the tag from the DOM
            parent.removeChild(target);

            // Override the blur event
            lost_focus = false;

            // Send callback
            parameters.remove_tag_callback(tag_text);
        };

        /**
         * Create a new tag in the selected tag list
         * @param  {String} text   Text for the tag
         * @param  {DOM}    parent Where to add the tag
         */
        var create_selected_tag_element = function(text, parent) {
            var tag;
            var remove_box;

            tag = document.createElement("div");
            tag.className = "existing-tag";
            tag.appendChild(document.createTextNode(text));
            tag.setAttribute("tag-value", text);

            remove_box = document.createElement("div");
            remove_box.className = "remove-tag-button";
            remove_box.appendChild(document.createTextNode(String.fromCharCode(215)));
            tag.appendChild(remove_box);

            remove_box.addEventListener("click", remove_tag_clicked, false);

            if (undefined !== parent) {
                parent.appendChild(tag);
            }
        };

        /**
         * Callback when an item in the selectable tag list was clicked
         * @param  {Event} event Event for the click
         */
        var dropdown_tag_list_element_clicked = function(event) {
            var target = event.currentTarget;
            var text = target.childNodes[0].textContent;

            select_tag_list_element(text);
        };

        /**
         * Select an item on the selectable tag list.
         *
         * This will remove the tag from the list, add it to the selected
         * tag list, and execute the callback
         *
         * @param  {String} text Text of tag to select
         */
        var select_tag_list_element = function(text) {
            var elements = js_helper.unordered_list_to_array(dropdown_tag_list);

            var index = get_selectable_tag_index(text);

            // Remove this tag from the selectable tag list
            dropdown_tag_list.removeChild(dropdown_tag_list.childNodes[index]);

            // Add this to the tag list
            create_selected_tag_element(text, selected_tag_container);

            // Execute the callback
            parameters.select_tag_callback(text);

            // Hide the tag list if this was the last one
            hide_tag_select_if_empty();

            // Override the lost focus behavior
            lost_focus = false;
        };

        /**
         * Hide the list of tags if it is empty
         */
        var hide_tag_select_if_empty = function() {
            var list = dropdown_tag_list_container.getElementsByTagName("ul")[0];

            dropdown_tag_list_container.style.display = 0 === list.childNodes.length ? "none" : "block";
        };
        /**
         * Modify the selectable tag list, aka the list of tags returned from the
         * server. This will create the tag list if it doesnt exist, update it if
         * it does, and hide if it's empty.
         *
         * @param  {String} title   Title to display. "Suggested Results" for example
         * @param  {Array}  options List of options to display
         */
        var modify_dropdown_tag_list = function(title, options) {
            var key;
            var option;
            var tag_list_element;

            if (undefined === dropdown_tag_list_container) {
                dropdown_tag_list_container = document.createElement("div");
                dropdown_tag_list_container.className = "dropdown-tag-list-container";
                target.appendChild(dropdown_tag_list_container);

                dropdown_tag_list = document.createElement("ul");
                dropdown_tag_list_container.appendChild(dropdown_tag_list);

                title_element = document.createElement("div");
                title_element.className = "select-title";
                dropdown_tag_list_container.appendChild(title_element);
            } else {
                // Clear tag list and title text
                dom_helper.remove_children(dropdown_tag_list);
                dom_helper.remove_children(title_element);
            }

            // Populate the tag list
            for (key in options) {
                if (options.hasOwnProperty(key)) {
                    option = options[key];
                    tag_list_element = document.createElement("li");
                    tag_list_element.appendChild(document.createTextNode(option));
                    tag_list_element.addEventListener("click", dropdown_tag_list_element_clicked, false);
                    dropdown_tag_list.appendChild(tag_list_element);
                }
            }

            // Hide the tag select if there are no results available
            hide_tag_select_if_empty();

            // Assign the title
            title_element.appendChild(document.createTextNode(title));
        };

        var init = function() {
            // Validate input
            validate_parameters();

            // Save the target
            target = parameters.target;

            content_box = document.createElement("div");
            content_box.className = "content-box";
            target.appendChild(content_box);

            // Find the children
            text_input = target.getElementsByTagName("input")[0];
            content_box.appendChild(text_input);

            // Create tag container
            selected_tag_container = document.createElement("div");
            selected_tag_container.className = "selected-tags";
            content_box.insertBefore(selected_tag_container, content_box.childNodes[0]);

            create_selected_tag_element("Tag 1", selected_tag_container);
            create_selected_tag_element("Tag 2 With A Long Name", selected_tag_container);
            create_selected_tag_element("Tag 3 With A Name", selected_tag_container);

            modify_dropdown_tag_list("title", []);

            target.addEventListener("focus", focus, true);
            target.addEventListener("blur", blur, true);
            target.addEventListener("keyup", js_helper.debounce(key_up, 250), false);

            text_input.focus();
        };

        var clear_tags = function() {
            while(selected_tag_container.childNodes.length > 0) {
                selected_tag_container.removeChild(selected_tag_container.childNodes[0]);
            }
        };

        var set_tags = function(tags) {
            clear_tags();

            js_helper.each(tags, function() {
                create_selected_tag_element(this, selected_tag_container);
            });
        };

        init();

        return {set_tags: set_tags,
            clear_tags: clear_tags,
            list: list
        };
    };

    var js_helper = {
        /**
         * Call a callback for every member of the list. Parameters will be index, value.
         * If the callback returns false, the iterator will stop.
         * @param  {Array}    list     List to iterate over
         * @param  {Function} callback Function to call for each item in the list
         */
        each: function(list, callback) {
            var index;
            var length = list.length;

            if (length === 0) {
                return;
            }

            for (index = 0; index < length; index += 1) {
                var result = callback.apply(list[index], [index, list[index]]);
                if (false === result) {
                    break;
                }
            }
        },
        /**
         * Take an unordered list dom element and return an array with each
         * element being the text value of each li in the list
         * @param  {DOM}      element DOM Element to search for li's
         * @param  {Function} filter  Optional filter. Add the string value returned by calling
         *                            this function will the text as it's only parameter
         *                            be placed in the list.
         * @return {Array} List of text
         */
        unordered_list_to_array: function(element, filter) {
            var indicies = element.getElementsByTagName("li");
            var list = [];

            js_helper.each(indicies, function(index, element) {
                var childNodes = element.childNodes;
                var text_value = element.childNodes[0].textContent;

                // Apply optional filter
                if ("function" === typeof filter) {
                    text_value = filter(text_value);
                }

                list.push(text_value);
            });

            return list;
        },
        /**
         * Standard debouncer
         */
        debounce: function(fn, delay) {
            var timer = null;
            return function () {
                var args = arguments;
                var context = this;

                clearTimeout(timer);

                timer = setTimeout(function () {
                    fn.apply(context, args);
                }, delay);
            };
        }
    };

    var dom_helper = {
        has_class: function (element, target_class) {
            var class_name;
            var index;

            class_name = " " + element.className + " ";
            target_class = " " + target_class + " ";
            index = class_name.indexOf(target_class);

            return index > -1;
        },
        remove_children: function(element) {
            if (!element || !element.childNodes) {
                return;
            }

            while(element.childNodes.length > 0) {
                element.removeChild(element.childNodes[0]);
            }
        }
    };

    /**
     * @public
     */
    parent_scope.multi_tag_input = multi_tag_input;

}(("undefined" === typeof __scope__) ? window : __scope__));

