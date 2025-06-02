import {
  o,
  s
} from "./chunk-MVTGUZIR.js";
import {
  appendErrors
} from "./chunk-VN7TGFZF.js";
import "./chunk-W4EHDCLL.js";
import "./chunk-EWTE5DHJ.js";

// node_modules/@hookform/resolvers/zod/dist/zod.mjs
function n(r, e) {
  for (var n2 = {}; r.length; ) {
    var s3 = r[0], t = s3.code, i = s3.message, a = s3.path.join(".");
    if (!n2[a]) if ("unionErrors" in s3) {
      var u = s3.unionErrors[0].errors[0];
      n2[a] = { message: u.message, type: u.code };
    } else n2[a] = { message: i, type: t };
    if ("unionErrors" in s3 && s3.unionErrors.forEach(function(e2) {
      return e2.errors.forEach(function(e3) {
        return r.push(e3);
      });
    }), e) {
      var c = n2[a].types, f = c && c[s3.code];
      n2[a] = appendErrors(a, e, n2, t, f ? [].concat(f, s3.message) : s3.message);
    }
    r.shift();
  }
  return n2;
}
function s2(o2, s3, t) {
  return void 0 === t && (t = {}), function(i, a, u) {
    try {
      return Promise.resolve(function(e, n2) {
        try {
          var a2 = Promise.resolve(o2["sync" === t.mode ? "parse" : "parseAsync"](i, s3)).then(function(e2) {
            return u.shouldUseNativeValidation && o({}, u), { errors: {}, values: t.raw ? Object.assign({}, i) : e2 };
          });
        } catch (r) {
          return n2(r);
        }
        return a2 && a2.then ? a2.then(void 0, n2) : a2;
      }(0, function(r) {
        if (function(r2) {
          return Array.isArray(null == r2 ? void 0 : r2.errors);
        }(r)) return { values: {}, errors: s(n(r.errors, !u.shouldUseNativeValidation && "all" === u.criteriaMode), u) };
        throw r;
      }));
    } catch (r) {
      return Promise.reject(r);
    }
  };
}
export {
  s2 as zodResolver
};
//# sourceMappingURL=@hookform_resolvers_zod.js.map
