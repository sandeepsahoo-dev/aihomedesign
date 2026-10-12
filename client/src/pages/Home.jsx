import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const Home = () => {
    return (
        <div className="relative min-h-screen bg-slate-900 overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
                <Logo className="w-32 h-32 mb-8 drop-shadow-2xl animate-fade-in" />
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                    Architect Your Dream with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">AI</span>
                </h1>
                <p className="max-w-2xl text-lg md:text-xl text-slate-400 mb-10">
                    The world's first conversational AI architect. Generate blueprints, high-fidelity renders, and color palettes in minutes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/studio"
                        className="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                    >
                        Start Building
                    </Link>
                    <Link
                        to="/pdf-upload"
                        className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all shadow-xl shadow-indigo-500/20"
                    >
                        📄 Upload PDF & QR
                    </Link>
                    <Link
                        to="/login"
                        className="px-8 py-4 text-lg font-semibold text-slate-200 bg-slate-800 rounded-full hover:bg-slate-700 transition-all border border-slate-700"
                    >
                        Sign In
                    </Link>
                </div>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl w-full">
                    {[
                        { title: 'Conversational UI', desc: 'No complex tools. Just tell the AI what you want.' },
                        { title: 'Instant Blueprints', desc: 'Generate accurate 2D layouts in seconds.' },
                        { title: '3D AI Rendering', desc: 'See your future home with photorealistic visuals.' },
                        { title: 'PDF & QR Share', desc: 'Upload documents and get instant shareable links and QR codes.' }
                    ].map((feature, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                            <p className="text-slate-400">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
