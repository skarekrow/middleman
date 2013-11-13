var env = require('./lib/env');

function exit(m) {
	console.error('[!] %s', m);
	process.exit(1);
}

if (env.user.toLowerCase() == 'root') exit('Script should not be run as root, exiting.');

var stdio = require('stdio');
var init = require('./lib/init');

var opts = stdio.getopt({
	init: {description: 'Initialize application'}
});

init.init(function(err) {
	if (err) return exit(err);
	if (opts.init) return console.log('Initialized!');
	if (env.platform == 'win') return require('./lib/dispatch');

	var forever = require('forever-monitor');
	var config = require('./lib/utils/config');

	function createChild() {
		var child = new (forever.Monitor)('lib/dispatch.js', {
			max: (config.app.forever ? Number.MAX_VALUE : 0),
			silent: false,
			options: [],
			minUptime: 2000,
			spinSleepTime: 10000,
			errFile: env.logs+'/forever.debug.log'
		});

		child.on('exit', function() {
			if (config.app.forever) {
				createChild();
			}
		});

		child.start();
	}

	createChild();
});
