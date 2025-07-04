const Footer = () => {
    return (
        <footer className="bg-zinc-900 text-gray-400 py-10 px-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                {/* Branding */}
                <div className="text-center md:text-left">
                    <h3 className="text-white text-xl font-bold mb-2"><img className='w-30 h-auto m-[-20px]' src="/SnapLink-Logo.png" alt="" /></h3>
                    <p className="text-sm">Simple, fast, and reliable link shortening.</p>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-wrap justify-center gap-6">
                    <a href="/" className="hover:text-purple-400 transition">Home</a>
                    <a href="/about" className="hover:text-purple-400 transition">About</a>
                    <a href="/pricing" className="hover:text-purple-400 transition">Pricing</a>
                    <a href="/login" className="hover:text-purple-400 transition">Login</a>
                    <a href="/register" className="hover:text-purple-400 transition">Register</a>
                </div>

                {/* Legal Links */}
                <div className="flex flex-wrap justify-center gap-6">
                    <a href="/privacy" className="hover:text-purple-400 transition">Privacy Policy</a>
                    <a href="/terms" className="hover:text-purple-400 transition">Terms of Service</a>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-500">
                <p>© 2025 SnapLink. All rights reserved.</p>
                <p className="mt-1">Built by Hector Leal</p>
            </div>
        </footer>
    );
};

export default Footer;