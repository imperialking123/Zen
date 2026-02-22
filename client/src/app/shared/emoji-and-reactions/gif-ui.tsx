import { Flex, IconButton, Input, InputGroup, Text } from "@chakra-ui/react";
import { useCallback, useState, useRef, useEffect, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { FaSearch } from "react-icons/fa";
import debounce from "lodash.debounce";
import { SearchGiphy } from "@/utils/chatFunctions";
import { type GifData } from "@/types";
import { gifCategories } from "@/lib/arrays";
import { GrLinkPrevious } from "react-icons/gr";
import { RiEmotionSadLine } from "react-icons/ri";
import React from "react";

const GifCategoryItem = React.memo(React.forwardRef<HTMLDivElement, {
  name: string;
  value: string;
  preview: string;
  onCategoryClick: ({ value, name }: { value: string; name: string }) => void;
  isVisible: boolean;
}>(({
  name,
  value,
  preview,
  onCategoryClick,
  isVisible,
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      if (isVisible && !hasLoaded) {
        // Only play if visible and not previously loaded
        videoRef.current.play().then(() => {
          setHasLoaded(true);
        }).catch(() => {
          // Handle autoplay policy violations gracefully
        });
      } else if (isVisible && hasLoaded) {
        // Resume if already loaded and visible
        videoRef.current.play().catch(() => {});
      } else if (!isVisible && hasLoaded) {
        // Pause but don't unload if already loaded
        videoRef.current.pause();
      }
    }
  }, [isVisible, hasLoaded]);

  // Cleanup video resources only on component unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    };
  }, []);

  return (
    <Flex ref={ref} rounded="4px" overflow="hidden" pos="relative" w="full" h="105px">
      <Flex
        onClick={() => onCategoryClick({ value, name })}
        userSelect="none"
        bg="blackAlpha.500"
        _hover={{
          bg: "blackAlpha.700",
        }}
        zIndex={20}
        transition="0.3s ease"
        color="white"
        h="full"
        pos="absolute"
        inset={0}
        fontWeight="bold"
        justifyContent="center"
        alignItems="center"
      >
        <Text>{name}</Text>
      </Flex>
      {isVisible || hasLoaded ? (
        <video
          ref={videoRef}
          autoPlay={isVisible}
          loop
          muted
          playsInline
          src={preview}
          preload="metadata"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "var(--chakra-colors-bg-subtle)",
          }}
        />
      )}
    </Flex>
  );
}));

const GifItem = React.memo(React.forwardRef<HTMLDivElement, {
  gifData: GifData;
  onGifSelect: ({ gifData }: { gifData: GifData }) => void;
  isVisible: boolean;
}>(({
  gifData,
  onGifSelect,
  isVisible,
}, ref) => {
  const { height, preview } = gifData;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      if (isVisible && !hasLoaded) {
        // Only play if visible and not previously loaded
        videoRef.current.play().then(() => {
          setHasLoaded(true);
        }).catch(() => {
          // Handle autoplay policy violations gracefully
        });
      } else if (isVisible && hasLoaded) {
        // Resume if already loaded and visible
        videoRef.current.play().catch(() => {});
      } else if (!isVisible && hasLoaded) {
        // Pause but don't unload if already loaded
        videoRef.current.pause();
      }
    }
  }, [isVisible, hasLoaded]);

  // Cleanup video resources only on component unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    };
  }, []);

  return (
    <Flex
      ref={ref}
      onClick={() => onGifSelect({ gifData: gifData })}
      boxShadow="xs"
      w="full"
      h={height}
      className="isLoading"
    >
      {isVisible || hasLoaded ? (
        <video
          ref={videoRef}
          autoPlay={isVisible}
          loop
          muted
          playsInline
          src={preview}
          preload="metadata"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "5px",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "5px",
            backgroundColor: "var(--chakra-colors-bg-subtle)",
          }}
        />
      )}
    </Flex>
  );
}));

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

