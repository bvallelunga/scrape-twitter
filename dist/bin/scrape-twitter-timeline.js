'use strict';

var meow = require('meow');

var JSONStream = require('JSONStream');
var pump = require('pump');
var TimelineStream = require('../lib/timeline-stream');
var cliUtils = require('../lib/cli-utils');

var SCRAPE_TWITTER_CONFIG = cliUtils.SCRAPE_TWITTER_CONFIG;
var env = cliUtils.getEnv();

var cli = meow('\n  Usage\n    $ TWITTER_USERNAME=jack TWITTER_PASSWORD=p4ssw0rd scrape-twitter timeline [--count=<count>] <username>\n\n  Options\n    --with-retweets, -t   Include retweets\n    --with-replies,  -p   Include replies\n    --count,         -c   Get first N items\n', {
  string: ['_'],
  alias: { t: 'withRetweets', p: 'withReplies', c: 'count' }
});

if (cli.input.length === 0) {
  cli.showHelp();
} else if (cli.flags.withReplies && (!env.TWITTER_USERNAME || !env.TWITTER_PASSWORD)) {
  console.log('Please ensure that the environment variables TWITTER_USERNAME and TWITTER_PASSWORD are set.');
  console.log();
  console.log('Environment variables can be set within the dotenv file: ' + SCRAPE_TWITTER_CONFIG);
  process.exit(1);
} else {
  var username = cliUtils.parseUsername(cli.input[0]);
  var tweets = new TimelineStream(username, {
    retweets: cli.flags.withRetweets || false,
    replies: cli.flags.withReplies || false,
    count: cli.flags.count,
    env: env
  });
  pump(tweets, JSONStream.stringify('[\n', ',\n', '\n]\n'), process.stdout, cliUtils.handleError(process.exit.bind(process)));
}