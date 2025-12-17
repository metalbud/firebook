"use client";

import { useState } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("https://www.firebook.app/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage("Thank you for subscribing!");
        setEmail(""); // Reset the input field
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Failed to subscribe:", error);
      setMessage("Failed to subscribe. Please try again later.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubscribe}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Notify Me</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
