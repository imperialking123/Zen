import { Flex, IconButton, Input, InputGroup, Text } from "@chakra-ui/react";
import {
  useCallback,
  useState,
  useRef,
  useEffect,
  type ChangeEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { FaSearch } from "react-icons/fa";
import debounce from "lodash.debounce";
import { SearchGiphy } from "@/functions/chatFunctions";
import { type GifData } from "@/types";
import { GrLinkPrevious } from "react-icons/gr";
import { RiEmotionSadLine } from "react-icons/ri";
import { memo, forwardRef } from "react";
import UserFavouriteStore from "@/store/user-favourite-store";

const GifCategoryItem = memo(
  ({
    name,
    value,
    preview,
    onCategoryClick,
  }: {
    name: string;
    value: string;
    preview: string;
    onCategoryClick: ({ value, name }: { value: string; name: string }) => void;
  }) => {
    const [hasLoaded, setHasLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleImageLoad = () => {
      setHasLoaded(true);
    };

    const handleImageError = () => {
      setHasError(true);
    };

    const handleClick = () => {
      onCategoryClick({ value, name: name.replace("#", "") });
    };

    return (
      <Flex
        onClick={handleClick}
        w="full"
        h="120px"
        rounded="md"
        overflow="hidden"
        position="relative"
        cursor="pointer"
        boxShadow="inner"
        _hover={{
          bg: "blackAlpha.400",
          transform: "scale(1.02)",
          transition: "all 0.2s ease-in-out",
        }}
        bg="blackAlpha.500"
        justifyContent="center"
        alignItems="center"
      >
        {!hasError ? (
          <img
            src={preview}
            alt={name}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: hasLoaded ? 1 : 0.7,
              transition: "opacity 0.3s ease",
            }}
          />
        ) : (
          <Flex
            w="full"
            h="full"
            bg="bg.subtle"
            justifyContent="center"
            alignItems="center"
          >
            <Text color="fg.muted" fontSize="sm" textAlign="center">
              {name}
            </Text>
          </Flex>
        )}

        <Flex
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          bg="blackAlpha.500"
          h="full"
          w="full"
          justifyContent="center"
          alignItems="center"
        >
          <Text color="white" fontWeight="600" fontSize="sm" textAlign="center">
            {name.replace("#", "")}
          </Text>
        </Flex>
      </Flex>
    );
  },
);

