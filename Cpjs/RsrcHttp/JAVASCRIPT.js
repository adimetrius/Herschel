"use strict";

function EMPTY () {};
/*var M = Object.seal({
	refcnt: 0, term: function() {}, 
	imports: [  ],
	exports: [], 
	name: 'M'
});
*/

//if (typeof Kernel === 'undefined') {
	var Kernel = Object.seal({refcnt:0,term:EMPTY,imports:[],exports:[],name:'Kernel'})
	var Kernel$int = 0; var Kernel$stringtp = 1; var Kernel$fld = 1;var Kernel$tproc = 2; 
	var $Kernel$Type = {};
	function Kernel$Type (mod, lvl, base) { this.mod = mod; this.level = lvl; this.base = base; this.fields = []; this.verbs = []; Object.seal(this) };
	Kernel$Type.prototype = $Kernel$Type;
	var $Kernel$Object = Object.seal({});
	function Kernel$Object (name, what, type) { this.name = name; this.what = what; this.type = type };
	Kernel$Object.prototype = $Kernel$Object;
	$Kernel$Type.type = new Kernel$Type(Kernel, 0, [], [new Kernel$Object('mod', Kernel$fld, Kernel$stringtp), new Kernel$Object('level', Kernel$fld, Kernel$int)], []);
	Object.seal($Kernel$Type);
//};

var JS = {};
/*JS.String = function (s) { };*/
JS.Ln = function () { RESULTS.insertAdjacentHTML('beforeend', '<br>') };

/*JS.Ln = function () {
	document.getElementById("ID").innerText = document.getElementById("ID").innerText + "\n";
};
*/
JS.String = function (str) {
	if (str.constructor === Uint16Array) { 
		str = String.fromCharCode.apply(null, str.slice(0, str.findIndex(ch=>ch===0))) 
	};
    RESULTS.insertAdjacentText('beforeend', str)
};

JS.Int = function (x) {
	RESULTS.insertAdjacentText('beforeend', x);
};

JS.Real = JS.Int;
JS.Set = function (s) { RESULTS.insertAdjacentText('beforeend', "{" + s.toString(2) + "}") };
JS.Bool = function (b) { RESULTS.insertAdjacentText('beforeend', b ? "TRUE" : "FALSE") };
JS.Char = function (ch) { RESULTS.insertAdjacentText('beforeend', String.fromCharCode(ch)) };

function RNG(i, j) { var s = 0; for(let k=i; k <=j;k++) s |= 1<<k; return s };

var $OpenArray = Object.seal({ a: null, dim: null, NDX: EMPTY });
function OpenArray () { };
OpenArray.prototype = $OpenArray;
$OpenArray.NDX = function () {
	var a = this.a, i = 0, len = this.dim.length, j = 0;
	while (i < len) { j = arguments[i]; 
		if ((0 <= j) && (j < this.dim[i])) { a = a[j] } else { throw "Index out of range" };
		i++
	};
	return a
}


function NDX (i, len) { if ((0 <= i) && (i < len)) { return i } else throw "Index out of range" };
//DNDX(a, i, len) { if ((0 <= i) && (i < len)) { return a[i] } else throw "Index out of range" };
	

function $NewStaticArray (i, dims, constructor) {
	var bottom = i === dims.length - 1;
	var len = dims[i];
	var res = new Array(len);
	for (var j = 0; j < len; j++) { //res[j] = bottom ? new constructor() : $NewStaticArray(i + 1, dims);
	    if (bottom) {
	        if (constructor === null) res[j] = null
	        else res[j] = new constructor()
        } else res[j] = $NewStaticArray(i + 1, dims, constructor)
	}
	return res
};
		
function $NewArray (dyn, stat, bottom) {
	var a, res, cons;
	if (typeof bottom === 'number') {
		if (bottom === 8) cons = Uint8Array
		else if (bottom === 16) cons = Uint16Array
		else if (bottom === 32) cons = Uint32Array
		else if (bottom === 64) cons = Uint64Array
		else throw "Illegal array element size";
		a = new cons(dyn.concat(stat).reduce((a,b)=>a*b))
	} else a = $NewStaticArray(0, dyn.concat(stat), bottom);
	if (dyn.length > 0) { res = new OpenArray; res.dim = dyn; res.a = a  }
	else res = a;
	return res
   }

