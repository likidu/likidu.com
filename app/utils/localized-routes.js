// Return an array of different routes paths for a same component
// used to generate localized routes in `/app/routes.js`
const generateRoute = ({paths, component}) => {
  return paths.map((path) => {
    return {path, component};
  });
};

// Replace params in route format: `/profile/:seed`
//
// Params:
//  - route: string = route with `:` preceding params
//  - params: object = key are param names
//
// Example:
//  For route: `/route/:foo` params will be `{foo: 'bar'}`
const replaceParams = (route, params) => {
  let parsedRoute = route.trim();
  Object.keys(params).forEach((paramKey) => {
    const param = ':' + paramKey;
    const paramValue = params[paramKey];
    if (parsedRoute && parsedRoute.match(param)) {
      parsedRoute = parsedRoute.replace(param, paramValue);
    }
  });
  return parsedRoute;
};

export default {generateRoute, replaceParams};
