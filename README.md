component2webpack
=================

use and install component dependencies with webpack.

```
# install globably 
npm install -g component2webpack

# inside your project with a component.json manifest, run 
DEBUG=component2webpack:* component2webpack
```

- all dependencies are installed in web_modules.
- css dependencies are imported using the css loader

Sample webpack.config.json

```js
module.exports = {
  resolve: {
    modulesDirectories: ['web_modules']
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }
    ]
  }
};
```
