import { useState, useRef } from "react";
import '../styles/Hero-transitions.css'

const Hero = () => {
    const [link, setLink] = useState("");
    const [shortenedLink, setShortenedLink] = useState("");
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    const [previewData, setPreviewData] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const [showStatsModal, setShowStatsModal] = useState(false);

    const exampleLinks = [
        { name: "GitHub", url: "https://github.com/no-c-123" },
        { name: "Portfolio", url: "https://portfolio-seven-green-92.vercel.app/" },
        { name: "LinkedIn", url: "https://www.linkedin.com/in/h%C3%A9ctor-emiliano-leal-prieto-b581a92b1/" },
    ];

    const handleShorten = async () => {
        if (!link) return;
        setLoading(true);
        setShortenedLink("");
        setCopied(false);
        setPreviewData(null);

        try {
            const response = await fetch('https://link-shortener-backend-production.up.railway.app/shorten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ originalUrl: link }),
            });

            const data = await response.json();

            if (response.ok) {
                setShortenedLink(data.shortUrl);

                // Fetch preview info
                const code = data.shortUrl.split("/").pop();
                const previewRes = await fetch(`https://link-shortener-backend-production.up.railway.app/info/${code}`);
                const previewJson = await previewRes.json();
                setPreviewData(previewJson);
            } else {
                console.error("Shorten failed:", data);
            }
        } catch (error) {
            console.error('Error shortening link:', error);
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

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-xl mb-8">
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
                    className={`px-6 py-3 rounded-full transition ${
                        loading ? "bg-gray-600" : "bg-purple-700 hover:bg-purple-800"
                    }`}
                >
                    {loading ? "Shortening..." : "Shorten"}
                </button>
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
            
        </section>

    );
};

export default Hero;