// ============================================================
// controllers/messageController.js
// ============================================================
const { messages, uuidv4 } = require('../data/db');

const sendMessage = (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message)
        return res.status(400).json({ message: 'Name, email and message are required.' });

    const newMsg = {
        id: uuidv4(),
        name,
        email,
        subject: subject || 'General Enquiry',
        message,
        read: false,
        createdAt: new Date().toISOString()
    };
    messages.push(newMsg);
    res.status(201).json({ message: 'Message sent successfully!', data: newMsg });
};

const getMessages = (req, res) => res.json(messages);

const markRead = (req, res) => {
    const msg = messages.find(m => m.id === req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found.' });
    msg.read = true;
    res.json({ message: 'Marked as read.', data: msg });
};

const deleteMessage = (req, res) => {
    const idx = messages.findIndex(m => m.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Message not found.' });
    messages.splice(idx, 1);
    res.json({ message: 'Message deleted.' });
};

module.exports = { sendMessage, getMessages, markRead, deleteMessage };
