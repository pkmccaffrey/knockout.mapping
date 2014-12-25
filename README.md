# knockout.mapping
> Object mapping plugin for [Knockout](http://knockoutjs.com/)


## Documentation

Official documentation [here](http://knockoutjs.com/documentation/plugins-mapping.html).


## Quick Start

```js

var data = {
    email: 'demo@example.com',
    name: 'demo',
    addresses: [
        { type: 'home', country: 'Romania', city: 'Cluj' },
        { type: 'work', country: 'Spain', city: 'Barcelona' }
    ]
};

// Create a view model from data
var viewModel = ko.mapping.fromJS(data);

// Now use the viewModel to change some values (properties are now observable)
viewModel.email('demo2@example.com');
viewModel.name('demo2');
viewModel.addresses()[0].city('Bucharest');

// Retrieve the updated data (as JS object)
var newData = ko.mapping.toJS(viewModel);

```


## License

[MIT](http://www.opensource.org/licenses/mit-license.php)
