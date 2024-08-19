import app from "../firebaseConfig/firebase";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { useState, useEffect } from "react";
import { Box, Image, Text, Flex, Spinner, Button } from "@chakra-ui/react";

const ParcelData = ({ onParcelSelect, onEditParcelChange }) => {
  const [data, setData] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [editParcel, setEditParcel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedParcel, setSelectedParcel] = useState(null); // State to track selected parcel
  const db = getFirestore(app);
  const storage = getStorage(app);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "bearerParcels"));
        const dataItems = querySnapshot.docs.map((doc) => doc.data());
        setData(dataItems);

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
        setLoading(false);
      }
    };

    fetchData();
  }, [db, storage]);

  function handleEditParcel() {
    setEditParcel(true);
    onEditParcelChange(true);
  }
  function handleCloseParcel() {
    setEditParcel(false);
    onEditParcelChange(false);
  }

  const handleParcelSelect = (parcel) => {
    setSelectedParcel(parcel); // Set the selected parcel
    onParcelSelect(parcel);
  };

  if (loading) {
    return <Spinner size="xl" position="absolute" top="50%" left="50%" />;
  }

  return (
    <Flex direction="column" align="center" w="100%">
      {editParcel ? (
        <Box
          w="100%"
          p={4}
          position="relative"
          backgroundColor="transparent"
          border={0}
          overflow="hidden"
          boxShadow={0}
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
              _hover={{ bg: "gray.100" }}
              mb={4}
              bg={selectedParcel === item ? "blue.600" : "white"} // Change background if selected
            >
              <Flex align="center" flexDirection="row">
                <Box
                  bg="gray.100" // Background color for the image container
                  boxSize="10%"
                  m={2}
                  p={2}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {imageUrls[index] && (
                    <Image src={imageUrls[index]} alt="Parcel Image" />
                  )}
                </Box>
                <Flex direction="row" justifyContent="space-between" w="100%">
                  <Text fontWeight="bold" fontSize="xl" alignItems="flex-start">
                    {item.parcel_type} {/* Increased font size */}
                  </Text>
                  <Flex direction="column" alignItems="flex-end">
                    <Text>{item.parcel_description}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {item.parcel_min_weight}kg - {item.parcel_max_weight}kg
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </Box>
          ))}
          <Text
            fontSize="lg"
            cursor="pointer"
            onClick={handleCloseParcel}
          >
            Close
          </Text>
        </Box>
      ) : (
        <Flex w="100%" p={4} justifyContent="space-between" alignItems="center">
          <Text fontSize="lg">Parcel's type</Text>
          <button onClick={handleEditParcel}>Edit</button>
        </Flex>
      )}
    </Flex>
  );
};

export default ParcelData;
