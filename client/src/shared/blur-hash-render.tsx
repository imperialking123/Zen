import { decode } from "blurhash";
import { useEffect, useRef } from "react";
import { AiOutlineLoading } from "react-icons/ai";

const BlurhashCanvas = ({
    hash,
    width = 32,   
    height = 32,
    punch = 1,
}: {
    hash: string;
    width?: number;
    height?: number;
    punch?: number;
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const pixels = decode(hash, width, height, punch);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const imageData = ctx.createImageData(width, height);
        imageData.data.set(pixels);
        ctx.putImageData(imageData, 0, 0);
    }, [hash, width, height, punch]);

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{ width: "100%", height: "100%", display: "block" }}
            />

            <div style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "25px",
                height: "25px",
                borderRadius: "50%",
                background: "rgba(26, 26, 26, 0.4)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                <AiOutlineLoading size={18} style={{ animation: "spin 1s linear infinite" }} />
            </div>
        </div>
    );
};

export default BlurhashCanvas




