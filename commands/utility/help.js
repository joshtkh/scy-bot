// Help command to list all other commands the bot has.
// Require the discord.js library
const fs = require("fs");

module.exports = {
	name: 'help',
	description: 'List brief help on each of my commands, or give info about a specific provided command.',
	usage: "['command name']",
	helptext: "",
	execute(message, args, client) {
		// if there are no args, we list all commands.
		if(!args.length) {
			// result string so we dont spam with multiple messages
			let res = "**(Round Brackets) are REQUIRED arguments.\n[Square Brackets] are optional arguments.\nDo NOT include the brackets when providing arguments.\n'Items in quotes' are values meant to be replaced.\nExample: _!gtts -n gb -g f2 Hello, this is a test!_**\n";
			// loop through all the commands
			for(const command of client.commands.values()) {
				res += `_**!${command.name} ${command.usage}**_ -> ${command.description}\n`;
			}
			// send the message with all the help text
			message.channel.send(res);
		} else {
			// otherwise, we list the helptext of the given command
			const commandName = args[0];
			if(!client.commands.has(commandName)) { return message.channel.send(`I don't have ${commandName} as a command.`); }
			const helpText = client.commands.get(commandName).helptext;
			if(!helpText) { return message.channel.send(`...Really? _**!${commandName}**_ is pretty self-explanatory from the !help menu. Try reading it?`); }
			message.channel.send(helpText);
		}	
	}
};