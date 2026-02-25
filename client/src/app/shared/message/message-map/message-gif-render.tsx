import type { GifData } from "@/types";
import { Flex, Text, type FlexProps } from "@chakra-ui/react"
import { useEffect, useRef, type RefObject } from "react"


interface BaseGifRendererProps extends FlexProps {
  ref?: RefObject<HTMLDivElement>;
  gifData: GifData,
}

function MessageGifRender({ ref, gifData, ...props }: BaseGifRendererProps) {

  const { full, preview, width } = gifData
  const videoRef = useRef<HTMLVideoElement>(null)


  // Dom bloat is not a problem here . 
  // will use vitualizer to take components out of dom when not in view.
  // Increasing overall speed
  useEffect(() => {

    const observerCallBackHandler = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (videoRef.current) {
            console.log("Entered View")
            videoRef.current.play()
          }
        } else {
          if (videoRef.current) {
            console.log("Left View")
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
    <Flex direction="column" ref={ref} {...props} >

      <video
        draggable={false}
        ref={videoRef}
        loop
        src={preview ? preview : full} style={{
          width: width ? width : "auto", height: "auto",
          maxWidth: "260px",
          maxHeight: "280px",
          objectFit: "fill",
          borderRadius: "6px",
          pointerEvents: "none"
        }} />


      <Text fontSize="xs" fontWeight="500" color="fg.muted"  >GIF</Text>
    </Flex>
  )
}


export default MessageGifRender