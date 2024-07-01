import { useContext, useEffect, useState } from "react";

import { Elements } from "@stripe/react-stripe-js";

import "./style.css";
import CheckoutForm from "./CheckoutForm";
import { loadStripe } from "@stripe/stripe-js";
import { UserAuthDataContext } from "../../context/context";
import { Helmet } from "react-helmet";

const stripePromise = loadStripe(import.meta.env.VITE_PUBLISHER_KEY);

function Membership() {
  const context = useContext(UserAuthDataContext);
  const { themeMode } = context;
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch(`${import.meta.env.VITE_SERVER_URL}/create-payment-intent`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then(({ clientSecret }) => setClientSecret(clientSecret));
  }, []);

  const appearance = {
    theme: themeMode === "dark" ? "night" : "stripe",
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <section>
      <Helmet>
        <title>Membership | Chatter Box</title>
      </Helmet>
      <header className="w-full dark:bg-gray-800 dark:text-white text-center border-b-2 border-gray-400 dark:border-gray-500 mb-8 p-5">
        <h3 className="text-2xl font-lato font-semibold mb-2">
          Become a Member
        </h3>
        <p>Just by $5, Become a Premium Member for Lifetime!</p>
      </header>

      {clientSecret && stripePromise ? (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm clientSecret={clientSecret} />
        </Elements>
      ) : (
        <div className="text-center">
          <span className="loading loading-lg"></span>
        </div>
      )}
    </section>
  );
}

export default Membership;
