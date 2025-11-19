import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Input from './uicomponents/Inputs';
import PasswordStrength from './PasswordStrength';

const RegisterForm = () => {
    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
    
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
    
        setLoading(true);
    
        // Step 1: Register user
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name: name.trim(), lastname: lastname.trim() }, // optional user metadata
            },
        });
    
        if (error) {
            console.error(error);
            setError(error.message);
            setLoading(false);
            return;
        }
    
        // Step 2: Insert profile
        const userId = data.user?.id;
    
        if (userId) {
            const { error: insertError } = await supabase.from('profiles').insert({
                user_id: userId,
                two_factor_enabled: false,
                two_factor_secret: null,
            });
    
            if (insertError) {
                console.error(insertError);
                setError(insertError.message);
                setLoading(false);
                return;
            }
    
            // Step 3: Redirect to login
            window.location.href = '/login';
        } else {
            setError('User ID not found during registration.');
        }
    
        setLoading(false);
    };

    return (
        <section className="min-h-screen flex justify-center items-center bg-gradient-to-br from-black to-gray-900 px-4">
            <a href="/" className="absolute top-4 left-4 text-purple-400 hover:text-purple-300 underline text-sm">
                ← Back to Home
            </a>
            <form
                onSubmit={handleRegister}
                className="bg-zinc-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center"
            >
                <h2 className="text-3xl font-bold mb-6 text-white">Register for SnapLink</h2>

                <div className="space-y-6 mb-6">
                    <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name"
                        label="Name"
                    />
                    <Input
                        type="text"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        placeholder="Lastname"
                        label="Last name"
                    />
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        label="Email"
                    />
                    <div>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            label="Password"
                        />
                        <PasswordStrength password={password} />
                    </div>
                    <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        label="Confirm Password"
                    />
                </div>

                {error && <p className="text-red-500 mb-4">{error}</p>}

                <button
                    type="submit"
                    className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 mb-4 rounded-full transition w-full"
                    disabled={loading}
                >
                    {loading ? 'Registering...' : 'Register'}
                </button>

                <p className="flex justify-center w-full items-center text-white">
                    Already have an account? <span className="ml-1"><a href="/login" className="text-purple-600 underline">Login here</a></span>
                </p>
            </form>
        </section>
    );
};

export default RegisterForm;