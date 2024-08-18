import app from "../firebaseConfig/firebase";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { useState, useEffect } from "react";
import { Box, Image, Text, SimpleGrid, Spinner } from "@chakra-ui/react";

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
                switch (error.code) {
                  case "storage/object-not-found":
                    console.error("File does not exist:", item.parcel_img_url);
                    break;
                  case "storage/unauthorized":
                    console.error(
                      "User does not have permission to access the file:",
                      item.parcel_img_url
                    );
                    break;
                  case "storage/canceled":
                    console.error(
                      "User canceled the upload:",
                      item.parcel_img_url
                    );
                    break;
                  case "storage/unknown":
                    console.error("Unknown error occurred:", error.message);
                    break;
                  default:
                    console.error("Error fetching image:", error);
                }
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
    <SimpleGrid columns={[1, 2, 3]} spacing={4}>
      {data.map((item, index) => (
        <Box
          key={index}
          p={4}
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
          cursor="pointer"
          onClick={() => handleParcelSelect(item)}
          _hover={{ bg: "gray.100" }} // Add hover effect
        >
          {imageUrls[index] && (
            <Image src={imageUrls[index]} alt="Parcel Image" mb={4} />
          )}
          <Text fontWeight="bold">{item.parcel_type}</Text>
          <Text>{item.parcel_description}</Text>
          <Text fontSize="sm" color="gray.500">
            Weight: {item.parcel_min_weight}kg - {item.parcel_max_weight}kg
          </Text>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default ParcelData;
