import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-types";
import GexLevelsDeepKnowledgeClient from "@/components/gex-levels-deep-knowledge/gex-levels-deep-knowledge-client";

export default async function GexLevelsDeepKnowledgePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    redirect("/auth");
  }

  return <GexLevelsDeepKnowledgeClient />;
}