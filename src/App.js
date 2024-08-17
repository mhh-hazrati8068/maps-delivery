import React, { useEffect, useState } from "react";
import app from "./firebaseConfig/firebase";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import Maps from "./components/Maps";

function App() {
  const [data, setData] = useState([]);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "bearerParcels"));
      setData(querySnapshot.docs.map((doc) => doc.data()));
    };

    fetchData();
  }, [db]);

  return (
    <div className="App">
      <Maps />
      <h1>Firebase Data</h1>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{JSON.stringify(item)}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
