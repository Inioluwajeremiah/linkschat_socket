import { APIEndPoints } from "../../utils/ApiEndpoints";
import { apiSlice } from "./createApiSlice";

export const groupChatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGroupChats: builder.query({
      query: ({ userId }) => ({
        url: APIEndPoints.GROUP_CHAT_URL,
        params: {
          userId: userId,
        },
      }),
      providesTags: ["GroupChats"],
      keepUnusedDataFor: 86400,
    }),
    createGroupMessage: builder.mutation({
      query: (body) => ({
        url: APIEndPoints.MESSAGE_URL + "/group",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["GroupChats"],
    }),

    createGroup: builder.mutation({
      query: (body) => ({
        url: APIEndPoints.CREATE_GROUP_URL,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["GroupChats"],
    }),

    sendGroupMessage: builder.mutation({
      query: (body) => ({
        url: `/groupS/${body.chatId}/messages`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["GroupChats"],
    }),

    getGroupChat: builder.query({
      query: ({ chatId, userId }) => ({
        url: `/single-groupChat/${chatId}`,
        method: "GET",
        params: { userId },
      }),
      providesTags: (result, error, arg) => [
        { type: "GroupChat", id: arg.chatId },
      ],
    }),

    updateGroup: builder.mutation({
      query: (body) => ({
        url: "/groups/update",
        method: "PUT",
        body: body,
      }),
      // invalidatesTags: ["Message", "Chats"],
      invalidatesTags: (result, error, body) => [
        {
          type: "GroupChat",
          // id: "c671c95b-86ad-4454-87fd-4078ab8efefd",
          id: body.chatId,
        },
        "GroupChats",
      ],
    }),
    deleteGroup: builder.mutation({
      query: (body) => ({
        url: `groups/delete`,
        method: "DELETE",
        body: body,
      }),
      invalidatesTags: ["GroupChats"],
    }),
  }),
});

export const {
  useGetGroupChatsQuery,
  useGetGroupChatQuery,
  useCreateGroupMessageMutation,
  useCreateGroupMutation,
  useSendGroupMessageMutation,
  useDeleteGroupMutation,
  useUpdateGroupMutation,
} = groupChatApiSlice;
