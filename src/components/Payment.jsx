import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  "pk_test_51SLaJD1XOMQG7oTnvqLzPuyH6B5wo1HtNL78DefSrcEhuiQ96e9V3BHznO4GNNTK49pxnpfXeBqcsH2w7V0Pbclv00B6Bbbti1"
);

function CheckoutForm({ amount, planName }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: { label: `SnapLink ${planName} Plan`, amount },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) setPaymentRequest(pr);
    });
  }, [stripe, amount, planName]);

  useEffect(() => {
    const firstName = "John";
    const lastName = "Doe";
    const plan = planName;
    fetch(
      "https://link-shortener-backend-production.up.railway.app/create-payment-intent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, firstName, lastName, plan }),
      }
    )
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [amount, planName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:4321/success",
      },
    });

    if (error) alert(error.message);
  };

  return (
    <form 
      className="flex flex-col justify-center items-center w-full h-full"
      onSubmit={handleSubmit}
    >
      {paymentRequest && (
        <div className="mb-3 w-full flex justify-center">
          <PaymentRequestButtonElement
            options={{ paymentRequest }}
            className="w-[90%] rounded-xl"
          />
        </div>
      )}

      {clientSecret && <PaymentElement />}

      <div className="bg-[#52525216] backdrop-blur-2xl rounded-2xl w-[450px] h-[500px] flex flex-col justify-center items-center">
        <h1 className="text-2xl mb-3.5 top-1 fixed p-6 text-[#d8d8d8]">
          Payment Options
        </h1>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            className="bg-[#8B8E98] hover:bg-[#b8b9bc] transition-all duration-300 rounded-2xl w-[100px] flex justify-center items-center mb-7"
            onClick={() => alert("PayPal handled via Stripe automatically")}
          >
            <img className="w-24 h-auto" src="/PayPal.png" alt="PayPal icon" />
          </button>
          <button
            type="button"
            className="bg-[#8B8E98] hover:bg-[#b8b9bc] transition-all duration-300 rounded-2xl w-[100px] flex justify-center items-center mb-7"
            onClick={() => alert("Apple Pay opens automatically if available")}
          >
            <img
              className="w-10 h-auto pb-1"
              src="/Apple-Logo.svg"
              alt="Apple icon"
            />
          </button>
          <button
            type="button"
            className="bg-[#8B8E98] hover:bg-[#b8b9bc] transition-all duration-300 rounded-2xl w-[100px] flex justify-center items-center mb-7"
            onClick={() => alert("Google Pay opens automatically if available")}
          >
            <img
              className="w-auto h-20"
              src="/Google-Logo.png"
              alt="Google icon"
            />
          </button>
        </div>

        <div className="w-[calc(100%-20px)] grid grid-cols-3 gap-[10px] text-[#8B8E98] m-[0px 10px]">
          <hr className="inline-block w-full h-[1px] border-0 bg-[#8B8E98] m-auto" />
          <p className="break-all block text-center font-[600] text-[11px] m-auto">
            or pay using credit card
          </p>
          <hr className="inline-block w-full h-[1px] border-0 bg-[#8B8E98] m-auto" />
        </div>

        <div className="grid grid-cols-2 justify-center gap-2">
          <label className="text-sm text-[#8B8E98] mt-2 -mb-3 col-span-2">
            Credit or debit card holder
          </label>
          <input
            className="bg-[#8B8E98] rounded-md hover:bg-[#b8b9bc] transition-all duration-300 focus:bg-[#B8B9BC] mt-3 text-black col-span-2 h-10 p-3"
            type="text"
            placeholder="1234 1234 1234 1234"
          />
          <label className="col-span-full text-sm text-[#8B8E98]">
            Expiry Date / CVV
          </label>
          <input
            className="bg-[#8B8E98] col-span-1 rounded-md hover:bg-[#b8b9bc] transition-all duration-300 focus:bg-[#B8B9BC] text-black h-10 p-3"
            type="text"
            placeholder="MM/YY"
          />
          <input
            className="bg-[#8B8E98] col-span-1 rounded-md hover:bg-[#b8b9bc] transition-all duration-300 focus:bg-[#B8B9BC] text-black h-10 p-3"
            type="text"
            placeholder="CVV"
          />
        </div>

        <div className="flex justify-center items-center mt-7">
          <button
            className="p-3 w-[300px] rounded-2xl text-zinc-300 bg-[#5a5a5a58] cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 hover:bg-[#3f3f3f58]"
            type="submit"
            disabled={!stripe}
          >
            Checkout
          </button>
        </div>
      </div>
    </form>
  );
}

