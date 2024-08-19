import {
  Box,
  Flex,
  HStack,
  VStack,
  Input,
  SkeletonText,
  Button,
  Text,
} from "@chakra-ui/react";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  Polyline,
} from "@react-google-maps/api";
import { useRef, useState, useCallback } from "react";
import ParcelData from "./ParcelsData";
import PricingButton from "./Pricing";
import PricingInfo from "./PricingResualt";

const apiKey = "AIzaSyASGf3xaQKOEsMZaYET96y4yh0GI9oI4pk";

const initialCenter = { lat: 40.7128, lng: -74.006 }; // Default to tehran (baraye zibayi va namayesh avaliye map)

function Maps() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  const [map, setMap] = useState(null);
  // for toggling the visiblity in boxes
  const [originVisiblity, setOriginVisiblity] = useState(false);
  const [destinationVisiblity, setDestinationVisiblity] = useState(false);
  // for detecting and converting the current.value to lat and long
  const [originPosition, setOriginPosition] = useState(null);
  const [destinationPosition, setDestinationPosition] = useState(null);
  // add state for origin and destination values for stopping the re-rendering for the ref value for displaying
  const [originValue, setOriginValue] = useState("");
  const [destinationValue, setDestinationValue] = useState("");

  const [selectedParcel, setSelectedParcel] = useState(null); // State to cache the selected parcel
  const [isEditingParcel, setIsEditingParcel] = useState(false);

  const [pricingData, setPricingData] = useState(null);

  const originRef = useRef();
  const destinationRef = useRef();

  const onLoadMap = useCallback((mapInstance) => {
    setMap(mapInstance);
    mapInstance.setCenter(initialCenter); // Set initial center
    mapInstance.setZoom(10); // Set initial zoom
  }, []);

  async function setOrigin() {
    if (originRef.current.value === "") return;

    try {
      // eslint-disable-next-line no-undef
      const geocoder = new google.maps.Geocoder();
      const originGeocode = await geocoder.geocode({
        address: originRef.current.value,
      });
      if (originGeocode.results[0]) {
        const originLatLng = originGeocode.results[0].geometry.location;
        setOriginPosition({ lat: originLatLng.lat(), lng: originLatLng.lng() });

        setOriginValue(originRef.current.value);

        map.panTo(originLatLng);
        map.setZoom(15);
      }
      setOriginVisiblity(false);
    } catch (error) {
      console.error("in Geocoding error: ", error);
    }
  }
  function editOrigin() {
    setOriginVisiblity(true);
  }

  async function setDestination() {
    if (destinationRef.current.value === "") return;

    try {
      // eslint-disable-next-line no-undef
      const geocoder = new google.maps.Geocoder();
      const destinationGeocode = await geocoder.geocode({
        address: destinationRef.current.value,
      });
      if (destinationGeocode.results[0]) {
        const destinationLatLng =
          destinationGeocode.results[0].geometry.location;
        setDestinationPosition({
          lat: destinationLatLng.lat(),
          lng: destinationLatLng.lng(),
        });

        setDestinationValue(destinationRef.current.value);

        if (originPosition) {
          // eslint-disable-next-line no-undef
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(originPosition);
          bounds.extend(destinationLatLng);
          map.fitBounds(bounds); // Adjust view to include both markers
        } else {
          map.panTo(destinationLatLng);
          map.setZoom(15);
        }
      }
      setDestinationVisiblity(false);
    } catch (error) {
      console.error("in Geocoding error: ", error);
    }
  }
  function editdestination() {
    setDestinationVisiblity(true);
  }

  const handleEditParcelChange = (isEditing) => {
    setIsEditingParcel(isEditing); // Update the state when editParcel changes
  };

  const handlePricingSuccess = (data) => {
    setPricingData(data);
  };

  if (!isLoaded) {
    return <SkeletonText />;
  }

  return (
    <Flex
      position="relative"
      flexDirection="row-reverse"
      alignItems="center"
      h="100vh"
      w="100vw"
    >
      <Box h="100%" w="60%">
        <GoogleMap
          zoom={10}
          center={initialCenter}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={onLoadMap}
        >
          {originPosition && (
            <Marker
              position={originPosition}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              }}
            />
          )}
          {destinationPosition && (
            <Marker
              position={destinationPosition}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/orange-dot.png",
              }}
            />
          )}
          {originPosition && destinationPosition && (
            <Polyline
              path={[originPosition, destinationPosition]}
              options={{
                strokeColor: "#00008B",
                strokeOpacity: 0,
                strokeWeight: 2,
                icons: [
                  {
                    icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 4 },
                    offset: "0",
                    repeat: "15px",
                  },
                ],
              }}
            />
          )}
        </GoogleMap>
      </Box>
      <Flex flexDirection="column" alignItems="center" h="100vh" w="40vw" m={2}>
        <Box
          p={1}
          borderRadius="sm"
          m={1}
          bgColor="white"
          shadow="base"
          minW="container.md"
          zIndex="1"
          w="45%"
        >
          <Text fontSize="lg" fontWeight="bold" m={2}>
            {" "}
            Origin
          </Text>
          {originVisiblity ? (
            <VStack spacing={4} justifyContent="space-between">
              <Box flexGrow={2} w="80%" m={2} p={4}>
                <Autocomplete>
                  <Input
                    type="text"
                    placeholder="Origin"
                    ref={originRef}
                    m={2}
                    p={4}
                    borderRadius={0}
                    borderBottom="1px"
                    borderBottomColor="gray"
                    border={0}
                    background="lightgray"
                  />
                </Autocomplete>

                <Input
                  type="text"
                  placeholder="More Details / Massage For The Rider"
                  m={2}
                  p={4}
                  borderRadius={0}
                  borderBottom="1px"
                  borderBottomColor="gray"
                  border={0}
                  background="lightgray"
                />
                <HStack m={2}>
                  <Input
                    type="number"
                    placeholder="phone number"
                    borderRadius={0}
                    borderBottom="1px"
                    borderBottomColor="gray"
                    border={0}
                    background="lightgray"
                  />
                  <Input
                    type="text"
                    placeholder="sender's name"
                    borderRadius={0}
                    borderBottom="1px"
                    borderBottomColor="gray"
                    border={0}
                    background="lightgray"
                  />
                </HStack>
                <Button colorScheme="blue" onClick={setOrigin} m={2}>
                  Set Origin
                </Button>
              </Box>
            </VStack>
          ) : (
            <Flex
              w="100%"
              p={4}
              justifyContent="space-between" // This places items on opposite sides
              alignItems="center"
            >
              <Text fontSize="lg">
                {originValue
                  ? originValue
                  : "Please select an origin location!"}
              </Text>
              <button onClick={editOrigin}>Edit</button>
            </Flex>
          )}
        </Box>
        <Box
          p={1}
          borderRadius="sm"
          m={2}
          bgColor="white"
          shadow="base"
          minW="container.md"
          zIndex="1"
          w="45%"
        >
          <Text fontSize="lg" fontWeight="bold" m={2}>
            {" "}
            Destination
          </Text>
          {destinationVisiblity ? (
            <VStack>
              <Box flexGrow={2} w="80%" m={2} p={4}>
                <Autocomplete>
                  <Input
                    type="text"
                    placeholder="Destination"
                    ref={destinationRef}
                    m={2}
                    p={2}
                    borderRadius={0}
                    borderBottom="1px"
                    borderBottomColor="gray"
                    border={0}
                    background="lightgray"
                  />
                </Autocomplete>

                <Input
                  type="text"
                  placeholder="More Details / Massage For The Rider"
                  m={2}
                  p={4}
                  borderRadius={0}
                  borderBottom="1px"
                  borderBottomColor="gray"
                  border={0}
                  background="lightgray"
                />
                <HStack m={2}>
                  <Input
                    type="number"
                    placeholder="phone number"
                    borderRadius={0}
                    borderBottom="1px"
                    borderBottomColor="gray"
                    border={0}
                    background="lightgray"
                  />
                  <Input
                    type="text"
                    placeholder="Recipient name"
                    borderRadius={0}
                    borderBottom="1px"
                    borderBottomColor="gray"
                    border={0}
                    background="lightgray"
                  />
                </HStack>
                <Button colorScheme="blue" onClick={setDestination} m={2}>
                  Set Destination
                </Button>
              </Box>
            </VStack>
          ) : (
            <Flex
              w="100%"
              p={4}
              justifyContent="space-between"
              alignItems="center"
            >
              <Text fontSize="lg">
                {destinationValue
                  ? destinationValue
                  : "Please select the destination!"}
              </Text>
              <button onClick={editdestination}>Edit</button>
            </Flex>
          )}
        </Box>
        <Box
          p={1}
          borderRadius="sm"
          m={1}
          bgColor="white"
          shadow="lg"
          minW="container.md"
          zIndex="1"
          w="45%"
        >
          <HStack>
            <ParcelData
              onParcelSelect={(parcel) => setSelectedParcel(parcel)}
              onEditParcelChange={handleEditParcelChange}
            />
          </HStack>
          {isEditingParcel && (
            <PricingButton
              origin={originPosition}
              destination={destinationPosition}
              parcel={selectedParcel}
              onSuccess={handlePricingSuccess}
            />
          )}
        </Box>
        {pricingData ? (
          <PricingInfo pricingData={pricingData} />
        ) : (
          <Flex
            p={4}
            borderRadius="sm"
            m={1}
            bgColor="white"
            shadow="lg"
            minW="container.md"
            zIndex="1"
            w="45%"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text fontSize="lg">Transport Options!</Text>
            <button onClick={editdestination}>Edit</button>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}

export default Maps;
