import useTextMessage from "@/hooks/use-text";
import { Box, Flex, Text, } from "@chakra-ui/react";
import { memo, useEffect, useRef } from "react";


type MessageTextEditorModeT = {
  text: string,
  index: number,
  handleTriggerEditMode: (index: number, closeMenuFirst?: boolean) => void
  handleEditMesssage: (msgIndex: number, text: string) => void
}

const MessageTextEditor = (props: MessageTextEditorModeT) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<string>(props.text)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus()
      // place cursor at end
      const range = document.createRange()
      const sel = window.getSelection()
      range.selectNodeContents(editorRef.current)
      range.collapse(false)
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation()
        props.handleTriggerEditMode(props.index)
      }
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault()
        event.stopPropagation()
        props.handleEditMesssage(props.index, textRef.current)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    textRef.current = e.currentTarget.innerText
  }

  const handleSaveClick = () => {
    props.handleEditMesssage(props.index, textRef.current)
  }

  const handleCancelClick = () => {
    props.handleTriggerEditMode(props.index)
  }

  return (
    <Box pr="5px" display="flex" flexDir="column" gap="5px">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleTextChange}
        style={{
          outline: "none",
          minWidth: "100%",
          maxWidth: "100%",
          minHeight: "20px",
          padding: "10px",
          fontSize: "14px",
          borderRadius: "6px",
          border: "1px solid",
          borderColor: "var(--chakra-colors-bg-emphasized)",
        }}
      >
        {props.text}
      </div>

      <Flex alignItems="center" gap="2px" fontSize="xs">
        escape to{" "}
        <Text
          _hover={{ textDecor: "underline" }}
          color="fg"
          fontWeight="bold"
          cursor="pointer"
          onClick={handleCancelClick}
        >
          cancel
        </Text>{" "}
        • enter to{" "}
        <Text
          _hover={{ textDecor: "underline" }}
          color="fg"
          fontWeight="bold"
          cursor="pointer"
          onClick={handleSaveClick}
        >
          save
        </Text>
      </Flex>
    </Box>
  )
}


type MessageTextRenderT = {
  text: string,
  messageId: string, index: number,
  handleTriggerEditMode: (index: number, closeMenuFirst?: boolean) => void
  handleEditMesssage: (msgIndex: number, text: string) => void
}


const MessageTextRenderer = ({ text, messageId, index, handleTriggerEditMode, handleEditMesssage }: MessageTextRenderT) => {
  const { isEditing, } = useTextMessage({
    messageId, index
  })

  if (isEditing) {
    return (
      <MessageTextEditor handleEditMesssage={handleEditMesssage} index={index} handleTriggerEditMode={handleTriggerEditMode} text={text} />
    )
  }

  return (
    <Box
      wordBreak="break-word"
      fontWeight="400"
      fontSize="15px"
      lineHeight="1.5"
      whiteSpace="pre-wrap"
      overflowWrap="anywhere"
      color="gray.700"
      _dark={{
        color: "gray.100",
      }}
      letterSpacing="0.01em"
      userSelect="text"
      maxW="98%"
    >
      {text}
    </Box>
  );
};

export default memo(MessageTextRenderer);
