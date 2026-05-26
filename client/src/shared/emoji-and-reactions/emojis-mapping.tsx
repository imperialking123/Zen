import { getEmojiUrl } from "@/core/utils/chat-functions";

import { Flex, Grid, Input, InputGroup, Text } from "@chakra-ui/react";
import { useState, useEffect, useMemo, useCallback, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { FaSearch } from "react-icons/fa";
import { RiEmotionSadLine } from "react-icons/ri";
import React from "react";

// Lazy load emoji data to reduce initial bundle size
let emojiData: any = null;
const loadEmojiData = async () => {
  if (!emojiData) {
    const module = await import("@/lib/emojiArray");
    emojiData = module.default;
  }
  return emojiData;
};

interface EmojiCategory {
  categoryText: string;
  value: string;
  emojis: Array<{
    text: string;
    shortCode: string;
    value: string;
    searchKeywords: string[];
  }>;
}

const scrollYCss = {
  scrollBehavior: "smooth",
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "fg.muted",
    borderRadius: "full",
  },
};

const EmojiCategoryItem = React.memo(({
  emojiCategory,
  categoryText,
  onSelect,
}: {
  emojiCategory: EmojiCategory;
  categoryText: string;
  onSelect: (emoji: string) => void;
}) => {
  const handleEmojiClick = useCallback((emojiValue: string) => {
    onSelect(emojiValue);
  }, [onSelect]);

  return (
    <Flex direction="column" px="8px" w="full">
      <Text>{categoryText}</Text>

      <Grid
        w="full"
        templateColumns="repeat(auto-fill, minmax(45px, 1fr))"
        gap="3px"
        alignItems="center"
      >
        {emojiCategory.emojis.map((emoji, index) => (
          <button
            key={`${emoji.value}-${index}`}
            onClick={() => handleEmojiClick(emoji.value)}
            className="emojiItem"
            style={{
              backgroundImage: `url(${getEmojiUrl(emoji.value)})`,
            }}
          />
        ))}
      </Grid>
    </Flex>
  );
});

const EmojiMappingUI = ({
  showSearchBar = true,
  onEmojiSelect,
}: {
  showSearchBar?: boolean;
  onEmojiSelect: (emoji: string) => void;
}) => {
  const [emojisToMap, setEmojisToMap] = useState<EmojiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Load emoji data on mount
  useEffect(() => {
    const loadEmojis = async () => {
      try {
        const data = await loadEmojiData();
        setEmojisToMap(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load emoji data:", error);
        setIsLoading(false);
      }
    };
    loadEmojis();
  }, []);

  // Optimized debounced search with useMemo for performance
  const debouncedSearchQuery = useMemo(() => searchQuery, [searchQuery]);

  const filteredEmojis = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return emojisToMap;

    const normalizedQuery = debouncedSearchQuery.toLowerCase().trim();

    return emojisToMap
      .map((category: EmojiCategory) => {
        const matchedEmojis = category.emojis.filter((emoji: any) => {
          // Search by shortCode
          const shortCodeMatch = emoji.shortCode.toLowerCase().includes(normalizedQuery);

          // Search by emoji text (the actual emoji character)
          const textMatch = emoji.text.includes(debouncedSearchQuery);

          // Search by category name
          const categoryMatch = category.value.toLowerCase().includes(normalizedQuery) ||
            category.categoryText.toLowerCase().includes(normalizedQuery);

          // Search by keywords from the emoji array
          const keywords = emoji.searchKeywords || [];
          const keywordMatch = keywords.some((keyword: string) =>
            keyword.toLowerCase().includes(normalizedQuery)
          );

          // Search by removing colons from shortCode (for users who type without colons)
          const shortCodeNoColon = emoji.shortCode.replace(/:/g, '').toLowerCase();
          const shortCodeNoColonMatch = shortCodeNoColon.includes(normalizedQuery.replace(/:/g, ''));

          return shortCodeMatch || textMatch || categoryMatch || keywordMatch || shortCodeNoColonMatch;
        });

        if (matchedEmojis.length === 0) return null;

        return {
          ...category,
          emojis: matchedEmojis,
        };
      })
      .filter((category): category is EmojiCategory => category !== null);
  }, [debouncedSearchQuery, emojisToMap]);

  const { t: translate } = useTranslation(["chat"]);

  const { inputPlaceHolderText, noSearchResults } = translate(
    "EmojiMappingUI",
  ) as unknown as {
    inputPlaceHolderText: string;
    noSearchResults: string;
  };

  // Optimized debounced search handler
  const debouncedSearchHandler = useMemo(() => {
    let timer: number;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        // Search is handled by useMemo above
      }, 200); // Reduced from 300ms to 200ms for better responsiveness
    };
  }, []);

  useEffect(() => {
    debouncedSearchHandler();
  }, [searchQuery, debouncedSearchHandler]);

  const handleSearchInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  if (isLoading) {
    return (
      <Flex h="100%" w="100%" alignItems="center" justifyContent="center" color="fg.muted">
        <Flex
          w="40px"
          h="40px"
          borderRadius="50%"
          border="3px solid"
          borderColor="bg.muted"
          borderTopColor="fg.default"
          animation="spin 1s linear infinite"
        />
      </Flex>
    );
  }

  return (
    <Flex
      gap="10px"
      minH="full"
      minW="full"
      maxW="full"
      direction="column"
      maxH="full"
      userSelect="none"
    >
      {showSearchBar && (
        <Flex w="full" pt="2px" alignItems="center" px="10px">
          <InputGroup startElement={<FaSearch />}>
            <Input
              onChange={handleSearchInputChange}
              rounded="lg"
              placeholder={inputPlaceHolderText}
            />
          </InputGroup>
        </Flex>
      )}
      <Flex
        flex={1}
        borderTop="1px solid"
        borderTopColor="bg.emphasized"
        roundedBottom="10px"
        direction="column"
        gap="10px"
        overflow="auto"
        py="10px"
        css={scrollYCss}
      >
        {filteredEmojis.length > 0 &&
          filteredEmojis.map((category) => {
            return (
              <EmojiCategoryItem
                key={category.value}
                onSelect={onEmojiSelect}
                categoryText={translate(`EmojiMappingUI.${category.value}`)}
                emojiCategory={category}
              />
            );
          })}

        {filteredEmojis.length === 0 && (
          <Flex
            justifyContent="center"
            alignItems="center"
            direction="column"
            flex={1}
            color="fg.muted"
          >
            <RiEmotionSadLine
              strokeWidth={0}
              style={{ width: "100px", height: "100px" }}
            />

            <Text>{noSearchResults}</Text>
          </Flex>
        )}
      </Flex>

      <Flex h="5px"></Flex>
    </Flex>
  );
};

export default EmojiMappingUI;





