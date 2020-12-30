import Image from "next/image";
import Head from "next/head";
import { FunctionComponent } from "react";
import type { IndHotel, Region } from "./api/get-hotels";
import { useSearchInput } from "../hooks/use-search-input";
import { duration, Moment } from "moment";
import { States, useApi } from "../hooks/use-api";
import { first, last } from "lodash";

const applyToRates = <T extends {}>(
  room: IndHotel["roomTypes"][0],
  f: (...a: number[]) => T
): T => f(...room.rates.map((rate) => rate.retailRate.total.amount));

const HotelPrice: FunctionComponent<{
  rooms: IndHotel["roomTypes"];
  duration: string;
}> = ({ rooms }) => {
  const rates = rooms
    .flatMap((room) => room.rates.map((rate) => rate.retailRate.total))
    .slice()
    .sort((rate, _rate) => _rate.amount - rate.amount);

  const highest = first(rates);
  const lowest = last(rates);

  if (!highest || !lowest) {
    return <></>;
  }

  return (
    <>
      From {lowest.amount / 100} {lowest.currency.code} to{" "}
      {highest.amount / 100} {highest.currency.code} {duration}
    </>
  );
};

const imgWidth = 200;
const imgHeight = 200;

const Hotel = (duration: string): FunctionComponent<IndHotel> => (hotel) => (
  <div key={hotel.hotelId}>
    <h2>{hotel.name}</h2>
    <div>
      {hotel.address.region || hotel.address.city}, {hotel.address.country}
    </div>
    <Image
      src={`${hotel.images[0].url}?w=${imgWidth}h=${imgHeight}`}
      width={imgWidth}
      height={imgHeight}
    />
    <div>
      <HotelPrice rooms={hotel.roomTypes} duration={duration} />
    </div>
  </div>
);

const HotelDisplay: FunctionComponent<{
  region: Region;
  start: Moment;
  end: Moment;
}> = ({ region, start, end }) => {
  const response = useApi("getHotels", {
    query: {
      region: region.key,
      start,
      end,
    },
  });
  const stayDuration = `for ${end.clone().diff(start, "days")} nights.`;
  return (
    <div>
      <h3>
        Searching for hotels in {region.title} from {start.format("DD/MM/yyyy")}{" "}
        to {end.format("DD/MM/yyyy")}
      </h3>
      {response.state === States.data ? (
        response.data.hotels.map(Hotel(stayDuration))
      ) : response.state === States.loading ? (
        "Loading..."
      ) : (
        <div>Error: {response.error.message}</div>
      )}
    </div>
  );
};

export default function Hotels() {
  const {
    selectedRegion,
    regionSelector,
    startDate,
    endDate,
    datePicker,
  } = useSearchInput();

  return (
    <div style={{ padding: "10px" }}>
      <Head>
        <title>
          Hotel Geek
          {selectedRegion ? `: Hotels in ${selectedRegion.title}` : ""}
        </title>
      </Head>
      <h1>Hotel Geek</h1>
      <div>{regionSelector}</div>
      <div>{datePicker}</div>
      {selectedRegion && startDate && endDate && (
        <HotelDisplay region={selectedRegion} start={startDate} end={endDate} />
      )}
    </div>
  );
}