const GifItem = memo(
  forwardRef<
    HTMLDivElement,
    {
      gifData: GifData;
      onGifSelect: ({ gifData }: { gifData: GifData }) => void;
      isVisible: boolean;
    }
  >(({ gifData, onGifSelect, isVisible }, ref) => {
    const { height, preview } = gifData;
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
      if (videoRef.current) {
        if (isVisible && !hasLoaded) {
          videoRef.current
            .play()
            .then(() => {
              setHasLoaded(true);
            })
            .catch(() => {});
        } else if (isVisible && hasLoaded) {
          videoRef.current.play().catch(() => {});
        } else if (!isVisible && hasLoaded) {
          videoRef.current.pause();
        }
      }
    }, [isVisible, hasLoaded]);

    // Cleanup video resources only on component unmount
    useEffect(() => {
      return () => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.src = "";
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
  }),
);

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

  const { inputPlaceHolderText, noGifFound, gifSearchError, FavouritesText } =
    translate("GifsUI") as unknown as {
      inputPlaceHolderText: string;
      gifSearchError: string;
      noGifFound: string;
      FavouritesText: string;
    };

  const [searchQuery, setSearchQuery] = useState("");
  const [LoadedGifs, setLoadedGifs] = useState<GifData[]>([]);
  const [gifError, setGifError] = useState(false);
  const [isLoadingGifs, setIsLoadingGifs] = useState(false);
  const [visibleVideoIds, setVisibleVideoIds] = useState<Set<string>>(
    new Set(),
  );

  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRefs = useRef<Map<string, HTMLElement>>(new Map());
  const favouriteGifs = UserFavouriteStore((state) => state.favouriteGifs);
  const gifCategories = UserFavouriteStore((state) => state.gifCategories);
  const getGifCategories = UserFavouriteStore.getState().getGifCategories;
  const [showFavourites, setShowFavourites] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
        // Reset scroll to top when new GIFs load
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
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
            const id = entry.target.getAttribute("data-video-id");
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
        rootMargin: "150px", // Increased margin for earlier preloading
        threshold: 0.1,
      },
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

  useEffect(() => {
    if (gifCategories.length === 0) {
      getGifCategories();
    }
  }, [gifCategories]);

  const setElementRef = (id: string) => (element: HTMLElement | null) => {
    if (element) {
      element.setAttribute("data-video-id", id);
      elementRefs.current.set(id, element);
      observerRef.current?.observe(element);
    } else {
      elementRefs.current.delete(id);
    }
  };

  const handleCategoryClick = useCallback(
    async ({ value, name }: { value: string; name: string }) => {
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
        // Reset scroll to top when new GIFs load
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      }
    },
    [],
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setSearchQuery(value);
      if (!value || value.length === 0) {
        setLoadedGifs([]);
        return;
      }
      setIsLoadingGifs(true);
      debounceSearch(value);
    },
    [debounceSearch],
  );

  const handleRemoveSearch = useCallback(() => {
    setSearchQuery("");
    setLoadedGifs([]);
    // Reset scroll to top when clearing search
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
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
      {showSearchBar && !showFavourites && (
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

      {showFavourites && (
        <Flex
          userSelect="none"
          w="full"
          pt="2px"
          gap="8px"
          alignItems="center"
          px="10px"
        >
          <IconButton
            onClick={() => {
              setShowFavourites(false);
              // Reset scroll to top when leaving favourites
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = 0;
              }
            }}
            size="xs"
            variant="plain"
          >
            <GrLinkPrevious style={{ width: "20px", height: "20px" }} />
          </IconButton>

          <Text fontSize="md" fontWeight="600">
            {FavouritesText}
          </Text>
        </Flex>
      )}
      <Flex
        ref={scrollContainerRef}
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
        {!isLoadingGifs && !searchQuery && !showFavourites && (
          <Flex
            flex={1}
            roundedBottom="10px"
            direction="column"
            gap="10px"
            gridTemplateColumns="repeat(2, 1fr)"
            display="grid"
            bg="none"
          >
            {Object.keys(favouriteGifs).length > 0 &&
              gifCategories.length > 0 && (
                <Flex
                  w="full"
                  h="full"
                  onClick={() => {
                    setShowFavourites(true);
                    // Reset scroll to top when entering favourites
                    if (scrollContainerRef.current) {
                      scrollContainerRef.current.scrollTop = 0;
                    }
                  }}
                  justifyContent="center"
                  userSelect="none"
                  boxShadow="inner"
                  rounded="md"
                  _hover={{
                    bg: "blackAlpha.400",
                  }}
                  bg="blackAlpha.500"
                  alignItems="center"
                >
                  <Text color="white" fontWeight="600">
                    {FavouritesText}
                  </Text>
                </Flex>
              )}

            {gifCategories.map((gifCategory, i) => {
              return (
                <GifCategoryItem
                  onCategoryClick={handleCategoryClick}
                  key={i}
                  name={gifCategory.name}
                  value={gifCategory.searchterm}
                  preview={gifCategory.image}
                />
              );
            })}
          </Flex>
        )}

        {!isLoadingGifs &&
          searchQuery &&
          Array.isArray(LoadedGifs) &&
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
          Array.isArray(LoadedGifs) &&
          LoadedGifs.length === 0 &&
          (gifError ? (
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
          ))}

        {searchQuery &&
          Array.isArray(LoadedGifs) &&
          LoadedGifs.length === 0 &&
          isLoadingGifs && (
            <div className="gifGallery">
              {Array.from({ length: 15 }).map((_, index) => (
                <div key={index} className="gif-skeleton" />
              ))}
            </div>
          )}

        {showFavourites && (
          <div className="gifGallery">
            {Object.entries(favouriteGifs).map((gif) => {
              const gifItem = gif[1];
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
      </Flex>
      <Flex h="5px"></Flex>
    </Flex>
  );
};

export default GifsUI;
