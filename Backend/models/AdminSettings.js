const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
    totalCustomers: {
        type: Number,
        default: 1240
    },
    ordersPending: {
        type: Number,
        default: 24
    },
    totalRevenue: {
        type: Number,
        default: 30000
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure only one settings document exists
adminSettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);