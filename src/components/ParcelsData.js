import app from "../firebaseConfig/firebase";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { useState, useEffect } from "react";

const ParcelData = ({ onParcelSelect }) => {
  const [data, setData] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
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
      }
    };

    fetchData();
  }, [db, storage]);

  const handleParcelSelect = (parcel) => {
    onParcelSelect(parcel); // Pass the selected parcel data to the parent component
  };

  return (
    <ul>
      {data.map((item, index) => (
        <li key={index} onClick={() => handleParcelSelect(item)}>
          {JSON.stringify(item.parcel_description)}
          {JSON.stringify(item.parcel_type)}
          {imageUrls[index] && <img src={imageUrls[index]} alt="Firebase" />}
        </li>
      ))}
    </ul>
  );
};

export default ParcelData;
