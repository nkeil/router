import { configFromFs } from "../../utils/mockState";
import getStateFromPath from "../getStateFromPath";

it(`supports spaces`, () => {
  expect(
    getStateFromPath("/hello%20world", {
      screens: {
        "hello world": "hello world",
      },
    } as any)
  ).toEqual({
    routes: [
      {
        name: "hello world",
        path: "/hello%20world",
      },
    ],
  });

  expect(
    getStateFromPath("/hello%20world", configFromFs(["[hello world].js"]))
  ).toEqual({
    routes: [
      {
        name: "[hello world]",
        params: {
          "hello world": "hello%20world",
        },
        path: "/hello%20world",
      },
    ],
  });

  // TODO: Test rest params
});

it(`matches unmatched existing groups against 404`, () => {
  expect(
    getStateFromPath(
      "/(app)/(explore)",
      configFromFs([
        "[...404].js",

        "(app)/_layout.tsx",

        "(app)/(explore)/_layout.tsx",
        "(app)/(explore)/[user]/index.tsx",
        "(app)/(explore)/explore.tsx",

        "(app)/([user])/_layout.tsx",
        "(app)/([user])/[user]/index.tsx",
        "(app)/([user])/explore.tsx",
      ])
    )
  ).toEqual({
    routes: [
      {
        name: "(app)",
        params: { user: "(explore)" },
        state: {
          routes: [
            {
              name: "([user])",
              params: { user: "(explore)" },
              state: {
                routes: [
                  {
                    name: "[user]/index",
                    params: { user: "(explore)" },
                    path: "",
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  });
});

it(`adds dynamic route params from all levels of the path`, () => {
  // A route at `app/[foo]/bar/[baz]/other` should get all of the params from the path.
  expect(
    getStateFromPath(
      "/foo/bar/baz/other",

      configFromFs([
        "[foo]/_layout.tsx",
        "[foo]/bar/_layout.tsx",
        "[foo]/bar/[baz]/_layout.tsx",
        "[foo]/bar/[baz]/other.tsx",
      ])
    )
  ).toEqual({
    routes: [
      {
        name: "[foo]",
        params: { baz: "baz", foo: "foo" },
        state: {
          routes: [
            {
              name: "bar",
              params: { baz: "baz", foo: "foo" },
              state: {
                routes: [
                  {
                    name: "[baz]",
                    params: { baz: "baz", foo: "foo" },
                    state: {
                      routes: [
                        {
                          name: "other",
                          params: {
                            baz: "baz",
                            foo: "foo",
                          },
                          path: "/foo/bar/baz/other",
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  });
});
