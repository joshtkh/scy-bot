// import google api
const textToSpeech = require("@google-cloud/text-to-speech");
// other imports
const fs = require("fs");
const util = require("util");
// consts
const voiceTypeOptCode = "-g";
const nationalityOptCode = "-n";
const speakingRateOptCode = "-s";
// create an enum to store references to the voice types
const voicesEnum = {
    "AU" : {
        "m1" : "B",
        "m2" : "D",
        "f1" : "A",
        "f2" : "C"
    },
    "IN" : {
        "m1" : "B",
        "m2" : "C",
        "f1" : "A",
        "f2" : "D"
    },
    "GB" : {
        "m1" : "B",
        "m2" : "D",
        "f1" : "A",
        "f2" : "C",
        "f3" : "F"
    },
    "US" : {
        "m1" : "A",
        "m2" : "B",
        "m3" : "D",
        "m4" : "I",
        "m5" : "J",
        "f1" : "C",
        "f2" : "E",
        "f3" : "F",
        "f4" : "G",
        "f5" : "H"
    }
}
const helpTextEnum = {
    "AU" : [Object.keys(voicesEnum["AU"])],
    "IN" : [Object.keys(voicesEnum["IN"])],
    "GB" : [Object.keys(voicesEnum["GB"])],
    "US" : [Object.keys(voicesEnum["US"])]
}

function _formatHelpText() {
    // return a nice string we can give the user to list all valid voice formats
    let res = "";
    for(const nat of Object.keys(voicesEnum)) {
        res += `${nat}: `;
        for(const voice of Object.keys(voicesEnum[nat])) {
            res += `${voice} |`;
        }
        res += "\n";
    }
    return res;
}

module.exports = {
    name: "gtts",
    description: "Joins the user's current channel and uses the google text-to-speech API to speak the given text. Use !shutup to stop the bot.",
    usage: "[-n 'nationality'] [-g 'voice type'] ('text-to-speak')",
    helptext: `List of all valid [-n 'nationality'] and [-g 'voice'] combos (m: male, f: female):\n${_formatHelpText()}\n**EXAMPLE:** !gtts -n gb -g m2 Hello, this is what I will say.`,
    async execute(message, args, client) {
        // first we check if the user is in a channel
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel) { return message.channel.send("Sooooo, you need to be in a voice channel to execute that command... now we both look dumb, huh?"); }
        if(message.guild.me.voice.channel) { return message.channel.send("I am already playing!!"); }

        // This allows user to change the voice gender/nationality with options.
        // usage ex: !gtts [nationality] [gender+type]
        // EX: !gtts -n us -g m2 (text)
        // EX: !gtts -n us -g f (text)
        // EX: !gtts -n us (text)
        // EX: !gtts -g f (text)
        // set up array to store any provided options
        const options = {};
        while(args[0].startsWith("-")) {
            options[args.shift()] = args.shift(); // stores the options in a dictionary type object where option:value
        }
        // now we determine what options were given
        const voiceType = (voiceTypeOptCode in options) ? options[voiceTypeOptCode] : "m1";
        const nationality = (nationalityOptCode in options) ? options[nationalityOptCode].toUpperCase() : "US";
        const speakingRate = (speakingRateOptCode in options) ? options[speakingRateOptCode] : 1.0;
        // Speaking rate can only be between 0.25 and 4.0, so make sure it isnt outside that range
        if(speakingRate < 0.25) { speakingRate = 0.25; }
        if(speakingRate > 4.0) { speakingRate = 4.0; }
        // If no number was supplied by the user, we must append one here. Default to 1.
        if(voiceType.length == 1) { voiceType += "1"; }
        // now we need to access our custom voicesEnum to get the voice code we need.
        if(!(nationality in voicesEnum)) { return message.channel.send(`Sorry, that isn't a valid nationality. Supported nationalities include: ${Object.keys(voicesEnum)}`); }
        if(!(voiceType in voicesEnum[nationality])) { return message.channel.send(`Sorry, that isn't a valid voice type for ${nationality}. Supported voices for ${nationality} are: ${Object.keys(voicesEnum[nationality])}`); }
        const voiceTypeLetter = voicesEnum[nationality][voiceType];
        

        // now we need to get the text from the user, and create a sentence out of it.
        const text = args.join(" ");
        
        // now create the tts client
        const ttsclient = new textToSpeech.TextToSpeechClient();
        // make the request
        const request = {
            input: {text: text},
            // select the language
            voice: {languageCode: `en-${nationality}`, name: `en-${nationality}-Wavenet-${voiceTypeLetter}`},
            // type of audio encoding
            audioConfig: {audioEncoding: "MP3"},
            speakingRate: speakingRate
        };

        // perform the tts request
        const [response] = await ttsclient.synthesizeSpeech(request);
        // now write the audio content to a local file
        const writeFile = util.promisify(fs.writeFile);
        await writeFile("tts-output.mp3", response.audioContent, "binary");
        console.log("Audio content successfully written to file.");

        // now we have the audio file, get the bot to join and play it
        const connection = await voiceChannel.join();
        // now try to play the audio file
        try {
            connection.play("tts-output.mp3", {volume: 1})
            .on("finish", () => {
                voiceChannel.leave();
            });
            //await message.channel.send(`Now speaking this text: ${text}`);
        } catch(e) {
            console.error(`TTS Play Error: ${e}`);
            await voiceChannel.leave();
            await message.reply(`Sorry! Something went wrong playing the audio file!`);
        }
    }
}