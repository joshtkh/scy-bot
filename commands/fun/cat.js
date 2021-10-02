// shows a random picture of a cat!
const axios = require("axios");
module.exports = {
    name: "cat",
    description: "Shows a random picture of a cat!",
    usage: "",
    async execute(message, args, client) {
        axios.defaults.headers.common['x-api-key'] = "DEMO-API-KEY";
        // now get the image
        axios.get("https://api.thecatapi.com/v1/images/search")
        .then((response) => {
            message.channel.send(response.data[0].url);
        })
        .catch((err) => {
            console.error(err);
        });
    }
}