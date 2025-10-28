import { Link } from 'react-scroll';
import { supabase } from '../lib/supabaseClient'
import { useEffect, useState } from 'react';

export default function NavBar() {
    const navLinks = [
        { name: 'Main', to: 'hero' },       // ID of the Hero section
        { name: 'About', to: 'about' },   // ID of the About section
        { name: 'Pricing', to: 'pricing' },   // ID of the Pricing section
    ];

    const [user, setUser] = useState(null);

    useEffect(() => {
        const getSession = async () => {
            const {data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
            }
        };

        getSession()

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                setUser(session.user);
            } else {
                setUser(null);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);


    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        window.location.href = '/'
    }



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
                {user ? (
                    <button 
                        className='bg-white text-black w-26 h-10 rounded-[30px] hover:bg-gray-300 duration-300 transition'
                        onClick={() => window.location.href = '/account'}
                    >
                        Account
                    </button>
                ): (
                    <a 
                        href='/login'
                        className="cursor-pointer relative inline-flex items-center gap-2 text-black font-medium px-4 py-2 rounded-full bg-white hover:bg-gray-400 transition duration-300"
                    >
                        
                        Login
                    </a>
                )}
            </nav>
        </header>
    );
}