/*	function GET (a, dim, base, pos) {
		if (arguments.length !== dim.length + 4) throw "Wrong number of indices";
		var i = dim.length - 1, j = 0, k = 0, n = base, res = null;
		while (i >= 0) { 
			j = arguments[i + 4]; 
			if ((j < 0) || (dim[i] <= j)) { throw "Index out of range @ " + pos };
			k += j * n; n *= dim[i];
			i--
		};
		if (base === 1) res = a[k]
		else res = a.subarray(k, k + base);
		return res
	}
	
	function SET(v, a, dim, base, pos) {
		if (arguments.length !== dim.length + 5) throw "Wrong number of indices";
		var i = dim.length - 1, j = 0, k = 0, n = base;
		while (i >= 0) { 
			j = arguments[i + 5];
			if ((j < 0) || (dim[i] <= j)) { throw "Index out of range @ " + pos };
			k += j * n; n *= dim[i];
			i--
		};
		if (base === 1) a[k] = v
		else a.subarray(k, k + base).set(v);
	}
	
	const $POINTER = 0, $RECORD = 1, $BASIC = 2;
	
	// Array assignment for non-basic bottom type. Assuming same dimensions. l = left, r = right
	function ASSIGN(bottom, l, ldim, r, rdim, base, pos) {
		const args = 7;
		if (arguments.length !== ldim.length + rdim.length + args) throw "Wrong number of indices";
		var i = ldim.length - 1, j = 0, rk = 0, lk = 0, n = base, offs = 0;
		while (i >= 0) { 
			j = arguments[i + args];
			if ((j < 0) || (ldim[i] <= j)) { throw "Index LEFT out of range @ " + pos };
			lk += j * n; n *= ldim[i];
			i--
		};
		i = rdim.length - 1; offs = args + ldim.length; n = base;
		while (i >= 0) { 
			j = arguments[i + offs];
			if ((j < 0) || (rdim[i] <= j)) { throw "Index RIGHT out of range @ " + pos };
			rk += j * n; n *= rdim[i];
			i--
		};
		if (bottom === $POINTER) { for (i = 0; i < base; i++) l[lk + i] = r[rk + i] }
		else if (bottom === $RECORD) { for (i = 0; i < base; i++) Object.assign(l[lk + i], r[rk + i]) }
		else if (bottom === $BASIC) { l.subarray(lk, lk + base).set(r.subarray(rk, rk + base)) }
		else throw "Illegal bottom identifier"
	}
*/
	
	function SUBRANGE (baseoffs, dim, pos) {
		var pars = 0;
		if (Array.isArray(baseoffs)) { pos = dim, dim = baseoffs, baseoffs = 0, pars = 2 } else { pars = 3 };
		var j, i = dim.length - 1, alen = arguments.length, offset = 0, base = 1, len = 1, k = i + pars;
		while (i >= 0) {
			if (k < alen) { j = arguments[k] } else { j = 0 };
			if ((j < 0) || (dim[i] <= j)) { throw "Index out of range @" + pos };
			offset += j * base;
			if (k === alen - 1) len = base;
			base *= dim[i];
			if (k === alen) len = base;
			i--; k--
		};
		return [baseoffs + offset, baseoffs + offset + len]
	}

	function OFFSET (baseoffs, dim, pos) {
		var pars = 0;
		if (Array.isArray(baseoffs)) { pos = dim, dim = baseoffs, baseoffs = 0, pars = 2 } else { pars = 3 };
		var j, i = dim.length - 1, alen = arguments.length, offset = 0, base = 1, k = i + pars;
		while (i >= 0) {
			if (k < alen) { j = arguments[k] } else { j = 0 };
			if ((j < 0) || (dim[i] <= j)) { throw "Index out of range @" + pos };
			offset += j * base; base *= dim[i];
			i--; k--
		};
		return baseoffs + offset
	}

/*	function OFFSSET (dim, pos) {
		const pars = 2;
		var j, i = dim.length - 1, alen = arguments.length, offset = 0, base = 1, k = i + pars;
		while (i >= 0) {
			if (k < alen) { j = arguments[k] } else { j = 0 };
			if ((j < 0) || (dim[i] <= j)) { throw "Index out of range @" + pos };
			offset += j * base;
			base *= dim[i];
			i--; k--
		};
		return offset
	}

	function OFFSET (dim, pos) {
		const pars = 2;
		var i = dim.length - 1, alen = arguments.length, i = 0, offset = 0, base = 1;
		while (i >= 0) {
			j = i + pars < alen ? arguments[i] : 0;
			if ((j < 0) || (dim[i] <= j)) { throw "Index out of range @" + pos };
			offset += j * base; base *= dim[i];
			i--
		};
		return offset
	}
*/
	
	function FILL (a, proto) {
		var i = 0, len = a.length; while (i < len) { a[i] = new proto.constructor; i++ };
		return a
	}

var testjs = "Make it as simple as possible, but not simpler!";
	// for DEBUGGING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

