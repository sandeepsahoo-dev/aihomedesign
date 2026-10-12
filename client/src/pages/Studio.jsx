import { useState, useContext, useRef, useEffect } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Logo from '../components/Logo';

const EXAMPLE_PROMPTS = [
    "Ultra realistic modern house, 4K, architectural design, exterior view, natural lighting, highly detailed, professional photography style. Modern 2-floor house with garden, white theme, glass walls, luxury style, ultra realistic, 4k, architectural render",
    "Mediterranean style villa with a terracotta roof, white stucco walls, an outdoor swimming pool, and arched doorways.",
    "Contemporary Indian home designed for tropical weather, featuring a central courdyard (brahmasthan), jali work screens, and earthy terracotta tones.",
    "Cozy Scandinavian interior living room with lots of natural light, light oak wood floors, a neutral beige couch, and minimalist indoor plants."
];

const Studio = () => {
    const { user, logout } = useContext(AuthContext);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState(null); // { image, description }
    const [error, setError] = useState(null);
    
    // Auto-scroll
    const resultRef = useRef(null);

    useEffect(() => {
        if (result && resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [result]);

    const handleGenerate = async () => {
        if (!input.trim()) return;

        setIsGenerating(true);
        setResult(null);
        setError(null);

        try {
            const config = {
                headers: {
                    ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
                },
            };

            // Using our optimized single backend route that handles both image and text concurrently
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/generate-design`,
                { prompt: input },
                config
            );

            if (!data.image || !data.description) {
               throw new Error("Invalid response format from server");
            }

            setResult({
                image: data.image,
                description: data.description,
            });
            
            // Save to history automatically if logged in
            if (user?.token) {
                 await axios.post(
                    `${import.meta.env.VITE_API_URL}/history`,
                    { 
                        messages: [{ role: 'user', content: input }, { role: 'assistant', content: data.description }],
                        renders: [{ view: 'Dall-E Render', imageUrl: data.image }]
                    },
                    config
                ).catch(err => console.error('Failed to save history inline:', err));
            }

        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to connect to the AI engine. Please try again.";
            setError(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-inter">
            {/* Header */}
            <header className="p-4 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm z-10 w-full shrink-0">
                <div className="flex items-center gap-6">
                    <a href="/" className="font-bold text-xl text-slate-800 flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Logo className="w-8 h-8" />
                        AI Home Studio
                    </a>
                    <a
                        href="/pdf-upload"
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
                    >
                        📄 Upload PDF & QR Hub
                    </a>
                </div>
                <div className="flex items-center gap-4">
                    <a
                        href="/pdf-upload"
                        className="sm:hidden text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg"
                    >
                        PDF Hub
                    </a>
                    {!user && (
                        <span className="text-sm text-slate-500 font-medium hidden sm:inline-block">Login to save your designs</span>
                    )}
                    {user ? (
                        <button onClick={logout} className="text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors uppercase tracking-widest">Logout</button>
                    ) : (
                        <a href="/login" className="px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-md">Sign In</a>
                    )}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-8 flex flex-col items-center">
                
                {/* Input Card */}
                <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">Design Your Space</h2>
                    <p className="text-slate-500 mb-6">
                        Describe your dream home or room. Our AI uses GPT-4o and gpt-image-1 to instantly generate an architectural rendering and detailed layout description.
                    </p>

                    <div className="mb-4">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Design Prompt</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32 transition-all shadow-inner"
                            placeholder="e.g., A minimalist white-themed modern house exterior with large glass panels and a glowing swimming pool at dusk..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isGenerating}
                        />
                    </div>

                    {/* Example Prompts */}
                    <div className="mb-6">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Try an example</p>
                        <div className="flex flex-wrap gap-2">
                            {EXAMPLE_PROMPTS.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setInput(prompt)}
                                    disabled={isGenerating}
                                    className="text-left text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-3 py-2 rounded-lg transition-colors border border-indigo-100 max-w-[48%] truncate"
                                    title={prompt}
                                >
                                    "{prompt.substring(0, 45)}..."
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error Handling */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
                            <p className="font-bold">Error Generating Design</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !input.trim()}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex justify-center items-center gap-2 
                        \${isGenerating || !input.trim() 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 hover:-translate-y-0.5'}`}
                    >
                        {isGenerating ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Architecting Design...
                            </>
                        ) : (
                            'Generate Concept'
                        )}
                    </button>
                    {isGenerating && (
                        <p className="text-center text-xs text-slate-400 mt-3 animate-pulse">
                            Optimizing generation via Promise.all (avg ~8s)
                        </p>
                    )}
                </div>

                {/* Output Card */}
                {result && !isGenerating && (
                    <div ref={resultRef} className="w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden mb-16 animation-fade-in-up">
                        {/* Image Output (Top) */}
                        <div className="relative w-full bg-slate-100 group">
                            <img 
                                src={result.image} 
                                alt="Generated Architecture" 
                                className="w-full h-auto object-cover max-h-[600px]"
                            />
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a 
                                    href={result.image} 
                                    download="ai-design.png"
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="bg-white/90 backdrop-blur-sm text-slate-800 text-sm font-bold px-4 py-2 rounded-lg shadow-lg hover:bg-white transition-colors"
                                >
                                    ⬇ Download High-Res
                                </a>
                            </div>
                        </div>

                        {/* Description Output (Below Image) */}
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                </span>
                                Design Specifications
                            </h3>
                            <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-p:leading-relaxed">
                                <div className="whitespace-pre-wrap font-medium">
                                    {result.description}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            
            <style jsx="true">{`
                .animation-fade-in-up {
                    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Studio;
