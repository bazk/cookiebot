#!/usr/bin/env node

var irc = require('irc');
var pg = require('pg');

var config = require('./config.json');

var bot = new irc.Client(config.irc.server, config.irc.nick, {
    channels: [ config.irc.channel ],
    password: config.irc.password,
    username: config.irc.nick,
    secure: false
});

function sayCookies(channel, username) {
    pg.connect(config.db, function (err, client, done) {
        if (err) {
            console.error(err);
            done(err);
            return;
        }

        client.query('SELECT get_cookies($1);', [username], function (err, result) {
            if (err) {
                console.error(err);
                done(err);
                return;
            }

            done();

            if ( (result.rows.length < 1) || (!parseInt(result.rows[0].get_cookies, 10)) ) {
                bot.say(channel, username + " has no cookie points.");
            }
            else {
                bot.say(channel, username + " has " + parseInt(result.rows[0].get_cookies, 10) + " cookie points.");
            }
        });
    });
}

function addCookies(channel, username, ammount) {
    pg.connect(config.db, function (err, client, done) {
        if (err) {
            console.error(err);
            done(err);
            return;
        }

        client.query('SELECT add_cookies($1, $2);', [username, ammount], function (err, result) {
            if (err) {
                console.error(err);
                done(err);
                return;
            }

            done();

            if (ammount < -1) {
                bot.say(channel, username + " is acting realy shady and lost " + Math.abs(ammount) + " of his cookies points!");
            }
            else if (ammount == -1) {
                bot.say(channel, username + " lost a cookie!");
            }
            else if (ammount == 0) {
                bot.say(channel, username + ", no cookie for you!");
            }
            else if (ammount == 1) {
                bot.say(channel, username + " earned a cookie point!");
            }
            else {
                bot.say(channel, username + " earned " + ammount + " cookie points!");
            }
        });
    });
}

bot.addListener("message", function(from, to, text, message) {
    var lowerFrom = from.toLowerCase();
    var args = null;

    if (to !== config.irc.channel)
        return; // not a message to channel

    args = text.match(/^ *\!jar +([a-zA-Z0-9_]+) *$/);
    if (args) {
        sayCookies(to, args[1]);
    }

    args = text.match(/^ *\!jar *$/);
    if (args) {
        sayCookies(to, from);
    }

    if ( (lowerFrom === 'livinpink') ||
         (lowerFrom === 'livinpinkcookies') ||
         (lowerFrom === 'drbazooka') ) {

        args = text.match(/^ *\!cookies +([+\-]?[0-9]+) +([a-zA-Z0-9_]+) *$/);
        if (args) {
            var ammount = parseInt(args[1], 10),
                username = args[2];

            addCookies(to, username, ammount);
        }

    }
});
