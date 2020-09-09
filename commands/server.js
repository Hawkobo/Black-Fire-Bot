module.exports = {
    name: 'server',
    guildOnly: true,
	description: 'Provides information about the server the command was sent in',
	execute(client, message, args) {
		message.channel.send(`This server's name is: ${message.guild.name}\nServer ID: ${message.guild.id}\nTotal members: ${message.guild.memberCount}\nCreated on: ${message.guild.createdAt}\nRegion: ${message.guild.region}`);
	},
};