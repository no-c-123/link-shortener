import { useRef } from "react";
import style from 'styled-components'


const Payment = () => {


     return(
        <div className="flex flex-col justify-center items-center text-black min-h-screen ">
            <div className=" border-2 border-black rounded-2xl h-[10vh] w-[20vw] flex justify-around items-center mb-10">
                <button className="border-2 w-40 h-20 rounded-2xl ">
                    Monthly
                </button>
                
                <button className="border-2 w-40 h-20 rounded-2xl ">
                    Anually
                </button>
            </div>
            {/*grid containers*/}
            <div className="rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-8 min-w-5xl mb-16 justify-evenly">

                <div className="border border-white rounded-lg p-8 bg-zinc-800 text-white justify-center flex flex-col items-center h-[70vh] ">
                    <h1 className="text-4xl text-center font-bold">Starter Plan</h1>
                    <p className="text-4xl font-bold mb-6">$5<span className="text-lg font-medium">/mo</span></p>
                    <ul className="space-y-4 mb-6 text-gray-300 text-left">
                        <li>✅ Unlimited link shortening</li>
                        <li>✅ Instant access</li>
                        <li>✅ Clean, ad-free interface</li>
                        <li>✅ Secure API handling</li>
                        <li>🚧 Basic link history (coming soon)</li>
                    </ul>
                    <button className="w-24 h-10 rounded-lg text-white/80 bg-black/50 cursor-pointer transition-all hover:scale-110 active:scale-95 hover:shadow-xl shadow-white/40">
                        See More
                    </button>                
                </div>

                <div className="border border-white rounded-lg p-8 bg-zinc-800 text-white justify-center flex flex-col items-center h-[70vh]">
                    <h1 className="text-4xl text-center font-bold">Pro Plan</h1>
                    <p className="text-4xl font-bold mb-6">$10<span className="text-lg font-medium">/mo</span></p>
                    <ul className="space-y-4 mb-6 text-gray-300 text-left">
                        <li>✅ Unlimited link shortening</li>
                        <li>✅ Instant access</li>
                        <li>✅ Clean, ad-free interface</li>
                        <li>✅ Secure API handling</li>
                        <li>🚧 Basic link history (coming soon)</li>
                    </ul>
                    <button className="w-24 h-10 rounded-lg text-white/80 bg-black/50 cursor-pointer transition-all hover:scale-110 active:scale-95 hover:shadow-xl shadow-white/40">
                        See More
                    </button>                
                </div>
            </div>
        </div>
     )
}

export default Payment;