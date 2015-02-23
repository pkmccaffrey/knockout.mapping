(function() {
'use strict';
/*global ko, QUnit*/

QUnit.module('Mapping', {
    beforeEach: function() {
        ko.mapping.resetDefaultOptions();
    }
});

QUnit.test('ko.mapping.toJS should unwrap observable values', function(assert) {
	var atomicValues = ["hello", 123, true, null, undefined, {a: 1}];
	for (var i = 0; i < atomicValues.length; i++) {
		var data = ko.observable(atomicValues[i]);
		var result = ko.mapping.toJS(data);
		assert.equal(ko.isObservable(result), false);
		assert.deepEqual(result, atomicValues[i]);
	}
});

QUnit.test('ko.mapping.toJS should unwrap observable properties, including nested ones', function (assert) {
	var data = {
		a: ko.observable(123),
		b: {
			b1: ko.observable(456),
			b2: 789
		}
	};
	var result = ko.mapping.toJS(data);
	assert.equal(result.a, 123);
	assert.equal(result.b.b1, 456);
	assert.equal(result.b.b2, 789);
});

QUnit.test('ko.mapping.toJS should unwrap observable arrays and things inside them', function (assert) {
	var data = ko.observableArray(['a', 1,
	{
		someProp: ko.observable('Hey')
	}]);
	var result = ko.mapping.toJS(data);
	assert.equal(result.length, 3);
	assert.equal(result[0], 'a');
	assert.equal(result[1], 1);
	assert.equal(result[2].someProp, 'Hey');
});

QUnit.test('ko.mapping.toJS should ignore specified single property', function(assert) {
	var data = {
		a: "a",
		b: "b"
	};

	var result = ko.mapping.toJS(data, { ignore: "b" });
	assert.equal(result.a, "a");
	assert.equal(result.b, undefined);
});

QUnit.test('ko.mapping.toJS should ignore specified single property on update', function(assert) {
	var data = {
		a: "a",
		b: "b",
		c: "c"
	};

	var result = ko.mapping.fromJS(data);
	assert.equal(result.a(), "a");
	assert.equal(result.b(), "b");
	assert.equal(result.c(), "c");
	ko.mapping.fromJS({ a: "a2", b: "b2", c: "c2" }, { ignore: ["b", "c"] }, result);
	assert.equal(result.a(), "a2");
	assert.equal(result.b(), "b");
	assert.equal(result.c(), "c");
});

QUnit.test('ko.mapping.toJS should ignore specified multiple properties', function(assert) {
	var data = {
		a: { a1: "a1", a2: "a2" },
		b: "b"
	};

	var result = ko.mapping.fromJS(data, { ignore: ["a.a1", "b"] });
	assert.equal(result.a.a1, undefined);
	assert.equal(result.a.a2(), "a2");
	assert.equal(result.b, undefined);

    data.a.a1 = "a11";
    data.a.a2 = "a22";
	ko.mapping.fromJS(data, {}, result);
	assert.equal(result.a.a1, undefined);
	assert.equal(result.a.a2(), "a22");
	assert.equal(result.b, undefined);
});

QUnit.test('ko.mapping.fromJS should ignore specified single property', function(assert) {
	var data = {
		a: "a",
		b: "b"
	};

	var result = ko.mapping.fromJS(data, { ignore: "b" });
	assert.equal(result.a(), "a");
	assert.equal(result.b, undefined);
});

QUnit.test('ko.mapping.fromJS should ignore specified array item', function(assert) {
	var data = {
		a: "a",
		b: [{ b1: "v1" }, { b2: "v2" }]
	};

	var result = ko.mapping.fromJS(data, { ignore: "b[1].b2" });
	assert.equal(result.a(), "a");
	assert.equal(result.b()[0].b1(), "v1");
	assert.equal(result.b()[1].b2, undefined);
});

QUnit.test('ko.mapping.fromJS should ignore specified single property, also when going back .toJS', function(assert) {
	var data = {
		a: "a",
		b: "b"
	};

	var result = ko.mapping.fromJS(data, { ignore: "b" });
	var js = ko.mapping.toJS(result);
	assert.equal(js.a, "a");
	assert.equal(js.b, undefined);
});

QUnit.test('ko.mapping.fromJS should copy specified single property', function(assert) {
	var data = {
		a: "a",
		b: "b"
	};

	var result = ko.mapping.fromJS(data, { copy: "b" });
	assert.equal(result.a(), "a");
	assert.equal(result.b, "b");
});

QUnit.test('ko.mapping.fromJS should copy specified array', function(assert) {
	var data = {
		a: "a",
		b: ["b1", "b2"]
	};

	var result = ko.mapping.fromJS(data, { copy: "b" });
	assert.equal(result.a(), "a");
	assert.deepEqual(result.b, ["b1", "b2"]);
});

QUnit.test('ko.mapping.fromJS should copy specified array item', function(assert) {
	var data = {
		a: "a",
		b: [{ b1: "v1" }, { b2: "v2" }]
	};

	var result = ko.mapping.fromJS(data, { copy: "b[0].b1" });
	assert.equal(result.a(), "a");
	assert.equal(result.b()[0].b1, "v1");
	assert.equal(result.b()[1].b2(), "v2");
});

QUnit.test('ko.mapping.fromJS should copy specified single property, also when going back .toJS', function(assert) {
	var data = {
		a: "a",
		b: "b"
	};

	var result = ko.mapping.fromJS(data, { copy: "b" });
	var js = ko.mapping.toJS(result);
	assert.equal(js.a, "a");
	assert.equal(js.b, "b");
});

QUnit.test('ko.mapping.fromJS should copy specified single property, also when going back .toJS, except when overridden', function(assert) {
	var data = {
		a: "a",
		b: "b"
	};

	var result = ko.mapping.fromJS(data, { copy: "b" });
	var js = ko.mapping.toJS(result, { ignore: "b" });
	assert.equal(js.a, "a");
	assert.equal(js.b, undefined);
});

QUnit.test('ko.mapping.toJS should include specified single property', function(assert) {
	var data = {
		a: "a"
	};

	var mapped = ko.mapping.fromJS(data);
	mapped.c = 1;
	mapped.d = 2;
	var result = ko.mapping.toJS(mapped, { include: "c" });
	assert.equal(result.a, "a");
	assert.equal(result.c, 1);
	assert.equal(result.d, undefined);
});

QUnit.test('ko.mapping.toJS should by default ignore the mapping property', function(assert) {
	var data = {
		a: "a",
		b: "b"
	};

	var fromJS = ko.mapping.fromJS(data);
	var result = ko.mapping.toJS(fromJS);
	assert.equal(result.a, "a");
	assert.equal(result.b, "b");
	assert.equal(result.__ko_mapping__, undefined);
});

QUnit.test('ko.mapping.toJS should by default include the _destroy property', function(assert) {
	var data = {
		a: "a"
	};

	var fromJS = ko.mapping.fromJS(data);
	fromJS._destroy = true;
	var result = ko.mapping.toJS(fromJS);
	assert.equal(result.a, "a");
	assert.equal(result._destroy, true);
});

QUnit.test('ko.mapping.toJS should merge the default includes', function(assert) {
	var data = {
		a: "a"
	};

	var fromJS = ko.mapping.fromJS(data);
	fromJS.b = "b";
	fromJS._destroy = true;
	var result = ko.mapping.toJS(fromJS, { include: "b" });
	assert.equal(result.a, "a");
	assert.equal(result.b, "b");
	assert.equal(result._destroy, true);
});

QUnit.test('ko.mapping.toJS should merge the default ignores', function(assert) {
	var data = {
		a: "a",
		b: "b",
		c: "c"
	};

	ko.mapping.defaultOptions().ignore = ["a"];
	var fromJS = ko.mapping.fromJS(data);
	var result = ko.mapping.toJS(fromJS, { ignore: "b" });
	assert.equal(result.a, undefined);
	assert.equal(result.b, undefined);
	assert.equal(result.c, "c");
});

QUnit.test('ko.mapping.defaultOptions should by default include the _destroy property', function(assert) {
    assert.notEqual(ko.utils.arrayIndexOf(ko.mapping.defaultOptions().include, "_destroy"), -1);
});

QUnit.test('ko.mapping.defaultOptions.include should be an array', function(assert) {
    var fn = function() {
        ko.mapping.defaultOptions().include = {};
        ko.mapping.toJS({});
    };
    assert.throws(fn);
});

QUnit.test('ko.mapping.defaultOptions.ignore should be an array', function(assert) {
	var fn = function() {
        ko.mapping.defaultOptions().ignore = {};
        ko.mapping.toJS({});
    };
    assert.throws(fn);
});

QUnit.test('ko.mapping.defaultOptions can be set', function(assert) {
	var oldOptions = ko.mapping.defaultOptions();
	ko.mapping.defaultOptions({ a: "a" });
	var newOptions = ko.mapping.defaultOptions();
	ko.mapping.defaultOptions(oldOptions);
    assert.equal(newOptions.a, "a");
});

QUnit.test('recognized root-level options should be moved into a root namespace, leaving other options in place', function(assert) {
	var recognizedRootProperties = ['create', 'update', 'key', 'arrayChanged'];

	// Zero out the default options so they don't interfere with this test
	ko.mapping.defaultOptions({});

	// Set up a mapping with root and child mappings
	var mapping = {
		ignore: ['a'],
		copy: ['b'],
		include: ['c'],
		create: function(opts) { return opts.data; },
		update: function(opts) { return opts.data; },
		key: function(item) { return ko.utils.unwrapObservable(item.id); },
		arrayChanged: function(event, item) { },
		children: {
			ignore: ['a1'],
			copy: ['b1'],
			include: ['c1'],
			create: function(opts) { return opts.data; },
			update: function(opts) { return opts.data; },
			key: function(item) { return ko.utils.unwrapObservable(item.id); },
			arrayChanged: function(event, item) { }
		}
	};

	// Run the mapping through ko.mapping.fromJS
	var resultantMapping = ko.mapping.fromJS({}, mapping).__ko_mapping__;

	// Test that the recognized root-level mappings were moved into a root-level namespace
	for (var i=recognizedRootProperties.length - 1; i >= 0; i--) {
		assert.notDeepEqual(resultantMapping[recognizedRootProperties[i]], mapping[[recognizedRootProperties[i]]]);
		assert.deepEqual(resultantMapping[''][recognizedRootProperties[i]], mapping[[recognizedRootProperties[i]]]);
	}

	// Test that the non-recognized root-level and descendant mappings were left in place
	for (var property in mapping) {
        if (mapping.hasOwnProperty(property)) {
            assert[recognizedRootProperties.indexOf(property) === -1 ? 'deepEqual' : 'notDeepEqual'](resultantMapping[property], mapping[property]);
        }
	}
});

QUnit.test('ko.mapping.toJS should ignore properties that were not part of the original model', function (assert) {
	var data = {
		a: 123,
		b: {
			b1: 456,
			b2: [
				"b21", "b22"
			]
		}
	};

	var mapped = ko.mapping.fromJS(data);
	mapped.extraProperty = ko.observable(333);
	mapped.extraFunction = function() {};

	var unmapped = ko.mapping.toJS(mapped);
	assert.equal(unmapped.a, 123);
	assert.equal(unmapped.b.b1, 456);
	assert.equal(unmapped.b.b2[0], "b21");
	assert.equal(unmapped.b.b2[1], "b22");
	assert.equal(unmapped.extraProperty, undefined);
	assert.equal(unmapped.extraFunction, undefined);
	assert.equal(unmapped.__ko_mapping__, undefined);
});

QUnit.test('ko.mapping.toJS should ignore properties that were not part of the original model when there are no nested create callbacks', function (assert) {
	var data = [
		{
			a: [{ id: "a1.1" }, { id: "a1.2" }]
		}
	];

	var mapped = ko.mapping.fromJS(data, {
		create: function(options) {
			return ko.mapping.fromJS(options.data);
		}
	});
	mapped.extraProperty = ko.observable(333);
	mapped.extraFunction = function() {};

	var unmapped = ko.mapping.toJS(mapped);
	assert.equal(unmapped[0].a[0].id, "a1.1");
	assert.equal(unmapped[0].a[1].id, "a1.2");
	assert.equal(unmapped.extraProperty, undefined);
	assert.equal(unmapped.extraFunction, undefined);
	assert.equal(unmapped.__ko_mapping__, undefined);
});

QUnit.test('ko.mapping.toJS should ignore properties that were not part of the original model when there are nested create callbacks', function (assert) {
	var data = [
		{
			a: [{ id: "a1.1" }, { id: "a1.2" }]
		}
	];

	var nestedMappingOptions = {
		a: {
			create: function(options) {
				return ko.mapping.fromJS(options.data);
			}
		}
	};

	var mapped = ko.mapping.fromJS(data, {
		create: function(options) {
			return ko.mapping.fromJS(options.data, nestedMappingOptions);
		}
	});
	mapped.extraProperty = ko.observable(333);
	mapped.extraFunction = function() {};

	var unmapped = ko.mapping.toJS(mapped);
	assert.equal(unmapped[0].a[0].id, "a1.1");
	assert.equal(unmapped[0].a[1].id, "a1.2");
	assert.equal(unmapped.extraProperty, undefined);
	assert.equal(unmapped.extraFunction, undefined);
	assert.equal(unmapped.__ko_mapping__, undefined);
});

QUnit.test('ko.mapping.toJS should ignore specified properties', function(assert) {
	var data = {
		a: "a",
		b: "b",
		c: "c"
	};

	var result = ko.mapping.toJS(data, { ignore: ["b", "c"] });
	assert.equal(result.a, "a");
	assert.equal(result.b, undefined);
	assert.equal(result.c, undefined);
});

QUnit.test('ko.mapping.toJSON should ignore specified properties', function(assert) {
	var data = {
		a: "a",
		b: "b",
		c: "c"
	};

	var result = ko.mapping.toJSON(data, { ignore: ["b", "c"] });
    assert.equal(result, "{\"a\":\"a\"}");
});

QUnit.test('ko.mapping.toJSON should unwrap everything and then stringify', function (assert) {
	var data = ko.observableArray(['a', 1,
	{
		someProp: ko.observable('Hey')
	}]);
	var result = ko.mapping.toJSON(data);

	// Check via parsing so the specs are independent of browser-specific JSON string formatting
    assert.equal(typeof result, 'string');
	var parsedResult = ko.utils.parseJson(result);
	assert.equal(parsedResult.length, 3);
	assert.equal(parsedResult[0], 'a');
	assert.equal(parsedResult[1], 1);
	assert.equal(parsedResult[2].someProp, 'Hey');
});

QUnit.test('ko.mapping.toJSON should allow JSON.stringify parameters', function(assert) {
    var data = {
        prop1: ko.observable('abc'),
        prop2: ko.observable(10)
    };
    var result = ko.mapping.toJSON(data, {}, null, '\t');
    assert.equal(result, '{\n\t"prop1": "abc",\n\t"prop2": 10\n}');
});

QUnit.test('ko.mapping.fromJS should require a parameter', function (assert) {
	assert.throws(ko.mapping.fromJS);
});

QUnit.test('ko.mapping.fromJS should return an observable if you supply an atomic value', function (assert) {
	var atomicValues = ["hello", 123, true, null, undefined];
	for (var i = 0; i < atomicValues.length; i++) {
		var result = ko.mapping.fromJS(atomicValues[i]);
        assert.equal(ko.isObservable(result), true);
        assert.equal(result(), atomicValues[i]);
	}
});

QUnit.test('ko.mapping.fromJS should be able to map into an existing object', function (assert) {
	var existingObj = {
		a: "a"
	};

	var obj = {
		b: "b"
	};

	ko.mapping.fromJS(obj, {}, existingObj);

	assert.equal(ko.isObservable(existingObj.a), false);
	assert.equal(ko.isObservable(existingObj.b), true);
	assert.equal(existingObj.a, "a");
	assert.equal(existingObj.b(), "b");
});

QUnit.test('ko.mapping.fromJS should return an observableArray if you supply an array, but should not wrap its entries in further observables', function (assert) {
	var sampleArray = ["a", "b"];
	var result = ko.mapping.fromJS(sampleArray);
	assert.equal(typeof result.destroyAll, 'function'); // Just an example of a function on ko.observableArray but not on Array
	assert.equal(result().length, 2);
	assert.equal(result()[0], "a");
	assert.equal(result()[1], "b");
});

QUnit.test('ko.mapping.fromJS should return an observableArray if you supply an array, and leave entries as observables if there is a create mapping that does that', function (assert) {
        var sampleArray = {array: ["a", "b"]};
        var result = ko.mapping.fromJS(sampleArray, {
                array: {
                        create: function(options) {
                                return new ko.observable(options.data);
                        }
                }
        });
        assert.equal(result.array().length, 2);
        assert.equal(ko.isObservable(result.array()[0]),true);
        assert.equal(ko.isObservable(result.array()[1]),true);
        assert.equal(result.array()[0](), "a");
        assert.equal(result.array()[1](), "b");
});

QUnit.test('ko.mapping.fromJS should not return an observable if you supply an object that could have properties', function (assert) {
    assert.equal(ko.isObservable(ko.mapping.fromJS({})), false);
});

QUnit.test('ko.mapping.fromJS should not wrap functions in an observable', function (assert) {
	var result = ko.mapping.fromJS({}, {
		create: function(model) {
			return {
				myFunc: function() {
					return 123;
				}
			};
		}
	});
    assert.equal(result.myFunc(), 123);
});

QUnit.test('ko.mapping.fromJS update callbacks should pass in a non-observable', function (assert) {
	var result = ko.mapping.fromJS({
		obj: { a: "a" }
	}, {
		obj: {
			update: function(options) {
                assert.equal(options.observable, undefined);
				return { b: "b" };
			}
		}
	});
    assert.equal(result.obj.b, "b");
});

QUnit.test('ko.mapping.fromJS update callbacks should pass in an observable, when original is also observable', function (assert) {
	var result = ko.mapping.fromJS({
		obj: ko.observable("a")
	}, {
		obj: {
			update: function(options) {
				return options.observable() + "ab";
			}
		}
	});
    assert.equal(result.obj(), "aab");
});

QUnit.test('ko.mapping.fromJS update callbacks should pass in an observable, when original is not observable', function (assert) {
	var result = ko.mapping.fromJS({
		obj: "a"
	}, {
		obj: {
			update: function(options) {
				return options.observable() + "ab";
			}
		}
	});
    assert.equal(result.obj(), "aab");
});

QUnit.test('ko.mapping.fromJS should map the top-level atomic properties on the supplied object as observables', function (assert) {
	var result = ko.mapping.fromJS({
		a: 123,
		b: 'Hello',
		c: true
	});
	assert.equal(ko.isObservable(result.a), true);
	assert.equal(ko.isObservable(result.b), true);
	assert.equal(ko.isObservable(result.c), true);
	assert.equal(result.a(), 123);
	assert.equal(result.b(), 'Hello');
	assert.equal(result.c(), true);
});

QUnit.test('ko.mapping.fromJS should not map the top-level non-atomic properties on the supplied object as observables', function (assert) {
	var result = ko.mapping.fromJS({
		a: {
			a1: "Hello"
		}
	});
	assert.equal(ko.isObservable(result.a), false);
	assert.equal(ko.isObservable(result.a.a1), true);
	assert.equal(result.a.a1(), 'Hello');
});

QUnit.test('ko.mapping.fromJS should not map the top-level non-atomic properties on the supplied overriden model as observables', function (assert) {
	var result = ko.mapping.fromJS({
		a: {
			a2: "a2"
		}
	}, {
		create: function(model) {
			return {
				a: {
					a1: "a1"
				}
			};
		}
	});
	assert.equal(ko.isObservable(result.a), false);
	assert.equal(ko.isObservable(result.a.a1), false);
	assert.equal(result.a.a2, undefined);
	assert.equal(result.a.a1, 'a1');
});

QUnit.test('ko.mapping.fromJS should not map top-level objects on the supplied overriden model as observables', function (assert) {
	var DummyObject = function (options) {
		this.a1 = options.a1;
		return this;
	};

	var result = ko.mapping.fromJS({}, {
		create: function(model) {
			return {
				a: new DummyObject({
					a1: "Hello"
				})
			};
		}
	});
	assert.equal(ko.isObservable(result.a), false);
	assert.equal(ko.isObservable(result.a.a1), false);
	assert.equal(result.a.a1, 'Hello');
});

QUnit.test('ko.mapping.fromJS should allow non-unique atomic properties', function (assert) {
	var vm = ko.mapping.fromJS({
		a: [1, 2, 1]
	});

    assert.deepEqual(vm.a(), [1, 2, 1]);
});
/* speed optimizations don't allow this anymore...
test('ko.mapping.fromJS should not allow non-unique non-atomic properties', function () {
	var options = {
		key: function(item) { return ko.utils.unwrapObservable(item.id); }
	};

	var didThrow = false;
	try {
		ko.mapping.fromJS([
			{ id: "a1" },
			{ id: "a2" },
			{ id: "a1" }
		], options);
	}
	catch (ex) {
		didThrow = true
	}
	equal(didThrow, true);
});
*/
QUnit.test('ko.mapping.fromJS should map descendant properties on the supplied object as observables', function (assert) {
	var result = ko.mapping.fromJS({
		a: {
			a1: 'a1value',
			a2: {
				a21: 'a21value',
				a22: 'a22value'
			}
		},
		b: {
			b1: null,
			b2: undefined
		}
	});
	assert.equal(result.a.a1(), 'a1value');
	assert.equal(result.a.a2.a21(), 'a21value');
	assert.equal(result.a.a2.a22(), 'a22value');
	assert.equal(result.b.b1(), null);
	assert.equal(result.b.b2(), undefined);
});

QUnit.test('ko.mapping.fromJS should map observable properties, but without adding a further observable wrapper', function (assert) {
	var result = ko.mapping.fromJS({
		a: ko.observable('Hey')
	});
    assert.equal(result.a(), 'Hey');
});

QUnit.test('ko.mapping.fromJS should escape from reference cycles', function (assert) {
	var obj = {};
	obj.someProp = {
		owner: obj
	};
	var result = ko.mapping.fromJS(obj);
    assert.equal(result.someProp.owner === result, true);
});

QUnit.test('ko.mapping.fromJS should send relevant create callbacks', function (assert) {
	var index = 0;
	var result = ko.mapping.fromJS({
		a: "hello"
	}, {
		create: function (model) {
			index++;
			return model;
		}
	});
    assert.equal(index, 1);
});

QUnit.test('ko.mapping.fromJS should send relevant create callbacks when mapping arrays', function (assert) {
	var index = 0;
	var result = ko.mapping.fromJS([
		"hello"
	], {
		create: function (model) {
			index++;
			return model;
		}
	});
    assert.equal(index, 1);
});

QUnit.test('ko.mapping.fromJS should send parent along to create callback when creating an object', function(assert) {
	var obj = {
		a: "a",
		b: {
			b1: "b1"
		}
	};

	ko.mapping.fromJS(obj, {
		"b": {
			create: function(options) {
				assert.equal(ko.isObservable(options.parent.a), true);
				assert.equal(options.parent.a(), "a");
			}
		}
	});
});

QUnit.test('ko.mapping.fromJS should send parent along to create callback when creating an array item inside an object', function(assert) {
	var obj = {
		a: "a",
		b: [
			{ id: 1 },
			{ id: 2 }
		]
	};

	var target = {};
	var numCreated = 0;
	ko.mapping.fromJS(obj, {
		"b": {
			create: function(options) {
                assert.equal(ko.isObservable(options.parent), false);
                assert.equal(options.parent, target);
				numCreated++;
			}
		}
	}, target);

    assert.equal(numCreated, 2);
});

QUnit.test('ko.mapping.fromJS should send parent along to create callback when creating an array item inside an array', function(assert) {
	// parent is the array

	var obj = [
		{ id: 1 },
		{ id: 2 }
	];

	var target = [];
	var numCreated = 0;
	var result = ko.mapping.fromJS(obj, {
		create: function(options) {
            assert.equal(ko.isObservable(options.parent), true);
			numCreated++;
		}
	}, target);

    assert.equal(numCreated, 2);
});

QUnit.test('ko.mapping.fromJS should update objects in arrays that were specified in the overridden model in the create callback', function (assert) {
	var options = {
		create: function(options) {
			return ko.mapping.fromJS(options.data);
		}
	};

	var result = ko.mapping.fromJS([], options);
	ko.mapping.fromJS([{
		a: "a",
		b: "b"
	}], {}, result);

	assert.equal(ko.isObservable(result), true);
	assert.equal(ko.isObservable(result()[0].a), true);
	assert.equal(result()[0].a(), "a");
	assert.equal(ko.isObservable(result()[0].b), true);
	assert.equal(result()[0].b(), "b");
});

QUnit.test('ko.mapping.fromJS should use the create callback to update objects in arrays', function (assert) {
	var created = [];
	var arrayEvents = 0;

	var options = {
		key: function(item) { return ko.utils.unwrapObservable(item.id); },
		create: function(options) {
			created.push(options.data.id);
			return ko.mapping.fromJS(options.data);
		},
		arrayChanged: function(event, item) {
			arrayEvents++;
		}
	};

	var result = ko.mapping.fromJS([
		{ id: "a" }
	], options);

	ko.mapping.fromJS([
		{ id: "a" },
		{ id: "b" }
	], {}, result);

	assert.equal(created[0], "a");
	assert.equal(created[1], "b");
	assert.equal(result()[0].id(), "a");
	assert.equal(result()[1].id(), "b");
	assert.equal(arrayEvents, 3); // added, retained, added
});

QUnit.test('ko.mapping.fromJS should not call the create callback for existing objects', function (assert) {
	var numCreate = 0;
	var options = {
		create: function (model) {
			numCreate++;
			var overridenModel = {};
			return overridenModel;
		}
	};

	var result = ko.mapping.fromJS({
		a: "hello"
	}, options);

	ko.mapping.fromJS({
		a: "bye"
	}, {}, result);

    assert.equal(numCreate, 1);
});

QUnit.test('ko.mapping.fromJS should not overwrite the existing observable array', function (assert) {
	var result = ko.mapping.fromJS({
		a: [1]
	});

	var resultA = result.a;

	ko.mapping.fromJS({
		a: [1]
	}, result);

    assert.equal(resultA, result.a);
});

QUnit.test('ko.mapping.fromJS should send an added callback for every array item that is added to a previously non-existent array', function (assert) {
	var added = [];

	var options = {
		"a" : {
			arrayChanged: function (event, newValue) {
				if (event === "added") {
                    added.push(newValue);
                }
			}
		}
	};
	var result = ko.mapping.fromJS({}, options);
	ko.mapping.fromJS({
		a: [1, 2]
	}, {}, result);
	assert.equal(added.length, 2);
	assert.equal(added[0], 1);
	assert.equal(added[1], 2);
});

QUnit.test('ko.mapping.fromJS should send an added callback for every array item that is added to a previously empty array', function (assert) {
	var added = [];

	var options = {
		"a": {
			arrayChanged: function (event, newValue) {
				if (event === "added") {
                    added.push(newValue);
                }
			}
		}
	};
	var result = ko.mapping.fromJS({ a: [] }, options);
	ko.mapping.fromJS({
		a: [1, 2]
	}, {}, result);
	assert.equal(added.length, 2);
	assert.equal(added[0], 1);
	assert.equal(added[1], 2);
});

QUnit.test('ko.mapping.fromJS should not make observable anything that is not in the js object', function (assert) {
	var result = ko.mapping.fromJS({});
	result.a = "a";
    assert.equal(ko.isObservable(result.a), false);

	ko.mapping.fromJS({
		b: "b"
	}, {}, result);

	assert.equal(ko.isObservable(result.a), false);
	assert.equal(ko.isObservable(result.b), true);
	assert.equal(result.a, "a");
	assert.equal(result.b(), "b");
});

QUnit.test('ko.mapping.fromJS should not make observable anything that is not in the js object when overriding the model', function (assert) {
	var options = {
		create: function(model) {
			return {
				a: "a"
			};
		}
	};

	var result = ko.mapping.fromJS({}, options);
	ko.mapping.fromJS({
		b: "b"
	}, {}, result);

	assert.equal(ko.isObservable(result.a), false);
	assert.equal(ko.isObservable(result.b), true);
	assert.equal(result.a, "a");
	assert.equal(result.b(), "b");
});

QUnit.test('ko.mapping.fromJS should send an added callback for every array item that is added', function (assert) {
	var added = [];

	var options = {
		"a": {
			arrayChanged: function (event, newValue) {
				if (event === "added") {
                    added.push(newValue);
                }
			}
		}
	};
	var result = ko.mapping.fromJS({
		a: []
	}, options);
	ko.mapping.fromJS({
		a: [1, 2]
	}, {}, result);
	assert.equal(added.length, 2);
	assert.equal(added[0], 1);
	assert.equal(added[1], 2);
});

QUnit.test('ko.mapping.fromJS should send an added callback for every array item that is added', function (assert) {
	var added = [];

	ko.mapping.fromJS({
		a: [1, 2]
	}, {
		"a": {
			arrayChanged: function (event, newValue) {
				if (event === "added") {
                    added.push(newValue);
                }
			}
		}
	});
	assert.equal(added.length, 2);
	assert.equal(added[0], 1);
	assert.equal(added[1], 2);
});

QUnit.test('ko.mapping.fromJSON should parse and then map in the same way', function (assert) {
	var jsonString = ko.utils.stringifyJson({ // Note that "undefined" property values are omitted by the stringifier, so not testing those
		a: {
			a1: 'a1value',
			a2: {
				a21: 'a21value',
				a22: 'a22value'
			}
		},
		b: {
			b1: null
		}
	});
	var result = ko.mapping.fromJSON(jsonString);
	assert.equal(result.a.a1(), 'a1value');
	assert.equal(result.a.a2.a21(), 'a21value');
	assert.equal(result.a.a2.a22(), 'a22value');
	assert.equal(result.b.b1(), null);
});

QUnit.test('ko.mapping.fromJS should be able to map empty object structures', function (assert) {
	var obj = {
		someProp: undefined,
		a: []
	};
	var result = ko.mapping.fromJS(obj);
	assert.equal(ko.isObservable(result.someProp), true);
	assert.equal(ko.isObservable(result.a), true);
	assert.equal(ko.isObservable(result.unknownProperty), false);
});

QUnit.test('ko.mapping.fromJS should send create callbacks when atomic items are constructed', function (assert) {
	var atomicValues = ["hello", 123, true, null, undefined];
	var callbacksReceived = 0;
    atomicValues.forEach(function(value) {
        var result = ko.mapping.fromJS(value, {
            create: function (item) {
                callbacksReceived++;
                return item;
            }
        });
    });
    assert.equal(callbacksReceived, 5);
});

QUnit.test('ko.mapping.fromJS should send callbacks when atomic array elements are constructed', function (assert) {
	var oldItems = {
		array: []
	};
	var newItems = {
		array: [{
			id: 1
		},
		{
			id: 2
		}]
	};

	var items = [];
	var result = ko.mapping.fromJS(oldItems, {
		"array": {
			arrayChanged: function (event, item) {
				if (event === "added") {
                    items.push(item);
                }
			}
		}
	});
	ko.mapping.fromJS(newItems, {}, result);
    assert.equal(items.length, 2);
});

QUnit.test('ko.mapping.fromJS should not send callbacks containing parent names when descendant objects are constructed', function (assert) {
	var obj = {
		a: {
			a1: "hello",
			a2: 234,
			a3: {
				a31: null
			}
		}
	};
	var parents = [];
	var pushParent = function (item, parent) {
		parents.push(parent);
		return item;
	};
	var result = ko.mapping.fromJS(obj, {
		create: pushParent
	});
	assert.equal(parents.length, 1);
	assert.equal(parents[0], undefined);
});

QUnit.test('ko.mapping.fromJS should create instead of update, on empty objects', function (assert) {
	var obj = {
		a: ["a1", "a2"]
	};

	var result;
	result = ko.mapping.fromJS({});
	ko.mapping.fromJS(obj, {}, result);
	assert.equal(result.a().length, 2);
	assert.equal(result.a()[0], "a1");
	assert.equal(result.a()[1], "a2");
});

QUnit.test('ko.mapping.fromJS should update atomic observables', function (assert) {
	var atomicValues = ["hello", 123, true, null, undefined];
	var atomicValues2 = ["hello2", 124, false, "not null", "defined"];

	for (var i = 0; i < atomicValues.length; i++) {
		var result = ko.mapping.fromJS(atomicValues[i]);
		ko.mapping.fromJS(atomicValues2[i], {}, result);
		assert.equal(ko.isObservable(result), true);
		assert.equal(result(), atomicValues2[i]);
	}
});

QUnit.test('ko.mapping.fromJS should update objects', function (assert) {
	var obj = {
		a: "prop",
		b: {
			b1: null,
			b2: "b2"
		}
	};

	var obj2 = {
		a: "prop2",
		b: {
			b1: 124,
			b2: "b22"
		}
	};

	var result = ko.mapping.fromJS(obj);
	ko.mapping.fromJS(obj2, {}, result);
	assert.equal(result.a(), "prop2");
	assert.equal(result.b.b1(), 124);
	assert.equal(result.b.b2(), "b22");
});

QUnit.test('ko.mapping.fromJS should update initially empty objects', function (assert) {
	var obj = {
		a: undefined,
		b: []
	};

	var obj2 = {
		a: "prop2",
		b: ["b1", "b2"]
	};

	var result = ko.mapping.fromJS(obj);
	ko.mapping.fromJS(obj2, {}, result);
	assert.equal(result.a(), "prop2");
	assert.equal(result.b()[0], "b1");
	assert.equal(result.b()[1], "b2");
});

QUnit.test('ko.mapping.fromJS should update arrays containing atomic types', function (assert) {
	var obj = ["a1", "a2", 6];
	var obj2 = ["a3", "a4", 7];

	var result = ko.mapping.fromJS(obj);

	ko.mapping.fromJS(obj2, {}, result);
	assert.equal(result().length, 3);
	assert.equal(result()[0], "a3");
	assert.equal(result()[1], "a4");
	assert.equal(result()[2], 7);
});

QUnit.test('ko.mapping.fromJS should update arrays containing objects', function (assert) {
	var obj = {
		a: [{
			id: 1,
			value: "a1"
		},
		{
			id: 2,
			value: "a2"
		}]
	};

	var obj2 = {
		a: [{
			id: 1,
			value: "a1"
		},
		{
			id: 3,
			value: "a3"
		}]
	};

	var options = {
		"a": {
			key: function (item) {
				return item.id;
			}
		}
	};
	var result = ko.mapping.fromJS(obj, options);

	ko.mapping.fromJS(obj2, {}, result);
	assert.equal(result.a().length, 2);
	assert.equal(result.a()[0].value(), "a1");
	assert.equal(result.a()[1].value(), "a3");
});

QUnit.test('ko.mapping.fromJS should send a callback when adding new objects to an array', function (assert) {
	var obj = [{
		id: 1
	}];
	var obj2 = [{
		id: 1
	},
	{
		id: 2
	}];

	var mappedItems = [];

	var options = {
		key: function(item) {
			return item.id;
		},
		arrayChanged: function (event, item) {
			if (event === "added") {
                mappedItems.push(item);
            }
		}
	};
	var result = ko.mapping.fromJS(obj, options);
	ko.mapping.fromJS(obj2, {}, result);
	assert.equal(mappedItems.length, 2);
	assert.equal(mappedItems[0].id(), 1);
	assert.equal(mappedItems[1].id(), 2);
});

QUnit.test('ko.mapping.fromJS should be able to update from an observable source', function (assert) {
	var obj = [{
		id: 1
	}];
	var obj2 = ko.mapping.fromJS([{
		id: 1
	},
	{
		id: 2
	}]);

	var result = ko.mapping.fromJS(obj);
	ko.mapping.fromJS(obj2, {}, result);
	assert.equal(result().length, 2);
	assert.equal(result()[0].id(), 1);
	assert.equal(result()[1].id(), 2);
});

QUnit.test('ko.mapping.fromJS should send a deleted callback when an item was deleted from an array', function (assert) {
	var obj = [1, 2];
	var obj2 = [1];

	var items = [];

	var options = {
		arrayChanged: function (event, item) {
			if (event === "deleted") {
                items.push(item);
            }
		}
	};
	var result = ko.mapping.fromJS(obj, options);
	ko.mapping.fromJS(obj2, {}, result);
	assert.equal(items.length, 1);
	assert.equal(items[0], 2);
});

QUnit.test('ko.mapping.fromJS should reuse options that were added in ko.mapping.fromJS', function(assert) {
	var viewModelMapping = {
		key: function(data) {
			return ko.utils.unwrapObservable(data.id);
		},
		create: function(options) {
			return new ViewModel(options);
		}
	};

	var ViewModel = function(options) {
		var mapping = {
			entries: viewModelMapping
		};

		ko.mapping.fromJS(options.data, mapping, this);

		this.func = function() { return true; };
	};

	var model = ko.mapping.fromJS([], viewModelMapping);

	var data = [{
		"id": 1,
		"entries": [{
			"id": 2,
			"entries": [{
				"id": 3,
				"entries": []
			}]
		}]
	}];

	ko.mapping.fromJS(data, {}, model);
	ko.mapping.fromJS(data, {}, model);

	assert.equal(model()[0].func(), true);
	assert.equal(model()[0].entries()[0].func(), true);
	assert.equal(model()[0].entries()[0].entries()[0].func(), true);
});

QUnit.test('ko.mapping.toJS should not change the mapped object', function(assert) {
	var obj = {
		a: "a"
	};

	var result = ko.mapping.fromJS(obj);
	result.b = ko.observable(123);
	var toJS = ko.mapping.toJS(result);

	assert.equal(ko.isObservable(result.b), true);
	assert.equal(result.b(), 123);
	assert.equal(toJS.b, undefined);
});

QUnit.test('ko.mapping.toJS should not change the mapped array', function(assert) {
	var obj = [{
		a: 50
	}];

	var result = ko.mapping.fromJS(obj);
	result()[0].b = ko.observable(123);
	var toJS = ko.mapping.toJS(result);

    assert.equal(ko.isObservable(result()[0].b), true);
    assert.equal(result()[0].b(), 123);
});

QUnit.test('observableArray.mappedRemove should use key callback if available', function(assert) {
	var obj = [
		{ id : 1 },
		{ id : 2 }
	];

	var result = ko.mapping.fromJS(obj, {
		key: function(item) {
			return ko.utils.unwrapObservable(item.id);
		}
	});
	result.mappedRemove({ id : 2 });
    assert.equal(result().length, 1);
});

QUnit.test('observableArray.mappedRemove with predicate should use key callback if available', function(assert) {
	var obj = [
		{ id : 1 },
		{ id : 2 }
	];

	var result = ko.mapping.fromJS(obj, {
		key: function(item) {
			return ko.utils.unwrapObservable(item.id);
		}
	});
	result.mappedRemove(function(key) {
		return key === 2;
	});
    assert.equal(result().length, 1);
});

QUnit.test('observableArray.mappedRemoveAll should use key callback if available', function(assert) {
	var obj = [
		{ id : 1 },
		{ id : 2 }
	];

	var result = ko.mapping.fromJS(obj, {
		key: function(item) {
			return ko.utils.unwrapObservable(item.id);
		}
	});
	result.mappedRemoveAll([{ id : 2 }]);
    assert.equal(result().length, 1);
});

QUnit.test('observableArray.mappedDestroy should use key callback if available', function(assert) {
	var obj = [
		{ id : 1 },
		{ id : 2 }
	];

	var result = ko.mapping.fromJS(obj, {
		key: function(item) {
			return ko.utils.unwrapObservable(item.id);
		}
	});
	result.mappedDestroy({ id : 2 });
	assert.equal(result()[0]._destroy, undefined);
	assert.equal(result()[1]._destroy, true);
});

QUnit.test('observableArray.mappedDestroy with predicate should use key callback if available', function(assert) {
	var obj = [
		{ id : 1 },
		{ id : 2 }
	];

	var result = ko.mapping.fromJS(obj, {
		key: function(item) {
			return ko.utils.unwrapObservable(item.id);
		}
	});
	result.mappedDestroy(function(key) {
		return key === 2;
	});
	assert.equal(result()[0]._destroy, undefined);
	assert.equal(result()[1]._destroy, true);
});

QUnit.test('observableArray.mappedDestroyAll should use key callback if available', function(assert) {
	var obj = [
		{ id : 1 },
		{ id : 2 }
	];

	var result = ko.mapping.fromJS(obj, {
		key: function(item) {
			return ko.utils.unwrapObservable(item.id);
		}
	});
	result.mappedDestroyAll([{ id : 2 }]);
	assert.equal(result()[0]._destroy, undefined);
	assert.equal(result()[1]._destroy, true);
});

QUnit.test('observableArray.mappedIndexOf should use key callback if available', function(assert) {
	var obj = [
		{ id : 1 },
		{ id : 2 }
	];

	var result = ko.mapping.fromJS(obj, {
		key: function(item) {
			return ko.utils.unwrapObservable(item.id);
		}
	});
	assert.equal(result.mappedIndexOf({ id : 1 }), 0);
	assert.equal(result.mappedIndexOf({ id : 2 }), 1);
	assert.equal(result.mappedIndexOf({ id : 3 }), -1);
});

QUnit.test('observableArray.mappedCreate should use key callback if available and not allow duplicates', function(assert) {
	var obj = [
		{ id : 1 },
		{ id : 2 }
	];

	var result = ko.mapping.fromJS(obj, {
		key: function(item) {
			return ko.utils.unwrapObservable(item.id);
		}
	});

    var fn = function() {
        result.mappedCreate({ id : 1 });
    };

	assert.throws(fn);
	assert.equal(result().length, 2);
});

QUnit.test('observableArray.mappedCreate should use create callback if available', function(assert) {
	var obj = [
		{ id : 1 },
		{ id : 2 }
	];

	var ChildModel = function(data){
		ko.mapping.fromJS(data, {}, this);
		this.Hello = ko.observable("hello");
	};

	var result = ko.mapping.fromJS(obj, {
		key: function(item) {
			return ko.utils.unwrapObservable(item.id);
		},
		create: function(options){
			return new ChildModel(options.data);
		}
	});

	result.mappedCreate({ id: 3 });
	var index = result.mappedIndexOf({ id : 3 });
	assert.equal(index, 2);
	assert.equal(result()[index].Hello(), "hello");
});

QUnit.test('observableArray.mappedCreate should use update callback if available', function(assert) {
    var obj = [
        {id: 1},
        {id: 2}
    ];

    var ChildModel = function(data) {
        ko.mapping.fromJS(data, {}, this);
    };

    var result = ko.mapping.fromJS(obj, {
        key: function(item) {
            return ko.utils.unwrapObservable(item.id);
        },
        create: function(options) {
            return new ChildModel(options.data);
        },
        update: function(options) {
            return {
                bla: options.data.id * 10
            };
        }
    });

    result.mappedCreate({id: 3});
    assert.equal(result()[0].bla, 10);
    assert.equal(result()[2].bla, 30);
});

QUnit.test('ko.mapping.fromJS should merge options from subsequent calls', function(assert) {
	var obj = ['a'];

	var result = ko.mapping.fromJS(obj, { dummyOption1: 1 });
	ko.mapping.fromJS({}, { dummyOption2: 2 }, result);

	assert.equal(result.__ko_mapping__.dummyOption1, 1);
	assert.equal(result.__ko_mapping__.dummyOption2, 2);
});

QUnit.test('ko.mapping.fromJS should correctly handle falsey values', function (assert) {
	var obj = [false, ""];

	var result = ko.mapping.fromJS(obj);

	assert.equal(result()[0] === false, true);
	assert.equal(result()[1] === "", true);
});

QUnit.test('ko.mapping.fromJS should correctly handle falsey values in keys', function (assert) {
	var gotDeletedEvent = false;

	var options = {
		key: function(item) { return ko.utils.unwrapObservable(item.id); },
		arrayChanged: function(event, item) {
			if (event === "deleted") {
                gotDeletedEvent = true;
            }
		}
	};

	var result = ko.mapping.fromJS([
		{ id: 0 }
	], options);

	ko.mapping.fromJS([
		{ id: 0 },
		{ id: 1 }
	], {}, result);

    assert.equal(gotDeletedEvent, false);
});

QUnit.test('ko.mapping.fromJS should allow duplicate atomic items in arrays', function (assert) {
	var result = ko.mapping.fromJS([
		"1", "1", "2"
	]);

	assert.equal(result().length, 3);
	assert.equal(result()[0], "1");
	assert.equal(result()[1], "1");
	assert.equal(result()[2], "2");

	ko.mapping.fromJS([
		"1", "1", "1", "2"
	], {}, result);

	assert.equal(result().length, 4);
	assert.equal(result()[0], "1");
	assert.equal(result()[1], "1");
	assert.equal(result()[2], "1");
	assert.equal(result()[3], "2");
});

QUnit.test('when doing ko.mapping.fromJS on an already mapped object, the new options should combine with the old', function(assert) {
	var dataA = {
		a: "a"
	};
	var dataB = {
		b: "b"
	};

	var mapped = {};
	ko.mapping.fromJS(dataA, {}, mapped);
	ko.mapping.fromJS(dataB, {}, mapped);
	assert.equal(mapped.__ko_mapping__.mappedProperties.a, true);
	assert.equal(mapped.__ko_mapping__.mappedProperties.b, true);
});

QUnit.test('ko.mapping.fromJS should merge options from subsequent calls', function(assert) {
	var obj = ['a'];

	var result = ko.mapping.fromJS(obj, { dummyOption1: 1 });
	ko.mapping.fromJS(['b'], { dummyOption2: 2 }, result);

	assert.equal(result.__ko_mapping__.dummyOption1, 1);
	assert.equal(result.__ko_mapping__.dummyOption2, 2);
});

QUnit.test('ko.mapping.fromJS should work on unmapped objects', function(assert) {
	var obj = ko.observableArray(['a']);

	ko.mapping.fromJS(['b'], {}, obj);

    assert.equal(obj()[0], 'b');
});

QUnit.test('ko.mapping.fromJS should update an array only once', function(assert) {
	var obj = {
		a: ko.observableArray()
	};

	var updateCount = 0;
	obj.a.subscribe(function() {
		updateCount++;
	});

	ko.mapping.fromJS({ a: [1, 2, 3] }, {}, obj);

    assert.equal(updateCount, 1);
});

QUnit.test('ko.mapping.fromJSON should merge options from subsequent calls', function(assert) {
	var obj = ['a'];

	var result = ko.mapping.fromJS(obj, { dummyOption1: 1 });
	ko.mapping.fromJSON('["b"]', { dummyOption2: 2 }, result);

	assert.equal(result.__ko_mapping__.dummyOption1, 1);
	assert.equal(result.__ko_mapping__.dummyOption2, 2);
});

QUnit.test('ko.mapping.fromJS should be able to update observables not created by fromJS', function(assert) {
	var existing = {
		a: ko.observable(),
		d: ko.observableArray()
	};

	ko.mapping.fromJS({
		a: {
			b: "b!"
		},
		d: [2]
	}, {}, existing);

	assert.equal(existing.a().b(), "b!");
	assert.equal(existing.d().length, 1);
	assert.equal(existing.d()[0], 2);
});

QUnit.test('ko.mapping.fromJS should accept an already mapped object as the second parameter', function(assert) {
	var mapped = ko.mapping.fromJS({ a: "a" });
	ko.mapping.fromJS({ a: "b" }, mapped);
    assert.equal(mapped.a(), "b");
});

QUnit.test('ko.mapping.fromJS should properly map objects that appear in multiple places', function(assert) {
	var obj = { title: "Lorem ipsum" }, obj2 = { title: "Lorem ipsum 2" };
	var x = [obj,obj2];
	var y = { o: obj, x: x };

	var z = ko.mapping.fromJS(y);

	assert.equal(y.x[0].title, "Lorem ipsum");
	assert.equal(z.x()[0].title(), "Lorem ipsum");
});

QUnit.test('ko.mapping.fromJS should properly update arrays containing a NULL key', function(assert) {
	var data = [1,2,3,null];
	var model=ko.mapping.fromJS(data);

    assert.deepEqual(model(), [1,2,3,null]);

	data = [null,1,2,3];
	ko.mapping.fromJS(data, {}, model);

    assert.deepEqual(model(), [null,1,2,3]);
});

QUnit.test('ko.mapping.visitModel will pass in correct parent names', function(assert) {
	var data = { a: { a2: "a2value" } };
	var parents = [];
	ko.mapping.visitModel(data, function(obj, parent) {
		parents.push(parent);
	});
	assert.equal(parents.length, 3);
	assert.equal(parents[0], undefined);
	assert.equal(parents[1], "a");
	assert.equal(parents[2], "a.a2");
});

QUnit.test('ko.mapping.toJS should merge the default observe', function(assert) {
	var data = {
		a: "a",
		b: "b",
		c: "c"
	};

	ko.mapping.defaultOptions().observe = ["a"];
	var result  = ko.mapping.fromJS(data, { observe: "b" });
	assert.equal(ko.isObservable(result.a), true);
	assert.equal(ko.isObservable(result.b), true);
	assert.equal(ko.isObservable(result.c), false);
});

QUnit.test('ko.mapping.fromJS should observe specified single property', function(assert) {
	var data = {
		a: "a",
		b: "b"
	};

	var result = ko.mapping.fromJS(data, { observe: "a" });
	assert.equal(result.a(), "a");
	assert.equal(result.b, "b");
});

QUnit.test('ko.mapping.fromJS should observe specified array', function(assert) {
	var data = {
		a: "a",
		b: ["b1", "b2"]
	};

	var result = ko.mapping.fromJS(data, { observe: "b" });
	assert.equal(result.a, "a");
	assert.equal(ko.isObservable(result.b), true);
});

QUnit.test('ko.mapping.fromJS should observe specified array item', function(assert) {
	var data = {
		a: "a",
		b: [{ b1: "v1" }, { b2: "v2" }]
	};

	var result = ko.mapping.fromJS(data, { observe: "b[0].b1" });
	assert.equal(result.a, "a");
	assert.equal(result.b[0].b1(), "v1");
	assert.equal(result.b[1].b2, "v2");
});

QUnit.test('ko.mapping.fromJS should observe specified array but not the children', function(assert) {
	var data = {
		a: "a",
		b: [{ b1: "v1" }, { b2: "v2" }]
	};

	var result = ko.mapping.fromJS(data, { observe: "b" });
	assert.equal(result.a, "a");
	assert.equal(result.b()[0].b1, "v1");
	assert.equal(result.b()[1].b2, "v2");
});

QUnit.test('ko.mapping.fromJS should observe specified single property, also when going back .toJS', function(assert) {
	var data = {
		a: "a",
		b: "b"
	};

	var result = ko.mapping.fromJS(data, { observe: "b" });
	var js = ko.mapping.toJS(result);
	assert.equal(js.a, "a");
	assert.equal(js.b, "b");
});

QUnit.test('ko.mapping.fromJS should copy specified single property, also when going back .toJS, except when overridden', function(assert) {
	var data = {
		a: "a",
		b: "b"
	};

	var result = ko.mapping.fromJS(data, { observe: "b" });
	var js = ko.mapping.toJS(result, { ignore: "b" });
	assert.equal(js.a, "a");
	assert.equal(js.b, undefined);
});

QUnit.test('ko.mapping.fromJS with observe option should not fail when map data with sub-object', function(assert) {
	var data = {
		a: "a",
		b: {
			c: "c"
		}
	};

	var result = ko.mapping.fromJS(data, { observe: "a" });
	assert.equal(ko.isObservable(result.a), true);
	assert.equal(ko.isObservable(result.b), false);
	assert.equal(ko.isObservable(result.b.c), false);
});

QUnit.test('ko.mapping.fromJS should observe property in sub-object', function(assert) {
	var data = {
		a: "a",
		b: {
			c: "c"
		}
	};

	var result = ko.mapping.fromJS(data, { observe: "b.c" });
	assert.equal(ko.isObservable(result.a), false);
	assert.equal(ko.isObservable(result.b), false);
	assert.equal(ko.isObservable(result.b.c), true);
});

QUnit.test('ko.mapping.fromJS explicit declared none observable members should not be mapped to an observable', function(assert) {
	var data = {
		a: "a",
		b: "b",
        c: "c"
	};

    var ViewModel = function() {
        this.a = ko.observable();
        this.b = null;
    };

	var result = ko.mapping.fromJS(data, {}, new ViewModel());
    assert.equal(ko.isObservable(result.a), true);
    assert.equal(ko.isObservable(result.b), false);
    assert.equal(ko.isObservable(result.c), true);
    assert.equal(result.b, data.b);
});

QUnit.test('ko.mapping.toJS explicit declared none observable members should be mapped toJS correctly', function(assert) {
	var data = {
		a: "a"
	};

    var ViewModel = function() {
        this.a = null;
    };

	var result = ko.mapping.fromJS(data, {}, new ViewModel());
    var js = ko.mapping.toJS(result);

    assert.equal(js.b, data.b);
});
})();
