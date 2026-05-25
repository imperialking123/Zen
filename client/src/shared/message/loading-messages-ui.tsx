import { useMemo } from 'react';
import { Flex, Box, Circle } from '@chakra-ui/react';

// Types
type NameWidth = 100 | 150;
type SkeletonData = {
    nameWidth: NameWidth;
    textLines: number[][]; // Array of lines, each line is an array of granule widths
    hasImage: boolean;
    optionalTextLines: number[][];
};

// Deterministic skeleton data instead of random
const PREDEFINED_SKELETONS: SkeletonData[] = [
    {
        nameWidth: 150,
        textLines: [[120, 80, 100], [200, 90]],
        hasImage: true,
        optionalTextLines: [[100, 150]]
    },
    {
        nameWidth: 100,
        textLines: [[180, 120]],
        hasImage: false,
        optionalTextLines: []
    },
    {
        nameWidth: 150,
        textLines: [[300], [150, 100, 80], [200]],
        hasImage: true,
        optionalTextLines: []
    },
    {
        nameWidth: 100,
        textLines: [[100, 150], [220]],
        hasImage: false,
        optionalTextLines: []
    },
    {
        nameWidth: 150,
        textLines: [[140, 200, 90]],
        hasImage: true,
        optionalTextLines: [[80, 100]]
    }
];

// Function to generate the skeleton data deterministically
const generateSkeletonData = (count: number): SkeletonData[] => {
    return Array.from({ length: count }).map((_, i) => {
        return PREDEFINED_SKELETONS[i % PREDEFINED_SKELETONS.length];
    });
};

// Component that takes the value and generates the UI
const MessageSkeletonItem = ({ data }: { data: SkeletonData }) => {
    return (
        <Flex gap={4} w="full">
            {/* Avatar */}
            <Circle size="40px" flexShrink={0} className="discord-shimmer" />

            {/* Message Content */}
            <Flex flexDir="column" gap={2} w="full">
                {/* Header (Name + Timestamp) */}
                <Flex alignItems="center" gap={3}>
                    <Box
                        h="16px"
                        borderRadius="md"
                        className="discord-shimmer-name"
                        style={{ width: `${data.nameWidth}px` }}
                    />
                    <Box
                        h="12px"
                        borderRadius="md"
                        className="discord-shimmer"
                        style={{ width: `60px` }}
                    />
                </Flex>

                {/* Text Lines */}
                <Flex flexDir="column" gap={2} mt={1}>
                    {data.textLines.map((line, lineIndex) => (
                        <Flex key={lineIndex} gap={2} flexWrap="wrap">
                            {line.map((width, granuleIndex) => (
                                <Box
                                    key={granuleIndex}
                                    h="16px"
                                    borderRadius="md"
                                    className="discord-shimmer"
                                    style={{ width: `${width}px` }}
                                />
                            ))}
                        </Flex>
                    ))}
                </Flex>

                {/* Image Attachment */}
                {data.hasImage && (
                    <Box
                        h="250px"
                        w="250px"
                        borderRadius="lg"
                        mt={2}
                        className="discord-shimmer"
                    />
                )}

                {/* Optional Text Lines after Image */}
                {data.optionalTextLines.length > 0 && (
                    <Flex flexDir="column" gap={2} mt={2}>
                        {data.optionalTextLines.map((line, lineIndex) => (
                            <Flex key={lineIndex} gap={2} flexWrap="wrap">
                                {line.map((width, granuleIndex) => (
                                    <Box
                                        key={granuleIndex}
                                        h="16px"
                                        borderRadius="md"
                                        className="discord-shimmer"
                                        style={{ width: `${width}px` }}
                                    />
                                ))}
                            </Flex>
                        ))}
                    </Flex>
                )}
            </Flex>
        </Flex>
    );
};

const LoadingMessagesUI = ({ count = 15 }: { count?: number }) => {
    const skeletons = useMemo(() => generateSkeletonData(count), [count]);

    return (
        <Flex flexDir="column" gap={6} px={4} pb={4} w="full">
            {skeletons.map((skeleton, index) => (
                <MessageSkeletonItem key={index} data={skeleton} />
            ))}
        </Flex>
    );
}

export default LoadingMessagesUI;