const truecallerjs = require('truecallerjs');

module.exports = {
    name: 'tru',
    description: 'Search for phone number details using Truecaller.',
    async execute(client, message, args) {
        const number = args[0];
        const installationId = process.env.TRUECALLER_INSTALLATION_ID;

        if (!installationId) {
            return message.reply("⚠️ Truecaller is not configured. Owner needs to set TRUECALLER_INSTALLATION_ID.");
        }

        if (!number) {
            return message.reply("❌ Usage: .true [phone_number_with_country_code]\nExample: .true +919912345678");
        }

        message.reply("⏳ Searching Truecaller... please wait.");

        try {
            const search_data = {
                number: number,
                countryCode: "AUTO",
                installationId: installationId
            };

            const response = await truecallerjs.search(search_data);
            const data = response.json();

            if (!data || !data.data || data.data.length === 0) {
                return message.reply("❌ No information found for this number.");
            }

            const info = data.data[0];
            let reply = `👤 *Truecaller Search Results*\n\n`;
            reply += `📝 *Name:* ${info.name || 'N/A'}\n`;
            reply += `📞 *Number:* ${info.phones ? info.phones[0].e164Format : number}\n`;
            reply += `🌍 *Location:* ${info.addresses ? info.addresses[0].city : 'N/A'}, ${info.addresses ? info.addresses[0].countryCode : 'N/A'}\n`;
            reply += `🏢 *Carrier:* ${info.phones ? info.phones[0].carrier : 'N/A'}\n`;
            if (info.internetAddresses && info.internetAddresses.length > 0) {
                reply += `📧 *Email:* ${info.internetAddresses[0].id}\n`;
            }

            const target = message.fromMe ? message.to : message.from;
            await client.sendMessage(target, reply);
        } catch (error) {
            console.error('Truecaller Error:', error);
            await message.reply("❌ Error searching Truecaller. The installation ID might be invalid or expired.");
        }
    }
};