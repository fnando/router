/* global test, suite, global */

import assert from "assert";
import { fake } from "sinon";

// eslint-disable-next-line @fnando/consistent-import/consistent-import
import drouter, { router } from "../../src/router";

suite("router()", () => {
  test("uses window.location", () => {
    global.window = { location: { pathname: "/using/window" } };

    const callback = fake();

    router().on("/using/window", callback).run();

    assert(callback.called);

    delete global.window;
  });

  test("matches / route", () => {
    const f1 = fake();
    const f2 = fake();

    router().on("/", f1).on("/*", f2).run("/");

    assert(f1.calledOnce);
    assert(!f2.called);
  });

  test("matches route down the chain", () => {
    const f1 = fake();
    const f2 = fake();

    router().on("/home", f1).on("/", f2).run("/");

    assert(!f1.called);
    assert(f2.called);
  });

  test("skips fallback when a route is matched", () => {
    const callback = fake();
    const fallback = fake();

    router().on("/", callback).fallback(fallback).run("/");

    assert(callback.called);
    assert(!fallback.called);
  });

  test("fallbacks when no route is matched", () => {
    const f1 = fake();
    const f2 = fake();

    router().fallback(f1).fallback(f2).run("/");

    assert(f1.called);
    assert(f2.called);
  });

  test("skips multiple route matching", () => {
    const f1 = fake();
    const f2 = fake();

    router().on("/", f1).on("/", f2).run("/");

    assert(f1.calledOnce);
    assert(!f2.called);
  });

  test("passes to next route", () => {
    const f1 = fake((params, pass) => {
      pass();
    });

    const f2 = fake();
    const f3 = fake();

    router().on("/", f1).on("/", f2).on("/", f3).run("/");

    assert(f1.calledOnce);
    assert(f2.calledOnce);
    assert(!f3.called);
  });

  test("matches dynamic segment", () => {
    const callback = fake();

    router().on("/posts/:slug", callback).run("/posts/some-article");

    assert(callback.calledOnce);

    const [params] = callback.firstCall.args;

    assert.equal(params.slug, "some-article");
  });

  test("matches dynamic segment (camelcase)", () => {
    const callback = fake();

    router().on("/posts/:postId", callback).run("/posts/some-article");

    assert(callback.calledOnce);

    const [params] = callback.firstCall.args;

    assert.equal(params.postId, "some-article");
  });

  test("matches multiple dynamic segment", () => {
    const callback = fake();

    router()
      .on("/posts/archive/:year/:month/:day", callback)
      .run("/posts/archive/2019/01/25");

    assert(callback.calledOnce);

    const [params] = callback.firstCall.args;

    assert.equal(params.year, "2019");
    assert.equal(params.month, "01");
    assert.equal(params.day, "25");
  });

  test("matches optional segment", () => {
    const callback = fake();

    router().on("/(home)", callback).run("/");

    assert(callback.calledOnce);
  });

  test("matches optional segment (defined)", () => {
    const callback = fake();

    router().on("/(home)", callback).run("/home");

    assert(callback.calledOnce);
  });

  test("matches optional dynamic segment", () => {
    const callback = fake();

    router().on("/pages(/:page)", callback).run("/pages");

    assert(callback.calledOnce);
  });

  test("matches optional dynamic segment (defined)", () => {
    const callback = fake();

    router().on("/pages(/:page)", callback).run("/pages/home");

    const [params] = callback.firstCall.args;

    assert(callback.calledOnce);
    assert.equal(params.page, "home");
  });

  test("matches valid segments (regex)", () => {
    const callback = fake();

    router()
      .on("/posts/archive/:year", { year: /^\d{4}$/ }, callback)
      .run("/posts/archive/2019");

    const [params] = callback.firstCall.args;

    assert(callback.calledOnce);
    assert.equal(params.year, "2019");
  });

  test("skips invalid segments (regex)", () => {
    const callback = fake();

    router()
      .on("/posts/archive/:year", { year: /^\d{4}$/ }, callback)
      .run("/posts/archive/asdf");

    assert(!callback.called);
  });

  test("calls function validation", () => {
    const callback = fake();
    const validator = fake();

    router()
      .on("/posts/archive/:year", { year: validator }, callback)
      .run("/posts/archive/asdf");

    const [value, params] = validator.firstCall.args;

    assert(validator.calledOnce);
    assert.equal(value, "asdf");
    assert.deepEqual(params, { year: "asdf" });
  });

  test("calls function validation (test)", () => {
    const callback = fake();
    const test = fake();
    const validator = { test };

    router()
      .on("/posts/archive/:year", { year: validator }, callback)
      .run("/posts/archive/asdf");

    const [value, params] = test.firstCall.args;

    assert(test.calledOnce);
    assert.equal(value, "asdf");
    assert.deepEqual(params, { year: "asdf" });
  });

  test("matches valid segments (function)", () => {
    const callback = fake();

    router()
      .on(
        "/posts/archive/:year",
        { year: (value) => value === "2019" },
        callback
      )
      .run("/posts/archive/2019");

    const [params] = callback.firstCall.args;

    assert(callback.calledOnce);
    assert.equal(params.year, "2019");
  });

  test("skips invalid segments (function)", () => {
    const callback = fake();

    router()
      .on(
        "/posts/archive/:year",
        { year: (value) => value === "2019" },
        callback
      )
      .run("/posts/archive/asdf");

    assert(!callback.called);
  });

  test("run returns the matched route's results and params", () => {
    const [result, params] = router()
      .on("/:message", () => "result")
      .run("/hello");

    assert.equal(result, "result");
    assert.deepEqual(params, { message: "hello" });
  });

  test("run returns single fallback results", () => {
    const [results] = router()
      .fallback(() => "fallback")
      .run("/");

    assert.equal(results, "fallback");
  });

  test("run returns multiple fallbacks results", () => {
    const [results] = router()
      .fallback(() => "fallback 1")
      .fallback(() => "fallback 2")
      .run("/");

    assert.equal(results[0], "fallback 1");
    assert.equal(results[1], "fallback 2");
  });
});
