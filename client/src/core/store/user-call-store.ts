import { create } from "zustand";

type UserCallStoreTypes = {
  isCalling: boolean;
};

const userCallStore = create<UserCallStoreTypes>(() => ({
  isCalling: false,
}));

export default userCallStore;





