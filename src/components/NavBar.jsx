import { Link } from 'react-scroll';

export default function NavBar() {
    const navLinks = [
        { name: 'Inicio', to: 'hero' },       // ID of the Hero section
        { name: 'Acerca de', to: 'about' },   // ID of the About section
        { name: 'Precios', to: 'pricing' },   // ID of the Pricing section
    ];

    return (
        <header className="fixed top-0 left-0 w-full h-[10vh] z-50 bg-black/30 backdrop-blur-sm shadow-md">
            <nav className="w-full h-full max-w-7xl mx-auto px-6 flex justify-between items-center">
                <h1 className="text-white font-bold text-xl tracking-widest">SNAPLINK</h1>
                <div className="flex gap-6">
                    {navLinks.map((link, index) => (
                        <Link
                            key={index}
                            to={link.to}
                            smooth={true}
                            duration={600}
                            offset={-50}
                            className="cursor-pointer relative inline-flex items-center gap-2 text-white font-medium px-4 py-2 rounded-full bg-zinc-800 hover:bg-purple-700 transition duration-300"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </nav>
        </header>
    );
}