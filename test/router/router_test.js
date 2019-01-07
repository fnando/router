import assert from "assert";
import sinon from "sinon";

import { router } from "../../src/router";

suite("router()", () => {
  test("uses window.location", () => {
    global.window = {location: {pathname: "/using/window"}};

    const callback = sinon.fake();

    router()
      .on("/using/window", callback)
      .run();

    assert(callback.called);

    delete global.window;
  });

  test("matches / route", () => {
    const f1 = sinon.fake();
    const f2 = sinon.fake();

    router()
      .on("/", f1)
      .on("/*", f2)
      .run("/");

    assert(f1.calledOnce);
    assert(!f2.called);
  });

  test("matches route down the chain", () => {
    const f1 = sinon.fake();
    const f2 = sinon.fake();

    router()
      .on("/home", f1)
      .on("/", f2)
      .run("/");

    assert(!f1.called);
    assert(f2.called);
  });

  test("skips fallback when a route is matched", () => {
    const callback = sinon.fake();
    const fallback = sinon.fake();

    router()
      .on("/", callback)
      .fallback(fallback)
      .run("/");

    assert(callback.called);
    assert(!fallback.called);
  });

  test("fallbacks when no route is matched", () => {
    const f1 = sinon.fake();
    const f2 = sinon.fake();

    router()
      .fallback(f1)
      .fallback(f2)
      .run("/");

    assert(f1.called);
    assert(f2.called);
  });

  test("skips multiple route matching", () => {
    const f1 = sinon.fake();
    const f2 = sinon.fake();

    router()
      .on("/", f1)
      .on("/", f2)
      .run("/");

    assert(f1.calledOnce);
    assert(!f2.called);
  });

  test("passes to next route", () => {
    const f1 = sinon.fake((params, pass) => {
      pass();
    });

    const f2 = sinon.fake();
    const f3 = sinon.fake();

    router()
      .on("/", f1)
      .on("/", f2)
      .on("/", f3)
      .run("/");

    assert(f1.calledOnce);
    assert(f2.calledOnce);
    assert(!f3.called);
  });

  test("matches dynamic segment", () => {
    const callback = sinon.fake();

    router()
      .on("/posts/:slug", callback)
      .run("/posts/some-article");

    assert(callback.calledOnce);

    const [params] = callback.firstCall.args;

    assert.equal(params.slug, "some-article");
  });

  test("matches multiple dynamic segment", () => {
    const callback = sinon.fake();

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
    const callback = sinon.fake();

    router()
      .on("/(home)", callback)
      .run("/");

    assert(callback.calledOnce);
  });

  test("matches optional segment (defined)", () => {
    const callback = sinon.fake();

    router()
      .on("/(home)", callback)
      .run("/home");

    assert(callback.calledOnce);
  });

  test("matches optional dynamic segment", () => {
    const callback = sinon.fake();

    router()
      .on("/pages(/:page)", callback)
      .run("/pages");

    assert(callback.calledOnce);
  });

  test("matches optional dynamic segment (defined)", () => {
    const callback = sinon.fake();

    router()
      .on("/pages(/:page)", callback)
      .run("/pages/home");

    const [params] = callback.firstCall.args;

    assert(callback.calledOnce);
    assert.equal(params.page, "home");
  });

  test("matches valid segments (regex)", () => {
    const callback = sinon.fake();

    router()
      .on("/posts/archive/:year", {year: /^\d{4}$/}, callback)
      .run("/posts/archive/2019");

    const [params] = callback.firstCall.args;

    assert(callback.calledOnce);
    assert.equal(params.year, "2019");
  });

  test("skips invalid segments (regex)", () => {
    const callback = sinon.fake();

    router()
      .on("/posts/archive/:year", {year: /^\d{4}$/}, callback)
      .run("/posts/archive/asdf");

    assert(!callback.called);
  });

  test("calls function validation", () => {
    const callback = sinon.fake();
    const validator = sinon.fake();

    router()
      .on("/posts/archive/:year", {year: validator}, callback)
      .run("/posts/archive/asdf");

    const [value, params] = validator.firstCall.args;

    assert(validator.calledOnce);
    assert.equal(value, "asdf");
    assert.deepEqual(params, {year: "asdf"});
  });

  test("calls function validation (test)", () => {
    const callback = sinon.fake();
    const test = sinon.fake();
    const validator = {test};

    router()
      .on("/posts/archive/:year", {year: validator}, callback)
      .run("/posts/archive/asdf");

    const [value, params] = test.firstCall.args;

    assert(test.calledOnce);
    assert.equal(value, "asdf");
    assert.deepEqual(params, {year: "asdf"});
  });

  test("matches valid segments (function)", () => {
    const callback = sinon.fake();

    router()
      .on("/posts/archive/:year", {year: value => (value === "2019")}, callback)
      .run("/posts/archive/2019");

    const [params] = callback.firstCall.args;

    assert(callback.calledOnce);
    assert.equal(params.year, "2019");
  });

  test("skips invalid segments (function)", () => {
    const callback = sinon.fake();

    router()
      .on("/posts/archive/:year", {year: value => (value === "2019")}, callback)
      .run("/posts/archive/asdf");

    assert(!callback.called);
  });
});
