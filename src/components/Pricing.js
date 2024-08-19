import { Button, Text } from "@chakra-ui/react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useState } from "react";

const PricingButton = ({ origin, destination, parcel, onSuccess }) => {
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
      const functions = getFunctions(); // get Firebase functions instance
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

      const result = await pricing(data); // call the function with given data
      console.log("Pricing result: ", result.data);

      onSuccess(result.data); // Pass the pricing data to the parent component
    } catch (error) {
      console.error("Error in calling pricing function: ", error);
      setError("Failed to calculate price. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        bg="transparent"
        border="1px"
        borderRadius="3px"
        borderColor="gray"
        display="flex"
        alignSelf="center"
        m="1rem auto"
        onClick={calculatePrice}
        isLoading={loading}
      >
        Calculate Price
      </Button>

      {error && (
        <Text color="red.500" mt={2}>
          {error}
        </Text>
      )}
    </>
  );
};

export default PricingButton;
