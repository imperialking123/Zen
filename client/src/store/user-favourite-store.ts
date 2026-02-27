import type { GifCategory } from "@/types";
import type { GifData } from "@/types/schema"
import { axiosInstance } from "@/utils";
import i18next from "../../i18nextConfig";
import { create } from "zustand"


type UserFavouriteStoreTypes = {
    gifCategories: GifCategory[]
    favouriteGifs: Record<string, GifData>;
    toggleFavourite: (gif: GifData, doNotPersist?: boolean) => void;
    getGifCategories: () => void
}

const UserFavouriteStore = create<UserFavouriteStoreTypes>((set) => ({
    favouriteGifs: {},
    toggleFavourite: (gif, doNotPersist) => {
        set((state) => {
            const next = { ...state.favouriteGifs }
            next[gif.id] ? delete next[gif.id] : next[gif.id] = gif
            return { favouriteGifs: next }
        })
        if (doNotPersist) return
        axiosInstance.patch("/favourites/gifs/toggle", {
            gif
        })

    },

    getGifCategories: async () => {
        try {
            const response = await axiosInstance.get<{ locale: string, tags: GifCategory[] }>(`/gif/categories/${i18next.language}`)
            set({ gifCategories: response.data.tags })
        } catch (error) {
            console.log("Coudn't get Categories ")
        }
    },
    gifCategories: [],
}))

export default UserFavouriteStore