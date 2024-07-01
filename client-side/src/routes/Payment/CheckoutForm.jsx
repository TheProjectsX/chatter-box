import { PaymentElement } from "@stripe/react-stripe-js";
import { useContext, useState } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import { UserAuthDataContext } from "../../context/context";

export default function CheckoutForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const context = useContext(UserAuthDataContext);
  const { themeMode, userData, setUserData } = context;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { paymentIntent, error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        // Make sure to change this to your payment completion page
        // return_url: `${window.location.origin}/completion`,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    console.log(paymentIntent);
    if (!error) {
      if (paymentIntent.status === "succeeded") {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/user/premium`,
          {
            method: "PUT",
            credentials: "include",
          }
        );
        const data = await res.json();
        if (data.success) {
          setUserData({
            ...userData,
            membershipStatus: "Premium",
            badge: "gold",
          });
          toast.success("You are now a Premium Member!");
          e.target.reset();
        } else {
          toast.error(data.message);
        }
      }
    } else {
      if (error?.type === "card_error" || error?.type === "validation_error") {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }

    setIsLoading(false);
  };

  if (userData.membershipStatus === "Premium") {
    return (
      <div className="text-center py-6">
        <p className="text-2xl font-semibold dark:text-white mb-2">
          You Are already a Premium Member
        </p>{" "}
        <p>Thank You for Joining Us!</p>
      </div>
    );
  }

  return (
    <form
      id="payment-form"
      onSubmit={handleSubmit}
      className="dark:bg-gray-800 max-w-md mx-auto p-5 rounded-lg shadow-lg"
    >
      <PaymentElement id="payment-element" />
      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="btn w-full mt-6"
      >
        <span id="button-text">
          {isLoading ? <div className="loading"></div> : "Pay $5 now"}
        </span>
      </button>
    </form>
  );
}
