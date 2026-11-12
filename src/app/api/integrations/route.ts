import { integrationStatus } from "@/lib/integrations"

export const runtime = "nodejs"

export function GET() {
  return Response.json(integrationStatus())
}
