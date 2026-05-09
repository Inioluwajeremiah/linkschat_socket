import { APIEndPoints } from "../../utils/ApiEndpoints";
import { apiSlice } from "./createApiSlice";

export const callApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createUserCall: builder.mutation({
      query: (body) => ({
        url: "/call",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Call"],
    }),
    getUserCalls: builder.query({
      query: ({ userId }) => ({
        url: `/single-call`,
        params: { callerId: userId },
      }),
      providesTags: ["Call"],
      keepUnusedDataFor: 86400,
    }),
    getUserCallDetails: builder.query({
      query: ({ userId }) => ({
        url: `/call/${userId}`,
      }),
      providesTags: ["Call"],
      keepUnusedDataFor: 86400,
    }),
    updateUserCall: builder.mutation({
      query: (data) => ({
        url: `/call/${data.userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Call"],
    }),
    deleteUserCall: builder.mutation({
      query: ({ userId }) => ({
        url: `/call/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Call"],
    }),
    deleteAllUserCalls: builder.mutation({
      query: ({ callerId }) => ({
        url: `/call-delete`,
        method: "DELETE",
        params: { callerId },
      }),
      invalidatesTags: ["Call"],
    }),
  }),
});

export const {
  useCreateUserCallMutation,
  useGetUserCallsQuery,
  useGetUserCallDetailsQuery,
  useUpdateUserCallMutation,
  useDeleteUserCallMutation,
  useDeleteAllUserCallsMutation,
} = callApiSlice;
