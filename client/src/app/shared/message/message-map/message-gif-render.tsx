import type { GifData } from "@/types";
import { Flex, IconButton, Text, } from "@chakra-ui/react"
import { useEffect, useRef, useState, } from "react"
import MediaLoadErrorUI from "../media-load-error-ui";
import useGif from "@/hooks/use-gif";
import { FaRegStar, FaStar } from "react-icons/fa";

interface GifRendererProps {
  gifData: GifData,
  disPlayGifFullScreen: () => void
}

function MessageGifRender({ gifData, disPlayGifFullScreen, }: GifRendererProps) {

  const { full, preview, width, height } = gifData
  const videoRef = useRef<HTMLVideoElement>(null);

  interface GifDetails {
    isError: boolean;
    isLoading: boolean;
    showFavouriteButton: boolean;
    showFavouriteButtonTimer: number | null;
  }

  const [gifDetails, setGifDetails] = useState<GifDetails>({
    isError: false,
    isLoading: true,
    showFavouriteButton: false,
    showFavouriteButtonTimer: null,
  });

  const { toggleFavourite, isFavourite } = useGif(gifData.id)



  // Dom bloat is not a problem here . 
  // will use vitualizer to take components out of dom when not in view.
  // Increasing overall speed
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const observerCallBackHandler = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          videoEl.play().catch(() => { }) // catch prevents uncaught promise error
        } else {
          videoEl.pause()
        }
      })
    }

    const observer = new IntersectionObserver(observerCallBackHandler, {
      threshold: 0.6
    })

    observer.observe(videoEl)

    return () => {
      observer.disconnect()
    }

  }, [gifDetails.isLoading]) // re-run when loading finishes


  const handleMouseEnter = () => {
    setGifDetails(d => ({ ...d, showFavouriteButton: true }))
  }

  const handleMouseLeave = () => {
    setGifDetails(d => ({ ...d, showFavouriteButton: false }))
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setGifDetails(d => ({ ...d, showFavouriteButton: !d.showFavouriteButton }))
  }



  // Might need this function. will decide after testing on a real device

  // const handleToggleShowFavourite = (e: React.MouseEvent<HTMLDivElement>) => {
  //   e.stopPropagation();
  //   e.preventDefault()
  //   const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

  //   if (isTouchDevice) {
  //     setGifDetails((s) => ({ ...s, showFavouriteButton: true }))

  //     if (gifDetails.showFavouriteButtonTimer && typeof gifDetails.showFavouriteButtonTimer === "number") {
  //       clearTimeout(gifDetails.showFavouriteButtonTimer)
  //     }

  //     const timer = setTimeout(() => {
  //       setGifDetails((s) => ({ ...s, showFavouriteButton: true }))
  //     }, 3000);

  //     setGifDetails((s) => ({ ...s, showFavouriteButtonTimer: timer }))
  //   }
  // }





  return (
    <Flex direction="column" pr="15px" >

      <Flex onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
        onClick={disPlayGifFullScreen}
        // onDoubleClick={handleToggleShowFavourite} 
        pos="relative"
        width="fit-content"
        height="fit-content" overflow="hidden"
      >
        {!gifDetails.isError && (
          <video
            draggable={false}
            ref={videoRef}
            loop
            muted
            onError={() => setGifDetails(e => ({ ...e, isError: true, isLoading: false }))}
            onLoadedData={() => setGifDetails(e => ({ ...e, isLoading: false }))}
            src={preview ? full : full}
            style={{
              width: width ? `${width}px` : "auto",
              height: height ? `${height}px` : "auto",
              maxHeight: "300px",
              objectFit: "fill",
              borderRadius: "6px",
              pointerEvents: "none",
              display: gifDetails.isLoading ? "none" : "block"
            }} />
        )}


        {gifDetails.isError && (
          <Flex w="200px" h="200px" >
            <MediaLoadErrorUI />
          </Flex>
        )}

        {gifDetails.isLoading && (
          <Flex rounded="sm" w="200px" h="200px" p="5px" className="isLoading" >

          </Flex>
        )}



        {!gifDetails.isLoading && !gifDetails.isError &&
          <IconButton
            size="xs"
            rounded="md"
            pos="absolute"
            top={gifDetails.showFavouriteButton ? "10px" : "-35px"} left="10px"
            transition="0.2s ease"
            color="bg.emphasized"
            _hover={{
              color: "bg",
            }}
            onClick={(e) => {
              e.stopPropagation()
              toggleFavourite(gifData)
            }} >
            {!isFavourite ? <FaRegStar style={{ width: "20px", height: "20px" }} />
              :
              <FaStar style={{ width: "20px", height: "20px" }} />
            }
          </IconButton>}


      </Flex>

      <Text fontSize="xs" fontWeight="500" color="fg.muted" userSelect="none"  >GIF</Text>
    </Flex>
  )
}


export default MessageGifRender