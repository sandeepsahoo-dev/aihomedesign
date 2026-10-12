const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const asyncHandler = require('../middleware/asyncHandler');
const PdfDocument = require('../models/PdfDocument');

// Upload PDF and generate QR Code + Shareable Link
const uploadPdf = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please select a valid PDF file to upload' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/pdfs/${req.file.filename}`;

    // Generate base64 Data URL QR Code
    let qrCodeUrl = '';
    try {
        qrCodeUrl = await QRCode.toDataURL(fileUrl, {
            errorCorrectionLevel: 'H',
            margin: 2,
            scale: 8,
            color: {
                dark: '#0f172a',
                light: '#ffffff'
            }
        });
    } catch (qrErr) {
        console.error('QR generation error:', qrErr);
    }

    // Save to database
    const pdfDoc = await PdfDocument.create({
        user: req.user ? req.user._id : null,
        originalName: req.file.originalname,
        filename: req.file.filename,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        fileUrl,
        qrCodeUrl
    });

    res.status(201).json({
        success: true,
        message: 'PDF uploaded successfully',
        document: pdfDoc
    });
});

// Get all uploaded PDFs (optionally filtered by user if authenticated)
const getUploadedPdfs = asyncHandler(async (req, res) => {
    const filter = req.user ? { user: req.user._id } : {};
    const documents = await PdfDocument.find(filter).sort({ createdAt: -1 });

    res.json({
        success: true,
        documents
    });
});

// Delete a PDF
const deletePdf = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pdfDoc = await PdfDocument.findById(id);

    if (!pdfDoc) {
        return res.status(404).json({ message: 'Document not found' });
    }

    // Remove file from disk
    const filePath = path.join(__dirname, '../uploads/pdfs', pdfDoc.filename);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (e) {
            console.error('Failed to delete physical file:', e);
        }
    }

    await pdfDoc.deleteOne();

    res.json({
        success: true,
        message: 'PDF deleted successfully'
    });
});

module.exports = {
    uploadPdf,
    getUploadedPdfs,
    deletePdf
};
