import userChatStore from "@/store/user-chat-store"

type useTextMessageT = {
    messageId: string;
    index: number
}

const useTextMessage = (props: useTextMessageT) => {


    const { messageId } = props

    const editTextOnMessageId = userChatStore((state) => state.editTextOnMessageId)
    const isEditing = editTextOnMessageId === messageId;




    return {
        isEditing,
    }

}

export default useTextMessage

