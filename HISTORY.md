## 2.5.0 (2015-02-12)

* Remove deprecated methods (`updateFromJS` and `updateFromJSON`) 
* Issue #1: Compatibility with Knockout 3.x may still be a problem
* Issue #4: Library is not exported in ko namespace for CommonJS/Node

## 2.4.1 (2013-02-08) 

* Added mappedGet for observable arrays
* Issue #134: Throttle issue using mapping
* Issue #135: Why is custom update for observableArray firing twice when using mapping plugin?

## 2.4.0 (2013-02-04)

* Removed asynchronous processing that was used to reset mapping nesting
* Improved getType performance

## 2.3.5 (2012-12-10)

* Issue #121: Added functionality so that explicit declared none observable members on a ViewModel will remain none observable after mapping

## 2.3.4 (2012-11-22)

* Issue #114: Added new "observe" array to options

## 2.3.3 (2012-10-30)

* Fixed issue #105, #111: Update callback is not being called
* Fixed issue #107: String values in mapping cause infinite recursion in extendObject

## 2.3.2 (2012-08-20)

* Fixed issue #86: Don't update properties on object with update callback

## 2.3.1 (2012-08-06)

* Fixed issue #33: Create method in mappings receive meaningless options.parent for observableArray properties
* Fixed issue #99: Updating throttled observable
* Fixed issue #100: private variable leaks onto window object

## 2.3.0 (2012-07-31)

* Added support for not mapping certain array elements (return "options.skip" from your create callback)
* Fixed issue #91: "wrap" function makes computed writable
* Fixed issue #94: Bug/problem with ignore argument in mapping.fromJS
