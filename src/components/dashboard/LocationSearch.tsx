import { CardActionArea, SwipeableDrawer } from "@mui/material";
import { Button, Dropdown, Input } from "antd";
import { AnimatePresence, motion, MotionProps } from "framer-motion";
import React from "react";
import { Icon } from "@iconify/react";
import Loading from "@comps/Loading";
import { useAppSelector } from "@lib/redux/store";
import { LocationSearchPropsType, PlaceResult, SearchType } from "@lib/types";

function HighlightText(props: { originalText: string; search: string }) {
  const searchTerms = [props.search, ...props.search.split(" ")];
  // Combine the search terms into a regular expression with the 'g' flag for global search
  const regex = new RegExp(searchTerms.join("|"), "gi");

  // Use replace() with a callback function to wrap the matching text with a <span> element for highlighting
  const highlightedText = props.originalText.replace(
    regex,
    (match) => `<span class="text-yellow-700 font-bold">${match}</span>`
  );

  return <div dangerouslySetInnerHTML={{ __html: highlightedText }} />;
}

const LocationSearch = React.forwardRef<
  { open: (params: SearchType) => void },
  LocationSearchPropsType
>(function LocationSearch(props, ref) {
  const { showMapRef, setValue } = props;

  const device = useAppSelector((state) => state.sessionStore.device);
  const [open, setOpen] = React.useState<boolean>(false);
  const [search, setSearch] = React.useState<SearchType>();
  const [loading, setLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(
    search?.selectedPlace?.description
  );

  const [places, setPlaces] = React.useState<PlaceResult[]>([]);

  const findPlaces = async (place: string) => {
    if (!place) return setPlaces([]);
    if (place.length % 2 !== 0) return;

    const placesFinder = new google.maps.places.AutocompleteService();
    const places = await placesFinder.getPlacePredictions({
      input: place,
      types: ["address"],
      componentRestrictions: {
        country: "ng",
      },
    });

    setPlaces(places.predictions);
  };

  React.useImperativeHandle(ref, () => ({
    open: (params) => {
      setSearch(params);
      setOpen(true);
    },
  }));

  React.useEffect(() => {
    let selectedPlace = search?.selectedPlace?.description ?? "";
    if (open && selectedPlace) {
      setInputValue(selectedPlace);
      findPlaces(selectedPlace);
    } else if (!selectedPlace) {
      setPlaces([]);
      setInputValue("");
    }
  }, [search, open]);

  const openLocationOnMap = async (place: PlaceResult) => {
    setOpen(false);
    // tell user before show locations on map
    setLoading(true);

    const Geocoder = new google.maps.Geocoder();
    const placesData = (await Geocoder.geocode({ placeId: place.place_id }))
      .results;

    setTimeout(() => {
      showMapRef.current?.showOnMap({
        place,
        places: placesData,
        type: search?.type as SearchType["type"],
      });

      setTimeout(() => {
        setLoading(false);
      }, 500);
    }, 1000);
  };

  const Content = (
    <div className="content h-full rounded-t-2xl overflow-auto px-3 pb-5">
      <div className="flex justify-end py-3" onClick={() => setOpen(false)}>
        <Button type="ghost" className="text-primary font-bold rounded-lg">
          Cancel
        </Button>
      </div>

      <div className="title font-extrabold text-gray-700 text-lg mb-3 uppercase text-center">
        {search?.title} Location
      </div>
      {open && (
        <Input
          onChange={(e) => {
            setInputValue(e.target.value);
            findPlaces(e.target.value);
          }}
          size={"large"}
          value={inputValue}
          bordered
          placeholder={
            "Enter " + search?.title?.toLocaleLowerCase() + " location"
          }
          id="search-location-input"
          autoFocus
          className={"mb-3 shadow-lg shadow-secondary/10"}
        />
      )}
      <div className="matched-results flex flex-col gap-y-4 min-h-[250px]">
        {!Boolean(places.length) && (
          <div className="waiting text-sm">
            Place Predictions Will Appear Here
          </div>
        )}
        <AnimatePresence mode="wait">
          {places.map((place) => (
            <motion.div
              initial={{ x: 10, opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="place-wrap font-semibold"
              key={place.place_id}
            >
              <Dropdown
                menu={{
                  items: [
                    {
                      label: "Show on map",
                      key: place.place_id,
                      onClick: () => openLocationOnMap(place),
                    },
                  ],
                }}
                overlayClassName="z-[99999]"
                openClassName="z-[9999999]"
                trigger={["contextMenu"]}
              >
                <CardActionArea
                  className="!px-3 shadow-sm !bg-primary/[0.03] !rounded-lg !py-2 !border-b !border-gray-400"
                  onClick={() => {
                    setOpen(false);
                    if (!search?.callback)
                      return setValue(search!?.type, place);
                    search?.callback(place);
                  }}
                >
                  <HighlightText
                    originalText={place.description}
                    search={inputValue as string}
                  />
                  {/* <b className="text-blue-900">
                    {place.description.substring(0, inputValue?.length)}
                  </b>
                  {place.description.slice(inputValue!.length)} */}
                </CardActionArea>
              </Dropdown>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {inputValue && !search?.callback && (
          <motion.div
            className="action"
            animate={{ y: 0, opacity: 1 }}
            initial={{ y: 50, opacity: 0 }}
          >
            <Button
              type="primary"
              size="large"
              onClickCapture={() => openLocationOnMap(places[0])}
              className="!bg-primary text-lg font-bold mt-5 flex items-center gap-x-2"
            >
              <Icon icon={"material-symbols:map-outline"} height={24} />
              <span>Search on Map</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <React.Fragment>
      {loading && <Loading text="" unMount={loading} />}

      {device === "desktop" ? (
        <React.Fragment>
          <div
            className={
              "location-search-wrapper " +
              (open ? "absolute h-full w-full overflow-hidden bottom-0" : "h-0")
            }
          >
            <AnimatePresence>
              {open && (
                <motion.div
                  animate={{ opacity: 1 }}
                  initial={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setOpen(false)}
                  className="backdrop absolute left-0 h-full w-full cursor-pointer bg-black/40 z-[99999] top-0"
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {open && (
                <motion.div
                  {...({
                    initial: { y: 500 },
                    animate: { y: 0 },
                    exit: { y: 500 },
                    transition: { type: "just", duration: 0.5 },
                    className:
                      "absolute bottom-0 h-[500px] w-full left-0 z-[99999] rounded-t-2xl shadow-lg bg-white",
                  } as MotionProps)}
                >
                  {Content}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </React.Fragment>
      ) : (
        <SwipeableDrawer
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          open={open}
          anchor={"bottom"}
          onEnded={() => alert("ended")}
          ModalProps={{ style: { zIndex: 9999 } }}
          PaperProps={{ className: "rounded-t-2xl shadow-lg" }}
          transitionDuration={{
            exit: 500,
            enter: 700,
          }}
        >
          {Content}
        </SwipeableDrawer>
      )}
    </React.Fragment>
  );
});

export default LocationSearch;
