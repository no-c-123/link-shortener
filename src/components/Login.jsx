// src/components/Login.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // make sure your Supabase client is configured
import Input from '../components/uicomponents/Inputs'

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    
        // Step 1: Log in user
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
    
        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }
    
          if (data.user) {
        
            // Step 4: Redirect to dashboard
            window.location.href = '/account';
        } else {

            window.location.href = '/account';
        }
    
        setLoading(false);
    };

    return (
        <section className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-black to-gray-900 text-white px-4">
            <form onSubmit={handleLogin} className="flex flex-col gap-4 max-w-md w-full bg-zinc-800 p-8 rounded-lg">
                <h2 className="text-3xl font-bold mb-4 text-center">Login to SnapLink</h2>

                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    label='Email'
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="px-4 py-3 rounded bg-gray-700 text-white focus:outline-none"
                />

                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    label="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="px-4 py-3 rounded bg text-white focus:outline-none"
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className='w-full flex justify-center items-center'>
                    <button
                        type="submit"
                        className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-full transition flex justify-center items-center w-30"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </div>

                <p className='flex justify-center w-full items-center'>Don't have an account? <span className='ml-1'><a href="/register" className='text-purple-600 underline '> Register here</a></span></p>
            </form>
        </section>
    );
};

export default Login;