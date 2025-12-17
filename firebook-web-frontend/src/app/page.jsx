import React from "react";
import Image from "next/image";
import "./styles.css";
import SubscribeForm from "./components/SubscribeForm";

export default function Home() {
  const handleSubscribe = async (event) => {
    event.preventDefault();
    const email = event.target.email.value;

    try {
      const response = await fetch("https://www.firebook.app/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert("You're on the wait list!");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Failed to join the wait list:", error);
      alert("Failed to join. Please try again later.");
    }
  };

  return (
    <div className="container">
      <div className="content">
        <h1>Welcome to Firebook</h1>
        <p>
          AI-powered culinary companion that transforms your cooking experience.
        </p>
      </div>

      <div className="hero-image">
        <Image
          src="/images/mystical-cookbook.png"
          alt="Firebook"
          width={600}
          height={400}
        />
        <div className="overlay-text">Firebook 🔥🔥</div>
      </div>

      <div className="features">
        <div className="feature">
          <h2>Personalized Recipe Generation</h2>
          <p>
            Input the ingredients you have, and Firebook will craft a custom
            recipe to make the best use of them, reducing food waste and
            inspiring creativity in your cooking.
          </p>
        </div>
        <div className="feature">
          <h2>Dietary Customization</h2>
          <p>
            Whether you&apos;re vegan, gluten-free, or have other dietary
            restrictions, Firebook adjusts recipes to meet your specific needs,
            ensuring delicious meals that align with your lifestyle.
          </p>
        </div>
        <div className="feature">
          <h2>Step-by-Step Instructions</h2>
          <p>
            Each recipe comes with clear, easy-to-follow instructions, making
            cooking accessible for both beginners and seasoned chefs.
          </p>
        </div>
        <div className="feature">
          <h2>Nutritional Information</h2>
          <p>
            Stay informed about the nutritional content of your meals with
            detailed breakdowns provided for each recipe.
          </p>
        </div>
      </div>

      <div className="subscribe-form">
        <SubscribeForm />
      </div>

      <div className="footer">&copy; 2025 Firebook. All rights reserved.</div>
    </div>
  );
}
