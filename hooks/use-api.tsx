import axios from "axios";
import { Moment } from "moment";
import { useEffect, useState } from "react";
import { IndHotel, Region } from "../pages/api/get-hotels";

type Endpoints = {
  getHotels: {
    response: { region: Region; hotels: Array<IndHotel> };
    query: { region: string; start: Moment; end: Moment };
  };
};

const endpointData = {
  getHotels: {
    method: "get" as const,
    uri: "api/get-hotels",
    queryMapper: ({
      start,
      end,
      region,
    }: {
      region: string;
      start: Moment;
      end: Moment;
    }) => ({
      region,
      start: start.format("yyyy-MM-DD"),
      end: end.format("yyyy-MM-DD"),
    }),
  },
};

export enum States {
  loading = "loading",
  error = "error",
  data = "data",
}

interface LoadingApiResponse {
  state: States.loading;
}

interface ErrorApiResponse {
  state: States.error;
  error: Error;
}

interface DataApiResponse<T> {
  state: States.data;
  data: T;
}

export type ApiResponse<T> =
  | LoadingApiResponse
  | ErrorApiResponse
  | DataApiResponse<T>;

export const useApi = <K extends keyof Endpoints>(
  endpoint: K,
  { query }: { query: Endpoints[K]["query"] }
): ApiResponse<Endpoints[K]["response"]> => {
  const [data, setData] = useState<Endpoints[K]["response"]>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const { method, uri, queryMapper } = endpointData[endpoint];
    axios[method](uri, { params: queryMapper(query) })
      .then((response) => {
        setError(undefined);
        setData(response.data);
      })
      .catch((err) => {
        setError(err);
        setData(undefined);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [endpoint, JSON.stringify(query)]);

  if (error) {
    return {
      state: States.error,
      error,
    };
  }

  if (loading || !data) {
    return {
      state: States.loading,
    };
  }

  return {
    state: States.data,
    data: data!,
  };
};
