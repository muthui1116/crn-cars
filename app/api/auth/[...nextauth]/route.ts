// app/api/auth/[...nextauth]/route.ts — now just re-exports handlers
import { handlers } from "../../../../auth";
export const { GET, POST } = handlers;