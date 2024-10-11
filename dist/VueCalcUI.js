import { defineComponent as be, ref as Ae, useModel as ke, openBlock as se, createElementBlock as ie, createElementVNode as E, toDisplayString as ae, withDirectives as Oe, vModelText as Te, Fragment as Ie, renderList as Ce, normalizeStyle as Pe } from "vue";
var x = "INUMBER", F = "IOP1", L = "IOP2", $ = "IOP3", A = "IVAR", I = "IVARNAME", S = "IFUNCALL", q = "IFUNDEF", g = "IEXPR", z = "IEXPREVAL", C = "IMEMBER", D = "IENDSTATEMENT", N = "IARRAY";
function f(e, t) {
  this.type = e, this.value = t ?? 0;
}
f.prototype.toString = function() {
  switch (this.type) {
    case x:
    case F:
    case L:
    case $:
    case A:
    case I:
    case D:
      return this.value;
    case S:
      return "CALL " + this.value;
    case q:
      return "DEF " + this.value;
    case N:
      return "ARRAY " + this.value;
    case C:
      return "." + this.value;
    default:
      return "Invalid Instruction";
  }
};
function B(e) {
  return new f(F, e);
}
function O(e) {
  return new f(L, e);
}
function ve(e) {
  return new f($, e);
}
function W(e, t, r, n, s) {
  for (var a = [], i = [], o, l, p, u, c = 0; c < e.length; c++) {
    var h = e[c], w = h.type;
    if (w === x || w === I)
      Array.isArray(h.value) ? a.push.apply(a, W(h.value.map(function(U) {
        return new f(x, U);
      }).concat(new f(N, h.value.length)), t, r, n, s)) : a.push(h);
    else if (w === A && s.hasOwnProperty(h.value))
      h = new f(x, s[h.value]), a.push(h);
    else if (w === L && a.length > 1)
      l = a.pop(), o = a.pop(), u = r[h.value], h = new f(x, u(o.value, l.value)), a.push(h);
    else if (w === $ && a.length > 2)
      p = a.pop(), l = a.pop(), o = a.pop(), h.value === "?" ? a.push(o.value ? l.value : p.value) : (u = n[h.value], h = new f(x, u(o.value, l.value, p.value)), a.push(h));
    else if (w === F && a.length > 0)
      o = a.pop(), u = t[h.value], h = new f(x, u(o.value)), a.push(h);
    else if (w === g) {
      for (; a.length > 0; )
        i.push(a.shift());
      i.push(new f(g, W(h.value, t, r, n, s)));
    } else if (w === C && a.length > 0)
      o = a.pop(), a.push(new f(x, o.value[h.value]));
    else {
      for (; a.length > 0; )
        i.push(a.shift());
      i.push(h);
    }
  }
  for (; a.length > 0; )
    i.push(a.shift());
  return i;
}
function ye(e, t, r) {
  for (var n = [], s = 0; s < e.length; s++) {
    var a = e[s], i = a.type;
    if (i === A && a.value === t)
      for (var o = 0; o < r.tokens.length; o++) {
        var l = r.tokens[o], p;
        l.type === F ? p = B(l.value) : l.type === L ? p = O(l.value) : l.type === $ ? p = ve(l.value) : p = new f(l.type, l.value), n.push(p);
      }
    else i === g ? n.push(new f(g, ye(a.value, t, r))) : n.push(a);
  }
  return n;
}
function T(e, t, r) {
  var n = [], s, a, i, o, l, p;
  if (H(e))
    return b(e, r);
  for (var u = e.length, c = 0; c < u; c++) {
    var h = e[c], w = h.type;
    if (w === x || w === I)
      n.push(h.value);
    else if (w === L)
      a = n.pop(), s = n.pop(), h.value === "and" ? n.push(s ? !!T(a, t, r) : !1) : h.value === "or" ? n.push(s ? !0 : !!T(a, t, r)) : h.value === "=" ? (o = t.binaryOps[h.value], n.push(o(s, T(a, t, r), r))) : (o = t.binaryOps[h.value], n.push(o(b(s, r), b(a, r))));
    else if (w === $)
      i = n.pop(), a = n.pop(), s = n.pop(), h.value === "?" ? n.push(T(s ? a : i, t, r)) : (o = t.ternaryOps[h.value], n.push(o(b(s, r), b(a, r), b(i, r))));
    else if (w === A)
      if (h.value in t.functions)
        n.push(t.functions[h.value]);
      else if (h.value in t.unaryOps && t.parser.isOperatorEnabled(h.value))
        n.push(t.unaryOps[h.value]);
      else {
        var U = r[h.value];
        if (U !== void 0)
          n.push(U);
        else
          throw new Error("undefined variable: " + h.value);
      }
    else if (w === F)
      s = n.pop(), o = t.unaryOps[h.value], n.push(o(b(s, r)));
    else if (w === S) {
      for (p = h.value, l = []; p-- > 0; )
        l.unshift(b(n.pop(), r));
      if (o = n.pop(), o.apply && o.call)
        n.push(o.apply(void 0, l));
      else
        throw new Error(o + " is not a function");
    } else if (w === q)
      n.push(function() {
        for (var xe = n.pop(), X = [], Ee = h.value; Ee-- > 0; )
          X.unshift(n.pop());
        var re = n.pop(), Y = function() {
          for (var ne = Object.assign({}, r), V = 0, Me = X.length; V < Me; V++)
            ne[X[V]] = arguments[V];
          return T(xe, t, ne);
        };
        return Object.defineProperty(Y, "name", {
          value: re,
          writable: !1
        }), r[re] = Y, Y;
      }());
    else if (w === g)
      n.push(me(h, t));
    else if (w === z)
      n.push(h);
    else if (w === C)
      s = n.pop(), n.push(s[h.value]);
    else if (w === D)
      n.pop();
    else if (w === N) {
      for (p = h.value, l = []; p-- > 0; )
        l.unshift(n.pop());
      n.push(l);
    } else
      throw new Error("invalid Expression");
  }
  if (n.length > 1)
    throw new Error("invalid Expression (parity)");
  return n[0] === 0 ? 0 : b(n[0], r);
}
function me(e, t, r) {
  return H(e) ? e : {
    type: z,
    value: function(n) {
      return T(e.value, t, n);
    }
  };
}
function H(e) {
  return e && e.type === z;
}
function b(e, t) {
  return H(e) ? e.value(t) : e;
}
function Q(e, t) {
  for (var r = [], n, s, a, i, o, l, p = 0; p < e.length; p++) {
    var u = e[p], c = u.type;
    if (c === x)
      typeof u.value == "number" && u.value < 0 ? r.push("(" + u.value + ")") : Array.isArray(u.value) ? r.push("[" + u.value.map(oe).join(", ") + "]") : r.push(oe(u.value));
    else if (c === L)
      s = r.pop(), n = r.pop(), i = u.value, t ? i === "^" ? r.push("Math.pow(" + n + ", " + s + ")") : i === "and" ? r.push("(!!" + n + " && !!" + s + ")") : i === "or" ? r.push("(!!" + n + " || !!" + s + ")") : i === "||" ? r.push("(function(a,b){ return Array.isArray(a) && Array.isArray(b) ? a.concat(b) : String(a) + String(b); }((" + n + "),(" + s + ")))") : i === "==" ? r.push("(" + n + " === " + s + ")") : i === "!=" ? r.push("(" + n + " !== " + s + ")") : i === "[" ? r.push(n + "[(" + s + ") | 0]") : r.push("(" + n + " " + i + " " + s + ")") : i === "[" ? r.push(n + "[" + s + "]") : r.push("(" + n + " " + i + " " + s + ")");
    else if (c === $)
      if (a = r.pop(), s = r.pop(), n = r.pop(), i = u.value, i === "?")
        r.push("(" + n + " ? " + s + " : " + a + ")");
      else
        throw new Error("invalid Expression");
    else if (c === A || c === I)
      r.push(u.value);
    else if (c === F)
      n = r.pop(), i = u.value, i === "-" || i === "+" ? r.push("(" + i + n + ")") : t ? i === "not" ? r.push("(!" + n + ")") : i === "!" ? r.push("fac(" + n + ")") : r.push(i + "(" + n + ")") : i === "!" ? r.push("(" + n + "!)") : r.push("(" + i + " " + n + ")");
    else if (c === S) {
      for (l = u.value, o = []; l-- > 0; )
        o.unshift(r.pop());
      i = r.pop(), r.push(i + "(" + o.join(", ") + ")");
    } else if (c === q) {
      for (s = r.pop(), l = u.value, o = []; l-- > 0; )
        o.unshift(r.pop());
      n = r.pop(), t ? r.push("(" + n + " = function(" + o.join(", ") + ") { return " + s + " })") : r.push("(" + n + "(" + o.join(", ") + ") = " + s + ")");
    } else if (c === C)
      n = r.pop(), r.push(n + "." + u.value);
    else if (c === N) {
      for (l = u.value, o = []; l-- > 0; )
        o.unshift(r.pop());
      r.push("[" + o.join(", ") + "]");
    } else if (c === g)
      r.push("(" + Q(u.value, t) + ")");
    else if (c !== D) throw new Error("invalid Expression");
  }
  return r.length > 1 && (t ? r = [r.join(",")] : r = [r.join(";")]), String(r[0]);
}
function oe(e) {
  return typeof e == "string" ? JSON.stringify(e).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029") : e;
}
function m(e, t) {
  for (var r = 0; r < e.length; r++)
    if (e[r] === t)
      return !0;
  return !1;
}
function Z(e, t, r) {
  r = r || {};
  for (var n = !!r.withMembers, s = null, a = 0; a < e.length; a++) {
    var i = e[a];
    i.type === A || i.type === I ? !n && !m(t, i.value) ? t.push(i.value) : (s !== null && (m(t, s) || t.push(s)), s = i.value) : i.type === C && n && s !== null ? s += "." + i.value : i.type === g ? Z(i.value, t, r) : s !== null && (m(t, s) || t.push(s), s = null);
  }
  s !== null && !m(t, s) && t.push(s);
}
function M(e, t) {
  this.tokens = e, this.parser = t, this.unaryOps = t.unaryOps, this.binaryOps = t.binaryOps, this.ternaryOps = t.ternaryOps, this.functions = t.functions;
}
M.prototype.simplify = function(e) {
  return e = e || {}, new M(W(this.tokens, this.unaryOps, this.binaryOps, this.ternaryOps, e), this.parser);
};
M.prototype.substitute = function(e, t) {
  return t instanceof M || (t = this.parser.parse(String(t))), new M(ye(this.tokens, e, t), this.parser);
};
M.prototype.evaluate = function(e) {
  return e = e || {}, T(this.tokens, this, e);
};
M.prototype.toString = function() {
  return Q(this.tokens, !1);
};
M.prototype.symbols = function(e) {
  e = e || {};
  var t = [];
  return Z(this.tokens, t, e), t;
};
M.prototype.variables = function(e) {
  e = e || {};
  var t = [];
  Z(this.tokens, t, e);
  var r = this.functions;
  return t.filter(function(n) {
    return !(n in r);
  });
};
M.prototype.toJSFunction = function(e, t) {
  var r = this, n = new Function(e, "with(this.functions) with (this.ternaryOps) with (this.binaryOps) with (this.unaryOps) { return " + Q(this.simplify(t).tokens, !0) + "; }");
  return function() {
    return n.apply(r, arguments);
  };
};
var _ = "TEOF", v = "TOP", j = "TNUMBER", we = "TSTRING", k = "TPAREN", R = "TBRACKET", G = "TCOMMA", J = "TNAME", ee = "TSEMICOLON";
function de(e, t, r) {
  this.type = e, this.value = t, this.index = r;
}
de.prototype.toString = function() {
  return this.type + ": " + this.value;
};
function d(e, t) {
  this.pos = 0, this.current = null, this.unaryOps = e.unaryOps, this.binaryOps = e.binaryOps, this.ternaryOps = e.ternaryOps, this.consts = e.consts, this.expression = t, this.savedPosition = 0, this.savedCurrent = null, this.options = e.options, this.parser = e;
}
d.prototype.newToken = function(e, t, r) {
  return new de(e, t, r ?? this.pos);
};
d.prototype.save = function() {
  this.savedPosition = this.pos, this.savedCurrent = this.current;
};
d.prototype.restore = function() {
  this.pos = this.savedPosition, this.current = this.savedCurrent;
};
d.prototype.next = function() {
  if (this.pos >= this.expression.length)
    return this.newToken(_, "EOF");
  if (this.isWhitespace() || this.isComment())
    return this.next();
  if (this.isRadixInteger() || this.isNumber() || this.isOperator() || this.isString() || this.isParen() || this.isBracket() || this.isComma() || this.isSemicolon() || this.isNamedOp() || this.isConst() || this.isName())
    return this.current;
  this.parseError('Unknown character "' + this.expression.charAt(this.pos) + '"');
};
d.prototype.isString = function() {
  var e = !1, t = this.pos, r = this.expression.charAt(t);
  if (r === "'" || r === '"')
    for (var n = this.expression.indexOf(r, t + 1); n >= 0 && this.pos < this.expression.length; ) {
      if (this.pos = n + 1, this.expression.charAt(n - 1) !== "\\") {
        var s = this.expression.substring(t + 1, n);
        this.current = this.newToken(we, this.unescape(s), t), e = !0;
        break;
      }
      n = this.expression.indexOf(r, n + 1);
    }
  return e;
};
d.prototype.isParen = function() {
  var e = this.expression.charAt(this.pos);
  return e === "(" || e === ")" ? (this.current = this.newToken(k, e), this.pos++, !0) : !1;
};
d.prototype.isBracket = function() {
  var e = this.expression.charAt(this.pos);
  return (e === "[" || e === "]") && this.isOperatorEnabled("[") ? (this.current = this.newToken(R, e), this.pos++, !0) : !1;
};
d.prototype.isComma = function() {
  var e = this.expression.charAt(this.pos);
  return e === "," ? (this.current = this.newToken(G, ","), this.pos++, !0) : !1;
};
d.prototype.isSemicolon = function() {
  var e = this.expression.charAt(this.pos);
  return e === ";" ? (this.current = this.newToken(ee, ";"), this.pos++, !0) : !1;
};
d.prototype.isConst = function() {
  for (var e = this.pos, t = e; t < this.expression.length; t++) {
    var r = this.expression.charAt(t);
    if (r.toUpperCase() === r.toLowerCase() && (t === this.pos || r !== "_" && r !== "." && (r < "0" || r > "9")))
      break;
  }
  if (t > e) {
    var n = this.expression.substring(e, t);
    if (n in this.consts)
      return this.current = this.newToken(j, this.consts[n]), this.pos += n.length, !0;
  }
  return !1;
};
d.prototype.isNamedOp = function() {
  for (var e = this.pos, t = e; t < this.expression.length; t++) {
    var r = this.expression.charAt(t);
    if (r.toUpperCase() === r.toLowerCase() && (t === this.pos || r !== "_" && (r < "0" || r > "9")))
      break;
  }
  if (t > e) {
    var n = this.expression.substring(e, t);
    if (this.isOperatorEnabled(n) && (n in this.binaryOps || n in this.unaryOps || n in this.ternaryOps))
      return this.current = this.newToken(v, n), this.pos += n.length, !0;
  }
  return !1;
};
d.prototype.isName = function() {
  for (var e = this.pos, t = e, r = !1; t < this.expression.length; t++) {
    var n = this.expression.charAt(t);
    if (n.toUpperCase() === n.toLowerCase()) {
      if (t === this.pos && (n === "$" || n === "_")) {
        n === "_" && (r = !0);
        continue;
      } else if (t === this.pos || !r || n !== "_" && (n < "0" || n > "9"))
        break;
    } else
      r = !0;
  }
  if (r) {
    var s = this.expression.substring(e, t);
    return this.current = this.newToken(J, s), this.pos += s.length, !0;
  }
  return !1;
};
d.prototype.isWhitespace = function() {
  for (var e = !1, t = this.expression.charAt(this.pos); (t === " " || t === "	" || t === `
` || t === "\r") && (e = !0, this.pos++, !(this.pos >= this.expression.length)); )
    t = this.expression.charAt(this.pos);
  return e;
};
var Se = /^[0-9a-f]{4}$/i;
d.prototype.unescape = function(e) {
  var t = e.indexOf("\\");
  if (t < 0)
    return e;
  for (var r = e.substring(0, t); t >= 0; ) {
    var n = e.charAt(++t);
    switch (n) {
      case "'":
        r += "'";
        break;
      case '"':
        r += '"';
        break;
      case "\\":
        r += "\\";
        break;
      case "/":
        r += "/";
        break;
      case "b":
        r += "\b";
        break;
      case "f":
        r += "\f";
        break;
      case "n":
        r += `
`;
        break;
      case "r":
        r += "\r";
        break;
      case "t":
        r += "	";
        break;
      case "u":
        var s = e.substring(t + 1, t + 5);
        Se.test(s) || this.parseError("Illegal escape sequence: \\u" + s), r += String.fromCharCode(parseInt(s, 16)), t += 4;
        break;
      default:
        throw this.parseError('Illegal escape sequence: "\\' + n + '"');
    }
    ++t;
    var a = e.indexOf("\\", t);
    r += e.substring(t, a < 0 ? e.length : a), t = a;
  }
  return r;
};
d.prototype.isComment = function() {
  var e = this.expression.charAt(this.pos);
  return e === "/" && this.expression.charAt(this.pos + 1) === "*" ? (this.pos = this.expression.indexOf("*/", this.pos) + 2, this.pos === 1 && (this.pos = this.expression.length), !0) : !1;
};
d.prototype.isRadixInteger = function() {
  var e = this.pos;
  if (e >= this.expression.length - 2 || this.expression.charAt(e) !== "0")
    return !1;
  ++e;
  var t, r;
  if (this.expression.charAt(e) === "x")
    t = 16, r = /^[0-9a-f]$/i, ++e;
  else if (this.expression.charAt(e) === "b")
    t = 2, r = /^[01]$/i, ++e;
  else
    return !1;
  for (var n = !1, s = e; e < this.expression.length; ) {
    var a = this.expression.charAt(e);
    if (r.test(a))
      e++, n = !0;
    else
      break;
  }
  return n && (this.current = this.newToken(j, parseInt(this.expression.substring(s, e), t)), this.pos = e), n;
};
d.prototype.isNumber = function() {
  for (var e = !1, t = this.pos, r = t, n = t, s = !1, a = !1, i; t < this.expression.length && (i = this.expression.charAt(t), i >= "0" && i <= "9" || !s && i === "."); )
    i === "." ? s = !0 : a = !0, t++, e = a;
  if (e && (n = t), i === "e" || i === "E") {
    t++;
    for (var o = !0, l = !1; t < this.expression.length; ) {
      if (i = this.expression.charAt(t), o && (i === "+" || i === "-"))
        o = !1;
      else if (i >= "0" && i <= "9")
        l = !0, o = !1;
      else
        break;
      t++;
    }
    l || (t = n);
  }
  return e ? (this.current = this.newToken(j, parseFloat(this.expression.substring(r, t))), this.pos = t) : this.pos = n, e;
};
d.prototype.isOperator = function() {
  var e = this.pos, t = this.expression.charAt(this.pos);
  if (t === "+" || t === "-" || t === "*" || t === "/" || t === "%" || t === "^" || t === "?" || t === ":" || t === ".")
    this.current = this.newToken(v, t);
  else if (t === "∙" || t === "•")
    this.current = this.newToken(v, "*");
  else if (t === ">")
    this.expression.charAt(this.pos + 1) === "=" ? (this.current = this.newToken(v, ">="), this.pos++) : this.current = this.newToken(v, ">");
  else if (t === "<")
    this.expression.charAt(this.pos + 1) === "=" ? (this.current = this.newToken(v, "<="), this.pos++) : this.current = this.newToken(v, "<");
  else if (t === "|")
    if (this.expression.charAt(this.pos + 1) === "|")
      this.current = this.newToken(v, "||"), this.pos++;
    else
      return !1;
  else if (t === "=")
    this.expression.charAt(this.pos + 1) === "=" ? (this.current = this.newToken(v, "=="), this.pos++) : this.current = this.newToken(v, t);
  else if (t === "!")
    this.expression.charAt(this.pos + 1) === "=" ? (this.current = this.newToken(v, "!="), this.pos++) : this.current = this.newToken(v, t);
  else
    return !1;
  return this.pos++, this.isOperatorEnabled(this.current.value) ? !0 : (this.pos = e, !1);
};
d.prototype.isOperatorEnabled = function(e) {
  return this.parser.isOperatorEnabled(e);
};
d.prototype.getCoordinates = function() {
  var e = 0, t, r = -1;
  do
    e++, t = this.pos - r, r = this.expression.indexOf(`
`, r + 1);
  while (r >= 0 && r < this.pos);
  return {
    line: e,
    column: t
  };
};
d.prototype.parseError = function(e) {
  var t = this.getCoordinates();
  throw new Error("parse error [" + t.line + ":" + t.column + "]: " + e);
};
function y(e, t, r) {
  this.parser = e, this.tokens = t, this.current = null, this.nextToken = null, this.next(), this.savedCurrent = null, this.savedNextToken = null, this.allowMemberAccess = r.allowMemberAccess !== !1;
}
y.prototype.next = function() {
  return this.current = this.nextToken, this.nextToken = this.tokens.next();
};
y.prototype.tokenMatches = function(e, t) {
  return typeof t > "u" ? !0 : Array.isArray(t) ? m(t, e.value) : typeof t == "function" ? t(e) : e.value === t;
};
y.prototype.save = function() {
  this.savedCurrent = this.current, this.savedNextToken = this.nextToken, this.tokens.save();
};
y.prototype.restore = function() {
  this.tokens.restore(), this.current = this.savedCurrent, this.nextToken = this.savedNextToken;
};
y.prototype.accept = function(e, t) {
  return this.nextToken.type === e && this.tokenMatches(this.nextToken, t) ? (this.next(), !0) : !1;
};
y.prototype.expect = function(e, t) {
  if (!this.accept(e, t)) {
    var r = this.tokens.getCoordinates();
    throw new Error("parse error [" + r.line + ":" + r.column + "]: Expected " + (t || e));
  }
};
y.prototype.parseAtom = function(e) {
  var t = this.tokens.unaryOps;
  function r(s) {
    return s.value in t;
  }
  if (this.accept(J) || this.accept(v, r))
    e.push(new f(A, this.current.value));
  else if (this.accept(j))
    e.push(new f(x, this.current.value));
  else if (this.accept(we))
    e.push(new f(x, this.current.value));
  else if (this.accept(k, "("))
    this.parseExpression(e), this.expect(k, ")");
  else if (this.accept(R, "["))
    if (this.accept(R, "]"))
      e.push(new f(N, 0));
    else {
      var n = this.parseArrayList(e);
      e.push(new f(N, n));
    }
  else
    throw new Error("unexpected " + this.nextToken);
};
y.prototype.parseExpression = function(e) {
  var t = [];
  this.parseUntilEndStatement(e, t) || (this.parseVariableAssignmentExpression(t), !this.parseUntilEndStatement(e, t) && this.pushExpression(e, t));
};
y.prototype.pushExpression = function(e, t) {
  for (var r = 0, n = t.length; r < n; r++)
    e.push(t[r]);
};
y.prototype.parseUntilEndStatement = function(e, t) {
  return this.accept(ee) ? (this.nextToken && this.nextToken.type !== _ && !(this.nextToken.type === k && this.nextToken.value === ")") && t.push(new f(D)), this.nextToken.type !== _ && this.parseExpression(t), e.push(new f(g, t)), !0) : !1;
};
y.prototype.parseArrayList = function(e) {
  for (var t = 0; !this.accept(R, "]"); )
    for (this.parseExpression(e), ++t; this.accept(G); )
      this.parseExpression(e), ++t;
  return t;
};
y.prototype.parseVariableAssignmentExpression = function(e) {
  for (this.parseConditionalExpression(e); this.accept(v, "="); ) {
    var t = e.pop(), r = [], n = e.length - 1;
    if (t.type === S) {
      if (!this.tokens.isOperatorEnabled("()="))
        throw new Error("function definition is not permitted");
      for (var s = 0, a = t.value + 1; s < a; s++) {
        var i = n - s;
        e[i].type === A && (e[i] = new f(I, e[i].value));
      }
      this.parseVariableAssignmentExpression(r), e.push(new f(g, r)), e.push(new f(q, t.value));
      continue;
    }
    if (t.type !== A && t.type !== C)
      throw new Error("expected variable for assignment");
    this.parseVariableAssignmentExpression(r), e.push(new f(I, t.value)), e.push(new f(g, r)), e.push(O("="));
  }
};
y.prototype.parseConditionalExpression = function(e) {
  for (this.parseOrExpression(e); this.accept(v, "?"); ) {
    var t = [], r = [];
    this.parseConditionalExpression(t), this.expect(v, ":"), this.parseConditionalExpression(r), e.push(new f(g, t)), e.push(new f(g, r)), e.push(ve("?"));
  }
};
y.prototype.parseOrExpression = function(e) {
  for (this.parseAndExpression(e); this.accept(v, "or"); ) {
    var t = [];
    this.parseAndExpression(t), e.push(new f(g, t)), e.push(O("or"));
  }
};
y.prototype.parseAndExpression = function(e) {
  for (this.parseComparison(e); this.accept(v, "and"); ) {
    var t = [];
    this.parseComparison(t), e.push(new f(g, t)), e.push(O("and"));
  }
};
var Ne = ["==", "!=", "<", "<=", ">=", ">", "in"];
y.prototype.parseComparison = function(e) {
  for (this.parseAddSub(e); this.accept(v, Ne); ) {
    var t = this.current;
    this.parseAddSub(e), e.push(O(t.value));
  }
};
var Re = ["+", "-", "||"];
y.prototype.parseAddSub = function(e) {
  for (this.parseTerm(e); this.accept(v, Re); ) {
    var t = this.current;
    this.parseTerm(e), e.push(O(t.value));
  }
};
var Fe = ["*", "/", "%"];
y.prototype.parseTerm = function(e) {
  for (this.parseFactor(e); this.accept(v, Fe); ) {
    var t = this.current;
    this.parseFactor(e), e.push(O(t.value));
  }
};
y.prototype.parseFactor = function(e) {
  var t = this.tokens.unaryOps;
  function r(s) {
    return s.value in t;
  }
  if (this.save(), this.accept(v, r)) {
    if (this.current.value !== "-" && this.current.value !== "+") {
      if (this.nextToken.type === k && this.nextToken.value === "(") {
        this.restore(), this.parseExponential(e);
        return;
      } else if (this.nextToken.type === ee || this.nextToken.type === G || this.nextToken.type === _ || this.nextToken.type === k && this.nextToken.value === ")") {
        this.restore(), this.parseAtom(e);
        return;
      }
    }
    var n = this.current;
    this.parseFactor(e), e.push(B(n.value));
  } else
    this.parseExponential(e);
};
y.prototype.parseExponential = function(e) {
  for (this.parsePostfixExpression(e); this.accept(v, "^"); )
    this.parseFactor(e), e.push(O("^"));
};
y.prototype.parsePostfixExpression = function(e) {
  for (this.parseFunctionCall(e); this.accept(v, "!"); )
    e.push(B("!"));
};
y.prototype.parseFunctionCall = function(e) {
  var t = this.tokens.unaryOps;
  function r(a) {
    return a.value in t;
  }
  if (this.accept(v, r)) {
    var n = this.current;
    this.parseAtom(e), e.push(B(n.value));
  } else
    for (this.parseMemberExpression(e); this.accept(k, "("); )
      if (this.accept(k, ")"))
        e.push(new f(S, 0));
      else {
        var s = this.parseArgumentList(e);
        e.push(new f(S, s));
      }
};
y.prototype.parseArgumentList = function(e) {
  for (var t = 0; !this.accept(k, ")"); )
    for (this.parseExpression(e), ++t; this.accept(G); )
      this.parseExpression(e), ++t;
  return t;
};
y.prototype.parseMemberExpression = function(e) {
  for (this.parseAtom(e); this.accept(v, ".") || this.accept(R, "["); ) {
    var t = this.current;
    if (t.value === ".") {
      if (!this.allowMemberAccess)
        throw new Error('unexpected ".", member access is not permitted');
      this.expect(J), e.push(new f(C, this.current.value));
    } else if (t.value === "[") {
      if (!this.tokens.isOperatorEnabled("["))
        throw new Error('unexpected "[]", arrays are disabled');
      this.parseExpression(e), this.expect(R, "]"), e.push(O("["));
    } else
      throw new Error("unexpected symbol: " + t.value);
  }
};
function Le(e, t) {
  return Number(e) + Number(t);
}
function $e(e, t) {
  return e - t;
}
function _e(e, t) {
  return e * t;
}
function Ue(e, t) {
  return e / t;
}
function Ve(e, t) {
  return e % t;
}
function qe(e, t) {
  return Array.isArray(e) && Array.isArray(t) ? e.concat(t) : "" + e + t;
}
function De(e, t) {
  return e === t;
}
function Be(e, t) {
  return e !== t;
}
function je(e, t) {
  return e > t;
}
function Ge(e, t) {
  return e < t;
}
function Xe(e, t) {
  return e >= t;
}
function Ye(e, t) {
  return e <= t;
}
function Ke(e, t) {
  return !!(e && t);
}
function We(e, t) {
  return !!(e || t);
}
function ze(e, t) {
  return m(t, e);
}
function He(e) {
  return (Math.exp(e) - Math.exp(-e)) / 2;
}
function Qe(e) {
  return (Math.exp(e) + Math.exp(-e)) / 2;
}
function Ze(e) {
  return e === 1 / 0 ? 1 : e === -1 / 0 ? -1 : (Math.exp(e) - Math.exp(-e)) / (Math.exp(e) + Math.exp(-e));
}
function Je(e) {
  return e === -1 / 0 ? e : Math.log(e + Math.sqrt(e * e + 1));
}
function et(e) {
  return Math.log(e + Math.sqrt(e * e - 1));
}
function tt(e) {
  return Math.log((1 + e) / (1 - e)) / 2;
}
function ue(e) {
  return Math.log(e) * Math.LOG10E;
}
function rt(e) {
  return -e;
}
function nt(e) {
  return !e;
}
function st(e) {
  return e < 0 ? Math.ceil(e) : Math.floor(e);
}
function it(e) {
  return Math.random() * (e || 1);
}
function he(e) {
  return te(e + 1);
}
function at(e) {
  return isFinite(e) && e === Math.round(e);
}
var ot = 4.7421875, K = [
  0.9999999999999971,
  57.15623566586292,
  -59.59796035547549,
  14.136097974741746,
  -0.4919138160976202,
  3399464998481189e-20,
  4652362892704858e-20,
  -9837447530487956e-20,
  1580887032249125e-19,
  -21026444172410488e-20,
  21743961811521265e-20,
  -1643181065367639e-19,
  8441822398385275e-20,
  -26190838401581408e-21,
  36899182659531625e-22
];
function te(e) {
  var t, r;
  if (at(e)) {
    if (e <= 0)
      return isFinite(e) ? 1 / 0 : NaN;
    if (e > 171)
      return 1 / 0;
    for (var n = e - 2, s = e - 1; n > 1; )
      s *= n, n--;
    return s === 0 && (s = 1), s;
  }
  if (e < 0.5)
    return Math.PI / (Math.sin(Math.PI * e) * te(1 - e));
  if (e >= 171.35)
    return 1 / 0;
  if (e > 85) {
    var a = e * e, i = a * e, o = i * e, l = o * e;
    return Math.sqrt(2 * Math.PI / e) * Math.pow(e / Math.E, e) * (1 + 1 / (12 * e) + 1 / (288 * a) - 139 / (51840 * i) - 571 / (2488320 * o) + 163879 / (209018880 * l) + 5246819 / (75246796800 * l * e));
  }
  --e, r = K[0];
  for (var p = 1; p < K.length; ++p)
    r += K[p] / (e + p);
  return t = e + ot + 0.5, Math.sqrt(2 * Math.PI) * Math.pow(t, e + 0.5) * Math.exp(-t) * r;
}
function ut(e) {
  return Array.isArray(e) ? e.length : String(e).length;
}
function pe() {
  for (var e = 0, t = 0, r = 0; r < arguments.length; r++) {
    var n = Math.abs(arguments[r]), s;
    t < n ? (s = t / n, e = e * s * s + 1, t = n) : n > 0 ? (s = n / t, e += s * s) : e += n;
  }
  return t === 1 / 0 ? 1 / 0 : t * Math.sqrt(e);
}
function le(e, t, r) {
  return e ? t : r;
}
function ht(e, t) {
  return typeof t > "u" || +t == 0 ? Math.round(e) : (e = +e, t = -+t, isNaN(e) || !(typeof t == "number" && t % 1 === 0) ? NaN : (e = e.toString().split("e"), e = Math.round(+(e[0] + "e" + (e[1] ? +e[1] - t : -t))), e = e.toString().split("e"), +(e[0] + "e" + (e[1] ? +e[1] + t : t))));
}
function pt(e, t, r) {
  return r && (r[e] = t), t;
}
function lt(e, t) {
  return e[t | 0];
}
function ft(e) {
  return arguments.length === 1 && Array.isArray(e) ? Math.max.apply(Math, e) : Math.max.apply(Math, arguments);
}
function ct(e) {
  return arguments.length === 1 && Array.isArray(e) ? Math.min.apply(Math, e) : Math.min.apply(Math, arguments);
}
function vt(e, t) {
  if (typeof e != "function")
    throw new Error("First argument to map is not a function");
  if (!Array.isArray(t))
    throw new Error("Second argument to map is not an array");
  return t.map(function(r, n) {
    return e(r, n);
  });
}
function yt(e, t, r) {
  if (typeof e != "function")
    throw new Error("First argument to fold is not a function");
  if (!Array.isArray(r))
    throw new Error("Second argument to fold is not an array");
  return r.reduce(function(n, s, a) {
    return e(n, s, a);
  }, t);
}
function wt(e, t) {
  if (typeof e != "function")
    throw new Error("First argument to filter is not a function");
  if (!Array.isArray(t))
    throw new Error("Second argument to filter is not an array");
  return t.filter(function(r, n) {
    return e(r, n);
  });
}
function dt(e, t) {
  if (!(Array.isArray(t) || typeof t == "string"))
    throw new Error("Second argument to indexOf is not a string or array");
  return t.indexOf(e);
}
function gt(e, t) {
  if (!Array.isArray(t))
    throw new Error("Second argument to join is not an array");
  return t.join(e);
}
function xt(e) {
  return (e > 0) - (e < 0) || +e;
}
var fe = 1 / 3;
function Et(e) {
  return e < 0 ? -Math.pow(-e, fe) : Math.pow(e, fe);
}
function Mt(e) {
  return Math.exp(e) - 1;
}
function bt(e) {
  return Math.log(1 + e);
}
function At(e) {
  return Math.log(e) / Math.LN2;
}
function P(e) {
  this.options = e || {}, this.unaryOps = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    asin: Math.asin,
    acos: Math.acos,
    atan: Math.atan,
    sinh: Math.sinh || He,
    cosh: Math.cosh || Qe,
    tanh: Math.tanh || Ze,
    asinh: Math.asinh || Je,
    acosh: Math.acosh || et,
    atanh: Math.atanh || tt,
    sqrt: Math.sqrt,
    cbrt: Math.cbrt || Et,
    log: Math.log,
    log2: Math.log2 || At,
    ln: Math.log,
    lg: Math.log10 || ue,
    log10: Math.log10 || ue,
    expm1: Math.expm1 || Mt,
    log1p: Math.log1p || bt,
    abs: Math.abs,
    ceil: Math.ceil,
    floor: Math.floor,
    round: Math.round,
    trunc: Math.trunc || st,
    "-": rt,
    "+": Number,
    exp: Math.exp,
    not: nt,
    length: ut,
    "!": he,
    sign: Math.sign || xt
  }, this.binaryOps = {
    "+": Le,
    "-": $e,
    "*": _e,
    "/": Ue,
    "%": Ve,
    "^": Math.pow,
    "||": qe,
    "==": De,
    "!=": Be,
    ">": je,
    "<": Ge,
    ">=": Xe,
    "<=": Ye,
    and: Ke,
    or: We,
    in: ze,
    "=": pt,
    "[": lt
  }, this.ternaryOps = {
    "?": le
  }, this.functions = {
    random: it,
    fac: he,
    min: ct,
    max: ft,
    hypot: Math.hypot || pe,
    pyt: Math.hypot || pe,
    // backward compat
    pow: Math.pow,
    atan2: Math.atan2,
    if: le,
    gamma: te,
    roundTo: ht,
    map: vt,
    fold: yt,
    filter: wt,
    indexOf: dt,
    join: gt
  }, this.consts = {
    E: Math.E,
    PI: Math.PI,
    true: !0,
    false: !1
  };
}
P.prototype.parse = function(e) {
  var t = [], r = new y(
    this,
    new d(this, e),
    { allowMemberAccess: this.options.allowMemberAccess }
  );
  return r.parseExpression(t), r.expect(_, "EOF"), new M(t, this);
};
P.prototype.evaluate = function(e, t) {
  return this.parse(e).evaluate(t);
};
var ge = new P();
P.parse = function(e) {
  return ge.parse(e);
};
P.evaluate = function(e, t) {
  return ge.parse(e).evaluate(t);
};
var ce = {
  "+": "add",
  "-": "subtract",
  "*": "multiply",
  "/": "divide",
  "%": "remainder",
  "^": "power",
  "!": "factorial",
  "<": "comparison",
  ">": "comparison",
  "<=": "comparison",
  ">=": "comparison",
  "==": "comparison",
  "!=": "comparison",
  "||": "concatenate",
  and: "logical",
  or: "logical",
  not: "logical",
  "?": "conditional",
  ":": "conditional",
  "=": "assignment",
  "[": "array",
  "()=": "fndef"
};
function kt(e) {
  return ce.hasOwnProperty(e) ? ce[e] : e;
}
P.prototype.isOperatorEnabled = function(e) {
  var t = kt(e), r = this.options.operators || {};
  return !(t in r) || !!r[t];
};
const Ot = { class: "keypad w-100 h-100" }, Tt = {
  class: "text-end",
  style: { "grid-area": "sta" }
}, It = ["onClick"], Ct = /* @__PURE__ */ be({
  __name: "App",
  props: {
    modelValue: { default: "0" },
    modelModifiers: {}
  },
  emits: ["update:modelValue"],
  setup(e) {
    const t = Ae(""), r = ke(e, "modelValue");
    function n() {
      t.value = "", r.value = "0";
    }
    function s() {
      let p = r.value;
      p && (p = p.substring(0, p.length - 1)), p || (p = "0"), r.value = p;
    }
    function a(p) {
      t.value = `${l()} ${p}`, r.value = "0";
    }
    function i() {
      const p = l();
      try {
        r.value = `${P.evaluate(p)}`;
      } catch (u) {
        u instanceof Error ? r.value = u.message : (r.value = "error", console.error(`vue3-calc-ui unexpected error
${u}`));
      } finally {
        t.value = p;
      }
    }
    function o(p) {
      let u = r.value + p;
      u = u.replace(/^0*([^.])/, "$1"), /^([0-9]+|[0-9]+\.[0-9]*)$/.test(u) && (r.value = u);
    }
    function l() {
      return /[+\-*/]$/.test(t.value) ? `${t.value} ${r.value}` : r.value;
    }
    return (p, u) => (se(), ie("div", Ot, [
      E("p", Tt, ae(t.value), 1),
      Oe(E("input", {
        class: "form-control",
        type: "text",
        readonly: "",
        "onUpdate:modelValue": u[0] || (u[0] = (c) => r.value = c),
        style: { "grid-area": "inp" }
      }, null, 512), [
        [Te, r.value]
      ]),
      E("button", {
        type: "button",
        class: "btn btn-secondary",
        style: { "grid-area": "cls" },
        onClick: n
      }, "C"),
      E("button", {
        type: "button",
        class: "btn btn-secondary",
        style: { "grid-area": "bas" },
        onClick: s
      }, "<"),
      E("button", {
        type: "button",
        class: "btn btn-secondary",
        style: { "grid-area": "div" },
        onClick: u[1] || (u[1] = (c) => a("/"))
      }, "/"),
      E("button", {
        type: "button",
        class: "btn btn-secondary",
        style: { "grid-area": "mul" },
        onClick: u[2] || (u[2] = (c) => a("*"))
      }, "*"),
      E("button", {
        type: "button",
        class: "btn btn-secondary",
        style: { "grid-area": "sub" },
        onClick: u[3] || (u[3] = (c) => a("-"))
      }, "-"),
      E("button", {
        type: "button",
        class: "btn btn-secondary",
        style: { "grid-area": "add" },
        onClick: u[4] || (u[4] = (c) => a("+"))
      }, "+"),
      E("button", {
        type: "button",
        class: "btn btn-primary",
        style: { "grid-area": "eva" },
        onClick: i
      }, "="),
      E("button", {
        type: "button",
        class: "btn btn-light",
        style: { "grid-area": "dot" },
        onClick: u[5] || (u[5] = (c) => o("."))
      }, "."),
      (se(), ie(Ie, null, Ce(10, (c) => E("button", {
        type: "button",
        class: "btn btn-light",
        style: Pe(`grid-area:ky${c - 1}`),
        onClick: (h) => o(`${c - 1}`)
      }, ae(c - 1), 13, It)), 64))
    ]));
  }
}), Pt = (e, t) => {
  const r = e.__vccOpts || e;
  for (const [n, s] of t)
    r[n] = s;
  return r;
}, St = /* @__PURE__ */ Pt(Ct, [["__scopeId", "data-v-e3eb34c2"]]);
export {
  St as App
};
