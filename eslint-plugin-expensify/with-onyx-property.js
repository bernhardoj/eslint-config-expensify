const PropTypes = require('prop-types');

module.exports = {
  create: context => ({
    CallExpression(node) {
      if (node.callee.name !== 'withOnyx') {
        return;
      }

      const wrappedComponent = node.arguments[0];
      let propTypes, defaultProps, componentName;

      if (wrappedComponent.type === "ClassExpression") {
        propTypes = wrappedComponent.body.body.find(
          (m) => m.key.name === "propTypes"
        );
        defaultProps = wrappedComponent.body.body.find(
          (m) => m.key.name === "defaultProps"
        );
        componentName = wrappedComponent.id.name;
      } else {
        propTypes = wrappedComponent.propTypes;
        defaultProps = wrappedComponent.defaultProps;
        componentName = wrappedComponent.displayName || wrappedComponent.name;
      }

      if (node.arguments.length === 0) {
        context.report({
          node,
          message: `withOnyx must be passed a component`
        });
      }

      node.arguments[1].properties.forEach(({ key, value }) => {
        if (!propTypes[key.name]) {
          context.report({
            node,
            message: `Prop '${key.name}' is not defined in propTypes for component ${componentName}`
          });
          return;
        }

        if (!defaultProps[key.name]) {
          context.report({
            node,
            message: `Prop '${key.name}' has no default value for component ${componentName}`
          });
        }
      });
    },
  }),
};