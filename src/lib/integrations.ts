export function integrationStatus() {
  return {
    ai: Boolean(process.env.OPENAI_API_KEY?.trim()),
    notion: Boolean(process.env.NOTION_API_TOKEN?.trim() && process.env.NOTION_DATABASE_ID?.trim()),
  }
}
