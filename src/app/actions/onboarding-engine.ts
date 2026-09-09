"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function completeUserOnboarding(data: {
  displayName: string;
  age: number;
  university: string;
  yearOfStudy: number;
  languages: string[];
  introvertExtrovertScore: number;
  socialEnergyLevel: string;
  lookingForTags: string[];
  bio: string;
  extractedAiTags: string[];
  isInternationalStudent: boolean;
}) {
  try {
    const session = await getServerSession();

    if (!session || !session.user || !session.user.email) {
      return { error: "You must be logged in to complete onboarding." };
    }

    const isFirstTimeUni = data.yearOfStudy === 1;

    await prisma.user.update({
      where: {
        studentEmail: session.user.email,
      },
      data: {
        displayName: data.displayName,
        age: data.age,
        university: data.university,
        yearOfStudy: data.yearOfStudy,
        isFirstTimeUni: isFirstTimeUni,
        languages: data.languages,
        introvertExtrovertScore: data.introvertExtrovertScore,
        socialEnergyLevel: data.socialEnergyLevel,
        lookingForTags: data.lookingForTags,
        bio: data.bio,
        extractedAiTags: data.extractedAiTags,
        isInternationalStudent: data.isInternationalStudent,
        isFirstLogin: false,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error completing onboarding:", error);
    return { error: `Failed to save profile: ${error.message || "Unknown error"}` };
  }
}
