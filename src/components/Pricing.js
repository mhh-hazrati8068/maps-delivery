// PricingButton.js
import { Button } from "@chakra-ui/react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useState } from "react";

const PricingButton = ({ origin, destination, parcel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculatePrice = async () => {
    if (!origin || !destination || !parcel) {
      alert("Please set both origin, destination, and select a parcel.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const functions = getFunctions(); // Get Firebase functions instance
      const pricing = httpsCallable(functions, "pricing"); // Create callable function

      const data = {
        origin,
        destination,
        vehicle_type: parcel.vehicle_type,
        parcel_type: parcel.parcel_type,
        parcel_description: parcel.parcel_description,
        parcel_min_weight: parcel.parcel_min_weight,
        parcel_max_weight: parcel.parcel_max_weight,
      };

      const result = await pricing(data); // Call the function with data
      console.log("Pricing result: ", result.data);
      // Handle the result (e.g., display the price to the user)
    } catch (error) {
      console.error("Error calling pricing function: ", error);
      setError("Failed to calculate price. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button colorScheme="green" onClick={calculatePrice} isLoading={loading}>
      Calculate Price
    </Button>
  );
};

export default PricingButton;
