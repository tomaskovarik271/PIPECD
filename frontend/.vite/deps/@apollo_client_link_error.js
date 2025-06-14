import {
  PROTOCOL_ERRORS_SYMBOL,
  graphQLResultHasProtocolErrors
} from "./chunk-IWZBQYVM.js";
import {
  ApolloLink,
  Observable,
  __extends
} from "./chunk-OVFYXEYT.js";
import "./chunk-EWTE5DHJ.js";

// ../node_modules/@apollo/client/link/error/index.js
function onError(errorHandler) {
  return new ApolloLink(function(operation, forward) {
    return new Observable(function(observer) {
      var sub;
      var retriedSub;
      var retriedResult;
      try {
        sub = forward(operation).subscribe({
          next: function(result) {
            if (result.errors) {
              retriedResult = errorHandler({
                graphQLErrors: result.errors,
                response: result,
                operation,
                forward
              });
            } else if (graphQLResultHasProtocolErrors(result)) {
              retriedResult = errorHandler({
                protocolErrors: result.extensions[PROTOCOL_ERRORS_SYMBOL],
                response: result,
                operation,
                forward
              });
            }
            if (retriedResult) {
              retriedSub = retriedResult.subscribe({
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer)
              });
              return;
            }
            observer.next(result);
          },
          error: function(networkError) {
            retriedResult = errorHandler({
              operation,
              networkError,
              //Network errors can return GraphQL errors on for example a 403
              graphQLErrors: networkError && networkError.result && networkError.result.errors || void 0,
              forward
            });
            if (retriedResult) {
              retriedSub = retriedResult.subscribe({
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer)
              });
              return;
            }
            observer.error(networkError);
          },
          complete: function() {
            if (!retriedResult) {
              observer.complete.bind(observer)();
            }
          }
        });
      } catch (e) {
        errorHandler({ networkError: e, operation, forward });
        observer.error(e);
      }
      return function() {
        if (sub)
          sub.unsubscribe();
        if (retriedSub)
          sub.unsubscribe();
      };
    });
  });
}
var ErrorLink = (
  /** @class */
  function(_super) {
    __extends(ErrorLink2, _super);
    function ErrorLink2(errorHandler) {
      var _this = _super.call(this) || this;
      _this.link = onError(errorHandler);
      return _this;
    }
    ErrorLink2.prototype.request = function(operation, forward) {
      return this.link.request(operation, forward);
    };
    return ErrorLink2;
  }(ApolloLink)
);
export {
  ErrorLink,
  onError
};
//# sourceMappingURL=@apollo_client_link_error.js.map
