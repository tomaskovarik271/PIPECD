import {
  o,
  s
} from "./chunk-MVTGUZIR.js";
import {
  appendErrors
} from "./chunk-VN7TGFZF.js";
import "./chunk-W4EHDCLL.js";
import "./chunk-EWTE5DHJ.js";

// node_modules/@hookform/resolvers/yup/dist/yup.mjs
function o2(o3, n, s2) {
  return void 0 === s2 && (s2 = {}), function(a, i, c) {
    try {
      return Promise.resolve(function(t, r) {
        try {
          var u = (null != n && n.context && true && console.warn("You should not used the yup options context. Please, use the 'useForm' context object instead"), Promise.resolve(o3["sync" === s2.mode ? "validateSync" : "validate"](a, Object.assign({ abortEarly: false }, n, { context: i }))).then(function(t2) {
            return c.shouldUseNativeValidation && o({}, c), { values: s2.raw ? Object.assign({}, a) : t2, errors: {} };
          }));
        } catch (e) {
          return r(e);
        }
        return u && u.then ? u.then(void 0, r) : u;
      }(0, function(e) {
        if (!e.inner) throw e;
        return { values: {}, errors: s((o4 = e, n2 = !c.shouldUseNativeValidation && "all" === c.criteriaMode, (o4.inner || []).reduce(function(e2, t) {
          if (e2[t.path] || (e2[t.path] = { message: t.message, type: t.type }), n2) {
            var o5 = e2[t.path].types, s3 = o5 && o5[t.type];
            e2[t.path] = appendErrors(t.path, n2, e2, t.type, s3 ? [].concat(s3, t.message) : t.message);
          }
          return e2;
        }, {})), c) };
        var o4, n2;
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
export {
  o2 as yupResolver
};
//# sourceMappingURL=@hookform_resolvers_yup.js.map
