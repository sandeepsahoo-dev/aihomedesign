import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, FileText, QrCode, Copy, Check, ExternalLink, Trash2, Download, RefreshCw, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';

const PdfUploader = ({ token }) => {
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [latestDoc, setLatestDoc] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [copiedId, setCopiedId] = useState(null);
    const [error, setError] = useState(null);
    const [previewQr, setPreviewQr] = useState(null);
    const fileInputRef = useRef(null);

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    // Base URL for uploads / links
    const serverUrl = apiBaseUrl.replace(/\/api\/?$/, '');

    const fetchDocuments = async () => {
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const res = await axios.get(`${apiBaseUrl}/pdf`, config);
            if (res.data?.documents) {
                setDocuments(res.data.documents);
            }
        } catch (err) {
            console.error('Failed to load documents:', err);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [token]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (selectedFile) => {
        setError(null);
        if (!selectedFile) return;

        if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
            setError('Only PDF documents are allowed.');
            return;
        }

        if (selectedFile.size > 30 * 1024 * 1024) {
            setError('File size must be less than 30MB.');
            return;
        }

        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);
        setError(null);

        const formData = new FormData();
        formData.append('pdf', file);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                }
            };

            const res = await axios.post(`${apiBaseUrl}/pdf/upload`, formData, config);
            if (res.data && res.data.document) {
                const doc = res.data.document;
                
                // If server didn't generate qrCodeUrl or for fast client guarantee:
                if (!doc.qrCodeUrl) {
                    try {
                        doc.qrCodeUrl = await QRCode.toDataURL(doc.fileUrl, { margin: 2, scale: 8 });
                    } catch (e) {
                        console.error(e);
                    }
                }

                setLatestDoc(doc);
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                fetchDocuments();
            }
        } catch (err) {
            console.error('Upload failed:', err);
            setError(err.response?.data?.message || 'Failed to upload PDF. Please check server connection.');
        } finally {
            setUploading(false);
        }
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2500);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this PDF?')) return;
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            await axios.delete(`${apiBaseUrl}/pdf/${id}`, config);
            if (latestDoc?._id === id) {
                setLatestDoc(null);
            }
            fetchDocuments();
        } catch (err) {
            console.error('Failed to delete document:', err);
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const downloadQr = (dataUrl, filename) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${filename || 'document'}-qr.png`;
        link.click();
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 font-inter">
            {/* Header section */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="relative z-10">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-md mb-3">
                        <FileText className="w-3.5 h-3.5" /> PDF Sharing Hub
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        Upload PDF, Generate Share Link & QR Code
                    </h2>
                    <p className="text-blue-100 text-sm sm:text-base mt-2 max-w-2xl">
                        Upload your architectural drawings, blueprints, project estimates, or specifications. Instantly get an accessible direct link and a scannable QR code to share with clients and contractors.
                    </p>
                </div>
            </div>

            {/* Upload Box */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                        dragActive
                            ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                            : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                        className="hidden"
                    />

                    <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 shadow-inner">
                        <UploadCloud className="w-8 h-8" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                        {file ? file.name : 'Click to upload or drag & drop PDF'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                        {file
                            ? `Selected: ${formatBytes(file.size)} • Click or drop another to replace`
                            : 'Architectural blueprints, site plans, house estimates, specifications (PDF up to 30MB)'}
                    </p>

                    {file && (
                        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                            <FileText className="w-4 h-4" /> Ready to upload
                        </div>
                    )}
                </div>

                {/* Error message */}
                {error && (
                    <div className="mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Progress bar */}
                {uploading && (
                    <div className="mt-6 space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-600">
                            <span>Uploading document...</span>
                            <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-200"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                            !file || uploading
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 hover:-translate-y-0.5 active:translate-y-0'
                        }`}
                    >
                        {uploading ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" /> Uploading & Generating QR...
                            </>
                        ) : (
                            <>
                                <UploadCloud className="w-4 h-4" /> Upload & Generate QR Code
                            </>
                        )}
                    </button>
                    {file && !uploading && (
                        <button
                            onClick={() => {
                                setFile(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="py-3.5 px-6 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* Latest Upload Result Card */}
            {latestDoc && (
                <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-6 sm:p-8 animation-fade-in-up">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                        <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                            <Check className="w-5 h-5" />
                        </span>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Upload Successful!</h3>
                            <p className="text-xs text-slate-500">Your PDF is live and ready to be shared</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        {/* QR Code Column */}
                        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
                            {latestDoc.qrCodeUrl ? (
                                <>
                                    <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-100">
                                        <img
                                            src={latestDoc.qrCodeUrl}
                                            alt="PDF QR Code"
                                            className="w-44 h-44 object-contain rounded-lg"
                                        />
                                    </div>
                                    <button
                                        onClick={() => downloadQr(latestDoc.qrCodeUrl, latestDoc.originalName)}
                                        className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" /> Download QR Code PNG
                                    </button>
                                </>
                            ) : (
                                <div className="text-slate-400 text-xs text-center py-10">QR Code not available</div>
                            )}
                        </div>

                        {/* Details and Links Column */}
                        <div className="md:col-span-2 space-y-5">
                            <div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Document</span>
                                <h4 className="text-lg font-bold text-slate-900 break-all">{latestDoc.originalName}</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Size: {formatBytes(latestDoc.fileSize)}</p>
                            </div>

                            {/* Shareable URL */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                                    Direct Shareable Link
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={latestDoc.fileUrl}
                                        className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-sm px-4 py-2.5 rounded-xl font-mono focus:outline-none"
                                    />
                                    <button
                                        onClick={() => handleCopy(latestDoc.fileUrl, 'latest-url')}
                                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm flex items-center gap-1.5 transition-colors shadow-md shadow-blue-500/20"
                                    >
                                        {copiedId === 'latest-url' ? (
                                            <>
                                                <Check className="w-4 h-4" /> Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" /> Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Quick open links */}
                            <div className="flex flex-wrap gap-3 pt-2">
                                <a
                                    href={latestDoc.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-md"
                                >
                                    <ExternalLink className="w-4 h-4" /> Open PDF in Browser
                                </a>
                                <a
                                    href={latestDoc.fileUrl}
                                    download={latestDoc.originalName}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors"
                                >
                                    <Download className="w-4 h-4" /> Download PDF
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Document History & Management */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-extrabold text-slate-900">Uploaded Documents ({documents.length})</h3>
                        <p className="text-xs text-slate-500">Access and share your previously uploaded PDFs</p>
                    </div>
                    <button
                        onClick={fetchDocuments}
                        title="Refresh"
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                {documents.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                        <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-semibold">No PDF documents uploaded yet</p>
                        <p className="text-xs text-slate-400 mt-1">Upload a PDF blueprint or document above to generate QR and link</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {documents.map((doc) => (
                            <div
                                key={doc._id}
                                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 p-3 rounded-2xl transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="truncate">
                                        <h4 className="text-sm font-bold text-slate-800 truncate" title={doc.originalName}>
                                            {doc.originalName}
                                        </h4>
                                        <p className="text-xs text-slate-400">
                                            {formatBytes(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                                    {/* QR Modal Trigger */}
                                    {doc.qrCodeUrl && (
                                        <button
                                            onClick={() => setPreviewQr(doc)}
                                            title="View QR Code"
                                            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                                        >
                                            <QrCode className="w-3.5 h-3.5" /> QR Code
                                        </button>
                                    )}

                                    {/* Copy Link */}
                                    <button
                                        onClick={() => handleCopy(doc.fileUrl, doc._id)}
                                        title="Copy Link"
                                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                                    >
                                        {copiedId === doc._id ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" /> Link
                                            </>
                                        )}
                                    </button>

                                    {/* Open PDF */}
                                    <a
                                        href={doc.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Open PDF"
                                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>

                                    {/* Delete */}
                                    <button
                                        onClick={() => handleDelete(doc._id)}
                                        title="Delete"
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* QR Code Modal */}
            {previewQr && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animation-fade-in-up text-center">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Scannable QR</span>
                            <button
                                onClick={() => setPreviewQr(null)}
                                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 inline-block mb-4">
                            <img
                                src={previewQr.qrCodeUrl}
                                alt="QR Code"
                                className="w-56 h-56 object-contain rounded-lg shadow-sm"
                            />
                        </div>

                        <h4 className="text-sm font-bold text-slate-800 truncate mb-1" title={previewQr.originalName}>
                            {previewQr.originalName}
                        </h4>
                        <p className="text-xs text-slate-500 mb-6">Scan with any phone camera to view or download</p>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => downloadQr(previewQr.qrCodeUrl, previewQr.originalName)}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                            >
                                <Download className="w-4 h-4" /> Download QR Image
                            </button>
                            <button
                                onClick={() => handleCopy(previewQr.fileUrl, 'modal')}
                                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                            >
                                {copiedId === 'modal' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                Copy Direct Link
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PdfUploader;