const Payment = () => {
  const [flipped, setFlipped] = useState(false);
  const [flippedPro, setFlippedPro] = useState(false);

  return (
    <Elements stripe={stripePromise}>
      <div className="flex flex-col justify-center items-center text-black min-h-screen">
        <div className="border-2 border-black rounded-2xl h-[10vh] w-[20vw] flex justify-around items-center mb-10 transition transform duration-500 ease-out">
          <button className="border-2 w-40 h-20 rounded-2xl text-white focus:text-black focus:bg-white transition duration-300 active:translate-x-full">
            Monthly
          </button>
          <button className="border-2 w-40 h-20 rounded-2xl text-white focus:text-black focus:bg-white transition duration-300 active:-translate-x-full">
            Annually
          </button>
        </div>

        <div className="rounded-2xl grid grid-cols-1 lg:grid-cols-2 gap-8 min-w-5xl mb-16 justify-evenly">
          {/* STARTER PLAN */}
          <div
            className={`border border-white rounded-lg p-8 bg-zinc-800 text-white justify-center flex flex-col items-center h-[70vh] relative transition-transform duration-500 [transform-style:preserve-3d] ${
              flipped ? "rotate-y-180" : ""
            }`}
          >
            <h1 className="text-4xl text-center font-bold">Starter Plan</h1>
            <p className="text-4xl font-bold mb-6">
              $5<span className="text-lg font-medium">/mo</span>
            </p>
            <ul className="space-y-4 mb-6 text-gray-300 text-left">
              <li>✅ Unlimited link shortening</li>
              <li>✅ Instant access</li>
              <li>✅ Clean, ad-free interface</li>
              <li>✅ Secure API handling</li>
              <li>🚧 Basic link history (coming soon)</li>
            </ul>
            <button
              className="w-24 h-10 rounded-lg text-white/80 bg-black/50 cursor-pointer transition-all hover:scale-110 active:scale-95 hover:shadow-xl shadow-white/40"
              onClick={() => setFlipped(!flipped)}
            >
              See More
            </button>

            <div className="absolute inset-0 bg-zinc-800 rounded-xl shadow-xl rotate-y-180 backface-hidden">
              <button
                className="fixed top-4 right-1 w-12 h-12 hover:scale-110 active:scale-95 transition-all duration-300"
                onClick={() => setFlipped(!flipped)}
              >
                <img
                  className="-m-3 bg-zinc-500 rounded-full"
                  src="/Close-Icon.png"
                  alt="Close icon"
                />
              </button>
              <CheckoutForm amount={500} planName="Starter" />
            </div>
          </div>

          {/* PRO PLAN */}
          <div
            className={`border border-white rounded-lg p-8 bg-zinc-800 text-white justify-center flex flex-col items-center h-[70vh] relative transition-transform duration-500 [transform-style:preserve-3d] ${
              flippedPro ? "rotate-y-180" : ""
            }`}
          >
            <h1 className="text-4xl text-center font-bold">Pro Plan</h1>
            <p className="text-4xl font-bold mb-6">
              $10<span className="text-lg font-medium">/mo</span>
            </p>
            <ul className="space-y-4 mb-6 text-gray-300 text-left">
              <li>✅ Unlimited link shortening</li>
              <li>✅ Priority API access</li>
              <li>✅ Custom short codes</li>
              <li>✅ Secure analytics dashboard</li>
              <li>🚀 Premium support</li>
            </ul>
            <button
              className="w-24 h-10 rounded-lg text-white/80 bg-black/50 cursor-pointer transition-all hover:scale-110 active:scale-95 hover:shadow-xl shadow-white/40"
              onClick={() => setFlippedPro(!flippedPro)}
            >
              See More
            </button>

            <div className="absolute inset-0 bg-zinc-800 rounded-xl shadow-xl rotate-y-180 backface-hidden">
              <button
                className="fixed top-4 right-1 w-12 h-12 hover:scale-110 active:scale-95 transition-all duration-300"
                onClick={() => setFlippedPro(!flippedPro)}
              >
                <img
                  className="-m-3 bg-zinc-500 rounded-full"
                  src="/Close-Icon.png"
                  alt="Close icon"
                />
              </button>
              <CheckoutForm amount={1000} planName="Pro" />
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
};

export default Payment;