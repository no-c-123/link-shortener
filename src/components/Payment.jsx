import React, { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import { supabase } from "../lib/supabaseClient";

const STRIPE_PUBLISHABLE_KEY = import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  console.error("⚠️ PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables!");
}

const stripePromise = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

function CheckoutForm({ amount, planName, onClose, onSuccess, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!stripe || !clientSecret) return;

    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: {
        label: `SnapLink ${planName} Plan`,
        amount,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        pr.on("paymentmethod", async (ev) => {
          const { error: confirmError } = await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          );

          if (confirmError) {
            ev.complete("fail");
            setError(confirmError.message);
          } else {
            ev.complete("success");
            onSuccess();
          }
        });
      }
    });
  }, [stripe, clientSecret, amount, planName, onSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const returnUrl = `${window.location.origin}/payment-success`;
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: "if_required",
      });

      if (submitError) {
        setError(submitError.message);
        setSubmitting(false);
      } else {
        onSuccess();
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <form
      className="flex flex-col w-full max-w-md space-y-6 p-6"
      onSubmit={handleSubmit}
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Complete Your Payment
        </h2>
        <p className="text-gray-400 text-sm">
          {planName} Plan - ${(amount / 100).toFixed(2)}
        </p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {paymentRequest && (
        <div className="w-full">
          <PaymentRequestButtonElement
            options={{ paymentRequest }}
          />
        </div>
      )}

      {clientSecret && (
        <div className="w-full">
          <PaymentElement />
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!stripe || !elements || submitting}
        >
          {submitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            `Pay $${(amount / 100).toFixed(2)}`
          )}
        </button>
      </div>
    </form>
  );
}

function PaymentModal({ selectedPlan, user, onClose, onSuccess }) {
  const { planName, amount } = selectedPlan;
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const fetchClientSecret = async () => {
      setLoading(true);
      setFetchError("");

      try {
        const backendUrl =
          import.meta.env.PUBLIC_BACKEND_URL ||
          "https://link-shortener-backend-production.up.railway.app";

        const firstName =
          user.user_metadata?.name || user.email?.split("@")[0] || "";
        const lastName = user.user_metadata?.lastname || "";
        const email = user.email || "";

        const response = await fetch(`${backendUrl}/create-payment-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            firstName,
            lastName,
            plan: planName,
            email,
          }),
        });

        if (!response.ok) {
          let errorMessage =
            "Failed to initialize payment. Please try again.";
          try {
            const errorData = await response.json();
            errorMessage =
              errorData.error || errorData.details || errorMessage;
            if (response.status === 500) {
              errorMessage =
                "Server error. Please check that Stripe is properly configured on the backend.";
            } else if (response.status === 400) {
              errorMessage =
                errorData.error ||
                "Invalid payment request. Please check your information.";
            }
          } catch {
            errorMessage = `Server error (${response.status}). Please try again later.`;
          }

          console.error("Payment intent error:", errorMessage);
          if (isMounted) setFetchError(errorMessage);
          return;
        }

        const data = await response.json();
        if (data.clientSecret && isMounted) {
          setClientSecret(data.clientSecret);
        } else if (isMounted) {
          setFetchError(
            "Failed to receive payment information. Please try again."
          );
        }
      } catch (err) {
        console.error("Error fetching payment intent:", err);
        if (isMounted) {
          if (err.name === "TypeError" && err.message.includes("fetch")) {
            setFetchError("Network error. Please check your connection.");
          } else {
            setFetchError("An unexpected error occurred. Please try again.");
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchClientSecret();
    return () => {
      isMounted = false;
    };
  }, [amount, planName, user]);

  const elementsOptions = useMemo(
    () =>
      clientSecret
        ? {
            clientSecret,
            appearance: {
              theme: "night",
            },
          }
        : null,
    [clientSecret]
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-zinc-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold">Payment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
              <p className="text-gray-400">Loading payment form...</p>
            </div>
          )}

          {!loading && fetchError && (
            <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
              <p className="text-red-400 mb-4 text-center">{fetchError}</p>
              <button
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          )}

          {!loading && !fetchError && clientSecret && elementsOptions && (
            <Elements stripe={stripePromise} options={elementsOptions}>
              <CheckoutForm
                amount={amount}
                planName={planName}
                onClose={onClose}
                onSuccess={onSuccess}
                clientSecret={clientSecret}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}

const Payment = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login";
        return;
      }
      setUser(session.user);
      setLoading(false);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        window.location.href = "/login";
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePlanSelect = (planName, amount) => {
    setSelectedPlan({ planName, amount });
  };

  const handleClose = () => {
    setSelectedPlan(null);
  };

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      window.location.href = "/payment-success";
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900 text-white">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-gray-400">Redirecting to confirmation page...</p>
        </div>
      </div>
    );
  }

  const plans = [
    {
      name: "Starter",
      price: 5,
      amount: 500,
      features: [
        "Unlimited link shortening",
        "Instant access",
        "Clean, ad-free interface",
        "Secure API handling",
        "Basic link history",
      ],
    },
    {
      name: "Pro",
      price: 10,
      amount: 1000,
      features: [
        "Unlimited link shortening",
        "Priority API access",
        "Custom short codes",
        "Secure analytics dashboard",
        "Premium support",
      ],
    },
  ];

  if (!STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black to-gray-900 text-white px-4">
        <div className="bg-zinc-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Configuration Error</h1>
          <p className="text-gray-400 mb-4">
            Stripe publishable key is not configured. Please set <code className="bg-gray-700 px-2 py-1 rounded">PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in your environment variables.
          </p>
          <a href="/" className="text-purple-400 hover:text-purple-300 underline">
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black to-gray-900 text-white px-4 py-8 relative">
      <a href="/" className="absolute top-4 left-4 text-purple-400 hover:text-purple-300 underline text-sm z-10">
        ← Back to Home
      </a>

      <div className="w-full max-w-6xl">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Choose Your Plan
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Select a plan to get started with SnapLink
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="border border-gray-700 rounded-lg p-6 bg-zinc-800 hover:bg-zinc-750 transition-all"
            >
              <h2 className="text-3xl font-bold mb-2">{plan.name} Plan</h2>
              <p className="text-4xl font-bold mb-4">
                ${plan.price}
                <span className="text-lg font-medium text-gray-400">/mo</span>
              </p>
              <ul className="space-y-3 mb-6 text-gray-300">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-400 mr-2">✅</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePlanSelect(plan.name, plan.amount)}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                Select {plan.name} Plan
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedPlan && (
        <PaymentModal
          selectedPlan={selectedPlan}
          user={user}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default Payment;
