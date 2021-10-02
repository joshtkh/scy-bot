"use strict";

// we need to access the file system, we can do that with node.js fs
const fs = require("fs");
// Require the discord.js library
const Discord = require("discord.js");
require('dotenv').config();

// config for our bot (contains the private string/token)
// prefix refers to the text you want users to use before a command, ex !, %, $, #, etc
const token = process.env.DISC_API_KEY;
const prefix = "!";

// Google Cloud setup
// make sure we authenticate for the google api
process.env.GOOGLE_APPLICATION_CREDENTIALS = "discordbottts-googleapi.json" || "google-credentials.json";

// !help counter (for fun)
let helpCounter = 0;

// client for our discord bot
const client = new Discord.Client();

// create a collection of our command files
client.commands = new Discord.Collection();
// save the location of the command folders
const commandsFolder = fs.readdirSync("./commands");
// point towards the command folder
for(const folder of commandsFolder){
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith(".js"));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		// set new item in the collection,
    	// the key is the command name, and the value is the exported module
    	client.commands.set(command.name, command);
	}
}

// Now set the ready event so the bot will start listening to the server.
client.once("ready", () => { 
    console.log("ScyBot is now online!");
    //client.channels.fetch("882423542942154763")
    //.then(channel => channel.send("ScyBot is now online!"))
    //.catch(console.error);
});

// Create an event listener for commands for the bot.
client.on("message", message => {
    // First check if the message started with the prefix & it wasnt the bot
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    // now we slice the prefix off the start, then we trim and split it by spaces
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    // The command will be the first string in the list, so take it off and store it
    const commandName = args.shift().toLowerCase(); // now all that is left in args is the arguments (or an empty list if there were none)

    // Now we dynamically access the commands.
    // first, check if the command exits.
    if(!client.commands.has(commandName)) {
        helpCounter++;
        if(helpCounter > 4) {
            message.reply("...Uhhhm. This is embarassing. Do you need some !help there buddy?");
            helpCounter = 0;
        }
        return;
    } 
    // get the command now
    const command = client.commands.get(commandName);
    // attempts to execute the command, outputs an error otherwise
    try {
        command.execute(message, args, client);
    } catch (error) {
        console.log("Command Error Output:");
        console.error(error);
        message.reply(`There was an error executing that command. (Developer: See console for error text.)`);
    }
});
// Log into the discord bot with our private token (PRIVATE KEY - DO NOT SHARE THIS STRING)
client.login(token);
