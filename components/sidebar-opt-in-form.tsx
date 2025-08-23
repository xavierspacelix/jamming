import { Button } from "@/components/ui/button";
type Video = {
  videoId: string;
  title: string;
  channel?: string;
  thumbnail?: string;
};
export function SidebarOptInForm({
  nextPageToken,
  setNextPageToken,
  loadMore,
  loading,
  setResult,
}: {
  nextPageToken: string | null;
  loading: boolean;
  loadMore: Function;
  setResult: React.Dispatch<React.SetStateAction<Video[]>>;
  setNextPageToken: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  return (
    <div className="flex gap-2 items-center">
      {nextPageToken && (
        <>
          <Button
            className="bg-sidebar-primary text-sidebar-primary-foreground"
            onClick={() => loadMore(nextPageToken)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
          <Button
            className="bg-sidebar-primary text-sidebar-primary-foreground"
            onClick={() => {
              setResult([]);
              setNextPageToken(null);
            }}
            disabled={loading}
          >
            {loading ? "Loading..." : "Clear Results"}
          </Button>
        </>
      )}
    </div>
  );
}
