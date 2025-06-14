import {
  require_react
} from "./chunk-W4EHDCLL.js";
import {
  PREPENDED_CLASS_NAMES,
  VIEWS,
  en_default,
  generateClassNames,
  merge,
  template
} from "./chunk-OH4ZLUJL.js";
import {
  __toESM
} from "./chunk-EWTE5DHJ.js";

// node_modules/@stitches/core/dist/index.mjs
var e;
var t = "colors";
var n = "sizes";
var r = "space";
var i = { gap: r, gridGap: r, columnGap: r, gridColumnGap: r, rowGap: r, gridRowGap: r, inset: r, insetBlock: r, insetBlockEnd: r, insetBlockStart: r, insetInline: r, insetInlineEnd: r, insetInlineStart: r, margin: r, marginTop: r, marginRight: r, marginBottom: r, marginLeft: r, marginBlock: r, marginBlockEnd: r, marginBlockStart: r, marginInline: r, marginInlineEnd: r, marginInlineStart: r, padding: r, paddingTop: r, paddingRight: r, paddingBottom: r, paddingLeft: r, paddingBlock: r, paddingBlockEnd: r, paddingBlockStart: r, paddingInline: r, paddingInlineEnd: r, paddingInlineStart: r, top: r, right: r, bottom: r, left: r, scrollMargin: r, scrollMarginTop: r, scrollMarginRight: r, scrollMarginBottom: r, scrollMarginLeft: r, scrollMarginX: r, scrollMarginY: r, scrollMarginBlock: r, scrollMarginBlockEnd: r, scrollMarginBlockStart: r, scrollMarginInline: r, scrollMarginInlineEnd: r, scrollMarginInlineStart: r, scrollPadding: r, scrollPaddingTop: r, scrollPaddingRight: r, scrollPaddingBottom: r, scrollPaddingLeft: r, scrollPaddingX: r, scrollPaddingY: r, scrollPaddingBlock: r, scrollPaddingBlockEnd: r, scrollPaddingBlockStart: r, scrollPaddingInline: r, scrollPaddingInlineEnd: r, scrollPaddingInlineStart: r, fontSize: "fontSizes", background: t, backgroundColor: t, backgroundImage: t, borderImage: t, border: t, borderBlock: t, borderBlockEnd: t, borderBlockStart: t, borderBottom: t, borderBottomColor: t, borderColor: t, borderInline: t, borderInlineEnd: t, borderInlineStart: t, borderLeft: t, borderLeftColor: t, borderRight: t, borderRightColor: t, borderTop: t, borderTopColor: t, caretColor: t, color: t, columnRuleColor: t, fill: t, outline: t, outlineColor: t, stroke: t, textDecorationColor: t, fontFamily: "fonts", fontWeight: "fontWeights", lineHeight: "lineHeights", letterSpacing: "letterSpacings", blockSize: n, minBlockSize: n, maxBlockSize: n, inlineSize: n, minInlineSize: n, maxInlineSize: n, width: n, minWidth: n, maxWidth: n, height: n, minHeight: n, maxHeight: n, flexBasis: n, gridTemplateColumns: n, gridTemplateRows: n, borderWidth: "borderWidths", borderTopWidth: "borderWidths", borderRightWidth: "borderWidths", borderBottomWidth: "borderWidths", borderLeftWidth: "borderWidths", borderStyle: "borderStyles", borderTopStyle: "borderStyles", borderRightStyle: "borderStyles", borderBottomStyle: "borderStyles", borderLeftStyle: "borderStyles", borderRadius: "radii", borderTopLeftRadius: "radii", borderTopRightRadius: "radii", borderBottomRightRadius: "radii", borderBottomLeftRadius: "radii", boxShadow: "shadows", textShadow: "shadows", transition: "transitions", zIndex: "zIndices" };
var o = (e3, t2) => "function" == typeof t2 ? { "()": Function.prototype.toString.call(t2) } : t2;
var l = () => {
  const e3 = /* @__PURE__ */ Object.create(null);
  return (t2, n2, ...r2) => {
    const i2 = ((e4) => JSON.stringify(e4, o))(t2);
    return i2 in e3 ? e3[i2] : e3[i2] = n2(t2, ...r2);
  };
};
var s = Symbol.for("sxs.internal");
var a = (e3, t2) => Object.defineProperties(e3, Object.getOwnPropertyDescriptors(t2));
var c = (e3) => {
  for (const t2 in e3) return true;
  return false;
};
var { hasOwnProperty: d } = Object.prototype;
var g = (e3) => e3.includes("-") ? e3 : e3.replace(/[A-Z]/g, (e4) => "-" + e4.toLowerCase());
var p = /\s+(?![^()]*\))/;
var u = (e3) => (t2) => e3(..."string" == typeof t2 ? String(t2).split(p) : [t2]);
var h = { appearance: (e3) => ({ WebkitAppearance: e3, appearance: e3 }), backfaceVisibility: (e3) => ({ WebkitBackfaceVisibility: e3, backfaceVisibility: e3 }), backdropFilter: (e3) => ({ WebkitBackdropFilter: e3, backdropFilter: e3 }), backgroundClip: (e3) => ({ WebkitBackgroundClip: e3, backgroundClip: e3 }), boxDecorationBreak: (e3) => ({ WebkitBoxDecorationBreak: e3, boxDecorationBreak: e3 }), clipPath: (e3) => ({ WebkitClipPath: e3, clipPath: e3 }), content: (e3) => ({ content: e3.includes('"') || e3.includes("'") || /^([A-Za-z]+\([^]*|[^]*-quote|inherit|initial|none|normal|revert|unset)$/.test(e3) ? e3 : `"${e3}"` }), hyphens: (e3) => ({ WebkitHyphens: e3, hyphens: e3 }), maskImage: (e3) => ({ WebkitMaskImage: e3, maskImage: e3 }), maskSize: (e3) => ({ WebkitMaskSize: e3, maskSize: e3 }), tabSize: (e3) => ({ MozTabSize: e3, tabSize: e3 }), textSizeAdjust: (e3) => ({ WebkitTextSizeAdjust: e3, textSizeAdjust: e3 }), userSelect: (e3) => ({ WebkitUserSelect: e3, userSelect: e3 }), marginBlock: u((e3, t2) => ({ marginBlockStart: e3, marginBlockEnd: t2 || e3 })), marginInline: u((e3, t2) => ({ marginInlineStart: e3, marginInlineEnd: t2 || e3 })), maxSize: u((e3, t2) => ({ maxBlockSize: e3, maxInlineSize: t2 || e3 })), minSize: u((e3, t2) => ({ minBlockSize: e3, minInlineSize: t2 || e3 })), paddingBlock: u((e3, t2) => ({ paddingBlockStart: e3, paddingBlockEnd: t2 || e3 })), paddingInline: u((e3, t2) => ({ paddingInlineStart: e3, paddingInlineEnd: t2 || e3 })) };
var f = /([\d.]+)([^]*)/;
var m = (e3, t2) => e3.length ? e3.reduce((e4, n2) => (e4.push(...t2.map((e5) => e5.includes("&") ? e5.replace(/&/g, /[ +>|~]/.test(n2) && /&.*&/.test(e5) ? `:is(${n2})` : n2) : n2 + " " + e5)), e4), []) : t2;
var b = (e3, t2) => e3 in S && "string" == typeof t2 ? t2.replace(/^((?:[^]*[^\w-])?)(fit-content|stretch)((?:[^\w-][^]*)?)$/, (t3, n2, r2, i2) => n2 + ("stretch" === r2 ? `-moz-available${i2};${g(e3)}:${n2}-webkit-fill-available` : `-moz-fit-content${i2};${g(e3)}:${n2}fit-content`) + i2) : String(t2);
var S = { blockSize: 1, height: 1, inlineSize: 1, maxBlockSize: 1, maxHeight: 1, maxInlineSize: 1, maxWidth: 1, minBlockSize: 1, minHeight: 1, minInlineSize: 1, minWidth: 1, width: 1 };
var k = (e3) => e3 ? e3 + "-" : "";
var y = (e3, t2, n2) => e3.replace(/([+-])?((?:\d+(?:\.\d*)?|\.\d+)(?:[Ee][+-]?\d+)?)?(\$|--)([$\w-]+)/g, (e4, r2, i2, o2, l2) => "$" == o2 == !!i2 ? e4 : (r2 || "--" == o2 ? "calc(" : "") + "var(--" + ("$" === o2 ? k(t2) + (l2.includes("$") ? "" : k(n2)) + l2.replace(/\$/g, "-") : l2) + ")" + (r2 || "--" == o2 ? "*" + (r2 || "") + (i2 || "1") + ")" : ""));
var B = /\s*,\s*(?![^()]*\))/;
var $ = Object.prototype.toString;
var x = (e3, t2, n2, r2, i2) => {
  let o2, l2, s2;
  const a2 = (e4, t3, n3) => {
    let c2, d2;
    const p2 = (e5) => {
      for (c2 in e5) {
        const x2 = 64 === c2.charCodeAt(0), z2 = x2 && Array.isArray(e5[c2]) ? e5[c2] : [e5[c2]];
        for (d2 of z2) {
          const e6 = /[A-Z]/.test(S3 = c2) ? S3 : S3.replace(/-[^]/g, (e7) => e7[1].toUpperCase()), z3 = "object" == typeof d2 && d2 && d2.toString === $ && (!r2.utils[e6] || !t3.length);
          if (e6 in r2.utils && !z3) {
            const t4 = r2.utils[e6];
            if (t4 !== l2) {
              l2 = t4, p2(t4(d2)), l2 = null;
              continue;
            }
          } else if (e6 in h) {
            const t4 = h[e6];
            if (t4 !== s2) {
              s2 = t4, p2(t4(d2)), s2 = null;
              continue;
            }
          }
          if (x2 && (u3 = c2.slice(1) in r2.media ? "@media " + r2.media[c2.slice(1)] : c2, c2 = u3.replace(/\(\s*([\w-]+)\s*(=|<|<=|>|>=)\s*([\w-]+)\s*(?:(<|<=|>|>=)\s*([\w-]+)\s*)?\)/g, (e7, t4, n4, r3, i3, o3) => {
            const l3 = f.test(t4), s3 = 0.0625 * (l3 ? -1 : 1), [a3, c3] = l3 ? [r3, t4] : [t4, r3];
            return "(" + ("=" === n4[0] ? "" : ">" === n4[0] === l3 ? "max-" : "min-") + a3 + ":" + ("=" !== n4[0] && 1 === n4.length ? c3.replace(f, (e8, t5, r4) => Number(t5) + s3 * (">" === n4 ? 1 : -1) + r4) : c3) + (i3 ? ") and (" + (">" === i3[0] ? "min-" : "max-") + a3 + ":" + (1 === i3.length ? o3.replace(f, (e8, t5, n5) => Number(t5) + s3 * (">" === i3 ? -1 : 1) + n5) : o3) : "") + ")";
          })), z3) {
            const e7 = x2 ? n3.concat(c2) : [...n3], r3 = x2 ? [...t3] : m(t3, c2.split(B));
            void 0 !== o2 && i2(I(...o2)), o2 = void 0, a2(d2, r3, e7);
          } else void 0 === o2 && (o2 = [[], t3, n3]), c2 = x2 || 36 !== c2.charCodeAt(0) ? c2 : `--${k(r2.prefix)}${c2.slice(1).replace(/\$/g, "-")}`, d2 = z3 ? d2 : "number" == typeof d2 ? d2 && e6 in R ? String(d2) + "px" : String(d2) : y(b(e6, null == d2 ? "" : d2), r2.prefix, r2.themeMap[e6]), o2[0].push(`${x2 ? `${c2} ` : `${g(c2)}:`}${d2}`);
        }
      }
      var u3, S3;
    };
    p2(e4), void 0 !== o2 && i2(I(...o2)), o2 = void 0;
  };
  a2(e3, t2, n2);
};
var I = (e3, t2, n2) => `${n2.map((e4) => `${e4}{`).join("")}${t2.length ? `${t2.join(",")}{` : ""}${e3.join(";")}${t2.length ? "}" : ""}${Array(n2.length ? n2.length + 1 : 0).join("}")}`;
var R = { animationDelay: 1, animationDuration: 1, backgroundSize: 1, blockSize: 1, border: 1, borderBlock: 1, borderBlockEnd: 1, borderBlockEndWidth: 1, borderBlockStart: 1, borderBlockStartWidth: 1, borderBlockWidth: 1, borderBottom: 1, borderBottomLeftRadius: 1, borderBottomRightRadius: 1, borderBottomWidth: 1, borderEndEndRadius: 1, borderEndStartRadius: 1, borderInlineEnd: 1, borderInlineEndWidth: 1, borderInlineStart: 1, borderInlineStartWidth: 1, borderInlineWidth: 1, borderLeft: 1, borderLeftWidth: 1, borderRadius: 1, borderRight: 1, borderRightWidth: 1, borderSpacing: 1, borderStartEndRadius: 1, borderStartStartRadius: 1, borderTop: 1, borderTopLeftRadius: 1, borderTopRightRadius: 1, borderTopWidth: 1, borderWidth: 1, bottom: 1, columnGap: 1, columnRule: 1, columnRuleWidth: 1, columnWidth: 1, containIntrinsicSize: 1, flexBasis: 1, fontSize: 1, gap: 1, gridAutoColumns: 1, gridAutoRows: 1, gridTemplateColumns: 1, gridTemplateRows: 1, height: 1, inlineSize: 1, inset: 1, insetBlock: 1, insetBlockEnd: 1, insetBlockStart: 1, insetInline: 1, insetInlineEnd: 1, insetInlineStart: 1, left: 1, letterSpacing: 1, margin: 1, marginBlock: 1, marginBlockEnd: 1, marginBlockStart: 1, marginBottom: 1, marginInline: 1, marginInlineEnd: 1, marginInlineStart: 1, marginLeft: 1, marginRight: 1, marginTop: 1, maxBlockSize: 1, maxHeight: 1, maxInlineSize: 1, maxWidth: 1, minBlockSize: 1, minHeight: 1, minInlineSize: 1, minWidth: 1, offsetDistance: 1, offsetRotate: 1, outline: 1, outlineOffset: 1, outlineWidth: 1, overflowClipMargin: 1, padding: 1, paddingBlock: 1, paddingBlockEnd: 1, paddingBlockStart: 1, paddingBottom: 1, paddingInline: 1, paddingInlineEnd: 1, paddingInlineStart: 1, paddingLeft: 1, paddingRight: 1, paddingTop: 1, perspective: 1, right: 1, rowGap: 1, scrollMargin: 1, scrollMarginBlock: 1, scrollMarginBlockEnd: 1, scrollMarginBlockStart: 1, scrollMarginBottom: 1, scrollMarginInline: 1, scrollMarginInlineEnd: 1, scrollMarginInlineStart: 1, scrollMarginLeft: 1, scrollMarginRight: 1, scrollMarginTop: 1, scrollPadding: 1, scrollPaddingBlock: 1, scrollPaddingBlockEnd: 1, scrollPaddingBlockStart: 1, scrollPaddingBottom: 1, scrollPaddingInline: 1, scrollPaddingInlineEnd: 1, scrollPaddingInlineStart: 1, scrollPaddingLeft: 1, scrollPaddingRight: 1, scrollPaddingTop: 1, shapeMargin: 1, textDecoration: 1, textDecorationThickness: 1, textIndent: 1, textUnderlineOffset: 1, top: 1, transitionDelay: 1, transitionDuration: 1, verticalAlign: 1, width: 1, wordSpacing: 1 };
var z = (e3) => String.fromCharCode(e3 + (e3 > 25 ? 39 : 97));
var W = (e3) => ((e4) => {
  let t2, n2 = "";
  for (t2 = Math.abs(e4); t2 > 52; t2 = t2 / 52 | 0) n2 = z(t2 % 52) + n2;
  return z(t2 % 52) + n2;
})(((e4, t2) => {
  let n2 = t2.length;
  for (; n2; ) e4 = 33 * e4 ^ t2.charCodeAt(--n2);
  return e4;
})(5381, JSON.stringify(e3)) >>> 0);
var j = ["themed", "global", "styled", "onevar", "resonevar", "allvar", "inline"];
var E = (e3) => {
  if (e3.href && !e3.href.startsWith(location.origin)) return false;
  try {
    return !!e3.cssRules;
  } catch (e4) {
    return false;
  }
};
var T = (e3) => {
  let t2;
  const n2 = () => {
    const { cssRules: e4 } = t2.sheet;
    return [].map.call(e4, (n3, r3) => {
      const { cssText: i2 } = n3;
      let o2 = "";
      if (i2.startsWith("--sxs")) return "";
      if (e4[r3 - 1] && (o2 = e4[r3 - 1].cssText).startsWith("--sxs")) {
        if (!n3.cssRules.length) return "";
        for (const e5 in t2.rules) if (t2.rules[e5].group === n3) return `--sxs{--sxs:${[...t2.rules[e5].cache].join(" ")}}${i2}`;
        return n3.cssRules.length ? `${o2}${i2}` : "";
      }
      return i2;
    }).join("");
  }, r2 = () => {
    if (t2) {
      const { rules: e4, sheet: n3 } = t2;
      if (!n3.deleteRule) {
        for (; 3 === Object(Object(n3.cssRules)[0]).type; ) n3.cssRules.splice(0, 1);
        n3.cssRules = [];
      }
      for (const t3 in e4) delete e4[t3];
    }
    const i2 = Object(e3).styleSheets || [];
    for (const e4 of i2) if (E(e4)) {
      for (let i3 = 0, o3 = e4.cssRules; o3[i3]; ++i3) {
        const l3 = Object(o3[i3]);
        if (1 !== l3.type) continue;
        const s2 = Object(o3[i3 + 1]);
        if (4 !== s2.type) continue;
        ++i3;
        const { cssText: a2 } = l3;
        if (!a2.startsWith("--sxs")) continue;
        const c2 = a2.slice(14, -3).trim().split(/\s+/), d2 = j[c2[0]];
        d2 && (t2 || (t2 = { sheet: e4, reset: r2, rules: {}, toString: n2 }), t2.rules[d2] = { group: s2, index: i3, cache: new Set(c2) });
      }
      if (t2) break;
    }
    if (!t2) {
      const i3 = (e4, t3) => ({ type: t3, cssRules: [], insertRule(e5, t4) {
        this.cssRules.splice(t4, 0, i3(e5, { import: 3, undefined: 1 }[(e5.toLowerCase().match(/^@([a-z]+)/) || [])[1]] || 4));
      }, get cssText() {
        return "@media{}" === e4 ? `@media{${[].map.call(this.cssRules, (e5) => e5.cssText).join("")}}` : e4;
      } });
      t2 = { sheet: e3 ? (e3.head || e3).appendChild(document.createElement("style")).sheet : i3("", "text/css"), rules: {}, reset: r2, toString: n2 };
    }
    const { sheet: o2, rules: l2 } = t2;
    for (let e4 = j.length - 1; e4 >= 0; --e4) {
      const t3 = j[e4];
      if (!l2[t3]) {
        const n3 = j[e4 + 1], r3 = l2[n3] ? l2[n3].index : o2.cssRules.length;
        o2.insertRule("@media{}", r3), o2.insertRule(`--sxs{--sxs:${e4}}`, r3), l2[t3] = { group: o2.cssRules[r3 + 1], index: r3, cache: /* @__PURE__ */ new Set([e4]) };
      }
      v(l2[t3]);
    }
  };
  return r2(), t2;
};
var v = (e3) => {
  const t2 = e3.group;
  let n2 = t2.cssRules.length;
  e3.apply = (e4) => {
    try {
      t2.insertRule(e4, n2), ++n2;
    } catch (e5) {
    }
  };
};
var M = Symbol();
var w = l();
var C = (e3, t2) => w(e3, () => (...n2) => {
  let r2 = { type: null, composers: /* @__PURE__ */ new Set() };
  for (const t3 of n2) if (null != t3) if (t3[s]) {
    null == r2.type && (r2.type = t3[s].type);
    for (const e4 of t3[s].composers) r2.composers.add(e4);
  } else t3.constructor !== Object || t3.$$typeof ? null == r2.type && (r2.type = t3) : r2.composers.add(P(t3, e3));
  return null == r2.type && (r2.type = "span"), r2.composers.size || r2.composers.add(["PJLV", {}, [], [], {}, []]), L(e3, r2, t2);
});
var P = ({ variants: e3, compoundVariants: t2, defaultVariants: n2, ...r2 }, i2) => {
  const o2 = `${k(i2.prefix)}c-${W(r2)}`, l2 = [], s2 = [], a2 = /* @__PURE__ */ Object.create(null), g2 = [];
  for (const e4 in n2) a2[e4] = String(n2[e4]);
  if ("object" == typeof e3 && e3) for (const t3 in e3) {
    p2 = a2, u3 = t3, d.call(p2, u3) || (a2[t3] = "undefined");
    const n3 = e3[t3];
    for (const e4 in n3) {
      const r3 = { [t3]: String(e4) };
      "undefined" === String(e4) && g2.push(t3);
      const i3 = n3[e4], o3 = [r3, i3, !c(i3)];
      l2.push(o3);
    }
  }
  var p2, u3;
  if ("object" == typeof t2 && t2) for (const e4 of t2) {
    let { css: t3, ...n3 } = e4;
    t3 = "object" == typeof t3 && t3 || {};
    for (const e5 in n3) n3[e5] = String(n3[e5]);
    const r3 = [n3, t3, !c(t3)];
    s2.push(r3);
  }
  return [o2, r2, l2, s2, a2, g2];
};
var L = (e3, t2, n2) => {
  const [r2, i2, o2, l2] = O(t2.composers), c2 = "function" == typeof t2.type || t2.type.$$typeof ? ((e4) => {
    function t3() {
      for (let n3 = 0; n3 < t3[M].length; n3++) {
        const [r3, i3] = t3[M][n3];
        e4.rules[r3].apply(i3);
      }
      return t3[M] = [], null;
    }
    return t3[M] = [], t3.rules = {}, j.forEach((e5) => t3.rules[e5] = { apply: (n3) => t3[M].push([e5, n3]) }), t3;
  })(n2) : null, d2 = (c2 || n2).rules, g2 = `.${r2}${i2.length > 1 ? `:where(.${i2.slice(1).join(".")})` : ""}`, p2 = (s2) => {
    s2 = "object" == typeof s2 && s2 || D;
    const { css: a2, ...p3 } = s2, u3 = {};
    for (const e4 in o2) if (delete p3[e4], e4 in s2) {
      let t3 = s2[e4];
      "object" == typeof t3 && t3 ? u3[e4] = { "@initial": o2[e4], ...t3 } : (t3 = String(t3), u3[e4] = "undefined" !== t3 || l2.has(e4) ? t3 : o2[e4]);
    } else u3[e4] = o2[e4];
    const h2 = /* @__PURE__ */ new Set([...i2]);
    for (const [r3, i3, o3, l3] of t2.composers) {
      n2.rules.styled.cache.has(r3) || (n2.rules.styled.cache.add(r3), x(i3, [`.${r3}`], [], e3, (e4) => {
        d2.styled.apply(e4);
      }));
      const t3 = A(o3, u3, e3.media), s3 = A(l3, u3, e3.media, true);
      for (const i4 of t3) if (void 0 !== i4) for (const [t4, o4, l4] of i4) {
        const i5 = `${r3}-${W(o4)}-${t4}`;
        h2.add(i5);
        const s4 = (l4 ? n2.rules.resonevar : n2.rules.onevar).cache, a3 = l4 ? d2.resonevar : d2.onevar;
        s4.has(i5) || (s4.add(i5), x(o4, [`.${i5}`], [], e3, (e4) => {
          a3.apply(e4);
        }));
      }
      for (const t4 of s3) if (void 0 !== t4) for (const [i4, o4] of t4) {
        const t5 = `${r3}-${W(o4)}-${i4}`;
        h2.add(t5), n2.rules.allvar.cache.has(t5) || (n2.rules.allvar.cache.add(t5), x(o4, [`.${t5}`], [], e3, (e4) => {
          d2.allvar.apply(e4);
        }));
      }
    }
    if ("object" == typeof a2 && a2) {
      const t3 = `${r2}-i${W(a2)}-css`;
      h2.add(t3), n2.rules.inline.cache.has(t3) || (n2.rules.inline.cache.add(t3), x(a2, [`.${t3}`], [], e3, (e4) => {
        d2.inline.apply(e4);
      }));
    }
    for (const e4 of String(s2.className || "").trim().split(/\s+/)) e4 && h2.add(e4);
    const f2 = p3.className = [...h2].join(" ");
    return { type: t2.type, className: f2, selector: g2, props: p3, toString: () => f2, deferredInjector: c2 };
  };
  return a(p2, { className: r2, selector: g2, [s]: t2, toString: () => (n2.rules.styled.cache.has(r2) || p2(), r2) });
};
var O = (e3) => {
  let t2 = "";
  const n2 = [], r2 = {}, i2 = [];
  for (const [o2, , , , l2, s2] of e3) {
    "" === t2 && (t2 = o2), n2.push(o2), i2.push(...s2);
    for (const e4 in l2) {
      const t3 = l2[e4];
      (void 0 === r2[e4] || "undefined" !== t3 || s2.includes(t3)) && (r2[e4] = t3);
    }
  }
  return [t2, n2, r2, new Set(i2)];
};
var A = (e3, t2, n2, r2) => {
  const i2 = [];
  e: for (let [o2, l2, s2] of e3) {
    if (s2) continue;
    let e4, a2 = 0, c2 = false;
    for (e4 in o2) {
      const r3 = o2[e4];
      let i3 = t2[e4];
      if (i3 !== r3) {
        if ("object" != typeof i3 || !i3) continue e;
        {
          let e5, t3, o3 = 0;
          for (const l3 in i3) {
            if (r3 === String(i3[l3])) {
              if ("@initial" !== l3) {
                const e6 = l3.slice(1);
                (t3 = t3 || []).push(e6 in n2 ? n2[e6] : l3.replace(/^@media ?/, "")), c2 = true;
              }
              a2 += o3, e5 = true;
            }
            ++o3;
          }
          if (t3 && t3.length && (l2 = { ["@media " + t3.join(", ")]: l2 }), !e5) continue e;
        }
      }
    }
    (i2[a2] = i2[a2] || []).push([r2 ? "cv" : `${e4}-${o2[e4]}`, l2, c2]);
  }
  return i2;
};
var D = {};
var H = l();
var N = (e3, t2) => H(e3, () => (...n2) => {
  const r2 = () => {
    for (let r3 of n2) {
      r3 = "object" == typeof r3 && r3 || {};
      let n3 = W(r3);
      if (!t2.rules.global.cache.has(n3)) {
        if (t2.rules.global.cache.add(n3), "@import" in r3) {
          let e4 = [].indexOf.call(t2.sheet.cssRules, t2.rules.themed.group) - 1;
          for (let n4 of [].concat(r3["@import"])) n4 = n4.includes('"') || n4.includes("'") ? n4 : `"${n4}"`, t2.sheet.insertRule(`@import ${n4};`, e4++);
          delete r3["@import"];
        }
        x(r3, [], [], e3, (e4) => {
          t2.rules.global.apply(e4);
        });
      }
    }
    return "";
  };
  return a(r2, { toString: r2 });
});
var V = l();
var G = (e3, t2) => V(e3, () => (n2) => {
  const r2 = `${k(e3.prefix)}k-${W(n2)}`, i2 = () => {
    if (!t2.rules.global.cache.has(r2)) {
      t2.rules.global.cache.add(r2);
      const i3 = [];
      x(n2, [], [], e3, (e4) => i3.push(e4));
      const o2 = `@keyframes ${r2}{${i3.join("")}}`;
      t2.rules.global.apply(o2);
    }
    return r2;
  };
  return a(i2, { get name() {
    return i2();
  }, toString: i2 });
});
var F = class {
  constructor(e3, t2, n2, r2) {
    this.token = null == e3 ? "" : String(e3), this.value = null == t2 ? "" : String(t2), this.scale = null == n2 ? "" : String(n2), this.prefix = null == r2 ? "" : String(r2);
  }
  get computedValue() {
    return "var(" + this.variable + ")";
  }
  get variable() {
    return "--" + k(this.prefix) + k(this.scale) + this.token;
  }
  toString() {
    return this.computedValue;
  }
};
var J = l();
var U = (e3, t2) => J(e3, () => (n2, r2) => {
  r2 = "object" == typeof n2 && n2 || Object(r2);
  const i2 = `.${n2 = (n2 = "string" == typeof n2 ? n2 : "") || `${k(e3.prefix)}t-${W(r2)}`}`, o2 = {}, l2 = [];
  for (const t3 in r2) {
    o2[t3] = {};
    for (const n3 in r2[t3]) {
      const i3 = `--${k(e3.prefix)}${t3}-${n3}`, s3 = y(String(r2[t3][n3]), e3.prefix, t3);
      o2[t3][n3] = new F(n3, s3, t3, e3.prefix), l2.push(`${i3}:${s3}`);
    }
  }
  const s2 = () => {
    if (l2.length && !t2.rules.themed.cache.has(n2)) {
      t2.rules.themed.cache.add(n2);
      const i3 = `${r2 === e3.theme ? ":root," : ""}.${n2}{${l2.join(";")}}`;
      t2.rules.themed.apply(i3);
    }
    return n2;
  };
  return { ...o2, get className() {
    return s2();
  }, selector: i2, toString: s2 };
});
var Z = l();
var X = (e3) => {
  let t2 = false;
  const n2 = Z(e3, (e4) => {
    t2 = true;
    const n3 = "prefix" in (e4 = "object" == typeof e4 && e4 || {}) ? String(e4.prefix) : "", r2 = "object" == typeof e4.media && e4.media || {}, o2 = "object" == typeof e4.root ? e4.root || null : globalThis.document || null, l2 = "object" == typeof e4.theme && e4.theme || {}, s2 = { prefix: n3, media: r2, theme: l2, themeMap: "object" == typeof e4.themeMap && e4.themeMap || { ...i }, utils: "object" == typeof e4.utils && e4.utils || {} }, a2 = T(o2), c2 = { css: C(s2, a2), globalCss: N(s2, a2), keyframes: G(s2, a2), createTheme: U(s2, a2), reset() {
      a2.reset(), c2.theme.toString();
    }, theme: {}, sheet: a2, config: s2, prefix: n3, getCssText: a2.toString, toString: a2.toString };
    return String(c2.theme = c2.createTheme(l2)), c2;
  });
  return t2 || n2.reset(), n2;
};
var Y = () => e || (e = X());
var q = (...e3) => Y().createTheme(...e3);
var _ = (...e3) => Y().css(...e3);

// node_modules/@supabase/auth-ui-react/dist/index.es.js
var import_react = __toESM(require_react());
var g1 = _({
  fontFamily: "$bodyFontFamily",
  fontSize: "$baseBodySize",
  marginBottom: "$anchorBottomMargin",
  color: "$anchorTextColor",
  display: "block",
  textAlign: "center",
  textDecoration: "underline",
  "&:hover": {
    color: "$anchorTextHoverColor"
  }
});
var V2 = ({ children: t2, appearance: l2, ...n2 }) => {
  var o2;
  const r2 = generateClassNames(
    "anchor",
    g1(),
    l2
  );
  return import_react.default.createElement(
    "a",
    {
      ...n2,
      style: (o2 = l2 == null ? void 0 : l2.style) == null ? void 0 : o2.anchor,
      className: r2.join(" ")
    },
    t2
  );
};
var h1 = _({
  fontFamily: "$buttonFontFamily",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  borderRadius: "$borderRadiusButton",
  fontSize: "$baseButtonSize",
  padding: "$buttonPadding",
  cursor: "pointer",
  borderWidth: "$buttonBorderWidth",
  borderStyle: "solid",
  width: "100%",
  transitionProperty: "background-color",
  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  transitionDuration: "100ms",
  "&:disabled": {
    opacity: 0.7,
    cursor: "unset"
  },
  variants: {
    color: {
      default: {
        backgroundColor: "$defaultButtonBackground",
        color: "$defaultButtonText",
        borderColor: "$defaultButtonBorder",
        "&:hover:not(:disabled)": {
          backgroundColor: "$defaultButtonBackgroundHover"
        }
      },
      primary: {
        backgroundColor: "$brand",
        color: "$brandButtonText",
        borderColor: "$brandAccent",
        "&:hover:not(:disabled)": {
          backgroundColor: "$brandAccent"
        }
      }
    }
  }
});
var U2 = ({
  children: t2,
  color: l2 = "default",
  appearance: n2,
  icon: r2,
  loading: o2 = false,
  ...v2
}) => {
  var C2;
  const E2 = generateClassNames(
    "button",
    h1({ color: l2 }),
    n2
  );
  return import_react.default.createElement(
    "button",
    {
      ...v2,
      style: (C2 = n2 == null ? void 0 : n2.style) == null ? void 0 : C2.button,
      className: E2.join(" "),
      disabled: o2
    },
    r2,
    t2
  );
};
var f1 = _({
  display: "flex",
  gap: "4px",
  variants: {
    direction: {
      horizontal: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(48px, 1fr))"
      },
      vertical: {
        flexDirection: "column",
        margin: "8px 0"
      }
    },
    gap: {
      small: {
        gap: "4px"
      },
      medium: {
        gap: "8px"
      },
      large: {
        gap: "16px"
      }
    }
  }
});
var N2 = ({
  children: t2,
  appearance: l2,
  ...n2
}) => {
  var o2;
  const r2 = generateClassNames(
    "container",
    f1({
      direction: n2.direction,
      gap: n2.gap
    }),
    l2
  );
  return import_react.default.createElement(
    "div",
    {
      ...n2,
      style: (o2 = l2 == null ? void 0 : l2.style) == null ? void 0 : o2.container,
      className: r2.join(" ")
    },
    t2
  );
};
var E1 = _({
  background: "$dividerBackground",
  display: "block",
  margin: "16px 0",
  height: "1px",
  width: "100%"
});
var C1 = ({
  children: t2,
  appearance: l2,
  ...n2
}) => {
  var o2;
  const r2 = generateClassNames(
    "divider",
    E1(),
    l2
  );
  return import_react.default.createElement(
    "div",
    {
      ...n2,
      style: (o2 = l2 == null ? void 0 : l2.style) == null ? void 0 : o2.divider,
      className: r2.join(" ")
    }
  );
};
var w1 = _({
  fontFamily: "$inputFontFamily",
  background: "$inputBackground",
  borderRadius: "$inputBorderRadius",
  padding: "$inputPadding",
  cursor: "text",
  borderWidth: "$inputBorderWidth",
  borderColor: "$inputBorder",
  borderStyle: "solid",
  fontSize: "$baseInputSize",
  width: "100%",
  color: "$inputText",
  boxSizing: "border-box",
  "&:hover": {
    borderColor: "$inputBorderHover",
    outline: "none"
  },
  "&:focus": {
    borderColor: "$inputBorderFocus",
    outline: "none"
  },
  "&::placeholder": {
    color: "$inputPlaceholder",
    letterSpacing: "initial"
  },
  transitionProperty: "background-color, border",
  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  transitionDuration: "100ms",
  variants: {
    type: {
      default: {
        letterSpacing: "0px"
      },
      password: {
        letterSpacing: "0px"
      }
    }
  }
});
var D2 = ({ children: t2, appearance: l2, ...n2 }) => {
  var o2;
  const r2 = generateClassNames(
    "input",
    w1({
      type: n2.type === "password" ? "password" : "default"
    }),
    l2
  );
  return import_react.default.createElement(
    "input",
    {
      ...n2,
      style: (o2 = l2 == null ? void 0 : l2.style) == null ? void 0 : o2.input,
      className: r2.join(" ")
    },
    t2
  );
};
var v1 = _({
  fontFamily: "$labelFontFamily",
  fontSize: "$baseLabelSize",
  marginBottom: "$labelBottomMargin",
  color: "$inputLabelText",
  display: "block"
});
var H2 = ({ children: t2, appearance: l2, ...n2 }) => {
  var o2;
  const r2 = generateClassNames(
    "label",
    v1(),
    l2
  );
  return import_react.default.createElement(
    "label",
    {
      ...n2,
      style: (o2 = l2 == null ? void 0 : l2.style) == null ? void 0 : o2.label,
      className: r2.join(" ")
    },
    t2
  );
};
var x1 = _({
  fontFamily: "$bodyFontFamily",
  fontSize: "$baseInputSize",
  marginBottom: "$labelBottomMargin",
  display: "block",
  textAlign: "center",
  borderRadius: "0.375rem",
  padding: "1.5rem 1rem",
  lineHeight: "1rem",
  color: "$messageText",
  backgroundColor: "$messageBackground",
  border: "1px solid $messageBorder",
  variants: {
    color: {
      danger: {
        color: "$messageTextDanger",
        backgroundColor: "$messageBackgroundDanger",
        border: "1px solid $messageBorderDanger"
      }
    }
  }
});
var F2 = ({
  children: t2,
  appearance: l2,
  ...n2
}) => {
  var o2;
  const r2 = generateClassNames(
    "message",
    x1({ color: n2.color }),
    l2
  );
  return import_react.default.createElement(
    "span",
    {
      ...n2,
      style: (o2 = l2 == null ? void 0 : l2.style) == null ? void 0 : o2.message,
      className: r2.join(" ")
    },
    t2
  );
};
function X2({
  setAuthView: t2 = () => {
  },
  supabaseClient: l2,
  redirectTo: n2,
  i18n: r2,
  appearance: o2,
  showLinks: v2 = false
}) {
  var _2;
  const [E2, C2] = (0, import_react.useState)(""), [w2, d2] = (0, import_react.useState)(""), [i2, m2] = (0, import_react.useState)(""), [c2, y2] = (0, import_react.useState)(false), x2 = async (h2) => {
    var s2, M2;
    if (h2.preventDefault(), d2(""), m2(""), y2(true), E2.length === 0) {
      d2((s2 = r2 == null ? void 0 : r2.magic_link) == null ? void 0 : s2.empty_email_address), y2(false);
      return;
    }
    const { error: g2 } = await l2.auth.signInWithOtp({
      email: E2,
      options: { emailRedirectTo: n2 }
    });
    g2 ? d2(g2.message) : m2((M2 = r2 == null ? void 0 : r2.magic_link) == null ? void 0 : M2.confirmation_text), y2(false);
  }, a2 = r2 == null ? void 0 : r2.magic_link;
  return import_react.default.createElement("form", { id: "auth-magic-link", onSubmit: x2 }, import_react.default.createElement(N2, { gap: "large", direction: "vertical", appearance: o2 }, import_react.default.createElement("div", null, import_react.default.createElement(H2, { htmlFor: "email", appearance: o2 }, a2 == null ? void 0 : a2.email_input_label), import_react.default.createElement(
    D2,
    {
      id: "email",
      name: "email",
      type: "email",
      autoFocus: true,
      placeholder: a2 == null ? void 0 : a2.email_input_placeholder,
      onChange: (h2) => {
        d2 && d2(""), C2(h2.target.value);
      },
      appearance: o2
    }
  )), import_react.default.createElement(
    U2,
    {
      color: "primary",
      type: "submit",
      loading: c2,
      appearance: o2
    },
    c2 ? a2 == null ? void 0 : a2.loading_button_label : a2 == null ? void 0 : a2.button_label
  ), v2 && import_react.default.createElement(
    V2,
    {
      href: "#auth-sign-in",
      onClick: (h2) => {
        h2.preventDefault(), t2(VIEWS.SIGN_IN);
      },
      appearance: o2
    },
    (_2 = r2 == null ? void 0 : r2.sign_in) == null ? void 0 : _2.link_text
  ), i2 && import_react.default.createElement(F2, { appearance: o2 }, i2), w2 && import_react.default.createElement(F2, { color: "danger", appearance: o2 }, w2)));
}
var L2 = _({
  width: "21px",
  height: "21px"
});
var _1 = ({ provider: t2 }) => t2 == "google" ? y1() : t2 == "facebook" ? L1() : t2 == "twitter" ? b1() : t2 == "apple" ? p1() : t2 == "github" ? k1() : t2 == "gitlab" ? M1() : t2 == "bitbucket" ? S1() : t2 == "discord" ? N1() : t2 == "azure" ? F1() : t2 == "keycloak" ? z1() : t2 == "linkedin" ? $1() : t2 == "notion" ? B1() : t2 == "slack" ? D1() : t2 == "spotify" ? H1() : t2 == "twitch" ? P1() : t2 == "workos" ? V1() : t2 == "kakao" ? I1() : null;
var y1 = () => import_react.default.createElement(
  "svg",
  {
    className: L2(),
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 48 48",
    width: "21px",
    height: "21px"
  },
  import_react.default.createElement(
    "path",
    {
      fill: "#FFC107",
      d: "M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    }
  ),
  import_react.default.createElement(
    "path",
    {
      fill: "#FF3D00",
      d: "M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    }
  ),
  import_react.default.createElement(
    "path",
    {
      fill: "#4CAF50",
      d: "M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    }
  ),
  import_react.default.createElement(
    "path",
    {
      fill: "#1976D2",
      d: "M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    }
  )
);
var L1 = () => import_react.default.createElement(
  "svg",
  {
    className: L2(),
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 48 48",
    width: "21px",
    height: "21px"
  },
  import_react.default.createElement("path", { fill: "#039be5", d: "M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z" }),
  import_react.default.createElement(
    "path",
    {
      fill: "#fff",
      d: "M26.572,29.036h4.917l0.772-4.995h-5.69v-2.73c0-2.075,0.678-3.915,2.619-3.915h3.119v-4.359c-0.548-0.074-1.707-0.236-3.897-0.236c-4.573,0-7.254,2.415-7.254,7.917v3.323h-4.701v4.995h4.701v13.729C22.089,42.905,23.032,43,24,43c0.875,0,1.729-0.08,2.572-0.194V29.036z"
    }
  )
);
var b1 = () => import_react.default.createElement(
  "svg",
  {
    className: L2(),
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 48 48",
    width: "21px",
    height: "21px"
  },
  import_react.default.createElement(
    "path",
    {
      fill: "#03A9F4",
      d: "M42,12.429c-1.323,0.586-2.746,0.977-4.247,1.162c1.526-0.906,2.7-2.351,3.251-4.058c-1.428,0.837-3.01,1.452-4.693,1.776C34.967,9.884,33.05,9,30.926,9c-4.08,0-7.387,3.278-7.387,7.32c0,0.572,0.067,1.129,0.193,1.67c-6.138-0.308-11.582-3.226-15.224-7.654c-0.64,1.082-1,2.349-1,3.686c0,2.541,1.301,4.778,3.285,6.096c-1.211-0.037-2.351-0.374-3.349-0.914c0,0.022,0,0.055,0,0.086c0,3.551,2.547,6.508,5.923,7.181c-0.617,0.169-1.269,0.263-1.941,0.263c-0.477,0-0.942-0.054-1.392-0.135c0.94,2.902,3.667,5.023,6.898,5.086c-2.528,1.96-5.712,3.134-9.174,3.134c-0.598,0-1.183-0.034-1.761-0.104C9.268,36.786,13.152,38,17.321,38c13.585,0,21.017-11.156,21.017-20.834c0-0.317-0.01-0.633-0.025-0.945C39.763,15.197,41.013,13.905,42,12.429"
    }
  )
);
var p1 = () => import_react.default.createElement(
  "svg",
  {
    className: L2(),
    fill: "gray",
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    width: "21px",
    height: "21px"
  },
  " ",
  import_react.default.createElement("path", { d: "M 15.904297 1.078125 C 15.843359 1.06875 15.774219 1.0746094 15.699219 1.0996094 C 14.699219 1.2996094 13.600391 1.8996094 12.900391 2.5996094 C 12.300391 3.1996094 11.800781 4.1996094 11.800781 5.0996094 C 11.800781 5.2996094 11.999219 5.5 12.199219 5.5 C 13.299219 5.4 14.399609 4.7996094 15.099609 4.0996094 C 15.699609 3.2996094 16.199219 2.4 16.199219 1.5 C 16.199219 1.275 16.087109 1.10625 15.904297 1.078125 z M 16.199219 5.4003906 C 14.399219 5.4003906 13.600391 6.5 12.400391 6.5 C 11.100391 6.5 9.9003906 5.5 8.4003906 5.5 C 6.3003906 5.5 3.0996094 7.4996094 3.0996094 12.099609 C 2.9996094 16.299609 6.8 21 9 21 C 10.3 21 10.600391 20.199219 12.400391 20.199219 C 14.200391 20.199219 14.600391 21 15.900391 21 C 17.400391 21 18.500391 19.399609 19.400391 18.099609 C 19.800391 17.399609 20.100391 17.000391 20.400391 16.400391 C 20.600391 16.000391 20.4 15.600391 20 15.400391 C 17.4 14.100391 16.900781 9.9003906 19.800781 8.4003906 C 20.300781 8.1003906 20.4 7.4992188 20 7.1992188 C 18.9 6.1992187 17.299219 5.4003906 16.199219 5.4003906 z" })
);
var k1 = () => import_react.default.createElement(
  "svg",
  {
    className: L2(),
    fill: "gray",
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 30 30",
    width: "21px",
    height: "21px"
  },
  " ",
  import_react.default.createElement("path", { d: "M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z" })
);
var M1 = () => import_react.default.createElement(
  "svg",
  {
    className: L2(),
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 48 48",
    width: "21px",
    height: "21px"
  },
  import_react.default.createElement("path", { fill: "#e53935", d: "M24 43L16 20 32 20z" }),
  import_react.default.createElement("path", { fill: "#ff7043", d: "M24 43L42 20 32 20z" }),
  import_react.default.createElement("path", { fill: "#e53935", d: "M37 5L42 20 32 20z" }),
  import_react.default.createElement("path", { fill: "#ffa726", d: "M24 43L42 20 45 28z" }),
  import_react.default.createElement("path", { fill: "#ff7043", d: "M24 43L6 20 16 20z" }),
  import_react.default.createElement("path", { fill: "#e53935", d: "M11 5L6 20 16 20z" }),
  import_react.default.createElement("path", { fill: "#ffa726", d: "M24 43L6 20 3 28z" })
);
var S1 = () => import_react.default.createElement(
  "svg",
  {
    className: L2(),
    xmlns: "http://www.w3.org/2000/svg",
    width: "512",
    height: "512",
    viewBox: "0 0 62.42 62.42"
  },
  import_react.default.createElement("defs", null, import_react.default.createElement(
    "linearGradient",
    {
      id: "New_Gradient_Swatch_1",
      x1: "64.01",
      y1: "30.27",
      x2: "32.99",
      y2: "54.48",
      gradientUnits: "userSpaceOnUse"
    },
    import_react.default.createElement("stop", { offset: "0.18", stopColor: "#0052cc" }),
    import_react.default.createElement("stop", { offset: "1", stopColor: "#2684ff" })
  )),
  import_react.default.createElement("title", null, "Bitbucket-blue"),
  import_react.default.createElement("g", { id: "Layer_2", "data-name": "Layer 2" }, import_react.default.createElement("g", { id: "Blue", transform: "translate(0 -3.13)" }, import_react.default.createElement(
    "path",
    {
      d: "M2,6.26A2,2,0,0,0,0,8.58L8.49,60.12a2.72,2.72,0,0,0,2.66,2.27H51.88a2,2,0,0,0,2-1.68L62.37,8.59a2,2,0,0,0-2-2.32ZM37.75,43.51h-13L21.23,25.12H40.9Z",
      fill: "#2684ff"
    }
  ), import_react.default.createElement(
    "path",
    {
      d: "M59.67,25.12H40.9L37.75,43.51h-13L9.4,61.73a2.71,2.71,0,0,0,1.75.66H51.89a2,2,0,0,0,2-1.68Z",
      fill: "url(#New_Gradient_Swatch_1)"
    }
  )))
);
var N1 = () => import_react.default.createElement(
  "svg",
  {
    className: L2(),
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 48 48",
    width: "21px",
    height: "21px"
  },
  import_react.default.createElement(
    "path",
    {
      fill: "#536dfe",
      d: "M39.248,10.177c-2.804-1.287-5.812-2.235-8.956-2.778c-0.057-0.01-0.114,0.016-0.144,0.068	c-0.387,0.688-0.815,1.585-1.115,2.291c-3.382-0.506-6.747-0.506-10.059,0c-0.3-0.721-0.744-1.603-1.133-2.291	c-0.03-0.051-0.087-0.077-0.144-0.068c-3.143,0.541-6.15,1.489-8.956,2.778c-0.024,0.01-0.045,0.028-0.059,0.051	c-5.704,8.522-7.267,16.835-6.5,25.044c0.003,0.04,0.026,0.079,0.057,0.103c3.763,2.764,7.409,4.442,10.987,5.554	c0.057,0.017,0.118-0.003,0.154-0.051c0.846-1.156,1.601-2.374,2.248-3.656c0.038-0.075,0.002-0.164-0.076-0.194	c-1.197-0.454-2.336-1.007-3.432-1.636c-0.087-0.051-0.094-0.175-0.014-0.234c0.231-0.173,0.461-0.353,0.682-0.534	c0.04-0.033,0.095-0.04,0.142-0.019c7.201,3.288,14.997,3.288,22.113,0c0.047-0.023,0.102-0.016,0.144,0.017	c0.22,0.182,0.451,0.363,0.683,0.536c0.08,0.059,0.075,0.183-0.012,0.234c-1.096,0.641-2.236,1.182-3.434,1.634	c-0.078,0.03-0.113,0.12-0.075,0.196c0.661,1.28,1.415,2.498,2.246,3.654c0.035,0.049,0.097,0.07,0.154,0.052	c3.595-1.112,7.241-2.79,11.004-5.554c0.033-0.024,0.054-0.061,0.057-0.101c0.917-9.491-1.537-17.735-6.505-25.044	C39.293,10.205,39.272,10.187,39.248,10.177z M16.703,30.273c-2.168,0-3.954-1.99-3.954-4.435s1.752-4.435,3.954-4.435	c2.22,0,3.989,2.008,3.954,4.435C20.658,28.282,18.906,30.273,16.703,30.273z M31.324,30.273c-2.168,0-3.954-1.99-3.954-4.435	s1.752-4.435,3.954-4.435c2.22,0,3.989,2.008,3.954,4.435C35.278,28.282,33.544,30.273,31.324,30.273z"
    }
  )
);
var F1 = () => import_react.default.createElement(
  "svg",
  {
    className: L2(),
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 48 48",
    width: "21px",
    height: "21px"
  },
  import_react.default.createElement(
    "linearGradient",
    {
      id: "k8yl7~hDat~FaoWq8WjN6a",
      x1: "-1254.397",
      x2: "-1261.911",
      y1: "877.268",
      y2: "899.466",
      gradientTransform: "translate(1981.75 -1362.063) scale(1.5625)",
      gradientUnits: "userSpaceOnUse"
    },
    import_react.default.createElement("stop", { offset: "0", stopColor: "#114a8b" }),
    import_react.default.createElement("stop", { offset: "1", stopColor: "#0669bc" })
  ),
  import_react.default.createElement(
    "path",
    {
      fill: "url(#k8yl7~hDat~FaoWq8WjN6a)",
      d: "M17.634,6h11.305L17.203,40.773c-0.247,0.733-0.934,1.226-1.708,1.226H6.697 c-0.994,0-1.8-0.806-1.8-1.8c0-0.196,0.032-0.39,0.094-0.576L15.926,7.227C16.173,6.494,16.86,6,17.634,6L17.634,6z"
    }
  ),
  import_react.default.createElement(
    "path",
    {
      fill: "#0078d4",
      d: "M34.062,29.324H16.135c-0.458-0.001-0.83,0.371-0.831,0.829c0,0.231,0.095,0.451,0.264,0.608 l11.52,10.752C27.423,41.826,27.865,42,28.324,42h10.151L34.062,29.324z"
    }
  ),
  import_react.default.createElement(
    "linearGradient",
    {
      id: "k8yl7~hDat~FaoWq8WjN6b",
      x1: "-1252.05",
      x2: "-1253.788",
      y1: "887.612",
      y2: "888.2",
      gradientTransform: "translate(1981.75 -1362.063) scale(1.5625)",
      gradientUnits: "userSpaceOnUse"
    },
    import_react.default.createElement("stop", { offset: "0", stopOpacity: ".3" }),
    import_react.default.createElement("stop", { offset: ".071", stopOpacity: ".2" }),
    import_react.default.createElement("stop", { offset: ".321", stopOpacity: ".1" }),
    import_react.default.createElement("stop", { offset: ".623", stopOpacity: ".05" }),
    import_react.default.createElement("stop", { offset: "1", stopOpacity: "0" })
  ),
  import_react.default.createElement(
    "path",
    {
      fill: "url(#k8yl7~hDat~FaoWq8WjN6b)",
      d: "M17.634,6c-0.783-0.003-1.476,0.504-1.712,1.25L5.005,39.595 c-0.335,0.934,0.151,1.964,1.085,2.299C6.286,41.964,6.493,42,6.702,42h9.026c0.684-0.122,1.25-0.603,1.481-1.259l2.177-6.416 l7.776,7.253c0.326,0.27,0.735,0.419,1.158,0.422h10.114l-4.436-12.676l-12.931,0.003L28.98,6H17.634z"
    }
  ),
  import_react.default.createElement(
    "linearGradient",
    {
      id: "k8yl7~hDat~FaoWq8WjN6c",
      x1: "-1252.952",
      x2: "-1244.704",
      y1: "876.6",
      y2: "898.575",
      gradientTransform: "translate(1981.75 -1362.063) scale(1.5625)",
      gradientUnits: "userSpaceOnUse"
    },
    import_react.default.createElement("stop", { offset: "0", stopColor: "#3ccbf4" }),
    import_react.default.createElement("stop", { offset: "1", stopColor: "#2892df" })
  ),
  import_react.default.createElement(
    "path",
    {
      fill: "url(#k8yl7~hDat~FaoWq8WjN6c)",
      d: "M32.074,7.225C31.827,6.493,31.141,6,30.368,6h-12.6c0.772,0,1.459,0.493,1.705,1.224 l10.935,32.399c0.318,0.942-0.188,1.963-1.13,2.281C29.093,41.968,28.899,42,28.703,42h12.6c0.994,0,1.8-0.806,1.8-1.801 c0-0.196-0.032-0.39-0.095-0.575L32.074,7.225z"
    }
  )
);
var z1 = () => import_react.default.createElement(
  "svg",
  {
    className: L2(),
    width: "512",
    height: "512",
    viewBox: "0 0 512 512",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  },
  import_react.default.createElement(
    "path",
    {
      d: "M472.136 163.959H408.584C407.401 163.959 406.218 163.327 405.666 162.3L354.651 73.6591C354.02 72.632 352.916 72 351.654 72H143.492C142.309 72 141.126 72.632 140.574 73.6591L87.5084 165.618L36.414 254.259C35.862 255.286 35.862 256.55 36.414 257.656L87.5084 346.297L140.495 438.335C141.047 439.362 142.23 440.073 143.413 439.994H351.654C352.837 439.994 354.02 439.362 354.651 438.335L405.745 349.694C406.297 348.667 407.48 347.956 408.663 348.035H472.215C474.344 348.035 476 346.297 476 344.243V167.83C475.921 165.697 474.186 163.959 472.136 163.959ZM228.728 349.694L212.721 377.345C212.485 377.74 212.091 378.135 211.696 378.372C211.223 378.609 210.75 378.767 210.198 378.767H178.422C177.318 378.767 176.293 378.214 175.82 377.187L128.431 294.787L123.779 286.65L106.748 257.498C106.511 257.103 106.353 256.629 106.432 256.076C106.432 255.602 106.59 255.049 106.827 254.654L123.937 224.949L175.899 134.886C176.451 133.938 177.476 133.306 178.501 133.306H210.198C210.75 133.306 211.302 133.464 211.854 133.701C212.248 133.938 212.643 134.254 212.879 134.728L228.886 162.537C229.359 163.485 229.28 164.67 228.728 165.539L177.397 254.654C177.16 255.049 177.081 255.523 177.081 255.918C177.081 256.392 177.239 256.787 177.397 257.182L228.728 346.218C229.438 347.403 229.359 348.667 228.728 349.694V349.694ZM388.083 257.498L371.051 286.65L366.399 294.787L319.011 377.187C318.459 378.135 317.512 378.767 316.409 378.767H284.632C284.08 378.767 283.607 378.609 283.134 378.372C282.74 378.135 282.346 377.819 282.109 377.345L266.103 349.694C265.393 348.667 265.393 347.403 266.024 346.376L317.355 257.34C317.591 256.945 317.67 256.471 317.67 256.076C317.67 255.602 317.513 255.207 317.355 254.812L266.024 165.697C265.472 164.749 265.393 163.643 265.866 162.695L281.873 134.886C282.109 134.491 282.503 134.096 282.898 133.859C283.371 133.543 283.923 133.464 284.553 133.464H316.409C317.512 133.464 318.538 134.017 319.011 135.044L370.972 225.107L388.083 254.812C388.319 255.286 388.477 255.76 388.477 256.234C388.477 256.55 388.319 257.024 388.083 257.498V257.498Z",
      fill: "#008AAA"
    }
  )
);
var $1 = () => import_react.default.createElement(
  "svg",
  {
    className: L2(),
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 48 48",
    width: "21px",
    height: "21px"
  },
  import_react.default.createElement(
    "path",
    {
      fill: "#0288D1",
      d: "M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"
    }
  ),
  import_react.default.createElement(
    "path",
    {
      fill: "#FFF",
      d: "M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z"
    }
  )
);
var B1 = () => import_react.default.createElement(
  "svg",
  {
    className: L2(),
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 48 48",
    width: "21px",
    height: "21px",
    fillRule: "evenodd",
    clipRule: "evenodd"
  },
  import_react.default.createElement(
    "path",
    {
      fill: "#fff",
      fillRule: "evenodd",
      d: "M11.553,11.099c1.232,1.001,1.694,0.925,4.008,0.77 l21.812-1.31c0.463,0,0.078-0.461-0.076-0.538l-3.622-2.619c-0.694-0.539-1.619-1.156-3.391-1.002l-21.12,1.54 c-0.77,0.076-0.924,0.461-0.617,0.77L11.553,11.099z",
      clipRule: "evenodd"
    }
  ),
  import_react.default.createElement(
    "path",
    {
      fill: "#fff",
      fillRule: "evenodd",
      d: "M12.862,16.182v22.95c0,1.233,0.616,1.695,2.004,1.619 l23.971-1.387c1.388-0.076,1.543-0.925,1.543-1.927V14.641c0-1-0.385-1.54-1.234-1.463l-25.05,1.463 C13.171,14.718,12.862,15.181,12.862,16.182L12.862,16.182z",
      clipRule: "evenodd"
    }
  ),
  import_react.default.createElement(
    "path",
    {
      fill: "#424242",
      fillRule: "evenodd",
      d: "M11.553,11.099c1.232,1.001,1.694,0.925,4.008,0.77 l21.812-1.31c0.463,0,0.078-0.461-0.076-0.538l-3.622-2.619c-0.694-0.539-1.619-1.156-3.391-1.002l-21.12,1.54 c-0.77,0.076-0.924,0.461-0.617,0.77L11.553,11.099z M12.862,16.182v22.95c0,1.233,0.616,1.695,2.004,1.619l23.971-1.387 c1.388-0.076,1.543-0.925,1.543-1.927V14.641c0-1-0.385-1.54-1.234-1.463l-25.05,1.463C13.171,14.718,12.862,15.181,12.862,16.182 L12.862,16.182z M36.526,17.413c0.154,0.694,0,1.387-0.695,1.465l-1.155,0.23v16.943c-1.003,0.539-1.928,0.847-2.698,0.847 c-1.234,0-1.543-0.385-2.467-1.54l-7.555-11.86v11.475l2.391,0.539c0,0,0,1.386-1.929,1.386l-5.317,0.308 c-0.154-0.308,0-1.078,0.539-1.232l1.388-0.385V20.418l-1.927-0.154c-0.155-0.694,0.23-1.694,1.31-1.772l5.704-0.385l7.862,12.015 V19.493l-2.005-0.23c-0.154-0.848,0.462-1.464,1.233-1.54L36.526,17.413z M7.389,5.862l21.968-1.618 c2.698-0.231,3.392-0.076,5.087,1.155l7.013,4.929C42.614,11.176,43,11.407,43,12.33v27.032c0,1.694-0.617,2.696-2.775,2.849 l-25.512,1.541c-1.62,0.077-2.391-0.154-3.239-1.232l-5.164-6.7C5.385,34.587,5,33.664,5,32.585V8.556 C5,7.171,5.617,6.015,7.389,5.862z",
      clipRule: "evenodd"
    }
  )
);
var D1 = () => import_react.default.createElement(
  "svg",
  {
    className: L2(),
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 48 48",
    width: "21px",
    height: "21px"
  },
  import_react.default.createElement(
    "path",
    {
      fill: "#33d375",
      d: "M33,8c0-2.209-1.791-4-4-4s-4,1.791-4,4c0,1.254,0,9.741,0,11c0,2.209,1.791,4,4,4s4-1.791,4-4	C33,17.741,33,9.254,33,8z"
    }
  ),
  import_react.default.createElement(
    "path",
    {
      fill: "#33d375",
      d: "M43,19c0,2.209-1.791,4-4,4c-1.195,0-4,0-4,0s0-2.986,0-4c0-2.209,1.791-4,4-4S43,16.791,43,19z"
    }
  ),
  import_react.default.createElement(
    "path",
    {
      fill: "#40c4ff",
      d: "M8,14c-2.209,0-4,1.791-4,4s1.791,4,4,4c1.254,0,9.741,0,11,0c2.209,0,4-1.791,4-4s-1.791-4-4-4	C17.741,14,9.254,14,8,14z"
    }
  ),
  import_react.default.createElement(
    "path",
    {
      fill: "#40c4ff",
      d: "M19,4c2.209,0,4,1.791,4,4c0,1.195,0,4,0,4s-2.986,0-4,0c-2.209,0-4-1.791-4-4S16.791,4,19,4z"
    }
  ),
  import_react.default.createElement(
    "path",
    {
      fill: "#e91e63",
      d: "M14,39.006C14,41.212,15.791,43,18,43s4-1.788,4-3.994c0-1.252,0-9.727,0-10.984	c0-2.206-1.791-3.994-4-3.994s-4,1.788-4,3.994C14,29.279,14,37.754,14,39.006z"
    }
  ),
  import_react.default.createElement(
    "path",
    {
      fill: "#e91e63",
      d: "M4,28.022c0-2.206,1.791-3.994,4-3.994c1.195,0,4,0,4,0s0,2.981,0,3.994c0,2.206-1.791,3.994-4,3.994	S4,30.228,4,28.022z"
    }
  ),
  import_react.default.createElement(
    "path",
    {
      fill: "#ffc107",
      d: "M39,33c2.209,0,4-1.791,4-4s-1.791-4-4-4c-1.254,0-9.741,0-11,0c-2.209,0-4,1.791-4,4s1.791,4,4,4	C29.258,33,37.746,33,39,33z"
    }
  ),
  import_react.default.createElement(
    "path",
    {
      fill: "#ffc107",
      d: "M28,43c-2.209,0-4-1.791-4-4c0-1.195,0-4,0-4s2.986,0,4,0c2.209,0,4,1.791,4,4S30.209,43,28,43z"
    }
  )
);
var H1 = () => import_react.default.createElement(
  "svg",
  {
    className: L2(),
    width: "512",
    height: "512",
    viewBox: "0 0 512 512",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  },
  import_react.default.createElement(
    "path",
    {
      d: "M255.498 31.0034C131.513 31.0034 31 131.515 31 255.502C31 379.492 131.513 480 255.498 480C379.497 480 480 379.495 480 255.502C480 131.522 379.497 31.0135 255.495 31.0135L255.498 31V31.0034ZM358.453 354.798C354.432 361.391 345.801 363.486 339.204 359.435C286.496 327.237 220.139 319.947 141.993 337.801C134.463 339.516 126.957 334.798 125.24 327.264C123.516 319.731 128.217 312.225 135.767 310.511C221.284 290.972 294.639 299.384 353.816 335.549C360.413 339.596 362.504 348.2 358.453 354.798ZM385.932 293.67C380.864 301.903 370.088 304.503 361.858 299.438C301.512 262.345 209.528 251.602 138.151 273.272C128.893 276.067 119.118 270.851 116.309 261.61C113.521 252.353 118.74 242.597 127.981 239.782C209.512 215.044 310.87 227.026 380.17 269.612C388.4 274.68 391 285.456 385.935 293.676V293.673L385.932 293.67ZM388.293 230.016C315.935 187.039 196.56 183.089 127.479 204.055C116.387 207.42 104.654 201.159 101.293 190.063C97.9326 178.964 104.189 167.241 115.289 163.87C194.59 139.796 326.418 144.446 409.723 193.902C419.722 199.826 422.995 212.71 417.068 222.675C411.168 232.653 398.247 235.943 388.303 230.016H388.293V230.016Z",
      fill: "#1ED760"
    }
  )
);
var P1 = () => import_react.default.createElement(
  "svg",
  {
    className: L2(),
    width: "512",
    height: "512",
    viewBox: "0 0 512 512",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  },
  import_react.default.createElement("path", { d: "M416 240L352 304H288L232 360V304H160V64H416V240Z", fill: "white" }),
  import_react.default.createElement(
    "path",
    {
      d: "M144 32L64 112V400H160V480L240 400H304L448 256V32H144ZM416 240L352 304H288L232 360V304H160V64H416V240Z",
      fill: "#9146FF"
    }
  ),
  import_react.default.createElement("path", { d: "M368 120H336V216H368V120Z", fill: "#9146FF" }),
  import_react.default.createElement("path", { d: "M280 120H248V216H280V120Z", fill: "#9146FF" })
);
var V1 = () => import_react.default.createElement(
  "svg",
  {
    className: L2(),
    width: "512",
    height: "512",
    viewBox: "0 0 512 512",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  },
  import_react.default.createElement(
    "path",
    {
      d: "M33 256.043C33 264.556 35.3159 273.069 39.4845 280.202L117.993 415.493C126.098 429.298 138.373 440.572 153.657 445.634C183.764 455.528 214.797 442.873 229.618 417.333L248.609 384.661L173.806 256.043L252.777 119.831L271.768 87.1591C277.557 77.2654 284.968 69.4424 294 63H285.894H172.185C150.878 63 131.193 74.2742 120.54 92.6812L39.7161 231.884C35.3159 239.016 33 247.53 33 256.043Z",
      fill: "#6363F1"
    }
  ),
  import_react.default.createElement(
    "path",
    {
      d: "M480 256.058C480 247.539 477.684 239.021 473.516 231.883L393.849 94.6596C379.028 69.3331 347.995 56.4396 317.888 66.34C302.603 71.4053 290.329 82.6871 282.224 96.5015L264.391 127.354L339.194 256.058L260.223 392.131L241.232 424.825C235.443 434.495 228.032 442.553 219 449H227.106H340.815C362.122 449 381.807 437.718 392.46 419.299L473.284 280.003C477.684 272.866 480 264.577 480 256.058Z",
      fill: "#6363F1"
    }
  )
);
var I1 = () => import_react.default.createElement(
  "svg",
  {
    className: L2(),
    xmlns: "http://www.w3.org/2000/svg",
    width: "2500",
    height: "2500",
    viewBox: "0 0 256 256"
  },
  import_react.default.createElement(
    "path",
    {
      fill: "#FFE812",
      d: "M256 236c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20V20C0 8.954 8.954 0 20 0h216c11.046 0 20 8.954 20 20v216z"
    }
  ),
  import_react.default.createElement("path", { d: "M128 36C70.562 36 24 72.713 24 118c0 29.279 19.466 54.97 48.748 69.477-1.593 5.494-10.237 35.344-10.581 37.689 0 0-.207 1.762.934 2.434s2.483.15 2.483.15c3.272-.457 37.943-24.811 43.944-29.04 5.995.849 12.168 1.29 18.472 1.29 57.438 0 104-36.712 104-82 0-45.287-46.562-82-104-82z" }),
  import_react.default.createElement(
    "path",
    {
      fill: "#FFE812",
      d: "M70.5 146.625c-3.309 0-6-2.57-6-5.73V105.25h-9.362c-3.247 0-5.888-2.636-5.888-5.875s2.642-5.875 5.888-5.875h30.724c3.247 0 5.888 2.636 5.888 5.875s-2.642 5.875-5.888 5.875H76.5v35.645c0 3.16-2.691 5.73-6 5.73zM123.112 146.547c-2.502 0-4.416-1.016-4.993-2.65l-2.971-7.778-18.296-.001-2.973 7.783c-.575 1.631-2.488 2.646-4.99 2.646a9.155 9.155 0 0 1-3.814-.828c-1.654-.763-3.244-2.861-1.422-8.52l14.352-37.776c1.011-2.873 4.082-5.833 7.99-5.922 3.919.088 6.99 3.049 8.003 5.928l14.346 37.759c1.826 5.672.236 7.771-1.418 8.532a9.176 9.176 0 0 1-3.814.827c-.001 0 0 0 0 0zm-11.119-21.056L106 108.466l-5.993 17.025h11.986zM138 145.75c-3.171 0-5.75-2.468-5.75-5.5V99.5c0-3.309 2.748-6 6.125-6s6.125 2.691 6.125 6v35.25h12.75c3.171 0 5.75 2.468 5.75 5.5s-2.579 5.5-5.75 5.5H138zM171.334 146.547c-3.309 0-6-2.691-6-6V99.5c0-3.309 2.691-6 6-6s6 2.691 6 6v12.896l16.74-16.74c.861-.861 2.044-1.335 3.328-1.335 1.498 0 3.002.646 4.129 1.772 1.051 1.05 1.678 2.401 1.764 3.804.087 1.415-.384 2.712-1.324 3.653l-13.673 13.671 14.769 19.566a5.951 5.951 0 0 1 1.152 4.445 5.956 5.956 0 0 1-2.328 3.957 5.94 5.94 0 0 1-3.609 1.211 5.953 5.953 0 0 1-4.793-2.385l-14.071-18.644-2.082 2.082v13.091a6.01 6.01 0 0 1-6.002 6.003z"
    }
  )
);
function A1({
  supabaseClient: t2,
  socialLayout: l2 = "vertical",
  providers: n2 = ["github", "google", "azure"],
  providerScopes: r2,
  queryParams: o2,
  redirectTo: v2,
  onlyThirdPartyProviders: E2 = true,
  view: C2 = "sign_in",
  i18n: w2,
  appearance: d2
}) {
  const [i2, m2] = (0, import_react.useState)(false), [c2, y2] = (0, import_react.useState)(""), x2 = l2 === "vertical", a2 = C2 === "magic_link" ? "sign_in" : C2, _2 = async (g2) => {
    m2(true);
    const { error: s2 } = await t2.auth.signInWithOAuth({
      provider: g2,
      options: {
        redirectTo: v2,
        scopes: r2 == null ? void 0 : r2[g2],
        queryParams: o2
      }
    });
    s2 && y2(s2.message), m2(false);
  };
  function h2(g2) {
    const s2 = g2.toLowerCase();
    return g2.charAt(0).toUpperCase() + s2.slice(1);
  }
  return import_react.default.createElement(import_react.default.Fragment, null, n2 && n2.length > 0 && import_react.default.createElement(import_react.default.Fragment, null, import_react.default.createElement(N2, { gap: "large", direction: "vertical", appearance: d2 }, import_react.default.createElement(
    N2,
    {
      direction: x2 ? "vertical" : "horizontal",
      gap: x2 ? "small" : "medium",
      appearance: d2
    },
    n2.map((g2) => {
      var s2;
      return import_react.default.createElement(
        U2,
        {
          key: g2,
          color: "default",
          loading: i2,
          onClick: () => _2(g2),
          appearance: d2
        },
        import_react.default.createElement(_1, { provider: g2 }),
        x2 && template(
          (s2 = w2 == null ? void 0 : w2[a2]) == null ? void 0 : s2.social_provider_text,
          {
            provider: h2(g2)
          }
        )
      );
    })
  )), !E2 && import_react.default.createElement(C1, { appearance: d2 })));
}
function Q({
  authView: t2 = "sign_in",
  defaultEmail: l2 = "",
  defaultPassword: n2 = "",
  setAuthView: r2 = () => {
  },
  setDefaultEmail: o2 = (x2) => {
  },
  setDefaultPassword: v2 = (x2) => {
  },
  supabaseClient: E2,
  showLinks: C2 = false,
  redirectTo: w2,
  additionalData: d2,
  magicLink: i2,
  i18n: m2,
  appearance: c2,
  children: y2
}) {
  var T2, G2, Z2, j2;
  const x2 = (0, import_react.useRef)(true), [a2, _2] = (0, import_react.useState)(l2), [h2, g2] = (0, import_react.useState)(n2), [s2, M2] = (0, import_react.useState)(""), [p2, B2] = (0, import_react.useState)(false), [P2, A2] = (0, import_react.useState)("");
  (0, import_react.useEffect)(() => (x2.current = true, _2(l2), g2(n2), () => {
    x2.current = false;
  }), [t2]);
  const O2 = async (k2) => {
    var q2;
    switch (k2.preventDefault(), M2(""), B2(true), t2) {
      case "sign_in":
        const { error: K } = await E2.auth.signInWithPassword({
          email: a2,
          password: h2
        });
        K && M2(K.message);
        break;
      case "sign_up":
        let Y2 = {
          emailRedirectTo: w2
        };
        d2 && (Y2.data = d2);
        const {
          data: { user: r1, session: o1 },
          error: J2
        } = await E2.auth.signUp({
          email: a2,
          password: h2,
          options: Y2
        });
        J2 ? M2(J2.message) : r1 && !o1 && A2((q2 = m2 == null ? void 0 : m2.sign_up) == null ? void 0 : q2.confirmation_text);
        break;
    }
    x2.current && B2(false);
  }, z2 = (k2) => {
    o2(a2), v2(h2), r2(k2);
  }, f2 = m2 == null ? void 0 : m2[t2];
  return import_react.default.createElement(
    "form",
    {
      id: t2 === "sign_in" ? "auth-sign-in" : "auth-sign-up",
      onSubmit: O2,
      autoComplete: "on",
      style: { width: "100%" }
    },
    import_react.default.createElement(N2, { direction: "vertical", gap: "large", appearance: c2 }, import_react.default.createElement(N2, { direction: "vertical", gap: "large", appearance: c2 }, import_react.default.createElement("div", null, import_react.default.createElement(H2, { htmlFor: "email", appearance: c2 }, f2 == null ? void 0 : f2.email_label), import_react.default.createElement(
      D2,
      {
        id: "email",
        type: "email",
        name: "email",
        placeholder: f2 == null ? void 0 : f2.email_input_placeholder,
        defaultValue: a2,
        onChange: (k2) => _2(k2.target.value),
        autoComplete: "email",
        appearance: c2
      }
    )), import_react.default.createElement("div", null, import_react.default.createElement(H2, { htmlFor: "password", appearance: c2 }, f2 == null ? void 0 : f2.password_label), import_react.default.createElement(
      D2,
      {
        id: "password",
        type: "password",
        name: "password",
        placeholder: f2 == null ? void 0 : f2.password_input_placeholder,
        defaultValue: h2,
        onChange: (k2) => g2(k2.target.value),
        autoComplete: t2 === "sign_in" ? "current-password" : "new-password",
        appearance: c2
      }
    )), y2), import_react.default.createElement(
      U2,
      {
        type: "submit",
        color: "primary",
        loading: p2,
        appearance: c2
      },
      p2 ? f2 == null ? void 0 : f2.loading_button_label : f2 == null ? void 0 : f2.button_label
    ), C2 && import_react.default.createElement(N2, { direction: "vertical", gap: "small", appearance: c2 }, t2 === VIEWS.SIGN_IN && i2 && import_react.default.createElement(
      V2,
      {
        href: "#auth-magic-link",
        onClick: (k2) => {
          k2.preventDefault(), r2(VIEWS.MAGIC_LINK);
        },
        appearance: c2
      },
      (T2 = m2 == null ? void 0 : m2.magic_link) == null ? void 0 : T2.link_text
    ), t2 === VIEWS.SIGN_IN && import_react.default.createElement(
      V2,
      {
        href: "#auth-forgot-password",
        onClick: (k2) => {
          k2.preventDefault(), r2(VIEWS.FORGOTTEN_PASSWORD);
        },
        appearance: c2
      },
      (G2 = m2 == null ? void 0 : m2.forgotten_password) == null ? void 0 : G2.link_text
    ), t2 === VIEWS.SIGN_IN ? import_react.default.createElement(
      V2,
      {
        href: "#auth-sign-up",
        onClick: (k2) => {
          k2.preventDefault(), z2(VIEWS.SIGN_UP);
        },
        appearance: c2
      },
      (Z2 = m2 == null ? void 0 : m2.sign_up) == null ? void 0 : Z2.link_text
    ) : import_react.default.createElement(
      V2,
      {
        href: "#auth-sign-in",
        onClick: (k2) => {
          k2.preventDefault(), z2(VIEWS.SIGN_IN);
        },
        appearance: c2
      },
      (j2 = m2 == null ? void 0 : m2.sign_in) == null ? void 0 : j2.link_text
    ))),
    P2 && import_react.default.createElement(F2, { appearance: c2 }, P2),
    s2 && import_react.default.createElement(F2, { color: "danger", appearance: c2 }, s2)
  );
}
function e1({
  setAuthView: t2 = () => {
  },
  supabaseClient: l2,
  redirectTo: n2,
  i18n: r2,
  appearance: o2,
  showLinks: v2 = false
}) {
  var _2;
  const [E2, C2] = (0, import_react.useState)(""), [w2, d2] = (0, import_react.useState)(""), [i2, m2] = (0, import_react.useState)(""), [c2, y2] = (0, import_react.useState)(false), x2 = async (h2) => {
    var s2;
    h2.preventDefault(), d2(""), m2(""), y2(true);
    const { error: g2 } = await l2.auth.resetPasswordForEmail(E2, {
      redirectTo: n2
    });
    g2 ? d2(g2.message) : m2((s2 = r2 == null ? void 0 : r2.forgotten_password) == null ? void 0 : s2.confirmation_text), y2(false);
  }, a2 = r2 == null ? void 0 : r2.forgotten_password;
  return import_react.default.createElement("form", { id: "auth-forgot-password", onSubmit: x2 }, import_react.default.createElement(N2, { direction: "vertical", gap: "large", appearance: o2 }, import_react.default.createElement(N2, { gap: "large", direction: "vertical", appearance: o2 }, import_react.default.createElement("div", null, import_react.default.createElement(H2, { htmlFor: "email", appearance: o2 }, a2 == null ? void 0 : a2.email_label), import_react.default.createElement(
    D2,
    {
      id: "email",
      name: "email",
      type: "email",
      autoFocus: true,
      placeholder: a2 == null ? void 0 : a2.email_input_placeholder,
      onChange: (h2) => C2(h2.target.value),
      appearance: o2
    }
  )), import_react.default.createElement(
    U2,
    {
      type: "submit",
      color: "primary",
      loading: c2,
      appearance: o2
    },
    c2 ? a2 == null ? void 0 : a2.loading_button_label : a2 == null ? void 0 : a2.button_label
  ), v2 && import_react.default.createElement(
    V2,
    {
      href: "#auth-sign-in",
      onClick: (h2) => {
        h2.preventDefault(), t2(VIEWS.SIGN_IN);
      },
      appearance: o2
    },
    (_2 = r2 == null ? void 0 : r2.sign_in) == null ? void 0 : _2.link_text
  ), i2 && import_react.default.createElement(F2, { appearance: o2 }, i2), w2 && import_react.default.createElement(F2, { color: "danger", appearance: o2 }, w2))));
}
function t1({
  supabaseClient: t2,
  i18n: l2,
  appearance: n2
}) {
  const [r2, o2] = (0, import_react.useState)(""), [v2, E2] = (0, import_react.useState)(""), [C2, w2] = (0, import_react.useState)(""), [d2, i2] = (0, import_react.useState)(false), m2 = async (y2) => {
    var a2;
    y2.preventDefault(), E2(""), w2(""), i2(true);
    const { error: x2 } = await t2.auth.updateUser({ password: r2 });
    x2 ? E2(x2.message) : w2((a2 = l2 == null ? void 0 : l2.update_password) == null ? void 0 : a2.confirmation_text), i2(false);
  }, c2 = l2 == null ? void 0 : l2.update_password;
  return import_react.default.createElement("form", { id: "auth-update-password", onSubmit: m2 }, import_react.default.createElement(N2, { gap: "large", direction: "vertical", appearance: n2 }, import_react.default.createElement("div", null, import_react.default.createElement(H2, { htmlFor: "password", appearance: n2 }, c2 == null ? void 0 : c2.password_label), import_react.default.createElement(
    D2,
    {
      id: "password",
      name: "password",
      placeholder: c2 == null ? void 0 : c2.password_input_placeholder,
      type: "password",
      autoFocus: true,
      onChange: (y2) => o2(y2.target.value),
      appearance: n2
    }
  )), import_react.default.createElement(
    U2,
    {
      type: "submit",
      color: "primary",
      loading: d2,
      appearance: n2
    },
    d2 ? c2 == null ? void 0 : c2.loading_button_label : c2 == null ? void 0 : c2.button_label
  ), C2 && import_react.default.createElement(F2, { appearance: n2 }, C2), v2 && import_react.default.createElement(F2, { color: "danger", appearance: n2 }, v2)));
}
function U1({
  setAuthView: t2 = () => {
  },
  supabaseClient: l2,
  otpType: n2 = "email",
  i18n: r2,
  appearance: o2,
  showLinks: v2 = false
}) {
  var M2;
  const [E2, C2] = (0, import_react.useState)(""), [w2, d2] = (0, import_react.useState)(""), [i2, m2] = (0, import_react.useState)(""), [c2, y2] = (0, import_react.useState)(""), [x2, a2] = (0, import_react.useState)(""), [_2, h2] = (0, import_react.useState)(false), g2 = async (p2) => {
    p2.preventDefault(), y2(""), a2(""), h2(true);
    let B2 = {
      email: E2,
      token: i2,
      type: n2
    };
    ["sms", "phone_change"].includes(n2) && (B2 = {
      phone: w2,
      token: i2,
      type: n2
    });
    const { error: P2 } = await l2.auth.verifyOtp(B2);
    P2 && y2(P2.message), h2(false);
  }, s2 = r2 == null ? void 0 : r2.verify_otp;
  return import_react.default.createElement("form", { id: "auth-magic-link", onSubmit: g2 }, import_react.default.createElement(N2, { gap: "large", direction: "vertical", appearance: o2 }, ["sms", "phone_change"].includes(n2) ? import_react.default.createElement("div", null, import_react.default.createElement(H2, { htmlFor: "phone", appearance: o2 }, s2 == null ? void 0 : s2.phone_input_label), import_react.default.createElement(
    D2,
    {
      id: "phone",
      name: "phone",
      type: "text",
      autoFocus: true,
      placeholder: s2 == null ? void 0 : s2.phone_input_placeholder,
      onChange: (p2) => d2(p2.target.value),
      appearance: o2
    }
  )) : import_react.default.createElement("div", null, import_react.default.createElement(H2, { htmlFor: "email", appearance: o2 }, s2 == null ? void 0 : s2.email_input_label), import_react.default.createElement(
    D2,
    {
      id: "email",
      name: "email",
      type: "email",
      autoFocus: true,
      placeholder: s2 == null ? void 0 : s2.email_input_placeholder,
      onChange: (p2) => C2(p2.target.value),
      appearance: o2
    }
  )), import_react.default.createElement("div", null, import_react.default.createElement(H2, { htmlFor: "token", appearance: o2 }, s2 == null ? void 0 : s2.token_input_label), import_react.default.createElement(
    D2,
    {
      id: "token",
      name: "token",
      type: "text",
      placeholder: s2 == null ? void 0 : s2.token_input_placeholder,
      onChange: (p2) => m2(p2.target.value),
      appearance: o2
    }
  )), import_react.default.createElement(
    U2,
    {
      color: "primary",
      type: "submit",
      loading: _2,
      appearance: o2
    },
    _2 ? s2 == null ? void 0 : s2.loading_button_label : s2 == null ? void 0 : s2.button_label
  ), v2 && import_react.default.createElement(
    V2,
    {
      href: "#auth-sign-in",
      onClick: (p2) => {
        p2.preventDefault(), t2(VIEWS.SIGN_IN);
      },
      appearance: o2
    },
    (M2 = r2 == null ? void 0 : r2.sign_in) == null ? void 0 : M2.link_text
  ), x2 && import_react.default.createElement(F2, { appearance: o2 }, x2), c2 && import_react.default.createElement(F2, { color: "danger", appearance: o2 }, c2)));
}
var l1 = (0, import_react.createContext)({ user: null, session: null });
var R1 = (t2) => {
  const { supabaseClient: l2 } = t2, [n2, r2] = (0, import_react.useState)(null), [o2, v2] = (0, import_react.useState)((n2 == null ? void 0 : n2.user) ?? null);
  (0, import_react.useEffect)(() => {
    (async () => {
      var d2;
      const { data: w2 } = await l2.auth.getSession();
      r2(w2.session), v2(((d2 = w2.session) == null ? void 0 : d2.user) ?? null);
    })();
    const { data: C2 } = l2.auth.onAuthStateChange(
      async (w2, d2) => {
        r2(d2), v2((d2 == null ? void 0 : d2.user) ?? null);
      }
    );
    return () => {
      C2 == null || C2.subscription.unsubscribe();
    };
  }, []);
  const E2 = {
    session: n2,
    user: o2
  };
  return import_react.default.createElement(l1.Provider, { value: E2, ...t2 });
};
var O1 = () => {
  const t2 = (0, import_react.useContext)(l1);
  if (t2 === void 0)
    throw new Error("useUser must be used within a UserContextProvider.");
  return t2;
};
function S2({
  supabaseClient: t2,
  socialLayout: l2 = "vertical",
  providers: n2,
  providerScopes: r2,
  queryParams: o2,
  view: v2 = "sign_in",
  redirectTo: E2,
  onlyThirdPartyProviders: C2 = false,
  magicLink: w2 = false,
  showLinks: d2 = true,
  appearance: i2,
  theme: m2 = "default",
  localization: c2 = { variables: {} },
  otpType: y2 = "email",
  additionalData: x2,
  children: a2
}) {
  const _2 = merge(en_default, c2.variables ?? {}), [h2, g2] = (0, import_react.useState)(v2), [s2, M2] = (0, import_react.useState)(""), [p2, B2] = (0, import_react.useState)(""), P2 = h2 === "sign_in" || h2 === "sign_up" || h2 === "magic_link";
  (0, import_react.useEffect)(() => {
    var z2, f2;
    X({
      theme: merge(
        ((z2 = i2 == null ? void 0 : i2.theme) == null ? void 0 : z2.default) ?? {},
        ((f2 = i2 == null ? void 0 : i2.variables) == null ? void 0 : f2.default) ?? {}
      )
    });
  }, [i2]);
  const A2 = ({ children: z2 }) => {
    var f2;
    return (
      // @ts-ignore
      import_react.default.createElement(
        "div",
        {
          className: m2 !== "default" ? q(
            merge(
              // @ts-ignore
              i2 == null ? void 0 : i2.theme[m2],
              ((f2 = i2 == null ? void 0 : i2.variables) == null ? void 0 : f2[m2]) ?? {}
            )
          ) : ""
        },
        P2 && import_react.default.createElement(
          A1,
          {
            appearance: i2,
            supabaseClient: t2,
            providers: n2,
            providerScopes: r2,
            queryParams: o2,
            socialLayout: l2,
            redirectTo: E2,
            onlyThirdPartyProviders: C2,
            i18n: _2,
            view: h2
          }
        ),
        !C2 && z2
      )
    );
  };
  (0, import_react.useEffect)(() => {
    const { data: z2 } = t2.auth.onAuthStateChange(
      (f2) => {
        f2 === "PASSWORD_RECOVERY" ? g2("update_password") : f2 === "USER_UPDATED" && g2("sign_in");
      }
    );
    return g2(v2), () => z2.subscription.unsubscribe();
  }, [v2]);
  const O2 = {
    supabaseClient: t2,
    setAuthView: g2,
    defaultEmail: s2,
    defaultPassword: p2,
    setDefaultEmail: M2,
    setDefaultPassword: B2,
    redirectTo: E2,
    magicLink: w2,
    showLinks: d2,
    i18n: _2,
    appearance: i2
  };
  switch (h2) {
    case VIEWS.SIGN_IN:
      return import_react.default.createElement(A2, null, import_react.default.createElement(Q, { ...O2, authView: "sign_in" }));
    case VIEWS.SIGN_UP:
      return import_react.default.createElement(A2, null, import_react.default.createElement(
        Q,
        {
          appearance: i2,
          supabaseClient: t2,
          authView: "sign_up",
          setAuthView: g2,
          defaultEmail: s2,
          defaultPassword: p2,
          setDefaultEmail: M2,
          setDefaultPassword: B2,
          redirectTo: E2,
          magicLink: w2,
          showLinks: d2,
          i18n: _2,
          additionalData: x2,
          children: a2
        }
      ));
    case VIEWS.FORGOTTEN_PASSWORD:
      return import_react.default.createElement(A2, null, import_react.default.createElement(
        e1,
        {
          appearance: i2,
          supabaseClient: t2,
          setAuthView: g2,
          redirectTo: E2,
          showLinks: d2,
          i18n: _2
        }
      ));
    case VIEWS.MAGIC_LINK:
      return import_react.default.createElement(A2, null, import_react.default.createElement(
        X2,
        {
          appearance: i2,
          supabaseClient: t2,
          setAuthView: g2,
          redirectTo: E2,
          showLinks: d2,
          i18n: _2
        }
      ));
    case VIEWS.UPDATE_PASSWORD:
      return import_react.default.createElement(
        t1,
        {
          appearance: i2,
          supabaseClient: t2,
          i18n: _2
        }
      );
    case VIEWS.VERIFY_OTP:
      return import_react.default.createElement(
        U1,
        {
          appearance: i2,
          supabaseClient: t2,
          otpType: y2,
          i18n: _2
        }
      );
    default:
      return null;
  }
}
S2.ForgottenPassword = e1;
S2.UpdatePassword = t1;
S2.MagicLink = X2;
S2.UserContextProvider = R1;
S2.useUser = O1;
var W1 = _({
  borderRadius: "12px",
  boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
  width: "360px",
  padding: "28px 32px"
});
var j1 = ({
  children: t2,
  appearance: l2
}) => {
  const n2 = [
    `${PREPENDED_CLASS_NAMES}_ui-card`,
    W1(),
    l2 == null ? void 0 : l2.className
  ];
  return import_react.default.createElement("div", { className: n2.join(" ") }, t2);
};
var q1 = (t2) => import_react.default.createElement(
  S2,
  {
    showLinks: false,
    ...t2,
    onlyThirdPartyProviders: false,
    view: "sign_up"
  }
);
var K1 = (t2) => import_react.default.createElement(
  S2,
  {
    showLinks: false,
    ...t2,
    onlyThirdPartyProviders: false,
    view: "sign_in"
  }
);
var Y1 = (t2) => import_react.default.createElement(S2, { ...t2, view: "magic_link", showLinks: false });
var J1 = (t2) => import_react.default.createElement(
  S2,
  {
    ...t2,
    view: "sign_in",
    showLinks: false,
    onlyThirdPartyProviders: true
  }
);
var Q1 = (t2) => import_react.default.createElement(S2, { showLinks: false, ...t2, view: "forgotten_password" });
var X1 = (t2) => import_react.default.createElement(S2, { ...t2, view: "update_password" });
var e0 = (t2) => import_react.default.createElement(S2, { ...t2, view: "verify_otp" });
export {
  S2 as Auth,
  j1 as AuthCard,
  Q1 as ForgottenPassword,
  Y1 as MagicLink,
  K1 as SignIn,
  q1 as SignUp,
  J1 as SocialAuth,
  X1 as UpdatePassword,
  e0 as VerifyOtp
};
//# sourceMappingURL=@supabase_auth-ui-react.js.map
