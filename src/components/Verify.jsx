import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const Verify = () => {
    const [code, setCode] = useState('');
    const [userId, setUserId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const userParam = urlParams.get('user');
        if (userParam) setUserId(userParam);
        if (!userParam) {
            setError('Invalid verification link.');
            return;
        }
    }, []);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Fetch stored code
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('two_factor_secret')
            .eq('user_id', userId)
            .single();

        if (fetchError) {
            setError(fetchError.message);
            setLoading(false);
            return;
        }

        if (profile.two_factor_secret === code) {
            // Clear the secret after successful verification
            await supabase
                .from('profiles')
                .update({ two_factor_secret: '' })
                .eq('user_id', userId);

            // Redirect to dashboard
            window.location.href = '/account';
        } else {
            setError('Invalid verification code.');
        }

        setLoading(false);
    };

    return (
        <section className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-black to-gray-900 text-white px-4">
            <form onSubmit={handleVerify} className="flex flex-col gap-4 max-w-md w-full bg-zinc-800 p-8 rounded-lg">
                <h2 className="text-3xl font-bold mb-4 text-center">Two-Factor Verification</h2>

                <input
                    type="text"
                    placeholder="Enter 2FA Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="px-4 py-3 rounded bg-gray-700 text-white focus:outline-none"
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    type="submit"
                    className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-full transition flex justify-center items-center"
                    disabled={loading}
                >
                    {loading ? 'Verifying...' : 'Verify Code'}
                </button>
            </form>
        </section>
    );
};

export default Verify;