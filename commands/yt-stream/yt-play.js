// require youtube packages
const ytdl = require('ytdl-core-discord');
const ytSearch = require('yt-search');

module.exports = {
    name: "yt-play",
    description: "Joins the user's current channel and plays audio from a youtube video url. Use !shutup to stop the bot.",
    usage: "(URL)",
    helptext: "",
    async execute(message, args, client) {
        // first, get the voice channel the user is in
        const voiceChannel = message.member.voice.channel;
        // check if they are in a voice channel first
        if(!voiceChannel) { return message.channel.send("Sooooo, you need to be in a voice channel to execute that command... now we both look dumb, huh?"); }
        // check if the bot is playing already
        if(message.guild.me.voice.channel) { return message.channel.send("I am already playing!!"); }
        // now check their channel permissions
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if(!permissions.has("CONNECT") || !permissions.has("SPEAK")) { return message.channel.send("You don't have permission for that, nice try pal."); }
        if(!args.length) { return message.channel.send("You are missing an argument, did you even read the docs bro?"); }

        const url = args[0]; // url will be the first argument
        // Now we start the process of connecting to the channel and streaming the audio.
        // first make the bot join the channel
        const connection = await voiceChannel.join();
        // find the video we want to stream from the given url
        try {
            const stream = await ytdl(url, {filter: "audio", highWaterMark: 1<<25});
            connection.play(stream, {type: "opus", volume: 1})
            .on("finish", () => {
                voiceChannel.leave();
            });
            await message.reply(`Now playing requested URL: <${url}>`);
        } catch(e) {
            console.error(`Play Error: ${e}`);
            stream.destroy();
            voiceChannel.leave();
            await message.reply(`Sorry! Something went wrong trying to play: <${url}>`);
        }
    }
}