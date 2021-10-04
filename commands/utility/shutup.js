// stop the bot from whatever it is currently playing.
module.exports = {
    name: "shutup",
    description: "Forces the bot to stop playing and leave the voice channel.",
    usage: "",
    helptext: "",
    async execute(message, args, client) {
        const voiceChannel = message.member.voice.channel;
        // check if the bot is playing something
        if(!message.guild.me.voice.channel) { return message.reply("Don't tell me to shut up, I'm not even talking!"); }
        // check if they are in a voice channel first
        if(!voiceChannel) { return message.channel.send("Sooooo, you need to be in a voice channel to execute that command... now we both look dumb, huh?"); }
        await voiceChannel.leave();
        await message.channel.send("Fine I'll shut up and leave the channel. Later nerds!!");
    }
}