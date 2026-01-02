const fs = require('fs');
const path = require('path');

/**
 * Utility to check if a user is an authorized admin.
 * Pulls from OWNER_NUMBER env var (comma separated).
 */
function isAdmin(client, message) {
    const ownerNumbers = (process.env.OWNER_NUMBER || '917012984372,190443681788158').split(',').map(num => num.trim());
    const senderId = message.author || message.from;
    const cleanSender = senderId.split('@')[0].split(':')[0];
    
    // Always true if it's the bot itself sending
    if (message.fromMe) return true;
    
    return ownerNumbers.some(owner => cleanSender.includes(owner) || owner.includes(cleanSender));
}

module.exports = { isAdmin };