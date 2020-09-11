const Discord = require('discord.js');
const fs = require('fs');

//#region Production server values
const __ROLES = [['Member', 'SuperMember'],  // Each user may only be subscribed to one of the roles in each list
                ['Test 1', 'Test 2', 'Test 3'], 
                ['Role 1', 'Role 2', 'Role 3'],
                [],
                [],
                [],
            ];
const __EXCLUDED_USERS = []; //done by display name and not discord username
//#endregion

function getMentionID(client, message, mention) { //function to extract ID of mention, rather than entire mention
    if (!mention) return;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);
        if (mention.startsWith('&')) {
            mention = mention.slice(1);
            return message.guild.roles.cache.get(mention)
        }

        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }

        return client.users.cache.get(mention);
    } else if (mention.startsWith('<#') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);
        return client.channels.cache.get(mention);
    }
}

module.exports = {
    name: 'csv',
    description: 'Returns a CSV of requested data',
    execute(client, message, args) {
        let output =[];
        let column_headers = ['Discord ID', 'Member'];

        for (let i = 0; i < __ROLES.length; i++) {
            column_headers.push(`Role ${i+1}`);
        }
        output.push(column_headers);
        // Acquiring server name based off of message.guild.id
        let guild = Discord.Guild;
        let guild_list = client.guilds.cache.get(message.guild.id);
        let item = guild_list
        if (item.name === message.guild.name) {
            guild = item;
            console.log(`${guild.name}\n`);
        }
   
        // if server isn't found, throw an exception
        if (guild === Discord.Guild) throw new Error("Server not found");

        let memberSearchGroup = guild.members.cache.values();
        
        if (args.length != 0) { //filter members by role if provided
            let newMemberSearchGroup = [];
            for (mention of args) {
                let membersWithRole = guild.roles.cache.get(getMentionID(client, message, mention).id).members;
    
                membersWithRole.forEach(roleM => {
                    for (allM of memberSearchGroup) {
                        if (allM == roleM && !newMemberSearchGroup.includes(roleM))
                            newMemberSearchGroup.push(roleM);
                    }
                });

                memberSearchGroup = newMemberSearchGroup;
            }
        }

        for (let member of memberSearchGroup) {
            // Skip loop iteration if member is to be excluded
            if (__EXCLUDED_USERS.includes(member.displayName)) {
                continue;
            }
            let data_entry = [member.user.id, member.displayName]; // Represents row in csv
            let roles = []; // list for holding role names
            for (let role of member.roles.cache.values()) {
                roles.push(role.name);
            }
            // Checks if there are set intersections between the roles list and each list in __ROLES
            for (let ranks of __ROLES) {
                let intersection = ranks.filter(value => roles.includes(value));
                data_entry.push(intersection.length !== 0 ? intersection[0] : null);
            }
            output.push(data_entry);
        }
        
        let csvContent = output.map(e => e.join(",")).join("\n");
        console.log(csvContent);

        fs.writeFile('Output.csv', csvContent, (err) => { if (err) throw err; });
        message.channel.send("Here you go!", {
                files: [{
                    attachment: './Output.csv',
                    name: 'Output.csv'
                    }],
        });
    },
};