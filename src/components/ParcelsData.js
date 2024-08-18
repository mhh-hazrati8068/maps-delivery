import app from "../firebaseConfig/firebase";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { useState, useEffect } from "react";
import { Box, Image, Text, Flex, Spinner, Center } from "@chakra-ui/react";

const ParcelData = ({ onParcelSelect }) => {
  const [data, setData] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(true); // State to track loading
  const db = getFirestore(app);
  const storage = getStorage(app);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "bearerParcels"));
        const dataItems = querySnapshot.docs.map((doc) => doc.data());
        setData(dataItems);

        // Fetch images
        const urls = await Promise.all(
          dataItems.map(async (item) => {
            if (item.parcel_img_url) {
              const imageRef = ref(storage, item.parcel_img_url);
              try {
                const url = await getDownloadURL(imageRef);
                return url;
              } catch (error) {
                console.error("Error fetching image:", error);
                return null;
              }
            }
            return null;
          })
        );

        setImageUrls(urls);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchData();
  }, [db, storage]);

  const handleParcelSelect = (parcel) => {
    onParcelSelect(parcel); // Pass the selected parcel data to the parent component
  };

  if (loading) {
    return <Spinner size="xl" />;
  }

  return (
    <Flex direction="column" align="center" w="100%">
      <Box
        w="100%"
        p={4}
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        {data.map((item, index) => (
          <Box
            key={index}
            p={4}
            w="90%"
            borderWidth="1px"
            borderRadius={0}
            overflow="hidden"
            boxShadow="md"
            cursor="pointer"
            onClick={() => handleParcelSelect(item)}
            _hover={{ bg: "gray.100" }} // Add hover effect
            mb={4}
          >
            <Flex align="center">
              {imageUrls[index] && (
                <Image
                  src={imageUrls[index]}
                  alt="Parcel Image"
                  boxSize="100px"
                  objectFit="cover"
                  mr={4}
                />
              )}
              <Flex direction="column">
                <Text fontWeight="bold" mb={2}>
                  {item.parcel_type}
                </Text>
                <Text mb={2}>{item.parcel_description}</Text>
                <Text fontSize="sm" color="gray.500">
                  {item.parcel_min_weight}kg - {item.parcel_max_weight}
                  kg
                </Text>
              </Flex>
            </Flex>
          </Box>
        ))}
      </Box>
    </Flex>
  );
};

export default ParcelData;
