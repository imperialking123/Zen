import useTextMessage from "@/hooks/use-text";
import { getEmojiUrl } from "@/utils/chatFunctions";
import { Box, Flex, Text, } from "@chakra-ui/react";
import { memo, useEffect, useState, useRef } from "react";


type MessageTextEditorModeT = {
  text: string
}

const MessageTextEditor = ({ text }: MessageTextEditorModeT) => {


  const [textData, setTextData] = useState<string>(text)
  const editorRef = useRef<HTMLDivElement>(null)

  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    const editor = e.currentTarget;
    const selection = window.getSelection();
    const cursorPosition = selection?.rangeCount ? selection.getRangeAt(0).startOffset : 0;

    const newText = editor.innerText || editor.textContent || '';
    console.log('Text changed:', newText);

    setTextData(newText);

    // Restore cursor position after React re-render
    setTimeout(() => {
      if (selection?.rangeCount && editor.firstChild) {
        const range = document.createRange();
        const textNode = editor.firstChild;
        if (textNode.nodeType === Node.TEXT_NODE) {
          range.setStart(textNode, Math.min(cursorPosition, textNode.textContent?.length || 0));
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }, 0);
  };

  const getRendition = (text: string) => {
    const emojiRegex = /(\p{RI}\p{RI}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(?:\u200D(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F))*/gu;
    const parts = text.split(emojiRegex);
    const showBig = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F){1,7}$/u.test(text.trim());

    return parts.map((part, i) => {
      if (!part) return null;

      if (part.match(emojiRegex)) {
        return (
          <img
            key={i}
            alt={part}
            draggable={false}
            data-type="emoji"
            data-emoji={part}
            className="emoji"
            src={getEmojiUrl(part)}
            width={showBig ? 45 : "1.2em"}
            height={showBig ? 45 : "1.2em"}
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
            style={{
              display: "inline-block",
              verticalAlign: "middle",
              objectFit: "contain",
            }}
          />
        );
      }

      return <span key={i}>{part}</span>;
    });
  };





  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      if (key === "Escape") {
        alert("Escape");
        event.stopPropagation();
      }

      if (key === "Enter" && event.shiftKey) {
        alert(" Save Enter");
        event.stopPropagation();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);


  return (
    <Box pr="5px" display="flex" flexDir="column" gap="5px" >
      <Box _focus={{
        outline: "none"
      }} ref={editorRef}
        minW="full" maxW="full" p="10px"
        fontSize="sm"
        contentEditable
        rounded="md" border="1px solid"
        borderColor="bg.emphasized"
        dangerouslySetInnerHTML={{ __html: getRendition(textData) }}
        onInput={handleTextChange}
      >
      </Box>

      <Flex alignItems="center" gap="2px" fontSize="xs"  >
        escape to <Text _hover={{
          textDecor: "underline"
        }} color="fg" fontWeight="bold" cursor="pointer" >cancel</Text> • <p>enter to</p> <Text _hover={{
          textDecor: "underline"
        }} color="fg" fontWeight="bold" cursor="pointer" >save</Text>
      </Flex>

    </Box>
  )
}


type MessageTextRenderT = { text: string, messageId: string, index: number }




const MessageTextRenderer = ({ text, messageId, index }: MessageTextRenderT) => {
  const emojiRegex =
    /(\p{RI}\p{RI}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(?:\u200D(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F))*/gu;

  const parts = text.split(emojiRegex);

  const showBig = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F){1,7}$/u.test(
    text.trim(),
  );

  const { isEditing, } = useTextMessage({
    messageId, index
  })

  if (isEditing) {
    return (
      <MessageTextEditor text={text} />
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
      {parts.map((part, i) => {
        if (!part) return null;

        if (part.match(emojiRegex)) {
          return (
            <img
              key={i}
              alt={part}
              draggable={false}
              data-type="emoji"
              data-emoji={part}
              className="emoji"
              src={getEmojiUrl(part)}
              width={showBig ? 45 : "1.2em"}
              height={showBig ? 45 : "1.2em"}
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
              style={{
                display: "inline-block",
                verticalAlign: "middle",
                objectFit: "contain",
              }}
            />
          );
        }

        return <span key={i}>{part}</span>;
      })}
    </Box>
  );
};

export default memo(MessageTextRenderer);