const GifsUI = ({
  showSearchBar = true,
  onGifSelect,
}: {
  showSearchBar?: boolean;
  onGifSelect: ({ gifData }: { gifData: GifData }) => void;
}) => {
  const { t: translate } = useTranslation(["chat"]);

  const { inputPlaceHolderText, noGifFound, gifSearchError } = translate(
    "GifsUI",
  ) as unknown as {
    inputPlaceHolderText: string;
    gifSearchError: string;
    noGifFound: string;
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [LoadedGifs, setLoadedGifs] = useState<GifData[]>([]);
  const [gifError, setGifError] = useState(false);
  const [isLoadingGifs, setIsLoadingGifs] = useState(false);
  const [visibleVideoIds, setVisibleVideoIds] = useState<Set<string>>(new Set());
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRefs = useRef<Map<string, HTMLElement>>(new Map());

  const debounceSearch = useCallback(
    debounce(async (query: string) => {
      setIsLoadingGifs(true);
      const results = await SearchGiphy(query);
      setIsLoadingGifs(false);

      if (results.isError) {
        // Show error UI: "Something went wrong"
        setLoadedGifs([]);
        setGifError(true); // Add this state
      } else if (results.gifData.length === 0) {
        // Show "No GIFs found"
        setLoadedGifs([]);
        setGifError(false);
      } else {
        setLoadedGifs(results.gifData);
        setGifError(false);
      }
    }, 500), // Reduced from 800ms for better responsiveness
    [],
  );

  // Intersection Observer setup with persistent video loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        setVisibleVideoIds((prev) => {
          const newSet = new Set(prev);
          entries.forEach((entry) => {
            const id = entry.target.getAttribute('data-video-id');
            if (id) {
              if (entry.isIntersecting) {
                newSet.add(id);
              }
              // Don't remove from set when not intersecting to keep videos loaded
            }
          });
          return newSet;
        });
      },
      {
        rootMargin: '150px', // Increased margin for earlier preloading
        threshold: 0.1,
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Clear visible videos when search query changes to prevent memory buildup
  useEffect(() => {
    setVisibleVideoIds(new Set());
  }, [searchQuery]);

  // Observe elements when they mount/unmount
  useEffect(() => {
    if (observerRef.current) {
      elementRefs.current.forEach((element) => {
        observerRef.current?.observe(element);
      });
    }

    return () => {
      if (observerRef.current) {
        elementRefs.current.forEach((element) => {
          observerRef.current?.unobserve(element);
        });
      }
    };
  }, [LoadedGifs, searchQuery]);

  const setElementRef = (id: string) => (element: HTMLElement | null) => {
    if (element) {
      element.setAttribute('data-video-id', id);
      elementRefs.current.set(id, element);
      observerRef.current?.observe(element);
    } else {
      elementRefs.current.delete(id);
    }
  };

  const handleCategoryClick = useCallback(async ({
    value,
    name,
  }: {
    value: string;
    name: string;
  }) => {
    setSearchQuery(name);
    setIsLoadingGifs(true);
    const results = await SearchGiphy(value);
    setIsLoadingGifs(false);

    if (results.isError) {
      setLoadedGifs([]);
      setGifError(true);
    } else {
      setLoadedGifs(results.gifData); // Could be empty array
      setGifError(false);
    }
  }, []);

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchQuery(value);
    if (!value || value.length === 0) {
      setLoadedGifs([]);
      return;
    }
    setIsLoadingGifs(true);
    debounceSearch(value);
  }, [debounceSearch]);

  const handleRemoveSearch = useCallback(() => {
    setSearchQuery("");
    setLoadedGifs([]);
  }, []);

  return (
    <Flex
      gap="10px"
      minH="full"
      minW="full"
      maxW="full"
      direction="column"
      maxH="full"
    >
      {showSearchBar && (
        <Flex w="full" pt="2px" gap="8px" alignItems="center" px="10px">
          {searchQuery && searchQuery.length > 0 && (
            <IconButton onClick={handleRemoveSearch} size="xs" variant="plain">
              <GrLinkPrevious style={{ width: "20px", height: "20px" }} />
            </IconButton>
          )}
          <InputGroup startElement={<FaSearch />}>
            <Input
              value={searchQuery}
              onChange={handleInputChange}
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
        css={scrollYCss}
        overflow="auto"
        px="10px"
        py="10px"
        direction="column"
        bg="none"
      >
        {/*Category Mapping */}
        {!isLoadingGifs && !searchQuery && (
          <Flex
            flex={1}
            roundedBottom="10px"
            direction="column"
            gap="10px"
            gridTemplateColumns="repeat(2, 1fr)"
            display="grid"
            bg="none"
          >
            {gifCategories.map((gifCategory) => {
              const { value, name } = translate(
                `GifsUI.gifCategories.${gifCategory.value}`,
              ) as unknown as {
                value: string;
                name: string;
              };

              return (
                <GifCategoryItem
                  onCategoryClick={handleCategoryClick}
                  key={value}
                  name={name}
                  value={value}
                  preview={gifCategory.preview}
                  isVisible={visibleVideoIds.has(value)}
                  ref={setElementRef(value)}
                />
              );
            })}
          </Flex>
        )}

        {!isLoadingGifs &&
          searchQuery &&
          LoadedGifs &&
          LoadedGifs.length > 0 && (
            <div className="gifGallery">
              {LoadedGifs.map((gifItem) => {
                return (
                  <GifItem
                    onGifSelect={onGifSelect}
                    key={gifItem.id}
                    gifData={gifItem}
                    isVisible={visibleVideoIds.has(gifItem.id)}
                    ref={setElementRef(gifItem.id)}
                  />
                );
              })}
            </div>
          )}

        {!isLoadingGifs &&
          searchQuery &&
          LoadedGifs.length === 0 && (
            gifError ? (
              <Flex
                flex={1}
                justifyContent="center"
                alignItems="center"
                direction="column"
                color="fg.muted"
              >
                <RiEmotionSadLine
                  strokeWidth={0}
                  style={{ width: "100px", height: "100px" }}
                />
                <Text>{gifSearchError}</Text>
              </Flex>
            ) : (
              <Flex
                flex={1}
                justifyContent="center"
                alignItems="center"
                direction="column"
                color="fg.muted"
              >
                <RiEmotionSadLine
                  strokeWidth={0}
                  style={{ width: "100px", height: "100px" }}
                />
                <Text>{noGifFound}</Text>
              </Flex>
            )
          )}

        {searchQuery && LoadedGifs.length === 0 && isLoadingGifs && (
          <div className="gifGallery">
            {Array.from({ length: 15 }).map((_, index) => (
              <div key={index} className="gif-skeleton" />
            ))}
          </div>
        )}
      </Flex>
      <Flex h="5px"></Flex>
    </Flex>
  );
};

export default GifsUI;
