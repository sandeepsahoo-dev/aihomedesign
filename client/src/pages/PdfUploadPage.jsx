import { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Logo from '../components/Logo';
import PdfUploader from '../components/PdfUploader';

const PdfUploadPage = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-inter">
            {/* Header */}
            <header className="p-4 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm z-10 w-full shrink-0">
                <div className="flex items-center gap-6">
                    <Link to="/" className="font-bold text-xl text-slate-800 flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Logo className="w-8 h-8" />
                        AI Home Studio
                    </Link>
                    <nav className="hidden sm:flex items-center gap-2 text-sm font-semibold">
                        <Link to="/studio" className="px-3 py-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors">
                            AI Designer
                        </Link>
                        <Link to="/pdf-upload" className="px-3 py-1.5 text-blue-600 bg-blue-50 rounded-lg transition-colors">
                            PDF Hub & QR
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-slate-600 hidden md:inline-block">
                                {user.name || user.email}
                            </span>
                            <button
                                onClick={logout}
                                className="text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors uppercase tracking-widest"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-md"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-8">
                <PdfUploader token={user?.token} />
            </main>
        </div>
    );
};

export default PdfUploadPage;
