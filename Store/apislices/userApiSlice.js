import { APIEndPoints } from "../../utils/ApiEndpoints";
import { apiSlice } from "./createApiSlice";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => ({
        url: `${APIEndPoints.USER_URL}`,
      }),
      providesTags: ["User"],
      keepUnusedDataFor: 86400,
    }),
    getUserDetails: builder.query({
      query: ({ userId }) => ({
        url: `/user/${userId}`,
      }),
      providesTags: ["User"],
      keepUnusedDataFor: 86400,
    }),

    deleteUser: builder.mutation({
      query: ({ userId }) => ({
        url: `/user/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    updateUser: builder.mutation({
      query: (data) => ({
        url: `/user/${data.userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    getStreamToken: builder.mutation({
      query: (data) => ({
        url: `${APIEndPoints.STREAM_TOKEN_URL}`,
        method: "POST",
        body: data,
      }),
      providesTags: ["User"],
      keepUnusedDataFor: 86400,
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useGetStreamTokenMutation,
} = userApiSlice;
