import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Modal from './uicomponents/Modal';

const AccountDashboard = () => {
    const [activeSection, setActiveSection] = useState('settings');
    const [user, setUser] = useState(null);

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [emailChangeStep, setEmailChangeStep] = useState(1);

    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
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
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const handleChangeEmail = async () => {
        if (!newEmail) return;

        const { error } = await supabase.auth.updateUser({ email: newEmail });
        if (error) {
            setFeedback(error.message);
        } else {
            setFeedback('Email updated successfully! Please confirm it via email.');
            setIsEmailModalOpen(false);
            setNewEmail('');
        }
        setEmailChangeStep(2);
    };

    const handleStartEmailChange = () => {
        if (!newEmail) return;

        setEmailChangeStep(2);
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setFeedback('Passwords do not match.');
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            setFeedback(error.message);
        } else {
            setFeedback('Password updated successfully.');
            setIsPasswordModalOpen(false);
            setNewPassword('');
            setConfirmPassword('');
        }
    };
    
    return (
        <section className="min-h-screen flex bg-gradient-to-br from-black to-gray-900 text-white justify-center items-center">
            <div className="bg-zinc-800 p-8 rounded-lg w-full max-w-4xl shadow-lg flex gap-8 h-[50vh]">
                {/* Sidebar */}
                <aside className="w-64 bg-zinc-900 p-6 space-y-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Account</h2>
                    <nav className="flex flex-col space-y-4">
                        <button
                            onClick={() => setActiveSection('settings')}
                            className={`text-left ${activeSection === 'settings' ? 'text-purple-500' : 'text-white'} hover:text-purple-400`}
                        >
                            Settings
                        </button>
                        <button
                            onClick={() => setActiveSection('transactions')}
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
                            onClick={handleLogout}
                            className="text-left text-red-500 hover:text-red-700 mt-8"
                        >
                            Logout
                        </button>
                    </nav>
                </aside>

                {/* Main Section */}
                <main className="flex-1 p-8 space-y-6">
                    {activeSection === 'settings' && user && (
                        <div className='h-0'>
                            <h2 className="text-3xl font-bold mb-6">Account Settings</h2>
                            <div className="space-y-6">
                                {/* Email Row */}
                                <div className="grid grid-cols-3 justify-start gap-6">
                                    <div className="col-span-2 flex flex-col justify-start">
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
                                            style={{ ViewTransitionName: 'emailTransition' }}
                                            onClick={() => {
                                                if (document.startViewTransition) {
                                                    document.startViewTransition(() => {
                                                        setIsEmailModalOpen(true);
                                                    });
                                                }else {
                                                    setIsEmailModalOpen(true);
                                                }
                                            }}
                                            className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-3 rounded transition w-[150px]"
                                        >
                                            Edit Email
                                        </button>
                                    </div>
                                </div>

                                {/* Password Row */}
                                <div className="grid grid-cols-3 justify-start gap-6">
                                    <div className="col-span-2 flex flex-col justify-start">
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
                                                if (document.startViewTransition) {
                                                    document.startViewTransition(() => {
                                                        setIsPasswordModalOpen(true);
                                                    })
                                                } else {
                                                    setIsPasswordModalOpen(true);
                                                }
                                            }}
                                            className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-3 rounded transition w-[150px]"
                                        >
                                            Edit Password
                                        </button>
                                    </div>
                                </div>
                                
                            </div>

                        </div>
                    )}

                    {activeSection === 'transactions' && (
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Transactions</h2>
                            <p>Transaction history will appear here.</p>
                        </div>
                    )}

                    {activeSection === 'apikeys' && (
                        <div>
                            <h2 className="text-3xl font-bold mb-6">API Keys</h2>
                            <p>API key management will be added here.</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Email Modal */}
            <Modal 
                isOpen={isEmailModalOpen} 
                onClose={() => {
                    setIsEmailModalOpen(false)
                    setEmailChangeStep(1);
                }} 
                title="Change Email"
                transitionName="emailTransition"
            >
                {emailChangeStep === 1 && (
                    <div>
                        <p className="text-gray-400 text-sm mb-4">
                            <strong>Important:</strong> Changing your email address is a sensitive action. For your security:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>You cannot change your email again for the next <strong>2 weeks.</strong></li>
                                <li>A confirmation code will be sent to your current email address to verify this change.</li>
                                <li>If you lose access to your current email, you may permanently lose access to your account.</li>
                                <li>This process helps protect your account from unauthorized changes.</li>
                            </ul>
                        </p>

                        <input
                            type="email"
                            placeholder="New Email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="w-full p-4 rounded bg-gray-700 text-white mb-4"
                        />

                        <button
                            onClick={handleStartEmailChange}
                            className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded text-white w-full"
                        >
                            Continue
                        </button>
                    </div>
                )}

                
            </Modal>

            {/* Password Modal */}
            <Modal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
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
                <button
                    onClick={handleChangePassword}
                    className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded text-white w-full"
                >
                    Confirm Change
                </button>
            </Modal>
        </section>
    );
};

export default AccountDashboard;