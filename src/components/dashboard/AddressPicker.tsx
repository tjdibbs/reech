import { Input } from "antd";
import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import LocationSearch from "./LocationSearch";
import ShowOnMap, { ShowMapRefObject } from "@pages/ShowOnMap";
import {
  AddressPropsType,
  HandleLocationSearch,
  PlaceResult,
  SearchType,
} from "@lib/types";

function AddressPicker(props: AddressPropsType) {
  const {
    pickupLocation,
    deliveryLocation,
    setValue,
    errors,
    locationSearchRef,
  } = props;
  // const [search, setSearch] = React.useState<SearchType>({
  //   open: false,
  //   courier: "car",
  //   type: "deliveryLocation",
  // });

  // const showMapRef = React.useRef<ShowMapRefObject>(null);

  /**
   * * get the description of the user current Location with the lat and lng provided to it
   */
  const getReverseGeocodingData = React.useCallback(
    function getReverseGeocodingData(lat: number, lng: number) {
      const latlng = new google.maps.LatLng(lat, lng);
      const geocoder = new google.maps.Geocoder();

      // @ts-ignore
      geocoder.geocode({ latLng: latlng }, (results, status) => {
        if (status !== google.maps.GeocoderStatus.OK) {
          alert(status);
        }
        // This is checking to see if the Geo-code Status is OK before proceeding
        if (status === google.maps.GeocoderStatus.OK) {
          const currentLocation = results![0];

          // making sure there currentLocation data is not empty
          if (!currentLocation) return;

          // Doing this complete AutoComplete because of the types assigned to it
          // what's important here, is just the description and the place id
          let currentLocationTransform: PlaceResult = {
            description: currentLocation.formatted_address,
            place_id: currentLocation.place_id,
            types: currentLocation.types,
            terms: [],
            structured_formatting: {
              main_text: "",
              secondary_text: "",
              main_text_matched_substrings: [],
            },
            matched_substrings: [],
          };

          setValue("pickupLocation", currentLocationTransform);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  React.useEffect(() => {
    // * This access user GPS and get the current location latitude
    // * and longitude
    navigator.geolocation.getCurrentPosition(function (position) {
      let lat = position.coords.latitude;
      let lng = position.coords.longitude;

      getReverseGeocodingData(lat, lng);
    }, console.error);
  }, [getReverseGeocodingData]);

  // /**
  //  * @description // * The parameter tell the function which location the user wants to type and set an identity state for it
  //  * @param open // * tells the function to either close or open the LocationSearchComponent
  //  * @param type
  //  */
  // const handleLocationSearch: HandleLocationSearch = (
  //   open,
  //   title,
  //   type = "deliveryLocation",
  //   selectedPlace
  // ) => {
  //   setSearch({
  //     ...search,
  //     open,
  //     title,
  //     type,
  //     selectedPlace: open
  //       ? selectedPlace ?? props[type as NonNullable<SearchType["type"]>]
  //       : undefined,
  //   });
  // };

  return (
    <>
      <motion.div
        initial={{ opacity: 0.6, y: 200 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl mx-auto flex flex-col gap-3 py-4 px-2 my-5 shadow-sm bg-[#f6fcff]"
      >
        <div
          className="form-group"
          onClickCapture={() =>
            locationSearchRef.current?.open({
              type: "pickupLocation",
              title: "Pick Up",
              selectedPlace: deliveryLocation,
            })
          }
        >
          <div className="relative">
            <div className="absolute h-full w-full z-10 cursor-text" />
            <div className="text-red-700 absolute top-[40%] -translate-y-1/2 left-2 h-3 w-3 rounded-full">
              <Icon icon={"mdi:truck-cargo-container"} height={24} />
            </div>
            <Input
              className={AutoCompleteClassName}
              placeholder={"Pick up location"}
              value={pickupLocation?.description}
              status={errors.pickupLocation && "error"}
            />
          </div>
        </div>
        <div
          className="form-group"
          onClickCapture={() =>
            locationSearchRef.current?.open({
              type: "deliveryLocation",
              title: "Delivery",
              selectedPlace: deliveryLocation,
            })
          }
        >
          <div className="relative">
            <div className="absolute h-full w-full z-10 cursor-text" />
            <div className="text-green-700 absolute top-[40%] -translate-y-1/2 left-2 h-3 w-3 rounded-full">
              <Icon icon={"mdi:truck-check"} height={24} />
            </div>
            <Input
              className={AutoCompleteClassName}
              placeholder={"Delivery location"}
              value={deliveryLocation?.description}
              status={errors.deliveryLocation && "error"}
            />
          </div>
        </div>
      </motion.div>
      {/* <LocationSearch
        {...{ setValue, search, handleLocationSearch, showMapRef }}
      />
      <ShowOnMap ref={showMapRef} {...{ handleLocationSearch }} /> */}
    </>
  );
}

export const AutoCompleteClassName =
  "w-full !shadow-xs px-3 pl-12 py-2 !bg-transparent !text-gray-600 !border-b-[1.5px] border-solid border-gray-300 !outline-none disabled:cursor-text";

export default AddressPicker;
