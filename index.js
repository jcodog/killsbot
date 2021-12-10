const tmi = require('tmi.js');
var formatDistance = require('date-fns/formatDistance')
const fs = require('fs');

const client = new tmi.Client({
	options: { debug: true },
	identity: {
		username: 'jconetchloe',
		password: process.env.pass
	},
	channels: [ "jconet" ]
});

client.connect().then(console.log("Chat Bot Active"));

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

const prefix = process.env.prefix;

client.on('message', (channel, tags, message, self) => {
	// Ignore echoed messages.
	if(self) return;

    if(tags['username'] === "streamlabs") return;

	let messageArray = message.content.split(" ");
  	let commandName = messageArray[0].slice(useprefix.length).toLowerCase();
  	let args = messageArray.slice(1);

	if (message.content.startsWith(useprefix)) {
		let command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    	if (!command) return;

		if (command.args && !args.length) {
			let reply = `You didn't provide any arguments!`;
	
			if (command.usage) {
			  reply += `\nThe proper usage would be: \`${useprefix}${command.name} ${command.usage}\``;
			}
	
			return client.say(channel, reply);
		}
	
		try {
		  command.execute(client, tmi, formatDistance, fs, channel, tags, message, self, messageArray, commandName, args);
		} catch (error) {
			console.error(error);
			client.say(channel, 'There was an unexpected error in executing that command, please check the bot logs for more information.');
		}
	};

	if (!command) return;

	try {
		await command.execute(cmd, tmi, formatDistance, fs, client, channel, tags, message, self);
	} catch (error) {
		console.error(error);
	}
});