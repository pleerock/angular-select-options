/**
 * todo: this class needs refactoring
 * todo: this class needs better documentation
 * todo: this class needs better to be tested better and check for bugs
 *
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name openDropdown
     * @description
     * This module represents a select-options directive that allows us to use a custom expression
     * for the components that needs model and list of options. This directive works like a ng-options.
     */
    angular.module('selectOptions', []);

    /**
     * @ngdoc directive
     * @name openDropdown
     * @restrict E
     * @description
     * This directive opens a dropdown on the click on some element.
     */
    angular.module('selectOptions').directive('selectOptions', selectOptions);

    /**
     * @ngInject
     */
    function selectOptions($parse) {
        var regexp = (/^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?(?:\s+order\s+by\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?(?:\s+create\s+from\s+([\s\S]+?))?$/);

        var replaceItemPrefix = function(replacement, string) {
            if (!string || !replacement) return string;
            replacement = replacement + '.';

            if (string.substr(0, replacement.length) === replacement)
                return string.substr(replacement.length);

            return string;
        };

        var hasPrefix = function(name) {
            return name.indexOf('.') !== -1;
        };

        var replacePrefixes = function(string) {
            if (!string) return string;
            var lastDot = string.lastIndexOf('.');
            return lastDot !== -1 ? string.substring(lastDot + 1) : string;
        };

        return {
            restrict: 'A',
            priority: 1, // we need a higher priority to make sure that select options directive initialize before directives that uses it
            controller: /* @ngInject */function ($scope, $attrs) {

                if (!$attrs.selectOptions)
                    throw 'No options has been specified';

                var match = $attrs.selectOptions.match(regexp);
                if (!match)
                    throw 'Expected expression in form of "_select_ (as _label_)? for (_key_,)?_value_ in _collection_ track by (_key_) order by (_key_) group by (_key_)", but given ' + $attrs.selectOptions;

                this.findItemInModel = function (item, model) {
                    var trackByProperty = this.getTrackBy();
                    var trackByValue    = this.parseTrackBy(item);

                    if (!trackByProperty || !trackByValue)
                        return this.parseItemValue(item);

                    var founded = null;
                    angular.forEach(model, function(m) {
                        if (m[trackByProperty] === trackByValue)
                            founded = m;
                    });
                    return founded;
                };

                /**
                 * Creates a new item with the given name as a name.
                 *
                 * @param {*} name
                 * @return {*}
                 */
                this.createItem = function(name) {
                    var itemProperty = this.getItemNameWithoutPrefixes();
                    var newItem;
                    if (itemProperty) {
                        newItem = this.createFrom() ? $parse(this.createFrom())($scope) : {};
                        newItem[itemProperty] = name;
                    } else {
                        newItem = name;
                    }
                    return this.parseItemValue(newItem);
                };

                this.getItemNameWithoutPrefixes = function() {
                    var name = this.getItemName();
                    return hasPrefix(name) ? replacePrefixes(name) : null;
                };

                this.getItemName = function() {
                    return match[2] || match[1];
                };

                this.getItemValue = function() {
                    return match[2] ? match[1] : this.getItem();
                };

                this.getItem = function() {
                    return match[3] || match[5];
                };

                this.getItems = function() {
                    return match[6];
                };

                this.getKey = function() {
                    return match[4];
                };

                this.getOrderBy = function() {
                    var orderBy = match[8];
                    return replaceItemPrefix(this.getItem(), orderBy);
                };

                this.getTrackBy = function() {
                    var trackBy = match[7];
                    return replacePrefixes(trackBy);
                };

                this.getGroupBy = function() {
                    return match[9];
                };

                this.createFrom = function() {
                    return match[10];
                };

                this.getGroupByWithoutPrefixes = function() {
                    return replaceItemPrefix(this.getItem(), this.getGroupBy());
                };

                /**
                 * @param object
                 * @returns {string}
                 */
                this.parseItemName = function(object) {
                    var locals = {};
                    locals[this.getItem()] = object;
                    var name = $parse(this.getItemName())($scope, locals);
                    return String(name).replace(/<[^>]+>/gm, ''); // strip html from the data here
                };

                /**
                 * @param object
                 * @returns {string}
                 */
                this.parseItemGroup = function(object) {
                    var locals = {};
                    locals[this.getItem()] = object;
                    var name = $parse(this.getGroupBy())($scope, locals);
                    return name ? String(name).replace(/<[^>]+>/gm, '') : name; // strip html from the data here
                };

                /**
                 * @param object
                 * @returns {string}
                 */
                this.parseItemValueFromSelection = function(object) {
                    var newItemValue = this.getItemValue().replace('.', '_');
                    var newItemName  = this.getItemName().replace(this.getItemValue(), newItemValue);
                    var locals = {};
                    locals[newItemValue] = object;
                    var name = $parse(newItemName)($scope, locals);
                    return name ? String(name).replace(/<[^>]+>/gm, '') : ''; // strip html from the data here
                };

                /**
                 * @param object
                 * @returns {*}
                 */
                this.parseItemValue = function(object) {
                    var locals = {};
                    locals[this.getItem()] = object;
                    return $parse(this.getItemValue())($scope, locals);
                };

                /**
                 * @param object
                 * @returns {*}
                 */
                this.parseTrackBy = function(object) {
                    var locals = {};
                    locals[this.getItem()] = object;
                    return $parse(match[7])($scope, locals);
                };

                /**
                 * @returns {*}
                 */
                this.parseItems = function() {
                    return $parse(this.getItems())($scope);
                };

                /**
                 * @param expression
                 * @returns {*}
                 */
                this.applyOnScope = function(expression) {
                    return $scope.$apply(expression);
                };

                /**
                 * Logs all parsed data.
                 */
                this.log = function() {
                    console.log('item name: ' + this.getItemName());
                    console.log('item value: ' + this.getItemValue());
                    console.log('key: ' + this.getKey());
                    console.log('item: ' + this.getItem());
                    console.log('items: ' + this.getItems());
                    console.log('orderBy: ' + this.getOrderBy());
                    console.log('trackBy (full): ' + match[7]);
                    console.log('trackBy: ' + this.getTrackBy());
                };

            }
        };
    }

})();