import { APIEndPoints } from "../../utils/ApiEndpoints";
import { apiSlice } from "./createApiSlice";

export const messageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createMessage: builder.mutation({
      query: (body) => ({
        url: APIEndPoints.MESSAGE_URL,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Message"],
    }),

    getChatsMessages: builder.query({
      query: ({ userId }) => ({
        url: APIEndPoints.MESSAGE_URL + "/" + userId,
        // params: { receiverId },
      }),
      providesTags: ["Message"],
      keepUnusedDataFor: 86400,
    }),
    getChatMessages: builder.query({
      query: ({ senderId, receiverId }) => ({
        url: `${APIEndPoints.MESSAGE_URL}/`,
        params: {
          senderId,
          receiverId,
        },
      }),
      providesTags: ["Message"],
      keepUnusedDataFor: 86400,
    }),
    updateViewedMessages: builder.mutation({
      query: ({ senderId, receiverId }) => ({
        url: `${APIEndPoints.MESSAGE_URL}/${senderId}/${receiverId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Message"],
    }),
    deleteMessage: builder.mutation({
      query: ({ senderId, messageIds, chatId }) => ({
        url: `messages/${chatId}`,
        method: "DELETE",
        body: { senderId, messageIds },
      }),
      invalidatesTags: ["Message", "Chats"],
    }),
  }),
});

export const {
  useGetChatsMessagesQuery,
  useCreateMessageMutation,
  useGetChatMessagesQuery,
  useUpdateViewedMessagesMutation,
  useDeleteMessageMutation,
} = messageApiSlice;
