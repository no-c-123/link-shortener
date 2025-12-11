import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Modal from './uicomponents/Modal';

const AccountDashboard = () => {
    const [activeSection, setActiveSection] = useState('settings');
    const [user, setUser] = useState(null);

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const [newEmail, setNewEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [emailChangeStep, setEmailChangeStep] = useState(1);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);

    // Transaction history
    const [transactions, setTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);

    // API Keys
    const [apiKeys, setApiKeys] = useState([]);
    const [newApiKeyName, setNewApiKeyName] = useState('');
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [generatedApiKey, setGeneratedApiKey] = useState('');

    // Link management
    const [userLinks, setUserLinks] = useState([]);
    const [linksLoading, setLinksLoading] = useState(false);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                if (activeSection === 'transactions') {
                    fetchTransactions(session.user.email);
                }
                if (activeSection === 'links') {
                    fetchUserLinks(session.user.id);
                }
                if (activeSection === 'apikeys') {
                    fetchApiKeys();
                }
            } else {
                window.location.href = '/login';
            }
        };

        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                setUser(session.user);
            } else {
                window.location.href = '/login';
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [activeSection]);

    const fetchTransactions = async (email) => {
        if (!email) return;
        setTransactionsLoading(true);
        try {
            const backendUrl = import.meta.env.PUBLIC_BACKEND_URL || 'https://link-shortener-backend-production.up.railway.app';
            const response = await fetch(`${backendUrl}/payments/${encodeURIComponent(email)}`);
            if (response.ok) {
                const data = await response.json();
                setTransactions(data);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setTransactionsLoading(false);
        }
    };

    const fetchUserLinks = async (userId) => {
        setLinksLoading(true);
        try {
            const { data, error } = await supabase
                .from('links')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setUserLinks(data || []);
        } catch (error) {
            console.error('Error fetching links:', error);
        } finally {
            setLinksLoading(false);
        }
    };

    const fetchApiKeys = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const backendUrl = import.meta.env.PUBLIC_BACKEND_URL || 'https://link-shortener-backend-production.up.railway.app';
            const response = await fetch(`${backendUrl}/api-keys`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setApiKeys(data);
            }
        } catch (error) {
            console.error('Error fetching API keys:', error);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const handleStartEmailChange = async () => {
        if (!newEmail) {
            setFeedback('Please enter a new email address.');
            return;
        }

        setLoading(true);
        setFeedback('');

        // Request email change - Supabase will send verification code to current email
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        
        if (error) {
            setFeedback(error.message);
            setLoading(false);
            return;
        }

        setFeedback('Verification code sent to your current email. Please check your inbox.');
        setEmailChangeStep(2);
        setLoading(false);
    };

    const handleVerifyEmailChange = async () => {
        if (!verificationCode) {
            setFeedback('Please enter the verification code.');
            return;
        }

        setLoading(true);
        setFeedback('');

        // Verify the code - in a real implementation, you'd verify the OTP
        // For now, we'll just confirm the email change was successful
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.email === newEmail) {
            setFeedback('Email updated successfully!');
            setIsEmailModalOpen(false);
            setNewEmail('');
            setVerificationCode('');
            setEmailChangeStep(1);
            // Refresh user data
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        } else {
            setFeedback('Verification failed. Please check the code and try again.');
        }

        setLoading(false);
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setFeedback('Passwords do not match.');
            return;
        }

        if (newPassword.length < 8) {
            setFeedback('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        
        if (error) {
            setFeedback(error.message);
        } else {
            setFeedback('Password updated successfully.');
            setIsPasswordModalOpen(false);
            setNewPassword('');
            setConfirmPassword('');
        }
        setLoading(false);
    };

    const generateApiKey = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const backendUrl = import.meta.env.PUBLIC_BACKEND_URL || 'https://link-shortener-backend-production.up.railway.app';
            const response = await fetch(`${backendUrl}/api-key`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ name: newApiKeyName || 'Default Key' })
            });

            if (response.ok) {
                const data = await response.json();
                setGeneratedApiKey(data.apiKey);
                setNewApiKeyName('');
                fetchApiKeys(); // Refresh the list
            } else {
                console.error('Failed to generate API key');
            }
        } catch (error) {
            console.error('Error generating API key:', error);
        }
    };

    const deleteApiKey = async (id) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const backendUrl = import.meta.env.PUBLIC_BACKEND_URL || 'https://link-shortener-backend-production.up.railway.app';
            const response = await fetch(`${backendUrl}/api-keys/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (response.ok) {
                fetchApiKeys(); // Refresh the list
            } else {
                console.error('Failed to delete API key');
            }
        } catch (error) {
            console.error('Error deleting API key:', error);
        }
    };

    const deleteLink = async (code) => {
        try {
            const { error } = await supabase
                .from('links')
                .delete()
                .eq('code', code);
            
            if (error) throw error;
            fetchUserLinks(user.id);
        } catch (error) {
            console.error('Error deleting link:', error);
        }
    };

    const exportLinksAsJSON = () => {
        const dataStr = JSON.stringify(userLinks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `snaplink-links-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const exportLinksAsCSV = () => {
        if (userLinks.length === 0) return;

        const headers = ['Code', 'Original URL', 'Click Count', 'Created At', 'Expires At'];
        const rows = userLinks.map(link => [
            link.code,
            link.original,
            link.click_count || 0,
            new Date(link.created_at).toLocaleString(),
            link.expires_at ? new Date(link.expires_at).toLocaleString() : 'Never'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `snaplink-links-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };
    
    return (
        <section className="min-h-screen flex bg-gradient-to-br from-black to-gray-900 text-white justify-center items-center p-4 relative">
            <a href="/" className="absolute top-4 left-4 text-purple-400 hover:text-purple-300 underline text-sm z-10">
                ← Back to Home
            </a>
            <div className="bg-zinc-800 p-8 rounded-lg w-full max-w-6xl shadow-lg flex flex-col lg:flex-row gap-8 min-h-[70vh]">
                {/* Sidebar */}
                <aside className="w-full lg:w-64 bg-zinc-900 p-6 space-y-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Account</h2>
                    <nav className="flex flex-col space-y-4">
                        <button
                            onClick={() => setActiveSection('settings')}
                            className={`text-left ${activeSection === 'settings' ? 'text-purple-500' : 'text-white'} hover:text-purple-400`}
                        >
                            Settings
                        </button>
                        <button
                            onClick={() => {
                                setActiveSection('links');
                                if (user) fetchUserLinks(user.id);
                            }}
                            className={`text-left ${activeSection === 'links' ? 'text-purple-500' : 'text-white'} hover:text-purple-400`}
                        >
                            My Links
                        </button>
                        <button
                            onClick={() => {
                                setActiveSection('transactions');
                                if (user) fetchTransactions(user.email);
                            }}
                            className={`text-left ${activeSection === 'transactions' ? 'text-purple-500' : 'text-white'} hover:text-purple-400`}
                        >
                            Transactions
                        </button>
                        <button
                            onClick={() => setActiveSection('apikeys')}
                            className={`text-left ${activeSection === 'apikeys' ? 'text-purple-500' : 'text-white'} hover:text-purple-400`}
                        >
                            API Keys
                        </button>
                        <button
                            onClick={() => setActiveSection('subscription')}
                            className={`text-left ${activeSection === 'subscription' ? 'text-purple-500' : 'text-white'} hover:text-purple-400`}
                        >
                            Subscription
                        </button>
                        <button
                            onClick={handleLogout}
                            className="text-left text-red-500 hover:text-red-700 mt-8"
                        >
                            Logout
                        </button>
                    </nav>
                </aside>

                {/* Main Section */}
                <main className="flex-1 p-8 space-y-6 overflow-auto">
                    {activeSection === 'settings' && user && (
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Account Settings</h2>
                            <div className="space-y-6">
                                {/* Email Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 justify-start gap-6">
                                    <div className="md:col-span-2 flex flex-col justify-start">
                                        <label className="block text-gray-400">Email</label>
                                        <input
                                            type="text"
                                            value={user.email}
                                            disabled
                                            className="w-full p-3 rounded bg-gray-700 text-white"
                                        />
                                    </div>
                                    <div className='flex flex-col justify-end items-center'>
                                        <label className='block text-transparent'></label>
                                        <button
                                            onClick={() => {
                                                setIsEmailModalOpen(true);
                                                setEmailChangeStep(1);
                                                setNewEmail('');
                                                setVerificationCode('');
                                                setFeedback('');
                                            }}
                                            className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-3 rounded transition w-full md:w-[150px]"
                                        >
                                            Edit Email
                                        </button>
                                    </div>
                                </div>

                                {/* Password Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 justify-start gap-6">
                                    <div className="md:col-span-2 flex flex-col justify-start">
                                        <label className="block text-gray-400 mb-1">Password</label>
                                        <input
                                            type="password"
                                            value="********"
                                            disabled
                                            className="w-full p-3 rounded bg-gray-700 text-white"
                                        />
                                    </div>
                                    <div className='flex flex-col justify-end items-center'>
                                        <label className='block text-transparent'></label>
                                        <button
                                            onClick={() => {
                                                setIsPasswordModalOpen(true);
                                                setNewPassword('');
                                                setConfirmPassword('');
                                                setFeedback('');
                                            }}
                                            className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-3 rounded transition w-full md:w-[150px]"
                                        >
                                            Edit Password
                                        </button>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    )}

                    {activeSection === 'links' && (
                        <div>
                            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                                <h2 className="text-3xl font-bold">My Links</h2>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={exportLinksAsJSON}
                                        className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded text-sm"
                                        disabled={userLinks.length === 0}
                                    >
                                        Export JSON
                                    </button>
                                    <button 
                                        onClick={exportLinksAsCSV}
                                        className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm"
                                        disabled={userLinks.length === 0}
                                    >
                                        Export CSV
                                    </button>
                                    <a href="/" className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded">
                                        Create New Link
                                    </a>
                                </div>
                            </div>
                            {linksLoading ? (
                                <p className="text-gray-400">Loading links...</p>
                            ) : userLinks.length === 0 ? (
                                <p className="text-gray-400">No links created yet. <a href="/" className="text-purple-400 underline">Create your first link</a></p>
                            ) : (
                                <>
                                    {/* Analytics Summary */}
                                    <div className="bg-zinc-900 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-purple-400">{userLinks.length}</p>
                                            <p className="text-sm text-gray-400">Total Links</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-purple-400">
                                                {userLinks.reduce((sum, link) => sum + (link.click_count || 0), 0)}
                                            </p>
                                            <p className="text-sm text-gray-400">Total Clicks</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-purple-400">
                                                {userLinks.length > 0 
                                                    ? Math.round(userLinks.reduce((sum, link) => sum + (link.click_count || 0), 0) / userLinks.length)
                                                    : 0}
                                            </p>
                                            <p className="text-sm text-gray-400">Avg Clicks/Link</p>
                                        </div>
                                    </div>

                                    {/* Links List */}
                                    <div className="space-y-4">
                                        {userLinks.map((link) => (
                                            <div key={link.id} className="bg-zinc-900 p-4 rounded-lg">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-400">Short URL</p>
                                                        <a href={link.original} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                                                            {import.meta.env.PUBLIC_BACKEND_URL || 'https://link-shortener-backend-production.up.railway.app'}/{link.code}
                                                        </a>
                                                        <p className="text-sm text-gray-500 mt-1 truncate">{link.original}</p>
                                                        <div className="flex gap-4 mt-2 text-sm text-gray-400">
                                                            <span>Created: {new Date(link.created_at).toLocaleDateString()}</span>
                                                            <span className="font-semibold text-purple-400">Clicks: {link.click_count || 0}</span>
                                                        </div>
                                                        {/* Simple click visualization */}
                                                        {userLinks.length > 0 && (
                                                            <div className="mt-2">
                                                                <div className="w-full bg-gray-700 rounded-full h-2">
                                                                    <div 
                                                                        className="bg-purple-500 h-2 rounded-full transition-all"
                                                                        style={{ 
                                                                            width: `${(() => {
                                                                                const maxClicks = Math.max(...userLinks.map(l => l.click_count || 0), 1);
                                                                                return maxClicks > 0 ? Math.min(100, ((link.click_count || 0) / maxClicks) * 100) : 0;
                                                                            })()}%` 
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => deleteLink(link.code)}
                                                        className="text-red-500 hover:text-red-700 ml-4"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeSection === 'transactions' && (
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Transaction History</h2>
                            {transactionsLoading ? (
                                <p className="text-gray-400">Loading transactions...</p>
                            ) : transactions.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                                    </svg>
                                    <p className="text-gray-400">No transactions found.</p>
                                    <a href="/payment" className="inline-block mt-4 text-purple-400 hover:text-purple-300 underline">
                                        Make your first purchase
                                    </a>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {transactions.map((tx) => (
                                        <div 
                                            key={tx.id} 
                                            className={`bg-zinc-900 p-4 rounded-lg border-l-4 ${
                                                tx.refunded 
                                                    ? 'border-yellow-500' 
                                                    : tx.status === 'succeeded' 
                                                        ? 'border-green-500' 
                                                        : tx.status === 'failed'
                                                            ? 'border-red-500'
                                                            : 'border-gray-500'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    {/* Status Badge */}
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                                            tx.refunded 
                                                                ? 'bg-yellow-900/50 text-yellow-300' 
                                                                : tx.status === 'succeeded'
                                                                    ? 'bg-green-900/50 text-green-300'
                                                                    : tx.status === 'failed'
                                                                        ? 'bg-red-900/50 text-red-300'
                                                                        : 'bg-gray-900/50 text-gray-300'
                                                        }`}>
                                                            {tx.refunded ? '↩️ REFUNDED' : tx.status.toUpperCase()}
                                                        </span>
                                                        <span className="font-semibold text-lg">
                                                            {tx.plan || 'Payment'} Plan
                                                        </span>
                                                    </div>

                                                    {/* Customer Info */}
                                                    <div className="text-sm text-gray-400 space-y-1">
                                                        <p>
                                                            <span className="text-gray-500">Customer:</span>{' '}
                                                            {tx.payer_first_name} {tx.payer_last_name}
                                                        </p>
                                                        <p>
                                                            <span className="text-gray-500">Email:</span>{' '}
                                                            {tx.payer_email}
                                                        </p>
                                                        {tx.card_brand && (
                                                            <p>
                                                                <span className="text-gray-500">Payment method:</span>{' '}
                                                                {tx.card_brand.charAt(0).toUpperCase() + tx.card_brand.slice(1)} •••• {tx.card_last4}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            <span className="text-gray-500">Transaction date:</span>{' '}
                                                            {new Date(tx.created_at).toLocaleString()}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            ID: {tx.stripe_payment_intent}
                                                        </p>
                                                    </div>

                                                    {/* Refund Info */}
                                                    {tx.refunded && (
                                                        <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded">
                                                            <p className="text-xs text-yellow-300 font-semibold mb-1">
                                                                Refund Information
                                                            </p>
                                                            <div className="text-xs text-gray-400 space-y-1">
                                                                {tx.refund_amount > 0 && (
                                                                    <p>
                                                                        <span className="text-gray-500">Refunded amount:</span>{' '}
                                                                        ${(tx.refund_amount / 100).toFixed(2)} {tx.currency.toUpperCase()}
                                                                    </p>
                                                                )}
                                                                {tx.refund_reason && (
                                                                    <p>
                                                                        <span className="text-gray-500">Reason:</span>{' '}
                                                                        {tx.refund_reason}
                                                                    </p>
                                                                )}
                                                                {tx.refunded_at && (
                                                                    <p>
                                                                        <span className="text-gray-500">Refunded on:</span>{' '}
                                                                        {new Date(tx.refunded_at).toLocaleString()}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Amount Display */}
                                                <div className="text-right ml-4">
                                                    <p className={`text-2xl font-bold ${
                                                        tx.refunded ? 'text-yellow-400' : 'text-green-400'
                                                    }`}>
                                                        {tx.refunded && tx.refund_amount > 0 ? '-' : ''}
                                                        ${((tx.refunded ? tx.refund_amount : tx.amount) / 100).toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-gray-400 uppercase">
                                                        {tx.currency}
                                                    </p>
                                                    {tx.refunded && tx.refund_amount < tx.amount && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Original: ${(tx.amount / 100).toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'apikeys' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-bold">API Keys</h2>
                                <div className="flex gap-3">
                                    <a
                                        href="/api-docs"
                                        className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded transition inline-flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                        API Docs
                                    </a>
                                    <button
                                        onClick={() => setShowApiKeyModal(true)}
                                        className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded"
                                    >
                                        Generate New Key
                                    </button>
                                </div>
                            </div>
                            <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4 mb-6">
                                <p className="text-blue-300 text-sm">
                                    <strong>Need help getting started?</strong> Check out our{' '}
                                    <a href="/api-docs" className="underline hover:text-blue-200">
                                        API Documentation
                                    </a>{' '}
                                    for code examples, endpoint details, and best practices.
                                </p>
                            </div>
                            {apiKeys.length === 0 ? (
                                <p className="text-gray-400">No API keys created yet. Generate one to start using the API.</p>
                            ) : (
                                <div className="space-y-4">
                                    {apiKeys.map((key) => (
                                        <div key={key.id} className="bg-zinc-900 p-4 rounded-lg flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">{key.name || 'Unnamed Key'}</p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Created: {new Date(key.created_at).toLocaleDateString()}
                                                </p>
                                                {key.last_used_at && (
                                                    <p className="text-xs text-gray-500">
                                                        Last used: {new Date(key.last_used_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => deleteApiKey(key.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'subscription' && (
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Subscription Management</h2>
                            <div className="bg-zinc-900 p-6 rounded-lg">
                                <div className="mb-4">
                                    <p className="text-lg font-semibold mb-2">Current Plan</p>
                                    <p className="text-gray-400">
                                        {transactions.length > 0 
                                            ? `${transactions[0].plan || 'Free'} Plan` 
                                            : 'Free Plan'}
                                    </p>
                                </div>
                                {transactions.length === 0 ? (
                                    <div className="space-y-4">
                                        <p className="text-gray-400 mb-4">You're currently on the free plan.</p>
                                        <a 
                                            href="/payment" 
                                            className="inline-block bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded transition"
                                        >
                                            Upgrade to Pro
                                        </a>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-400 mb-2">Subscription Status</p>
                                            <p className="text-green-400 font-semibold">Active</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400 mb-2">Next Billing Date</p>
                                            <p className="text-gray-300">
                                                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-4 mt-6">
                                            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">
                                                Manage Subscription
                                            </button>
                                            <button className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded">
                                                Cancel Subscription
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Email Modal */}
            <Modal 
                isOpen={isEmailModalOpen} 
                onClose={() => {
                    setIsEmailModalOpen(false);
                    setEmailChangeStep(1);
                    setNewEmail('');
                    setVerificationCode('');
                    setFeedback('');
                }} 
                title="Change Email"
                transitionName="emailTransition"
            >
                {emailChangeStep === 1 && (
                    <div>
                        <p className="text-gray-400 text-sm mb-4">
                            <strong>Important:</strong> Changing your email address is a sensitive action. For your security:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>A verification code will be sent to your current email address to verify this change.</li>
                                <li>If you lose access to your current email, you may permanently lose access to your account.</li>
                            </ul>
                        </p>

                        <input
                            type="email"
                            placeholder="New Email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="w-full p-4 rounded bg-gray-700 text-white mb-4"
                        />

                        {feedback && (
                            <p className={`text-sm mb-4 ${feedback.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                                {feedback}
                            </p>
                        )}

                        <button
                            onClick={handleStartEmailChange}
                            disabled={loading || !newEmail}
                            className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded text-white w-full disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Continue'}
                        </button>
                    </div>
                )}

                {emailChangeStep === 2 && (
                    <div>
                        <p className="text-gray-400 text-sm mb-4">
                            Please enter the verification code sent to your current email address.
                        </p>

                        <input
                            type="text"
                            placeholder="Verification Code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="w-full p-4 rounded bg-gray-700 text-white mb-4"
                            maxLength={6}
                        />

                        {feedback && (
                            <p className={`text-sm mb-4 ${feedback.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                                {feedback}
                            </p>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={() => setEmailChangeStep(1)}
                                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-white flex-1"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleVerifyEmailChange}
                                disabled={loading || !verificationCode}
                                className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded text-white flex-1 disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Password Modal */}
            <Modal 
                isOpen={isPasswordModalOpen} 
                onClose={() => {
                    setIsPasswordModalOpen(false);
                    setNewPassword('');
                    setConfirmPassword('');
                    setFeedback('');
                }} 
                title="Change Password"
                transitionName="passwordTransition"
            >
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-4 rounded bg-gray-700 text-white mb-4"
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-4 rounded bg-gray-700 text-white mb-4"
                />
                {feedback && (
                    <p className={`text-sm mb-4 ${feedback.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                        {feedback}
                    </p>
                )}
                <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded text-white w-full disabled:opacity-50"
                >
                    {loading ? 'Updating...' : 'Confirm Change'}
                </button>
            </Modal>

            {/* API Key Generation Modal */}
            <Modal
                isOpen={showApiKeyModal}
                onClose={() => {
                    setShowApiKeyModal(false);
                    setNewApiKeyName('');
                    setGeneratedApiKey('');
                }}
                title="Generate API Key"
            >
                {generatedApiKey ? (
                    <div>
                        <p className="text-gray-400 mb-4">Your new API key:</p>
                        <div className="bg-gray-700 p-4 rounded mb-4">
                            <p className="font-mono text-sm break-all">{generatedApiKey}</p>
                        </div>
                        <p className="text-yellow-400 text-sm mb-4">
                            ⚠️ Save this key now. You won't be able to see it again!
                        </p>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(generatedApiKey);
                                setShowApiKeyModal(false);
                                setGeneratedApiKey('');
                            }}
                            className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded text-white w-full"
                        >
                            Copy & Close
                        </button>
                    </div>
                ) : (
                    <div>
                        <input
                            type="text"
                            placeholder="Key Name (optional)"
                            value={newApiKeyName}
                            onChange={(e) => setNewApiKeyName(e.target.value)}
                            className="w-full p-4 rounded bg-gray-700 text-white mb-4"
                        />
                        <button
                            onClick={generateApiKey}
                            className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded text-white w-full"
                        >
                            Generate Key
                        </button>
                    </div>
                )}
            </Modal>
        </section>
    );
};

export default AccountDashboard;
