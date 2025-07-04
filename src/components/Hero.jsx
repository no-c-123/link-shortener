import { useState } from "react";

const Hero = () => {
    const [link, setLink] = useState("");
    const [shortenedLink, setShortenedLink] = useState("");

    const exampleLinks = [
        { name: "GitHub", url: "https://github.com/no-c-123" },
        { name: "Portfolio", url: "https://portfolio-seven-green-92.vercel.app/" },
        { name: "LinkedIn", url: "https://www.linkedin.com/in/h%C3%A9ctor-emiliano-leal-prieto-b581a92b1/" },
    ];

    const handleShorten = async () => {
        if (!link) return;
    
        try {
            const response = await fetch('https://link-shortener-backend-production.up.railway.app/shorten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ originalUrl: link }),
            });
    
            const data = await response.json();
            setShortenedLink(data.shortUrl);
    
            // ✅ Remove automatic opening
        } catch (error) {
            console.error('Error shortening link:', error);
        }
    };

    const handleExampleClick = (url) => {
        // Paste the example link inside the input
        setLink(url);
    };

    return (
        <section className="h-screen flex flex-col justify-center items-center text-center bg-gradient-to-br from-black to-gray-900 text-white px-4">
            <h1 className="text-6xl md:text-8xl font-bold mb-6">SnapLink</h1>
            <p className="text-lg md:text-2xl mb-8 max-w-2xl">
                Shorten your links. Share instantly. Snap it now with style.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-xl mb-8">
                <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="Paste your link here..."
                    className="w-full px-4 py-3 rounded-full focus:outline-none text-white border border-white bg-transparent"
                />
                <button
                    onClick={handleShorten}
                    className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-full transition"
                >
                    Shorten
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
                <div className="mt-6 bg-gray-800 px-4 py-2 rounded-full text-purple-400 select-all">
                    <a href={shortenedLink} target="_blank" rel="noopener noreferrer">
                        {shortenedLink}
                    </a>
                </div>
            )}
        </section>
    );
};

export default Hero;