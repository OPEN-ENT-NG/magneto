import { odeServices } from "edifice-ts-client";

export const getAvatarUrl: (userId: string) => Promise<string> = async (
  userId,
) => {
  try {
    const result = odeServices.directory().getAvatarUrl(userId, "user");
    return result;
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  }
};
