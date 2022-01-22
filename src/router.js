function parse(route) {
  route = route.replace(/\//, "\\/");

  const names = [];

  route = route.replace(/\((.*?)\)/, (match, value) => {
    if (value.startsWith("/")) {
      match = `(?:/(${value.substr(1)}))`;
    }

    return match + "?";
  });

  let match;

  while ((match = route.match(/(:([a-z][A-Za-z0-9_]+))/))) {
    names.push(match[2]);
    route = route.replace(match[1], "([^/]+)");
  }

  route = "^" + route + "$";

  return [new RegExp(route, "g"), names];
}

function register(routes, route, conditions, callback) {
  if (typeof conditions === "function") {
    callback = conditions;
    conditions = {};
  }

  const [regex, names] = parse(route);

  routes.push({
    regex,
    names,
    conditions,
    callback,
  });
}

function zip(keys, values) {
  return keys.reduce((buffer, key, index) => {
    buffer[key] = values[index];
    return buffer;
  }, {});
}

function validate(params, value, condition) {
  if (!condition) {
    return true;
  }

  if (typeof condition === "function") {
    return condition(value, params);
  } else {
    // n.b.: Technically, RegExp#test expects only one argument.
    // Let's pass `params` so custom objects that implement
    // `test()` can work as regular function validators.
    return condition.test(value, params);
  }
}

function validRoute(route, params) {
  const validSegments = route.names.map((name) => {
    const condition = route.conditions[name];
    const value = params[name] || "";
    return validate(params, value, condition);
  });

  return validSegments.every((valid) => valid);
}

function runner(pathname, routes, fallbacks) {
  let matched = false;
  let passed = false;
  let result = null;
  let params = {};
  const next = () => (passed = true);

  for (let i = 0; i < routes.length; i += 1) {
    passed = false;
    const route = routes[i];
    const matches = route.regex.exec(pathname);

    if (!matches) {
      continue;
    }

    const values = matches.slice(1);
    params = zip(route.names, values);

    if (validRoute(route, params)) {
      matched = true;
      result = route.callback(params, next);

      if (!passed) {
        break;
      }
    }
  }

  if (matched) {
    return [result, params];
  } else {
    result = fallbacks.map((callback) => callback());
    return [result.length === 1 ? result[0] : result];
  }
}

export function router() {
  const routes = [];
  const fallbacks = [];

  const context = {
    on(route, conditions, callback) {
      register(routes, route, conditions, callback);
      return context;
    },

    fallback(callback) {
      fallbacks.push(callback);
      return context;
    },

    run(pathname = window.location.pathname) {
      return runner(pathname, routes, fallbacks);
    },
  };

  return context;
}
