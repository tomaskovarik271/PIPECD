import {
  get,
  set
} from "./chunk-VN7TGFZF.js";

// node_modules/@hookform/resolvers/dist/resolvers.mjs
var r = (t, r2, o2) => {
  if (t && "reportValidity" in t) {
    const s2 = get(o2, r2);
    t.setCustomValidity(s2 && s2.message || ""), t.reportValidity();
  }
};
var o = (e, t) => {
  for (const o2 in t.fields) {
    const s2 = t.fields[o2];
    s2 && s2.ref && "reportValidity" in s2.ref ? r(s2.ref, o2, e) : s2 && s2.refs && s2.refs.forEach((t2) => r(t2, o2, e));
  }
};
var s = (r2, s2) => {
  s2.shouldUseNativeValidation && o(r2, s2);
  const n2 = {};
  for (const o2 in r2) {
    const f = get(s2.fields, o2), c = Object.assign(r2[o2] || {}, { ref: f && f.ref });
    if (i(s2.names || Object.keys(r2), o2)) {
      const r3 = Object.assign({}, get(n2, o2));
      set(r3, "root", c), set(n2, o2, r3);
    } else set(n2, o2, c);
  }
  return n2;
};
var i = (e, t) => {
  const r2 = n(t);
  return e.some((e2) => n(e2).match(`^${r2}\\.\\d+`));
};
function n(e) {
  return e.replace(/\]|\[/g, "");
}

export {
  o,
  s
};
//# sourceMappingURL=chunk-MVTGUZIR.js.map
