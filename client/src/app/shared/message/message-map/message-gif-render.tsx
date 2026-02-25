import type { GifData } from "@/types";
import { Flex, Text,  } from "@chakra-ui/react"
import { useEffect, useRef, useState, } from "react"
import MediaLoadErrorUI from "../media-load-error-ui";

interface GifRendererProps  {
  gifData: GifData,
  disPlayGifFullScreen: () => void
}

function MessageGifRender({  gifData, disPlayGifFullScreen, }: GifRendererProps) {

  const { full, preview, width } = gifData
  const videoRef = useRef<HTMLVideoElement>(null);

  const [gifDetails, setGifDetails] = useState({
    isError: false,
    isLoading: true,
  })



  // Dom bloat is not a problem here . 
  // will use vitualizer to take components out of dom when not in view.
  // Increasing overall speed
  useEffect(() => {

    const observerCallBackHandler = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (videoRef.current) {
            videoRef.current.play()
          }
        } else {
          if (videoRef.current) {
            videoRef.current.pause()
          }
        }
      })
    }

    const observer = new IntersectionObserver(observerCallBackHandler, {
      threshold: 0.6
    })

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      observer.disconnect()
    }

  }, [])



  return (
    <Flex direction="column" >

      <Flex onClick={disPlayGifFullScreen} pos="relative"
        className={gifDetails.isLoading ? "isLoading" : ""} >
        {!gifDetails.isError && (
          <video
            draggable={false}
            ref={videoRef}
            loop
            onError={() => setGifDetails(e => ({ ...e, isError: true }))}
            onLoadedData={() => setGifDetails(e => ({ ...e, isLoading: false }))}
            src={preview ? preview : full}
            style={{
              width: width ? width : "auto", height: "auto",
              maxWidth: "260px",
              maxHeight: "280px",
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
          <Flex w="200px" h="200px" p="5px" className="isLoading" >

          </Flex>
        )}

        

      
      </Flex>

      <Text fontSize="xs" fontWeight="500" color="fg.muted" userSelect="none"  >GIF</Text>
    </Flex>
  )
}


export default MessageGifRender