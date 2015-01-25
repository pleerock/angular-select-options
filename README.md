select-options directive for AngularJS
========================

This directive allows your inputs to grow as soon as user types.
The input's width always fit the text user typed in the input.

Open samples/index.html to see the example how to use this directive.

**Installation**

1. Run `bower install angular-select-options --save`

    * (or add manually into your bower.json dependencies and run bower-install)
    * (or download ZIP from github and extract files in the case if you don't use bower)
    
2. Include ```bower_components/angular-select-options/dist/angular-select-options.js``` in your `index.html` file

3. Add a new dependency in your module
```javascript
angular.module('yourApp', ['selectOptions', ...])
```

**How to use it**

```html
<my-custom-directive ng-model="youCanUseItWithModel" select-options="fruit.name in fruits track by fruit.id"></my-custom-directive>
```

Then you can get access to your fruits via `selectOptions` controller in your `my-custom-directive` directive this way:

```javascript
angular.module('myModule').directive('myCustomDirective', function () {
   return { // scope type can be any - even isolate
      require: ['ngModel', 'selectOptions'],
      templateUrl: 'select-items.html',
      link: function (scope, element, attrs, controllers) {
      
          var ngModelCtrl        = controllers[0];
          var selectOptionsCtrl  = controllers[1];
         
         // now you can access selectOptionsCtrl to get the data you need (fruits, fruit names, etc.)
         
      }
   }
});

```

**TODO-s (for contributors)**:

 * refactor some parts of code and make it easier to understand and maintain
 * better documentation and more examples if possible
 * cover sources with unit-tests
 * research in performance optimizations
 * search for bugs and fix them
 * star this project and get people to know about this plugin in angular community
