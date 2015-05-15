# node-gulp-starter
An unopinionated Node.js app skeleton and gulpfile

## Motivation

A few template languages in the Node.js ecosystem are not supersets of HTML.
Depending on the template engine used, it can be tricky to automatically wire
the compiled scripts and styles to our view templates. Because of this, the
gulpfile leaves that responsiblity to the app developer. Much can still be
automated though. The gulpfile aims to:

- Automate CoffeeScript and SASS compilation
- Automate JavaScript linting, minification, concatenation and source-mapping
- Automate CSS vendor-prefixing, minification, concatenation and
  source-mapping
- Automate image optimization
- Ease local development by working with structured source static assets, but
  test against compiled, source-mapped static assets
- Restart the local server automatically whenever Node.js scripts are modified
- Live reload the app whenever static assets are recompiled

## The Default Task

Use `gulp` to clean the destination directory and compile source static
assets there.

Use `gulp --production` for a production-ready assets build.

## Style Compilation & Optimization

Use `gulp styles` to compile source styles into one concatenated stylesheet
in the destination directory. Both CSS and SASS sources are supported. CSS
vendor prefixes are added automatically, using data from <http://caniuse.com>.
The `AUTOPREFIXER_BROWSERS` constant determines what browser versions should be
supported.

Use `gulp styles --production` to also minify the styles and exclude
source-maps.

## Script Compilation & Optimization

Use `gulp scripts` to compile source scripts into one concatenated script in
the destination directory. Both JavaScript and CoffeeScript sources are
supported. JavaScript goes through a linter and CoffeeScript is compiled to
JavaScript.

Use `gulp scripts --production` to also minify the scripts and exclude
source-maps.

## Asset Concatenation Order

Script or style concatenation is done in alphabetical order of the filenames
by default. If the order in which styles or scripts are concatenated is
important, a simple solution is to list the files explicitly in the source
globs.

A more advanced solution is to bundle scripts using a module loader like
RequireJS or Browserify and use SASS to import partials in the order needed.

## Image Optimization and Fonts

Use `gulp images` to optimize images and output them in the destination
directory.

Use `gulp fonts` to copy fonts over to the destination directory.

## Automatic Static Assets Compilation

Use `gulp watch &` in bash or `Start-Process gulp watch` in Powershell to
start a background file watcher that will recompile source static assets
automatically whenever they change.

## Local Testing

Use `gulp serve` to test the Node.js app using the compiled static assets.
By default the app's environment is set to `'development'`. To test the app
in production mode, use `gulp serve --production`.

## Live Reload

While serving the app locally, changes to Node.js scripts restart the server
automatically but require a manual browser refresh. Static asset
compilations are detected and will inject the changes in the browser. No
browser extension is required for live reloading to work.

## What the gulpfile **does not provide** out of the box

- Special considerations for Bower components
- Parsing of HTML files and view templates to replace references to
  non-compiled source scripts, stylesheets or Bower components.
- Script bundling using a module loader
- HTML & view template minification
- Asset Versioning
- Unit testing and continous integration tasks
