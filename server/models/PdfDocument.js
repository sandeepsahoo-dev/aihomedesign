const mongoose = require('mongoose');

const pdfDocumentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    originalName: {
        type: String,
        required: true,
    },
    filename: {
        type: String,
        required: true,
    },
    fileSize: {
        type: Number,
        required: true,
    },
    mimeType: {
        type: String,
        default: 'application/pdf',
    },
    fileUrl: {
        type: String,
        required: true,
    },
    qrCodeUrl: {
        type: String,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('PdfDocument', pdfDocumentSchema);
