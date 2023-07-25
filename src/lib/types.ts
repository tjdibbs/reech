import { itemTypes } from "@lib/constants";
import { FormState } from "react-hook-form";
import React from "react";
import { ShowMapRefObject } from "@pages/ShowOnMap";

export interface stateInterface {
  loggedIn: boolean;
  user: User | null;
  mode: "light" | "dark" | "default";
  device: "mobile" | "tablet" | "desktop";
  info: {
    description: string;
    courier?: "car" | "truck";
  };
  loaded: boolean;
  orders: Order[];
}

export interface Order extends FormFields {
  id: string;
  driverDetails: DriverDetails;
  status: "delivering" | "delivered" | "cancelled";
  courier: "car" | "truck";
  date: string;
  deliveryTime: string;
}

export type User = {
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  gender: string | null;
};

export type PlaceResult = google.maps.places.AutocompletePrediction;
export type FormFields = {
  pickupLocation: PlaceResult;
  deliveryLocation: PlaceResult;
  weight: { value: number; label: string };
  timeRange: string;
  distance: number;
  paymentMethod: string;
  details?: string;
  type: (typeof itemTypes)[0];
};

export type DriverDetails = {
  name: string;
  contact: string;
  image: string;
  license: string;
  vehicle: string;
  ratings: number;
  color: string;
  currentLocation: google.maps.LatLngLiteral;
  status: "delivering" | "coming" | "arrived";
};

export interface currentDelivery extends FormFields {
  driverDetails: DriverDetails;
}

export type SearchType = {
  /** the LocationSearch component can only open for Pick-Up location
  and for Delivery location **/
  type: "pickupLocation" | "deliveryLocation";
  title?: "Pick Up" | "Delivery";
  selectedPlace?: PlaceResult;
  courier?: "car" | "truck";
  callback?: (place: PlaceResult) => void;
};

export type AddressPropsType = {
  locationSearchRef: React.RefObject<{
    open: (params: SearchType) => void;
  }>;
  pickupLocation?: PlaceResult;
  deliveryLocation?: PlaceResult;
  setValue: (
    name: keyof FormFields,
    value: FormFields[keyof FormFields]
  ) => void;
  errors: FormState<FormFields>["errors"];
};

export type HandleLocationSearch = (
  open: boolean,
  title?: SearchType["title"],
  type?: SearchType["type"],
  selectedPlace?: PlaceResult
) => void;

export type LocationSearchPropsType = {
  showMapRef: React.RefObject<ShowMapRefObject>;
  setValue: (
    name: keyof FormFields,
    value: FormFields[keyof FormFields]
  ) => void;
};

export type OrderStateType = {
  loading: boolean;
  origin: google.maps.LatLngLiteral | null;
  destination: google.maps.LatLngLiteral | null;
  directions: google.maps.DirectionsResult | null;
  /** the delivery distance */
  distance?: { value: number; text: string };
  /** the delivery duration */
  duration?: { value: number; text: string };
  reech?: "Reeching" | "Reeched";
  driverDetails?: DriverDetails;
  driverDirectionToOrigin?: google.maps.DirectionsResult | null;
};
