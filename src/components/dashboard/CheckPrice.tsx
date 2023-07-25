import React from "react";
import { useAppDispatch, useAppSelector } from "@lib/redux/store";
import { useForm } from "react-hook-form";
import { INFO } from "@lib/redux/userSlice";

// * components
import { AnimatePresence, motion } from "framer-motion";
import Button from "antd/lib/button";
import { Divider, Input, Radio, Select, message } from "antd";
import AddressPicker from "./AddressPicker";
import SlideTransition from "@comps/animations/SlideTransition";
import GoBack from "@comps/GoBack";
import { IconsComp } from "./InitialInfo";
import { itemTypes, paymentOptions, weights } from "@lib/constants";
import OrderReech from "./OrderReech";

// * libraries types
import { FormFields } from "@lib/types";
import LocationSearch from "@comps/dashboard/LocationSearch";
import ShowOnMap from "@pages/ShowOnMap";
import { ShowMapRefObject } from "@pages/ShowOnMap";

function CheckPrice() {
  const courier = useAppSelector((state) => state.sessionStore.info.courier);
  const [unMount, setUnMount] = React.useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [openOrder, setOpenOrder] = React.useState(false);
  const dispatch = useAppDispatch();

  const locationSearchRef = React.useRef(null);
  const showMapRef = React.useRef<ShowMapRefObject>(null);

  // * this section controls the form fields state
  const {
    setValue,
    watch,
    setError,
    formState: { errors },
    getValues,
    clearErrors,
  } = useForm<FormFields>({ defaultValues: { timeRange: "Same Day" } });

  // * watch certain fields changes
  const { pickupLocation, deliveryLocation, timeRange } = watch();

  const submit = () => {
    clearErrors();
    let fields = getValues();
    let requiredFields: (keyof FormFields)[] = [
      "deliveryLocation",
      "type",
      "paymentMethod",
      "pickupLocation",
      "weight",
      "timeRange",
    ];

    // this check if any of the fields is empty
    let emptyFields = false;

    requiredFields.forEach((key, index) => {
      if (!fields[key as keyof FormFields] && key !== "details") {
        setError(key as keyof FormFields, {});
        emptyFields = true;
      }
    });

    if (emptyFields) {
      messageApi.error("Some required fields are empty");
      return;
    }

    setOpenOrder(true);
  };

  const handleClick = (courier: "car" | "truck") => {
    dispatch(INFO({ courier }));
  };

  const handleChange = (
    name: keyof FormFields,
    value: FormFields[keyof FormFields]
  ) => {
    setValue(name, value);
    clearErrors(name);
  };

  return (
    <>
      <SlideTransition unMount={unMount} noPadding>
        {contextHolder}
        <div className="check-price-wrapper h-full overflow-auto p-4 pt-0">
          <div className="head bg-white top-0 sticky py-3 z-50">
            <GoBack setUnMount={setUnMount} />
          </div>
          <form action="#">
            <div className="select-courier flex gap-3 items-center mt-2">
              <div className="label font-bold">Selected Courier</div>
              <div className="options flex gap-3">
                {IconsComp.map((item) => {
                  return (
                    <Button
                      key={item.courier}
                      icon={item.icon}
                      size={"large"}
                      shape={"circle"}
                      onClick={() =>
                        handleClick(item.courier as "car" | "truck")
                      }
                      className={
                        "rounded-full h-10 w-10 !grid !place-items-center" +
                        (courier === item.courier
                          ? " !bg-secondary !text-black shadow-xl "
                          : " !bg-secondary/40 !text-gray-400")
                      }
                    />
                  );
                })}
              </div>
            </div>
            <Divider style={{ marginBlock: 5 }} />
            <div className="max-weight w-max px-5 p-3 bg-primary/10 rounded-lg border-1 border-primary/70 font-semibold text-sm">
              Max Weight: 100kg
            </div>
            <div className="delivery flex flex-wrap items-center my-5 gap-x-2">
              <span className="title font-semibold text-sm">
                Delivery Time <b className="text-red-600 text-lg">*</b>
              </span>
              <div className="bg-primary/10 rounded-lg p-2">
                <Radio.Group
                  name="delivery"
                  value={timeRange}
                  onChange={({ target }) => {
                    handleChange("timeRange", target.value);
                  }}
                >
                  {["2hrs", "4hrs", "Same Day"].map((label) => {
                    return <Radio key={label} value={label} children={label} />;
                  })}
                </Radio.Group>
              </div>
            </div>
            <section className="address">
              <div className="title font-bold">
                Pickup & Delivery Address{" "}
                <b className="text-red-600 text-lg">*</b>
              </div>
              <AddressPicker
                {...{
                  pickupLocation,
                  deliveryLocation,
                  setValue: handleChange,
                  errors,
                  locationSearchRef,
                }}
              />
            </section>

            <section className="additional-info mb-16 flex flex-col gap-y-3 [&_label]:font-semibold [&_label]:block [&_label]:mb-2 [&_input]:rounded-lg [&_input]:shadow-sm [&_.ant-input]:focus:!border-secondary">
              <div className="form-group item-details">
                <label htmlFor="item-details-text-control">
                  Item Weight <b className="text-red-600 text-lg">*</b>
                </label>
                <Select
                  placeholder="What weight do you think the item hold ?"
                  options={weights}
                  size="large"
                  id="item-details-text-control"
                  className="w-full"
                  status={errors.weight && "error"}
                  onChange={(_, weight) =>
                    handleChange("weight", weight as FormFields["weight"])
                  }
                />
              </div>
              <div className="form-group payment-option">
                <label htmlFor="payment-option-text-control">
                  Payment Method <b className="text-red-600 text-lg">*</b>
                </label>
                <Select
                  size="large"
                  placeholder="Select your prefer payment method"
                  id="payment-option-text-control"
                  className="w-full"
                  options={paymentOptions}
                  status={errors.paymentMethod && "error"}
                  onChange={(value) => handleChange("paymentMethod", value)}
                />
              </div>
              <div className="form-group payment-option">
                <label htmlFor="item-type-text-control">
                  Item Type <b className="text-red-600 text-lg">*</b>
                </label>
                <Select
                  size="large"
                  id="item-type-text-control"
                  className="w-full"
                  placeholder="Select the type that best fit the items"
                  status={errors.type && "error"}
                  options={itemTypes}
                  onChange={(_, item) =>
                    handleChange("type", item as (typeof itemTypes)[0])
                  }
                />
              </div>
              <div className="form-group item-details">
                <label htmlFor="item-details-text-control">Item Details</label>
                <Input.TextArea
                  size="large"
                  showCount
                  maxLength={300}
                  id="item-details-text-control"
                  className="w-full"
                  onChange={({ target }) =>
                    handleChange("details", target.value)
                  }
                />
              </div>
            </section>
          </form>
        </div>
        {!unMount && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
            exit={{ y: 50, opacity: 0 }}
            className="actions fixed sm:absolute bottom-0 left-0 w-full bg-inherit p-4"
          >
            <Button
              type="ghost"
              htmlType="submit"
              size="large"
              onClick={submit}
              className="!bg-secondary !text-black !w-full !rounded-lg !py-2 !h-auto !font-bold"
            >
              Book Reech
            </Button>
          </motion.div>
        )}
        <AnimatePresence>
          {openOrder && (
            <OrderReech {...{ fields: getValues(), setOpenOrder }} />
          )}
        </AnimatePresence>
      </SlideTransition>
      <LocationSearch
        setValue={setValue}
        ref={locationSearchRef}
        showMapRef={showMapRef}
      />
      <ShowOnMap
        locationSearchRef={locationSearchRef}
        setValue={setValue}
        ref={showMapRef}
      />
    </>
  );
}

export default CheckPrice;
