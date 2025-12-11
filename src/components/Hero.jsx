import { useState, useRef } from "react";
import '../styles/Hero-transitions.css'
import { supabase } from '../lib/supabaseClient'
import { QRCodeSVG } from 'qrcode.react';

const Hero = () => {
    const [link, setLink] = useState("");
    const [shortenedLink, setShortenedLink] = useState("");
    const [customCode, setCustomCode] = useState("");
    const [showCustomCode, setShowCustomCode] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showQR, setShowQR] = useState(false);
    const inputRef = useRef(null);

    const [previewData, setPreviewData] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const [showStatsModal, setShowStatsModal] = useState(false);

    const exampleLinks = [
        { name: "My GitHub", url: "https://github.com/no-c-123" },
        { name: "My Portfolio", url: "https://portfolio-seven-green-92.vercel.app/" },
        { name: "LinkedIn", url: "https://www.linkedin.com/in/h%C3%A9ctor-emiliano-leal-prieto-b581a92b1/" },
    ];

    const handleShorten = async () => {
        if (!link) {
            setError("Please enter a URL");
            return;
        }
        
        // Auto-add https:// if no protocol is specified
        let urlToShorten = link.trim();
        if (!urlToShorten.match(/^https?:\/\//i)) {
            urlToShorten = 'https://' + urlToShorten;
        }
        
        setLoading(true);
        setShortenedLink("");
        setCopied(false);
        setPreviewData(null);
        setError("");

        try {
            const { data : { session } } = await supabase.auth.getSession();

            const backendUrl = import.meta.env.PUBLIC_BACKEND_URL || 'https://link-shortener-backend-production.up.railway.app';
            const response = await fetch(`${backendUrl}/shorten`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
                },
                body: JSON.stringify({ 
                    originalUrl: urlToShorten,
                    customCode: customCode.trim() || undefined
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setShortenedLink(data.shortUrl);
                setCustomCode("");

                // Fetch preview info
                const code = data.shortUrl.split("/").pop();
                const previewRes = await fetch(`${backendUrl}/info/${code}`);
                const previewJson = await previewRes.json();
                setPreviewData(previewJson);
            } else {
                setError(data.error || data.details || "Failed to shorten link");
            }
        } catch (error) {
            console.error('Error shortening link:', error);
            setError("Network error. Please try again.");
        }

        setLoading(false);
    };

    const handleExampleClick = (url) => {
        setLink(url);
        inputRef.current?.focus();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shortenedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleShorten();
    };

    return (
        <section className="h-screen flex flex-col justify-center items-center text-center bg-gradient-to-br from-black to-gray-900 text-white px-4">
            <h1 className="text-6xl md:text-8xl font-bold mb-6">SnapLink</h1>
            <p className="text-lg md:text-2xl mb-8 max-w-2xl">
                Shorten your links. Share instantly. Snap it now with style.
            </p>

            <div className="flex flex-col items-center gap-4 w-full max-w-xl mb-8">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                    <input
                        ref={inputRef}
                        type="text"
                        value={link}
                        autoFocus
                        onChange={(e) => setLink(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Paste your link here..."
                        className="w-full px-4 py-3 rounded-full focus:outline-none text-white border border-white bg-transparent"
                    />
                    <button
                        onClick={handleShorten}
                        disabled={loading}
                        className={`px-6 py-3 rounded-full transition whitespace-nowrap ${
                            loading ? "bg-gray-600" : "bg-purple-700 hover:bg-purple-800"
                        }`}
                    >
                        {loading ? "Shortening..." : "Shorten"}
                    </button>
                </div>
                <div className="w-full flex items-center gap-2">
                    <button
                        onClick={() => setShowCustomCode(!showCustomCode)}
                        className="text-sm text-purple-400 hover:text-purple-300 underline"
                    >
                        {showCustomCode ? "Hide" : "Add"} custom code
                    </button>
                </div>
                {showCustomCode && (
                    <div className="w-full">
                        <input
                            type="text"
                            value={customCode}
                            onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                            placeholder="Custom code (optional, letters, numbers, hyphens only)"
                            className="w-full px-4 py-2 rounded-full focus:outline-none text-white border border-purple-500 bg-transparent text-sm"
                            maxLength={20}
                        />
                        <p className="text-xs text-gray-400 mt-1">Leave empty for auto-generated code</p>
                    </div>
                )}
                {error && (
                    <div className="w-full bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded-full text-sm">
                        {error}
                    </div>
                )}
            </div>

            <p className="text-gray-400 mb-4">Here are some example links you can try:</p>
            <div className="flex gap-4 mb-6">
                {exampleLinks.map((example, index) => (
                    <button
                        key={index}
                        onClick={() => handleExampleClick(example.url)}
                        className="bg-zinc-800 hover:bg-purple-700 px-4 py-2 rounded-full text-sm transition"
                    >
                        {example.name}
                    </button>
                ))}
            </div>

            {shortenedLink && (
                <div
                    className="relative group mt-6 flex items-center bg-gray-800 px-4 py-2 rounded-full text-purple-400"
                    onMouseEnter={() => setShowPreview(true)}
                    onMouseLeave={() => setShowPreview(false)}
                >
                    <a
                        href={shortenedLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate max-w-[220px] sm:max-w-xs mr-4"
                    >
                        {shortenedLink}
                    </a>
                    <button
                        onClick={handleCopy}
                        className="text-sm bg-purple-700 hover:bg-purple-800 px-3 py-1 rounded-full text-white"
                    >
                        {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                        onClick={() => setShowQR(!showQR)}
                        className="ml-2 text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded-full text-white"
                    >
                        {showQR ? "Hide QR" : "Show QR"}
                    </button>
                    <div
                    className="relative"
                    style={{ viewTransitionName: "stats" }}
                    >
                    {showStatsModal ? (
                        <div
                        className="absolute top-0 left-0 z-50 w-[300px] sm:w-[360px] bg-white text-black rounded-xl shadow-xl p-6 transition-all duration-300"
                        onClick={(e) => e.stopPropagation()}
                        >
                        <button
                            onClick={() => {
                            if (document.startViewTransition) {
                                document.startViewTransition(() => setShowStatsModal(false));
                            } else {
                                setShowStatsModal(false);
                            }
                            }}
                            className="absolute top-3 right-4 text-gray-500 hover:text-black text-lg"
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl font-bold mb-4">📊 Link Stats</h2>
                        {previewData ? (
                            <div className="text-sm space-y-2">
                            <p><strong>Destination:</strong><br />{previewData.original}</p>
                            <p><strong>Created:</strong><br />{new Date(previewData.created_at).toLocaleString()}</p>
                            <p><strong>Short code:</strong> {previewData.code}</p>
                            <p><strong>Clicks:</strong> {previewData.click_count ?? 0}</p>
                            </div>
                        ) : (
                            <p>Loading preview data...</p>
                        )}
                        </div>
                    ) : (
                        <button
                        onClick={() => {
                            if (document.startViewTransition) {
                            document.startViewTransition(() => setShowStatsModal(true));
                            } else {
                            setShowStatsModal(true);
                            }
                        }}
                        className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-700 text-white hover:bg-purple-700"
                        >
                        📊 Stats
                        </button>
                    )}
                    </div>

                    {showPreview && previewData && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white text-black rounded-lg shadow-md p-4 w-64 text-left z-50">
                            <p className="text-sm">
                                <strong>Destination:</strong><br />
                                {previewData.original}
                            </p>
                            <p className="text-xs mt-2 text-gray-600">
                                Created: {new Date(previewData.created_at).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {showQR && shortenedLink && (
                <div className="mt-6 bg-white p-6 rounded-lg inline-block">
                    <QRCodeSVG value={shortenedLink} size={200} level="H" />
                    <p className="text-black text-sm mt-2 text-center">Scan to visit link</p>
                </div>
            )}
            
        </section>

    );
};

export default Hero;