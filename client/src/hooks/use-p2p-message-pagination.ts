import userChatStore from "@/core/store/user-chat-store";
import { useCallback, useEffect, useRef } from "react";

const useP2PMessagePagination = (
    conversationId?: string,
    wrapperRef?: React.RefObject<HTMLDivElement | null>
) => {
    const topRef = useRef<HTMLDivElement>(null);
    const isFetching = useRef(false);
    const isFirstRender = useRef(true);

    const hasMoreAbove = userChatStore((s) =>
        conversationId ? (s.hasMoreTop?.[conversationId] ?? false) : false
    );
    const fetchMoreMessagesTop = userChatStore((s) => s.fetchMoreMessagesTop);

    // keep hasMoreAbove in a ref so observer never needs to reconnect when it changes
    const hasMoreAboveRef = useRef(hasMoreAbove);
    useEffect(() => {
        hasMoreAboveRef.current = hasMoreAbove;
    }, [hasMoreAbove]);



    const onTopReached = useCallback(async () => {
        isFetching.current = true;
        if (conversationId) {
            await fetchMoreMessagesTop(conversationId);
        }
        isFetching.current = false;
    }, [conversationId, fetchMoreMessagesTop]);



    useEffect(() => {
        if (!conversationId) return;

        const observer = new IntersectionObserver((entries) => {
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }

            if (
                entries[0].isIntersecting &&
                !isFetching.current &&
                hasMoreAboveRef.current
            ) {
                isFetching.current = true;
                onTopReached();
            }
        }, {
            root: wrapperRef?.current || null,
            rootMargin: '500px'
        });

        if (topRef.current) observer.observe(topRef.current);

        return () => observer.disconnect();
    }, [conversationId, onTopReached, wrapperRef]);

    return { topRef };
};

export default useP2PMessagePagination;