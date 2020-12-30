import { NextApiRequest, NextApiResponse } from "next";

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

export interface IndHotel extends ListHotel {
  roomTypes: RoomType[];
}

export enum RegionKey {
  portugal = "portugal",
  europe = "europe",
}

export interface Region {
  title: string;
  key: string;
  search: any;
}

export const regions: Record<RegionKey, Region> = {
  portugal: {
    title: "Portugal",
    key: "portugal",
    search: {
      "country[eq]": "PRT",
    },
  },
  europe: {
    title: "Europe",
    key: "europe",
    search: {
      latitude: "48.486576",
      longitude: "11.335723",
      radius: "1200000",
    },
  },
};

const getHotels = async (req: NextApiRequest, res: NextApiResponse) => {
  const region = regions[req.query.region as keyof typeof regions];

  if (!region) {
    return res.status(404).send({});
  }

  const { start, end } = req.query;

  if (!start || !end || typeof start !== "string" || typeof end !== "string") {
    return res.status(400).send("Invalid query params");
  }

  const url = new URL(`https://sandbox.impala.travel/v1/hotels`);
  const query = new URLSearchParams({
    ...region.search,
    size: "6",
    start,
    end,
  });
  url.search = query.toString();

  const response = await fetch(url.toString(), {
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_IMPALA_API_KEY!,
    },
  })
    .then((r) => r.json())
    .catch((err) => {
      console.error(err);
      throw err;
    });

  if (!response.data) {
    console.error(response);
    console.log(query.toString());
    return res.status(500).send("Internal server error");
  }

  const roomData = await Promise.all(
    response.data.map(async (hotel: ListHotel, i: number) => {
      const hotelUrl = new URL(
        `https://sandbox.impala.travel/v1/hotels/${hotel.hotelId}`
      );
      hotelUrl.search = new URLSearchParams({
        start,
        end,
      }).toString();

      const response = await fetch(hotelUrl.toString(), {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_IMPALA_API_KEY!,
        },
      });

      return response.json();
    })
  );

  return res.status(200).send({ region, hotels: roomData });
};

export default getHotels;
