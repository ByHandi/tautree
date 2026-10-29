import { describe, expect, it } from "vitest";

import { canEmbed, getEmbed } from "./embed";

describe("getEmbed — YouTube", () => {
  it("parses a watch URL", () => {
    expect(getEmbed("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toEqual({
      provider: "youtube",
      src: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    });
  });

  it("parses youtu.be short links", () => {
    expect(getEmbed("https://youtu.be/dQw4w9WgXcQ")).toMatchObject({
      provider: "youtube",
      src: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    });
  });

  it("parses shorts and live URLs", () => {
    expect(getEmbed("https://youtube.com/shorts/abc123XYZ_")).toMatchObject({
      provider: "youtube",
    });
    expect(getEmbed("https://www.youtube.com/live/abc123XYZ_")).toMatchObject({
      provider: "youtube",
    });
  });

  it("rejects a watch URL with no video id", () => {
    expect(getEmbed("https://www.youtube.com/watch")).toBeNull();
  });

  it("parses embed URLs and youtube.com subdomains", () => {
    expect(getEmbed("https://www.youtube.com/embed/abc123XYZ_")).toEqual({
      provider: "youtube",
      src: "https://www.youtube.com/embed/abc123XYZ_",
    });
    expect(getEmbed("https://m.youtube.com/watch?v=dQw4w9WgXcQ")).toMatchObject({
      provider: "youtube",
    });
  });

  it("rejects other youtube.com paths, bad ids, and lookalike hosts", () => {
    expect(getEmbed("https://www.youtube.com/channel/UC123456")).toBeNull();
    expect(getEmbed("https://youtu.be/bad<id>")).toBeNull();
    expect(getEmbed("https://notyoutube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
  });
});

describe("getEmbed — Spotify", () => {
  it("parses a track into a compact player", () => {
    expect(getEmbed("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT")).toEqual({
      provider: "spotify",
      src: "https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT",
      height: 152,
    });
  });

  it("parses a playlist into a tall player", () => {
    expect(getEmbed("https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M")).toMatchObject({
      provider: "spotify",
      height: 352,
    });
  });

  it("ignores a leading locale segment", () => {
    expect(getEmbed("https://open.spotify.com/intl-id/track/4cOdK2wGLETKBW3PvgPWqT")).toMatchObject(
      {
        provider: "spotify",
        src: "https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT",
      },
    );
  });

  it("rejects an unknown resource type", () => {
    expect(getEmbed("https://open.spotify.com/user/someone")).toBeNull();
  });

  it("gives episodes a medium player and albums a tall one", () => {
    expect(getEmbed("https://open.spotify.com/episode/4cOdK2wGLETKBW3PvgPWqT")).toMatchObject({
      height: 232,
    });
    expect(getEmbed("https://open.spotify.com/album/4cOdK2wGLETKBW3PvgPWqT")).toMatchObject({
      height: 352,
    });
  });

  it("rejects a missing or invalid id and lookalike hosts", () => {
    expect(getEmbed("https://open.spotify.com/track")).toBeNull();
    expect(getEmbed("https://open.spotify.com/track/short")).toBeNull();
    expect(getEmbed("https://notspotify.com/track/4cOdK2wGLETKBW3PvgPWqT")).toBeNull();
  });
});

describe("getEmbed — rejections", () => {
  it("returns null for unsupported hosts and junk", () => {
    expect(getEmbed("https://instagram.com/p/abc")).toBeNull();
    expect(getEmbed("not a url")).toBeNull();
    expect(getEmbed("javascript:alert(1)")).toBeNull();
  });

  it("canEmbed mirrors getEmbed", () => {
    expect(canEmbed("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
    expect(canEmbed("https://example.com")).toBe(false);
  });
});
