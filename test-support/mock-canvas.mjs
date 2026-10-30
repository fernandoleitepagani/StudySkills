import http from "node:http";
import { readFile } from "node:fs/promises";

const fixtureUrl = new URL("../test/fixtures/canvas.json", import.meta.url);

function json(res, status, value, headers = {}) {
  const body = JSON.stringify(value);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    ...headers,
  });
  res.end(body);
}

function file(res, status, contentType, buffer) {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Content-Length": buffer.length,
  });
  res.end(buffer);
}

export async function startMockCanvas({ token = "test-token" } = {}) {
  const fixture = JSON.parse(await readFile(fixtureUrl, "utf8"));
  const state = {
    rateLimitOnce: false,
    rateLimitHits: 0,
    requests: [],
  };

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");
    state.requests.push({ method: req.method, path: url.pathname, search: url.search });

    if (req.method !== "GET") {
      json(res, 405, { error: "method not allowed" });
      return;
    }

    if (req.headers.authorization !== `Bearer ${token}`) {
      json(res, 401, { error: "unauthorized" });
      return;
    }

    if (url.pathname === "/api/v1/users/self") {
      if (state.rateLimitOnce && state.rateLimitHits === 0) {
        state.rateLimitHits += 1;
        json(
          res,
          403,
          { error: "rate limited" },
          { "Retry-After": "0" },
        );
        return;
      }
      json(res, 200, fixture.user);
      return;
    }

    if (url.pathname === "/api/v1/courses") {
      const page = Number(url.searchParams.get("page") ?? "1");
      if (page === 2) {
        json(res, 200, fixture.coursesPage2);
        return;
      }
      const origin = `http://127.0.0.1:${server.address().port}`;
      json(res, 200, fixture.coursesPage1, {
        Link: `<${origin}/api/v1/courses?page=2>; rel="next"`,
      });
      return;
    }

    if (url.pathname === "/api/v1/courses/1") {
      json(res, 200, fixture.course);
      return;
    }

    if (url.pathname === "/api/v1/courses/1/modules") {
      json(res, 200, fixture.modules);
      return;
    }

    if (url.pathname === "/api/v1/courses/1/pages") {
      json(res, 200, fixture.pages);
      return;
    }

    if (url.pathname === "/api/v1/courses/1/pages/intro") {
      json(res, 200, fixture.page);
      return;
    }

    if (url.pathname === "/api/v1/courses/1/assignments") {
      json(res, 200, fixture.assignments);
      return;
    }

    if (url.pathname === "/api/v1/courses/1/discussion_topics") {
      const onlyAnnouncements = url.searchParams.get("only_announcements");
      json(res, 200, onlyAnnouncements === "true" ? fixture.announcements : fixture.discussions);
      return;
    }

    if (url.pathname === "/api/v1/courses/1/files") {
      json(res, 200, fixture.files);
      return;
    }

    if (url.pathname === "/api/v1/courses/1/front_page") {
      json(res, 200, fixture.frontPage);
      return;
    }

    if (url.pathname === "/api/v1/files/10/download") {
      file(res, 200, "application/pdf", Buffer.from("%PDF-1.4\nmock lecture\n%%EOF\n"));
      return;
    }

    if (url.pathname === "/api/v1/files/12/download") {
      file(
        res,
        200,
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x6d, 0x6f, 0x63, 0x6b]),
      );
      return;
    }

    json(res, 404, { error: "not found", path: url.pathname });
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();

  return {
    origin: `http://127.0.0.1:${port}`,
    state,
    fixture,
    close: () => new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    }),
  };
}
