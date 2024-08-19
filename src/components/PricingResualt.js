import { Box, Text, VStack, Image, HStack, Flex } from "@chakra-ui/react";

import walkingImage from "../assets/walk2.png";
import ridingImage from "../assets/motor.png";
import cyclingImage from "../assets/bike.png";
import defaultImage from "../assets/walk2.png";

const modeImages = {
  walking: walkingImage,
  riding: ridingImage,
  cycling: cyclingImage,
};

const PricingInfo = ({ pricingData }) => {
  return (
    <Flex
      spacing={4}
      align="center"
      borderRadius="lg"
      boxShadow="md"
      m={2}
      w="100%"
      bg="white"
      alignItems="center"
    >
      {Object.keys(modeImages).map((mode) => {
        const data = pricingData ? pricingData[mode] : null; // hhandle if pricingData is undefined

        // use default image if mode is not in modeImages or if pricingData is empty which we dont have but we set it up just in case for error handling
        const imageSrc = modeImages[mode] || defaultImage;

        return (
          <Box
            key={mode}
            p={4}
            borderWidth="1px"
            borderRadius="xs"
            boxShadow="md"
            width="20%"
            m="1rem auto"
            bg="gray.200"
            display="flex"
            justifyContent="center"
            alignItems="center"
            alignSelf="center"
          >
            <VStack align="center" spacing={2} h="15vh">
              <Image src={imageSrc} alt={mode} mr={4} w="30%" />

              <Text fontSize="lg" fontWeight="bold">
                {mode}
              </Text>
              <Text>{data?.time || "N/A"}</Text>
              <Text>{data?.price ? `${data.price} USD` : "A#"}</Text>
            </VStack>
          </Box>
        );
      })}
    </Flex>
  );
};

export default PricingInfo;
