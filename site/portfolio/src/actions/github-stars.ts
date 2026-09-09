import { config } from "@/data/config";

// Static export: the star count is fetched from the browser instead of a
// server action. Unauthenticated GitHub allows 60 requests/hour per IP, and the
// button falls back silently when the call fails.
export async function getGithubStars(): Promise<number> {
  const res = await fetch(
    `https://api.github.com/repos/${config.githubUsername}/${config.githubRepo}`,
    { headers: { Accept: "application/vnd.github+json" } },
  );
  if (!res.ok) {
    throw new Error(`GitHub API responded with ${res.status}`);
  }

  const data = await res.json();
  if (typeof data.stargazers_count !== "number") {
    throw new Error("Unexpected GitHub API response shape");
  }
  return data.stargazers_count;
}
