import { APIEndPoints } from "../../utils/ApiEndpoints";
import { apiSlice } from "./createApiSlice";

export const statusApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createStatus: builder.mutation({
      query: (body) => ({
        url: APIEndPoints.STATUS_URL,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Status"],
    }),
    getStatus: builder.query({
      query: () => ({
        url: APIEndPoints.STATUS_URL,
        // params: { receiverId },
      }),
      providesTags: ["Status"],
      keepUnusedDataFor: 86400,
    }),
    getSingleStatus: builder.query({
      query: ({ senderId, receiverId }) => ({
        url: `${APIEndPoints.STATUS_URL}/`,
        params: {
          senderId,
          receiverId,
        },
      }),
      providesTags: ["Status"],
      keepUnusedDataFor: 86400,
    }),
    reactToStatus: builder.mutation({
      query: (body) => ({
        url: APIEndPoints.STATUS_URL,
        method: "POST",
        body: body,
      }),
    }),
    updateStatusToViewes: builder.mutation({
      query: (body) => ({
        url: `${APIEndPoints.STATUS_URL}/view/${body.statusId}`,
        method: "POST",
        body: body,
      }),
    }),

    deleteStatus: builder.mutation({
      query: ({ statusId, userId }) => ({
        url: `${APIEndPoints.STATUS_URL}`,
        method: "DELETE",
        params: { userId, statusId },
      }),
      invalidatesTags: ["Status"],
    }),
  }),
});

export const {
  useCreateStatusMutation,
  useGetStatusQuery,
  useGetSingleStatusQuery,
  useReactToStatusMutation,
  useUpdateStatusToViewesMutation,
  useDeleteStatusMutation,
} = statusApiSlice;
