import Image from "next/image";
import { FeedItem } from "@/types.db";
import { Newspaper, TrendingUp } from "lucide-react";
import { categorizeByRegion } from "@/utils/feedUtils";

// Accessible FeedCard with Next/Image, labels, and focus-visible states
export const FeedCard = ({ feed }: { feed: FeedItem }) => {
  const region = categorizeByRegion(feed);
  const regionDisplay =
    region === "zimbabwean" ? "Zimbabwe" : region === "african" ? "Africa" : "International";

  const hasImage =
    feed.imageUrl || (feed.enclosure && feed.enclosure.url && feed.enclosure.type?.startsWith("image/"));
  const imageUrl = feed.imageUrl || (feed.enclosure && feed.enclosure.url);

  if (hasImage && imageUrl) {
    return (
      <article className="rounded-lg border border-input bg-card/80 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="relative h-48 bg-muted">
          <Image
            src={imageUrl}
            alt={feed.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={false}
            placeholder="blur"
            // lightweight transparent 1x1 to gently fade-in unknown origins
            blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
          />
          <div className="absolute bottom-4 left-4 text-foreground/90" aria-hidden>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg border border-input bg-card/70">
              <Newspaper className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-full bg-accent/60 px-2 py-1 text-xs font-medium text-accent-foreground">
              {regionDisplay}
            </span>
            <time className="text-xs text-muted-foreground" dateTime={feed.isoDate || feed.pubDate}>
              {feed.pubDate}
            </time>
          </div>
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-foreground">{feed.title}</h3>
          <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">{feed.contentSnippet}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{feed.creator || "Unknown"}</span>
            <a
              href={feed.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Read more: ${feed.title}`}
              className="rounded px-2 py-1 text-sm font-medium text-primary underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-ring/40"
            >
              Read More →
            </a>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-xl border border-input bg-card/80 backdrop-blur-sm overflow-hidden transition-all duration-300 shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring/40">
      <div
        className={`h-2 ${
          region === "zimbabwean"
            ? "bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
            : region === "african"
            ? "bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500"
            : "bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"
        }`}
      />

      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span
              className={`h-3 w-3 rounded-full ${
                region === "zimbabwean" ? "bg-green-500" : region === "african" ? "bg-orange-500" : "bg-sky-500"
              }`}
              aria-hidden
            />
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                region === "zimbabwean"
                  ? "text-green-700 bg-green-100"
                  : region === "african"
                  ? "text-orange-700 bg-orange-100"
                  : "text-sky-700 bg-sky-100"
              }`}
            >
              {regionDisplay}
            </span>
          </div>
          <time className="text-xs font-medium text-muted-foreground" dateTime={feed.isoDate || feed.pubDate}>
            {feed.pubDate}
          </time>
        </div>

        <h3 className="mb-3 line-clamp-2 text-xl font-bold leading-tight text-foreground">{feed.title}</h3>
        <p className="mb-4 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{feed.contentSnippet}</p>

        <div className="flex items-center justify-between border-t border-input pt-3">
          <div className="flex items-center space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
              <Newspaper className="h-3 w-3 text-muted-foreground" />
            </span>
            <span className="text-xs font-medium text-muted-foreground">{feed.creator || "Unknown"}</span>
          </div>
          <a
            href={feed.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Read more: ${feed.title}`}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/40 ${
              region === "zimbabwean"
                ? "text-green-700 bg-green-100 hover:bg-green-200"
                : region === "african"
                ? "text-orange-700 bg-orange-100 hover:bg-orange-200"
                : "text-sky-700 bg-sky-100 hover:bg-sky-200"
            }`}
          >
            <span>Read More</span>
            <TrendingUp className="ml-1 h-3 w-3" />
          </a>
        </div>
      </div>
    </article>
  );
};