/* String procedures */
	
	String.prototype.LEN$ = function () { return Math.max(this.indexOf("\x00"), this.length) }
	Uint16Array.prototype.LEN$ = function() { return this.findIndex(ch=>ch===0) }

	String.prototype.TOSTRING = function () {
		var M = this.length, N;
		N = this.length + 1;
		var a = new Uint16Array(N); 
		var i = 0, ch = 0;
		while ((i < M) && (i < N) && ((ch = this.charCodeAt(i)) !== 0)) { a[i] = ch; i++ };
		if (ch === 0 || i === M) { a[i] = 0 } else throw "String too long CAP" + this;
	        return [a, i + 1]
	};

	Uint16Array.prototype.LEN$ = function () {
		var i = 0, len = this.length;
		while ((i < len) && (this[i] !== 0)) i++;
		if (i === len) throw "String not properly terminated with 0X in LEN$";
		return i
	}

	Uint16Array.prototype.CONCAT = function (s) {
		var M = this.length, j = 0, i = 0, k, m = 0, dup = null, ch = 0;
		if ((s.buffer === this.buffer) && (s.byteOffset === this.byteOffset)) { 
			while ((i < M) && (s[i] !== 0)) i++; 
			if (i === M) throw "String not properly terminated with 0X"
			else m = i;
			j = 1
		} else { 
			k = 1; while ((k < arguments.length) 
				&& !((this.buffer === arguments[k].buffer) 
						&& (this.byteOffset === arguments[k].byteOffset))) k++;
			if (k < arguments.length) dup = new Uint16Array(this);
		}
		while (j < arguments.length) { 
			s = arguments[j];
			if ((s.buffer === this.buffer) && (s.byteOffset === this.byteOffset))
				{ if (dup !== null) { s = dup } else { s = this; ch = this[m]; this[m] = 0 } };
			k = 0; while ((i < M) && (s[k] !== 0)) { this[i] = s[k]; i++; k++ };
			if (i === M) 
				{ throw "String too long concat" + arguments.length + " " + j + s; }
			j++;
			if (ch > 0) { this[m] = ch; ch = 0 }
		};
		this[i] = 0;
		return this
	};
	
	function CONCAT () {
		if (this !== null) throw "this = null expected";
		var M, i;
		for (M = 1, i = 0; i < arguments.length; i++) M += arguments[i].LEN$(); 
		return [Uint16Array.prototype.CONCAT.apply(new Uint16Array(M), arguments), M]
	};
	
	JS.GETSTR = function (js, $s, $soffs, $s0) {
		var i = 0, M = js.length, ch;
		while ((i < M) && ((ch = js.charCodeAt(i)) !== 0) && (i < $s0)) { $s[i] = ch; i++ };
		if (i < $s0 - 1) { $s[i] = 0 } else throw "String too long in GETSTR"
	};
	
	JS.TOSTR = function ($s, $soffs, $s0) {
		return String.fromCharCode.apply(null, $s.slice(0, $s.findIndex(ch=>ch===0)))
	}
		

/*	String.prototype.TOCHARRAY = function (a) {
		var N = this.length - 1, M = 0;
		if (a === null) { M = this.LEN$(); a = new Uint16Array(M + 1) } else { M = a.length - 1 };
		var i = 0, ch = 0;
		while ((i <= M) && (i <= N) && ((ch = this.charCodeAt(i)) !== 0)) { a[i] = ch; i++ };
		if (i <= M) { a[i] = 0 } else throw "String too long";
	        return a 
	};

	Uint16Array.prototype.ASSIGN = function (s) {
		var len = s.LEN$();
		if (this.length <= len) { throw "String too long" }
		else this.set(s);
		return this
	}
	
	Uint16Array.prototype.FROMJSTRING = function (jstr) {
		var i = 0, jlen = jstr.length, thislen = this.length, min = Math.min(jlen, thislen);
		if (jlen > thislen) throw "String too long";
		while (i < jlen) { this[i] = jstr.charCodeAt(i); i++ };
		while (i < thislen) { this[i] = 0; i++ }
	}
	
	JS.GETSTR = function (jstr, s) {
		var i = 0, jlen = jstr.length, slen = s.length;
		if (jlen > slen) throw "String too long";
		while (i < jlen) { s[i] = jstr.charCodeAt(i); i++ };
		while (i < slen) { s[i] = 0; i++ }
	}
	
	JS.PUTSTR = function (jstr, s) { jstr = String.fromCharCode.apply(String, s) }
	
*/
/*var a = new Uint16Array(2*3);
var b = {a:a, dim:[2]};
a[5] = 1978; a[4] = 5; a[3] = 28;
*/
/*
VAR a, b: ARRAY P, Q, R OF CHAR;
a[m] := b[n]

b: [P] is the defined dimensions, [Q, R] are the undefined dimensions. These sets can be constructed by the compiler based on the expression b[n].
When Q and R are known to the compiler, the size of b[i] is Q*R, and the starting offset is n*Q*R. Thus the segmed of b that is referenced is n*Q*R..n*Q*R+Q*R-1.
When Q is not know to the compiler, though, some of the calculations have to be delayed till runtime, when Q becomes known.
Actually, because b is fixed, the compiler can do 

b[M, N, K, P]
b[m, n]: offset m*N*K*P + n*K*P + (0 * P) + (0 * 1), length P

b[m, n, k, p]: base = 1, length = 1
b[m, n, k]: base = P, length = P
b[m, n]: base = K*P, length = K*P => base = length!
*/