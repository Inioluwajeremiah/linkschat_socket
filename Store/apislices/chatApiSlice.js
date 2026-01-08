import { APIEndPoints } from "../../utils/ApiEndpoints";
import { apiSlice } from "./createApiSlice";

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createChat: builder.mutation({
      query: (body) => ({
        url: APIEndPoints.CHAT_URL,
        method: "POST",
        body: body,
      }),
    }),
    getChats: builder.query({
      query: ({ userId }) => ({
        url: APIEndPoints.CHAT_URL,
        params: {
          userId: userId,
        },
      }),

      providesTags: ["Chats"],
      keepUnusedDataFor: 86400,
    }),

    getChat: builder.query({
      query: ({ userId, user2Id }) => ({
        url: APIEndPoints.CHAT_URL + "/" + userId + "/" + user2Id,
      }),
    }),
    deleteChat: builder.mutation({
      query: ({ userId, chatIds }) => ({
        // url: `${APIEndPoints.CHAT_URL}/${chatIds[0]}`,
        url: `chat/${chatIds[0]}`,
        method: "DELETE",
        body: { chatIds },
      }),
      invalidatesTags: ["Chats", "Message"],
    }),
  }),
});

export const {
  useCreateChatMutation,
  useGetChatsQuery,
  useGetChatQuery,
  useDeleteChatMutation,
} = chatApiSlice;
