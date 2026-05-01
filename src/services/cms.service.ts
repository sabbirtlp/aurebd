import "server-only";
import dbConnect from "@/lib/db";
import SiteContent from "@/models/SiteContent";
import { unstable_cache } from "next/cache";

async function _getCMSContent() {
  try {
    await dbConnect();
    const content = await SiteContent.find({}).lean();
    
    const map: Record<string, string> = {};
    content.forEach((item: any) => {
      const compositeKey = `${item.page}__${item.section}__${item.key}__${item.language || "en"}`;
      map[compositeKey] = item.value;
    });
    
    return JSON.parse(JSON.stringify(map));
  } catch (err) {
    console.error("Failed to fetch CMS content on server", err);
    return {};
  }
}

export const getCMSContent = unstable_cache(
  _getCMSContent,
  ["cms-content"],
  { revalidate: 3600, tags: ['cms'] }
);
