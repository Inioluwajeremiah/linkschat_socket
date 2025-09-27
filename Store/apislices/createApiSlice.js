import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { APIEndPoints } from "../../utils/ApiEndpoints";

// "http://172.27.62.117:5000"

const baseQuery = fetchBaseQuery({ baseUrl: APIEndPoints.BASE_URL });

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["Application", "Chats", "Message", "Status", "User"],
  endpoints: (builder) => ({}),
});
