import Image from "next/image";
import Head from "next/head";
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
import * as df from "date-fns";
import { first, last } from "lodash";
import { Nav } from "../../components/nav";

interface HotelImage {
  url: string;
  isHeroImage: boolean;
}

interface Rate {
  retailRate: {
    total: {
      amount: number;
      currency: {
        code: string;
      };
    };
  };
}

interface RoomType {
  rates: Rate[];
}

interface ListHotel {
  hotelId: string;
  name: string;
  starRating: number;
  description: {
    short: string;
    name: string;
  };
  address: {
    city: string;
    region: string;
    country: string;
  };
  images: HotelImage[];
}

interface IndHotel extends ListHotel {
  roomTypes: RoomType[];
}

const imgWidth = 200;
const imgHeight = 200;

const Hotel: FunctionComponent<IndHotel> = (hotel) => (
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
  </div>
);

export default function Hotels({
  region,
  hotels,
}: {
  region: { title: string };
  hotels: IndHotel[];
}) {
  return (
    <>
      <Nav />
      <div>
        <Head>
          <title>Hotels in {region.title}</title>
        </Head>
        <h1>Hotels in {region.title}</h1>
        {hotels.map(Hotel)}
      </div>
    </>
  );
}

const regions = {
  portugal: {
    title: "Portugal",
    search: {
      "country[eq]": "PRT",
    },
  },
  europe: {
    title: "Europe",
    search: {
      latitude: "48.486576",
      longitude: "11.335723",
      radius: "1200000",
    },
  },
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  res,
}) => {
  const region = regions[params!.region as keyof typeof regions];

  if (!region) {
    res.statusCode = 404;
    res.end();
    return { props: {} };
  }

  const url = new URL(`https://sandbox.impala.travel/v1/hotels`);
  const query = new URLSearchParams({
    ...region.search,
    size: "6",
  });
  url.search = query.toString();

  const hotels = await fetch(url.toString(), {
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_IMPALA_API_KEY!,
    },
  }).then((r) => r.json());

  const roomData = await Promise.all(
    hotels.data.map(async (hotel: ListHotel, i: number) => {
      const hotelUrl = new URL(
        `https://sandbox.impala.travel/v1/hotels/${hotel.hotelId}`
      );
      hotelUrl.search = new URLSearchParams({
        start: df.format(new Date(), "yyyy-MM-dd"),
        end: df.format(df.add(new Date(), { days: 10 }), "yyyy-MM-dd"),
      }).toString();

      const response = await fetch(hotelUrl.toString(), {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_IMPALA_API_KEY!,
        },
      });

      return response.json();
    })
  );

  return { props: { region, hotels: roomData } };
};
