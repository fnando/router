export function router() {
  const routes = [];
  const fallbacks = [];

  const self = {
    on(route, conditions, callback) {
      register(routes, route, conditions, callback);
      return self;
    },

    fallback(callback) {
      fallbacks.push(callback);
      return self;
    },

    run(pathname = window.location.pathname) {
      runner(pathname, routes, fallbacks);
    }
  };

  return self;
}

function parse(route) {
  route = route.replace(/\//, "\\/");

  const names = [];
  let match;

  route = route.replace(/\((.*?)\)/, (match, value) => {
    if (value.startsWith("/")) {
      match = `(?:/(${value.substr(1)}))`;
    }

    return match + "?";
  });

  while (match = route.match(/(:([a-z][a-z0-9_]+))/)) {
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
    callback
  });
}

function zip(keys, values) {
  return keys.reduce((buffer, key, index) => {
    buffer[key] = values[index];
    return buffer;
  }, {});
}

function validRoute(route, params) {
  const validSegments = route.names.map(name => {
    const condition = route.conditions[name];
    const value = params[name] || "";
    return validate(params, value, condition);
  });

  return validSegments.every(valid => valid);
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

function runner(pathname, routes, fallbacks) {
  let matched = false;
  let passed = false;
  const next = () => (passed = true);

  for (let i = 0; i < routes.length; i++) {
    passed = false;
    const route = routes[i];
    const matches = route.regex.exec(pathname);

    if (!matches) {
      continue;
    }

    const values = matches.slice(1);
    const params = zip(route.names, values);

    if (validRoute(route, params)) {
      matched = true;
      route.callback(params, next);

      if (!passed) {
        break;
      }
    }
  }

  if (!matched) {
    fallbacks.forEach(callback => callback());
  }
}
