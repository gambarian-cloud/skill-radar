const NON_ARTIFACT_HOSTS = new Set([
  "t.me",
  "reddit.com",
  "www.reddit.com",
  "i.redd.it",
  "v.redd.it",
  "x.com",
  "www.x.com",
  "twitter.com",
  "www.twitter.com",
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
]);

export function isArtifactEvidenceUrl(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (NON_ARTIFACT_HOSTS.has(hostname) || hostname.endsWith(".reddit.com")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
