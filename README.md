# knockout.mapping

> Object mapping plugin for [Knockout](http://knockoutjs.com/).  This fork of the [original plugin](https://github.com/SteveSanderson/knockout.mapping) contains bugfixes from various other forks.  The goal of this repo is to maintain the existing code (and fix any issues with it), as well as implement new features as needed.

## Documentation

Documentation lives [here](http://knockoutjs.com/documentation/plugins-mapping.html).  It was written for the original (SteveSanderson) plugin, but should still be accurate.

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

// newData now looks like this
{
  email: 'demo2@example.com',
  name: 'demo2',
  addresses: [
    { type: 'home', country: 'Romania', city: 'Bucharest' },
    { type: 'work', country: 'Spain', city: 'Barcelona' }
  ]
}

```

## Test

Continuous Integration tests are done with Travis, and the associated Gulp task is `test-ci`.
For development `test` task is used, which runs the tests against the latest version of Knockout.

## License

[MIT](http://www.opensource.org/licenses/mit-license.php)
