var js = require('atomify-js')
  , css = require('atomify-css')
  , fs = require('fs')
  , writer = require('write-to-path')
  , server = require('./server')

module.exports = function (args) {
  if ((args._ && args._[0] === 'help') || args.help) {
    return fs.createReadStream(__dirname + '/usage.txt')
      .pipe(process.stdout)
      .on('close', function () { process.exit(1) });
  }

  if (args.version) {
    return console.log(require('../package.json').version);
  }

  if (args.css) {
    args.css = parseArgs('css', args.css, args)

    args.css.variables = args.css.v || args.css.variables
    args.css.plugins = args.css.p || args.css.plugins
    args.css.compress = args.css.c || args.css.compress

    if (args.css.output) css(args.css, writer(args.css.output, args.css))
  }

  if (args.js) {
    args.js = parseArgs('js', args.js, args)

    args.js.watch = args.js.w || args.js.watch
    args.js.transforms = args.js.t || args.js.transform

    if (args.js.output) js(args.js, writer(args.js.output, args.js))
  }

  if (args.server) server(args)
}

function parseArgs (ext, child, parent) {
  if (typeof child === 'string') child = {entry: child} // -j entry.js
  if (child._) child.entry = child._[0] // -j [ entry.js ]
  if (typeof child.e === 'string') child.entry = child.e // -j [ -e entry.js ]
  if (Array.isArray(child.e)) child.entries = child.e // -j [ -e entry.js -e other.js ]

  if (child.entry.indexOf(':') > 0) {
    var pieces = child.entry.split(':')
    child.entry = pieces[0]
    child.alias = pieces[1]
  }

  child.debug = child.d || child.debug || parent.debug

  child.output = child.o || child.output
  if (child._ && child._.length === 2) child.output = child._[1] // -j [ entry.js bundle.js ]
  if (!child.output && parent.output) child.output = parent.output.indexOf(ext) > 1 ? parent.output : parent.output + '.' + ext

  if (!child.output && !parent.server) {
    console.error('No output path provided for ' + ext.toUpperCase() + ' bundle!')
    process.exit(1)
  }

  return child;
}
