import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
  profileImage: string | null;
  setProfileImage: (image: string | null) => void;
  userName: string;
  setUserName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  gender: string;
  setGender: (gender: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profileImage: null,
      setProfileImage: (image) => set({ profileImage: image }),
      userName: "Abu Talha",
      setUserName: (name) => set({ userName: name }),
      phone: "+880 1711223344",
      setPhone: (phone) => set({ phone: phone }),
      gender: "Male",
      setGender: (gender) => set({ gender: gender }),
    }),
    {
      name: 'aurea-user-data',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

