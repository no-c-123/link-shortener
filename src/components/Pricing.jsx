import React, {useRef} from "react";



const Pricing = () => {
    const featureList = [
        ['One-click link shortening', 'Allows you to shorten a link instantly with a single click.'],
        ['Basic click tracking', 'Shows how many times your link has been clicked.'],
        ['Editable destination URLs', 'Change where a link redirects without changing the short link.'],
        ['Custom branded links', 'Create personalized links with your brand name or custom text.'],
        ['Password-protected links', 'Require a password to access the shortened link.'],
        ['Expiration dates', 'Set a time limit or click limit after which the link will expire.'],
        ['Advanced link analytics', 'Track click locations, devices, referrers, and trends over time.'],
        ['Bulk link shortening', 'Shorten multiple links at once with a batch upload.'],
        ['API access for developers', 'Integrate SnapLink into your apps. Pro users get higher request limits.'],
        ['Priority support', 'Get faster response times and dedicated help.'],
        ['UTM builder integration', 'Easily add UTM parameters to track marketing campaigns.'],
        ['Link preview customization', 'Change the link title, image, and description shown on social media.'],
    ];

    const buttonPricingRef = useRef(null);

    const handleClick = () => {
        if(buttonPricingRef.current) {
            window.location.href = '/payment';
        }
    }

    return (
        <section id="pricing" className="min-h-screen flex flex-col justify-center items-center text-center bg-gradient-to-br from-black to-gray-900 text-white px-4 py-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-10">Pricing</h2>

            <div className="rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-8 min-w-7xl mb-16 justify-evenly">
                {/* Free Plan */}
                <div className="border border-white rounded-lg p-8 bg-zinc-800 text-white justify-center flex flex-col items-center">
                    <h3 className="text-2xl font-bold mb-4">Free</h3>
                    <p className="text-4xl font-bold mb-6">$0<span className="text-lg font-medium">/mo</span></p>
                    <ul className="space-y-4 mb-6 text-gray-300 text-left">
                        <li>✅ Unlimited link shortening</li>
                        <li>✅ Instant access</li>
                        <li>✅ Clean, ad-free interface</li>
                        <li>✅ Secure API handling</li>
                        <li>🚧 Basic link history (coming soon)</li>
                    </ul>
                    <button className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-full transition">
                        Get Started
                    </button>
                </div>

                {/* Starter Plan */}
                <div className="border border-white rounded-lg p-8 bg-zinc-800 text-white justify-center flex flex-col items-center">
                    <h3 className="text-2xl font-bold mb-4">Starter <span className="text-sm text-purple-400">(Coming Soon)</span></h3>
                    <p className="text-4xl font-bold mb-6">$5<span className="text-lg font-medium">/mo</span></p>
                    <ul className="space-y-4 mb-6 text-gray-300 text-left">
                        <li>✅ All Free features</li>
                        <li>✅ Editable links</li>
                        <li>✅ Password-protected links</li>
                        <li>✅ Limited custom branded links</li>
                        <li>✅ Standard API access</li>
                    </ul>
                    <button ref={buttonPricingRef} onClick={handleClick}  className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-full transition">
                        Upgrade Plan
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="border border-white rounded-lg p-8 bg-zinc-800 text-white justify-center flex flex-col items-center">
                    <h3 className="text-2xl font-bold mb-4">Pro <span className="text-sm text-purple-400">(Coming Soon)</span></h3>
                    <p className="text-4xl font-bold mb-6">$10<span className="text-lg font-medium">/mo</span></p>
                    <ul className="space-y-4 mb-6 text-gray-300 text-left">
                        <li>✅ All Starter features</li>
                        <li>✅ Advanced link analytics</li>
                        <li>✅ Bulk link shortening</li>
                        <li>✅ Full custom branded links</li>
                        <li>✅ Priority support</li>
                        <li>✅ UTM builder integration</li>
                        <li>✅ Link preview customization</li>
                    </ul>
                    <button ref={buttonPricingRef} onClick={handleClick}  className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-full transition">
                        Upgrade Plan
                    </button>
                </div>
            </div>

            {/* Pricing Table */}
            <div className="overflow-x-auto w-full max-w-6xl">
                <table className="w-full border-collapse text-center text-sm sm:text-base">
                    <thead>
                        <tr>
                            <th className="border border-gray-700 px-4 py-2 bg-gray-800">Feature</th>
                            <th className="border border-gray-700 px-4 py-2 bg-gray-800">Free</th>
                            <th className="border border-gray-700 px-4 py-2 bg-purple-800">Starter</th>
                            <th className="border border-gray-700 px-4 py-2 bg-purple-800">Pro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {featureList.map(([feature, tooltip], index) => (
                            <tr key={index} className="border border-gray-700">
                                <td className="border border-gray-700 px-4 py-3">
                                    <span title={tooltip} className="underline cursor-help">
                                        {feature}
                                    </span>
                                </td>

                                {/* Free Plan Features */}
                                <td className="border border-gray-700 px-4 py-3">
                                    {index < 2 ? '✅' : index === 8 ? 'Limited' : '❌'}
                                </td>

                                {/* Starter Plan Features */}
                                <td className="border border-gray-700 px-4 py-3">
                                    {index < 5 ? '✅' : index === 3 ? 'Limited' : index === 8 ? 'Standard' : '❌'}
                                </td>

                                {/* Pro Plan Features */}
                                <td className="border border-gray-700 px-4 py-3">
                                    {'✅'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default Pricing;