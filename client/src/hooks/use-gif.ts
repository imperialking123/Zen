import UserFavouriteStore from "@/store/user-favourite-store"


const useGif = (gifId: string) => {

    const isFavourite = UserFavouriteStore(state => !!state.favouriteGifs[gifId])
    const toggleFavourite = UserFavouriteStore(state => state.toggleFavourite)

    return {
        isFavourite,
        toggleFavourite
    }
}

export default useGif