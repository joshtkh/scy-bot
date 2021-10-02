module.exports = {
	name: 'ping',
	description: 'When you say !ping, I say Pong!',
	usage: "",
	helptext: "",
	execute(message, args, client) {
		message.channel.send('Pong!');
	},
};