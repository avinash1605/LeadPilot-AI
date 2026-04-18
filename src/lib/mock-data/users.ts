import type { User } from "@/lib/types";

export const users: User[] = [
  {
    id: "admin-1",
    name: "Priya Sharma",
    email: "admin@leadpilot.ai",
    role: "admin",
    avatar: "https://placehold.co/64x64",
    team: "Leadership",
  },
  {
    id: "user-1",
    name: "Rahul Mehta",
    email: "rahul@leadpilot.ai",
    role: "user",
    avatar: "https://placehold.co/64x64",
    team: "Sales",
  },
  {
    id: "user-2",
    name: "Ananya Singh",
    email: "ananya@leadpilot.ai",
    role: "user",
    avatar: "https://placehold.co/64x64",
    team: "Sales",
  },
  {
    id: "user-3",
    name: "Vikram Patel",
    email: "vikram@leadpilot.ai",
    role: "user",
    avatar: "https://placehold.co/64x64",
    team: "Sales",
  },
];

export const loginCredentials = {
  "admin@leadpilot.ai": { password: "admin123", userId: "admin-1" },
  "rahul@leadpilot.ai": { password: "user123", userId: "user-1" },
};
