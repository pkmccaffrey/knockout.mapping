(function() {
'use strict';
/*global ko, QUnit*/

QUnit.module('Integration tests', {
    beforeEach: function() {
        ko.mapping.resetDefaultOptions();
    }
});

QUnit.test('Store', function(assert) {
    function Product(data) {
        var viewModel = {
            guid: ko.observable(),
            name: ko.observable()
        };

        ko.mapping.fromJS(data, {}, viewModel);

        return viewModel;
    }

    function Store(data) {
        data = data || {};
        var mapping = {
            Products: {
                key: function(data) {
                    return ko.utils.unwrapObservable(data.guid);
                },
                create: function(options) {
                    return new Product(options.data);
                }
            },

            Selected: {
                update: function(options) {
                    return ko.utils.arrayFirst(viewModel.Products(), function(p) {
                        return p.guid() === options.data.guid;
                    });
                }
            }
        };

        var viewModel = {
            Products: ko.observableArray(),
            Selected: ko.observable()
        };

        ko.mapping.fromJS(data, mapping, viewModel);

        return viewModel;
    }

    var jsData = {
        "Products": [
            {"guid": "01", "name": "Product1"},
            {"guid": "02", "name": "Product2"},
            {"guid": "03", "name": "Product3"}
        ],
        "Selected": {"guid": "02"}
    };
    var viewModel = new Store(jsData);
    assert.equal(viewModel.Selected().name(), "Product2");
});

//https://github.com/SteveSanderson/knockout.mapping/issues/34
QUnit.test('Issue #34', function(assert) {
    var importData = function(dataArray, target) {
        var mapping = {
            "create": function(options) {
                return options.data;
            }
        };
        return ko.mapping.fromJS(dataArray, mapping, target);
    };

    var viewModel = {
        things: ko.observableArray([]),
        load: function() {
            var rows = [
                {id: 1}
            ];
            importData(rows, viewModel.things);
        }
    };

    viewModel.load();
    viewModel.load();
    viewModel.load();

    assert.deepEqual(viewModel.things(), [{"id": 1}]);
});

//TODO: Inconclusive test
QUnit.test('Adding large amounts of items to array is slow', function(assert) {
    assert.expect(0);

    var numItems = 5000;
    var data = [];
    for (var t = 0; t < numItems; t++) {
        data.push({id: t});
    }

    ko.mapping.fromJS(data, {
        key: function(data) {
            return ko.utils.unwrapObservable(data).id;
        }
    });
});

QUnit.test('Issue #87', function(assert) {
    var Item = function(data) {
        var _this = this;

        var mapping = {
            include: ["name"]
        };

        data = data || {};
        _this.name = ko.observable(data.name || "c");

        ko.mapping.fromJS(data, mapping, _this);
    };

    var Container = function(data) {
        var _this = this;

        var mapping = {
            items: {
                create: function(options) {
                    return new Item(options.data);
                }
            }
        };

        _this.addItem = function() {
            _this.items.push(new Item());
        };

        ko.mapping.fromJS(data, mapping, _this);
    };

    var data = {
        items: [
            {name: "a"},
            {name: "b"}
        ]
    };

    var mapped = new Container(data);

    mapped.addItem();
    assert.equal(mapped.items().length, 3);
    assert.equal(mapped.items()[0].name(), "a");
    assert.equal(mapped.items()[1].name(), "b");
    assert.equal(mapped.items()[2].name(), "c");

    var unmapped = ko.mapping.toJS(mapped);
    assert.equal(unmapped.items.length, 3);
    assert.equal(unmapped.items[0].name, "a");
    assert.equal(unmapped.items[1].name, "b");
    assert.equal(unmapped.items[2].name, "c");
});

QUnit.test('Issue #88', function(assert) {
    var ViewModel = function(data) {
        ko.mapping.fromJS(data, {
            copy: ["id"]
        }, this);

        this.reference = ko.observable(this);
    };

    var viewModel = new ViewModel({"id": 123, "name": "Alice"});
    var unmapped;

    unmapped = ko.mapping.toJS(viewModel);
    assert.equal(unmapped.id, 123);
    assert.equal(unmapped.name, "Alice");

    unmapped = ko.mapping.toJS(viewModel.reference);
    assert.equal(unmapped.id, 123);
    assert.equal(unmapped.name, "Alice");

    unmapped = ko.mapping.toJS(viewModel.reference());
    assert.equal(unmapped.id, 123);
    assert.equal(unmapped.name, "Alice");
});

QUnit.test('Issue #94', function(assert) {
    var model = {
        prop: "original",
        obj: {
            prop: "original",
            obj: {
                prop: "original"
            }
        }
    };
    var viewModel = ko.mapping.fromJS(model);

    var modelUpdate = {
        prop: "edit",
        obj: {
            prop: "edit",
            obj: {
                prop: "edit"
            }
        }
    };
    ko.mapping.fromJS(modelUpdate, {ignore: ["obj.prop", "obj.obj"]}, viewModel);

    assert.equal(viewModel.prop(), "edit");
    assert.equal(viewModel.obj.prop(), "original");
    assert.equal(viewModel.obj.obj.prop(), "original");
});

QUnit.test('Issue #96', function(assert) {

    var data = {
        a: {
            b: 123
        },
        'a.b': 456
    };

    var viewModel = ko.mapping.fromJS(data, {ignore: 'a.b'});
    var js = ko.mapping.toJS(viewModel);

    assert.equal(ko.isObservable(viewModel['a.b']), true);
    assert.equal(viewModel.a.b, undefined);
    assert.equal(js['a.b'], 456);
    assert.equal(js.a.b, undefined);
});

QUnit.test('Issue #99', function(assert) {
    assert.expect(1);
    var done = assert.async();

    var a = {
        x: ko.observable().extend({throttle: 1})
    };

    var receivedValue;
    a.x.subscribe(function(value) {
        receivedValue = value;
    });

    ko.mapping.fromJS({x: 3}, {}, a);
    window.setTimeout(function() {
        assert.equal(receivedValue, 3);
        done();
    }, 2);
});

QUnit.test('Issue #33', function(assert) {
    var mapping = {
        'items': {
            key: function(data) {
                return ko.utils.unwrapObservable(data.id);
            },
            create: function(options) {
                function SimpleObject() {
                    this._remove = function() {
                        options.parent.items.mappedRemove(options.data);
                    };
                    ko.mapping.fromJS(options.data, {}, this);
                }
                var o = new SimpleObject();
                return o;
            }
        }
    };

    var i = 0;
    var vm = ko.mapping.fromJS({
        'items': [{
            id: ++i
        }]
    }, mapping);

    vm.items.mappedCreate({
        id: ++i
    });

    assert.equal(vm.items().length, 2);
    vm.items()[1]._remove();

    assert.equal(vm.items().length, 1);
    vm.items()[0]._remove();

    assert.equal(vm.items().length, 0);
});

QUnit.test('Issue #86', function(assert) {
    var ViewModel = function() {
        var _this = this;
        this.filters = new FilterModel();
        this.update = function(data) {
            var mapping = {
                filters: {
                    update: function(options) {
                        return options.target.update(options.data);
                    }
                }
            };
            ko.mapping.fromJS(data, mapping, _this);
            return _this;
        };
    };

    var FilterModel = function() {
        var _this = this;
        this.a = ko.observable();
        this.update = function(data) {
            var mapping = {
                a: {
                    update: function(options) {
                        return options.data + " modified";
                    }
                }
            };
            ko.mapping.fromJS(data, mapping, _this);
            return _this;
        };
    };

    var model = new ViewModel();
    model.update({filters: {a: "a1"}});
    assert.equal(model.filters.a(), "a1 modified");
});

//https://github.com/SteveSanderson/knockout.mapping/issues/107
QUnit.test('Issue #107', function(assert) {
    var model = ko.mapping.fromJS({foo: 'bar'}, {
        fiz: 'applesauce'
    });

    ko.mapping.fromJS({foo: 'baz'}, model);

    assert.equal(model.foo(), "baz");
});

QUnit.test('Issue #203', function(assert) {

    var data = {type: 'nothing', connectionId: 1};
    var viewModel = ko.mapping.fromJS(data);

    ko.mapping.fromJS({type: 'thirdType', thirdTypeProperty: 'thirdTypeProperty'}, viewModel);

    assert.deepEqual(ko.mapping.toJS(viewModel), {connectionId: 1, type: 'thirdType', thirdTypeProperty: 'thirdTypeProperty'});
});

//https://github.com/SteveSanderson/knockout.mapping/issues/124
QUnit.test('Issue #124', function(assert) {
    var model = ko.mapping.fromJS({ foo: 'constructor' });
    assert.equal(model.foo(), 'constructor');
});

})();
