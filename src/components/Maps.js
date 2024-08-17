import {
  Box,
  Flex,
  HStack,
  VStack,
  Input,
  SkeletonText,
  Button
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

const apiKey = "AIzaSyASGf3xaQKOEsMZaYET96y4yh0GI9oI4pk";

const initialCenter = { lat: 40.7128, lng: -74.006 }; // Default to New York City

function Maps() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  const [map, setMap] = useState(null);
  const [originPosition, setOriginPosition] = useState(null);
  const [destinationPosition, setDestinationPosition] = useState(null);
  const [selectedParcel, setSelectedParcel] = useState(null); // State to store selected parcel

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

        map.panTo(originLatLng);
        map.setZoom(15);
      }
    } catch (error) {
      console.error("Geocoding error: ", error);
    }
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
    } catch (error) {
      console.error("Geocoding error: ", error);
    }
  }

  function clearRoute() {
    setOriginPosition(null);
    setDestinationPosition(null);
    originRef.current.value = "";
    destinationRef.current.value = "";
    map.setCenter(initialCenter);
    map.setZoom(10);
  }

  if (!isLoaded) {
    return <SkeletonText />;
  }

  return (
    <Flex
      position="relative"
      flexDirection="column"
      alignItems="center"
      h="100vh"
      w="100vw"
    >
      <Box position="absolute" right={0} top={0} h="100%" w="45%">
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
      <Box
        p={1}
        borderRadius="lg"
        m={1}
        bgColor="white"
        shadow="base"
        minW="container.md"
        zIndex="1"
        position="absolute"
        left={0}
        top={0}
        w="50%"
      >
        <VStack spacing={4} justifyContent="space-between">
          <Box flexGrow={2} w="100%">
            <Autocomplete>
              <Input type="text" placeholder="Origin" ref={originRef} />
            </Autocomplete>
            <Button colorScheme="blue" onClick={setOrigin}>
              Set Origin
            </Button>
          </Box>
        </VStack>
      </Box>
      <Box
        p={1}
        borderRadius="lg"
        m={1}
        bgColor="white"
        shadow="base"
        minW="container.md"
        zIndex="1"
        position="absolute"
        left={0}
        top="20%"
        w="50%"
      >
        <VStack>
          <Box flexGrow={1}>
            <Autocomplete>
              <Input
                type="text"
                placeholder="Destination"
                ref={destinationRef}
              />
            </Autocomplete>
            <Button colorScheme="blue" onClick={setDestination}>
              Set Destination
            </Button>
          </Box>
        </VStack>
      </Box>
      <Box
        p={1}
        borderRadius="lg"
        m={1}
        bgColor="white"
        shadow="base"
        minW="container.md"
        zIndex="1"
        position="absolute"
        left={0}
        top="40%"
        w="50%"
      >
        <HStack>
          <ParcelData onParcelSelect={setSelectedParcel} />
        </HStack>
      </Box>
      <Box
        p={1}
        borderRadius="lg"
        m={1}
        bgColor="white"
        shadow="base"
        minW="container.md"
        zIndex="1"
        position="absolute"
        left={0}
        top="60%"
        w="50%"
      >
        <PricingButton
          origin={originPosition}
          destination={destinationPosition}
          parcel={selectedParcel}
        />
      </Box>
    </Flex>
  );
}

export default Maps;
