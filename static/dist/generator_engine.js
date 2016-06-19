(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Generador = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var isObj = require('is-obj');
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Sources cannot be null or undefined');
	}

	return Object(val);
}

function assignKey(to, from, key) {
	var val = from[key];

	if (val === undefined || val === null) {
		return;
	}

	if (hasOwnProperty.call(to, key)) {
		if (to[key] === undefined || to[key] === null) {
			throw new TypeError('Cannot convert undefined or null to object (' + key + ')');
		}
	}

	if (!hasOwnProperty.call(to, key) || !isObj(val)) {
		to[key] = val;
	} else {
		to[key] = assign(Object(to[key]), from[key]);
	}
}

function assign(to, from) {
	if (to === from) {
		return to;
	}

	from = Object(from);

	for (var key in from) {
		if (hasOwnProperty.call(from, key)) {
			assignKey(to, from, key);
		}
	}

	if (Object.getOwnPropertySymbols) {
		var symbols = Object.getOwnPropertySymbols(from);

		for (var i = 0; i < symbols.length; i++) {
			if (propIsEnumerable.call(from, symbols[i])) {
				assignKey(to, from, symbols[i]);
			}
		}
	}

	return to;
}

module.exports = function deepAssign(target) {
	target = toObject(target);

	for (var s = 1; s < arguments.length; s++) {
		assign(target, arguments[s]);
	}

	return target;
};

},{"is-obj":2}],2:[function(require,module,exports){
'use strict';
module.exports = function (x) {
	var type = typeof x;
	return x !== null && (type === 'object' || type === 'function');
};

},{}],3:[function(require,module,exports){
// the whatwg-fetch polyfill installs the fetch() function
// on the global object (window or self)
//
// Return that as the export for use in Webpack, Browserify etc.
require('whatwg-fetch');
module.exports = self.fetch.bind(self);

},{"whatwg-fetch":6}],4:[function(require,module,exports){
(function (global){
/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/,
  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top, bq) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3] || ''
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top, true);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false, bq);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: !this.options.sanitizer
          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        text: cap[0]
      });
      continue;
    }

    // def
    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? this.options.sanitizer
          ? this.options.sanitizer(cap[0])
          : escape(cap[0])
        : cap[0]
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2], true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.text(escape(this.smartypants(cap[0])));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  if (!this.options.mangle) return text;
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

Renderer.prototype.text = function(text) {
  return text;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
  return html.replace(/&([#\w]+);/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  sanitizer: null,
  mangle: true,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer,
  xhtml: false
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (typeof module !== 'undefined' && typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],6:[function(require,module,exports){
(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[normalizeName(name)]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[normalizeName(name)] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)]
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      this.map[name].forEach(function(value) {
        callback.call(thisArg, value, name, this)
      }, this)
    }, this)
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (!body) {
        this._bodyText = ''
      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
        // Only support ArrayBuffers for POST method.
        // Receiving ArrayBuffers happens via Blobs, instead.
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body
    if (Request.prototype.isPrototypeOf(input)) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = input
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = (xhr.getAllResponseHeaders() || '').trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request
      if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input
      } else {
        request = new Request(input, init)
      }

      var xhr = new XMLHttpRequest()

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

},{}],7:[function(require,module,exports){
"use strict";var nameLowerRE=/(\s*(del|el|al|la|de|un|una|unas|unos|uno|the|of|from)\s+)/gi,MALE_PATTERNS=[[/(.)(o)$/i,function(e,n){return n+"a"}],[/(.)(et|ot)(e|o)$/i,function(e,n,t){return""+n+t+"a"}],[/(.)(an|on|ón|án|ór|or)$/i,function(e,n,t){return""+n+t+"a"}]],FEMALE_PATTERNS=[[/(.)(an|on|ón|án|ór|or)(a)$/i,function(e,n,t){return""+n+t}],[/(.)(et|ot)(a)$/i,function(e,n,t){return""+n+t+"o"}],[/(.)(a)$/i,function(e,n){return n+"o"}]],toTitleCase=function(e){return e.replace(/\w\S*/g,function(e){return e.charAt(0).toUpperCase()+e.substr(1).toLowerCase()})},toUpperCase=function(e){return e.split(/\n/).map(function(e){return e.toUpperCase()}).join("\n")},toLowerCase=function(e){return e.toLowerCase()},ucFirst=function(e){return e.replace(/^(\s+)?(.)(.*)/,function(e,n,t,r){return""+(n||"")+(t||"").toUpperCase()+(r||"").toLowerCase()})},toName=function(e){return toTitleCase(e).replace(nameLowerRE,function(e,n){return n.toLowerCase()}).replace(/((?=\S*)[a-z]|^[a-z])/i,function(e,n,t){return""+(n||"").toUpperCase()})},isMale=function(e){return!!MALE_PATTERNS.find(function(n){return!!e.match(n[0])})},isFemale=function(e){return!isMale(e)},isGeneric=function(e){return!isMale(e)&&(e.match(/[a-z][b-df-hj-np-tv-z]$/i)||e.match(/e$/i))},addArticle=function(e){var n=arguments.length<=1||void 0===arguments[1]?!0:arguments[1];return(isMale(e)||isGeneric(e)&&n?"el":"la")+" "+e},addArticleMale=function(e){return addArticle(e,!0)},addArticleFemale=function(e){return addArticle(e,!1)},addUndef=function(e){var n=arguments.length<=1||void 0===arguments[1]?!0:arguments[1];return(isMale(e)||isGeneric(e)&&n?"un":"una")+" "+e},addUndefMale=function(e){return addUndef(e,!0)},addUndefFemale=function(e){return addUndef(e,!1)},toFemale=function(e){if(isFemale(e))return e;var n=MALE_PATTERNS.find(function(n){return e.match(n[0])?n[1]:!1});return n?e.replace(n[0],n[1]):e},toMale=function(e){if(isMale(e)&&!isGeneric(e))return e;var n=FEMALE_PATTERNS.find(function(n){return e.match(n[0])?n[1]:!1});return n?e.replace(n[0],n[1]):e};module.exports={toTitleCase:toTitleCase,toUpperCase:toUpperCase,toLowerCase:toLowerCase,ucFirst:ucFirst,toName:toName,addArticle:addArticle,addArticleFemale:addArticleFemale,addArticleMale:addArticleMale,addUndef:addUndef,addUndefFemale:addUndefFemale,addUndefMale:addUndefMale,toFemale:toFemale,toMale:toMale,isGeneric:isGeneric,isMale:isMale,isFemale:isFemale};

},{}],8:[function(require,module,exports){
"use strict";var _slicedToArray=function(){function e(e,r){var t=[],n=!0,o=!1,a=void 0;try{for(var i,l=e[Symbol.iterator]();!(n=(i=l.next()).done)&&(t.push(i.value),!r||t.length!==r);n=!0);}catch(c){o=!0,a=c}finally{try{!n&&l["return"]&&l["return"]()}finally{if(o)throw a}}return t}return function(r,t){if(Array.isArray(r))return r;if(Symbol.iterator in Object(r))return e(r,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),getModdedGenerator=require("./generator_mods"),getFilteredGenerator=require("./generator_filters"),_require=require("./roller"),isDiceRoll=_require.isDiceRoll,makeRoller=_require.makeRoller,contextRE=/(?:([^\.]+)\.)?(.*)/,generatorRE=/\[(?:([^@\]]+)@)?([^\[\]|]*)(?:\|([^\[\]]*))?\]/gm,inlineTableRE=/\[(?:([^@\]]+)@)?>(([^;\@\[\]\|]+;*)+)\]/g,hasMoreSelectors=function(e){return e.match(generatorRE)},makeInlineGenerator=function(e){var r=inlineTableRE.exec(e),t=_slicedToArray(r,3),n=t[2],o=n.split(/;/);return function(){return o[Math.floor(Math.random()*o.length)]}},execReplacement=function e(r,t,n,o){var a=r.split(/\n/);return a.reduce(function(r,a){var i=void 0;if(!hasMoreSelectors(a))return r+"\n"+a;for(;i=generatorRE.exec(a);){var l=i,c=_slicedToArray(l,4),u=c[0],s=c[1],d=c[2],f=c[3],m=(d||"").match(contextRE),v=_slicedToArray(m,3),R=v[1],h=v[2];R=R||n||"main";var y=void 0;u.match(inlineTableRE)&&(y=makeInlineGenerator(u));var g=void 0;if(g=isDiceRoll(h)){var p=makeRoller(h);a=a.replace(u,p())}var E=y||t[R+"."+h]||t[h];if(E){var _=getModdedGenerator(s,E),x=_();hasMoreSelectors(x)&&(x=e(x,t,R,!0));var T=getFilteredGenerator(f);a=a.replace(u,T(x))}}return""+r+(o?"":"\n")+a},"")};module.exports=function(e,r){return Object.keys(e.tpls).reduce(function(t,n){return t[n]=function(){var t=(n||"").match(contextRE),o=_slicedToArray(t,2),a=o[1];return a=a||"main",execReplacement(e.tpls[n],r,a)},t},r)};

},{"./generator_filters":9,"./generator_mods":10,"./roller":15}],9:[function(require,module,exports){
"use strict";var id=function(e){return e},_require=require("./filters"),toTitleCase=_require.toTitleCase,toUpperCase=_require.toUpperCase,toLowerCase=_require.toLowerCase,ucFirst=_require.ucFirst,toName=_require.toName,addArticle=_require.addArticle,addArticleFemale=_require.addArticleFemale,addArticleMale=_require.addArticleMale,addUndef=_require.addUndef,addUndefFemale=_require.addUndefFemale,addUndefMale=_require.addUndefMale,toFemale=_require.toFemale,toMale=_require.toMale,generatorRE=/([^\[]*)\[(?:([^@\]]+)@)?([^\[\]|]*)(?:\|([^\[\]]*))?\]/gm,lastpartRE=/((?:.+)\])?(.*)$/,FILTERS={name:toName,frase:ucFirst,title:toTitleCase,upper:toUpperCase,lower:toLowerCase,male:toMale,female:toFemale,"+ar.gen":addArticle,"+ar.genm":addArticleMale,"+ar.genf":addArticleFemale,"+ar.ind":addUndef,"+ar.indm":addUndefMale,"+ar.indf":addUndefFemale,ucfirst:ucFirst,nombre:toName,titulo:toTitleCase,may:toUpperCase,min:toLowerCase,masc:toMale,fem:toFemale},applyOuter=function(e,r){for(var a=e,t=void 0,d=void 0;d=generatorRE.exec(e);)a=a.replace(d[1],r(d[1])),t=d.index;return a.replace(lastpartRE,function(e,a,t){return""+(a||"")+r(t)})};module.exports=function(e){var r=e?e.split("|"):null;return e&&r?function(e){return r.filter(id).reduce(function(e,r){var a=FILTERS[r];return a?applyOuter(e,a):e},e)}:id};

},{"./filters":7}],10:[function(require,module,exports){
"use strict";var _slicedToArray=function(){function r(r,e){var n=[],t=!0,o=!1,u=void 0;try{for(var i,f=r[Symbol.iterator]();!(t=(i=f.next()).done)&&(n.push(i.value),!e||n.length!==e);t=!0);}catch(c){o=!0,u=c}finally{try{!t&&f["return"]&&f["return"]()}finally{if(o)throw u}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return r(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(r){return typeof r}:function(r){return r&&"function"==typeof Symbol&&r.constructor===Symbol?"symbol":typeof r},range=function(r){return Array.apply(null,Array(r))},dice=require("./roller"),isDiceRoll=dice.isDiceRoll,makeRoller=dice.makeRoller;module.exports=function(r,e){if(!r)return e;var n=void 0;if(n=r.match(/^x([0-9]+)/)){var t=function(){var r=range(Number(n[1])).map(function(){return function(){return e()}});return{v:function(){return r.reduce(function(r,e){return""+r+e()+" "},"")}}}();if("object"===("undefined"==typeof t?"undefined":_typeof(t)))return t.v}if(n=isDiceRoll(r)){var o=function(){var n=makeRoller(r);return{v:function(){return range(n()).map(function(){return function(){return e()}}).reduce(function(r,e){return""+r+e()+" "},"")}}}();if("object"===("undefined"==typeof o?"undefined":_typeof(o)))return o.v}if(n=r.match(/^([0-9]+)\/([0-9]+)/)){var u=function(){var r=n,t=_slicedToArray(r,3),o=t[1],u=t[2];if(!u)return{v:e};var i=makeRoller("1d"+u);return{v:function(){return i()<=o?e():""}}}();if("object"===("undefined"==typeof u?"undefined":_typeof(u)))return u.v}if(n=r.match(/^([0-9]+)%/)){var i=function(){var r=n,t=_slicedToArray(r,2),o=t[1];if(!o)return{v:""};if(o>=100)return{v:e};var u=makeRoller("1d100");return{v:function(){return u()<=o?e():""}}}();if("object"===("undefined"==typeof i?"undefined":_typeof(i)))return i.v}return e};

},{"./roller":15}],11:[function(require,module,exports){
(function (process){
"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function e(e,t){for(var r=0;r<t.length;r++){var o=t[r];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(t,r,o){return r&&e(t.prototype,r),o&&e(t,o),t}}(),marked=require("marked"),deepAssign=require("deep-assign"),fetch=require("isomorphic-fetch"),parser=require("./parser"),createSelectors=require("./selector"),makeGenerators=require("./generator"),remotes=require("./remotes"),sourceToRollTable=require("./transforms/source_to_table"),HOST="//roleando.herokuapp.com",Generador=function(){function e(){var t=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],r=t.token,o=t.host,s=void 0===o?HOST:o;_classCallCheck(this,e),this.token=r,this.host=s,this.remotes=remotes(this.token),this.contextList=[null]}return _createClass(e,[{key:"getTokenFromAuth",value:function(){var e=this;return fetch(this.host+"/auth/token",{headers:{"content-type":"application/json"},credentials:"same-origin"}).then(function(e){return e.json()}).then(function(t){return t.token?(e.setToken(t.token),t.token):Promise.reject()})}},{key:"setToken",value:function(e){this.token=e,this.remotes=remotes(this.token)}},{key:"parseString",value:function(e){var t=this;this.data=deepAssign({},this.data,parser(e));var r=this.data.remotes?this.loadRemotes(this.data.remotes):Promise.resolve(this);return r.then(function(){t.selectors=createSelectors(t.data.sources,t.selectors||{}),t.selectors=makeGenerators(t.data,t.selectors)})}},{key:"loadRemotes",value:function(e){var t=this;return Promise.all(Object.keys(e).map(function(e){return t.remotes.load(e).then(function(r){var o=r.data.tpls+"\n"+r.data.tables,s=t.data.remotes[e].name,n=parser(o,s);return t.data=deepAssign({},t.data,n),t.contextList.push(s),n.remotes?t.loadRemotes(n.remotes):void 0})}))}},{key:"generate",value:function(e){var t=this;return e?this.selectors[e]?this.selectors[e]():"":Object.keys(this.data.tpls).reduce(function(e,r){return e+" "+t.selectors[r]()},"")}},{key:"toHtml",value:function(e){return marked(e)}},{key:"sourcesToRollTable",value:function(e){return sourceToRollTable(this.data.sources,e)}}]),e}();module.exports=Generador,process.on("unhandledRejection",function(e,t){console.log("Unhandled Rejection at: Promise ",t," reason: ",e)});

}).call(this,require('_process'))

},{"./generator":8,"./parser":12,"./remotes":13,"./selector":16,"./transforms/source_to_table":17,"_process":5,"deep-assign":1,"isomorphic-fetch":3,"marked":4}],12:[function(require,module,exports){
"use strict";var _slicedToArray=function(){function e(e,r){var t=[],n=!0,a=!1,i=void 0;try{for(var o,u=e[Symbol.iterator]();!(n=(o=u.next()).done)&&(t.push(o.value),!r||t.length!==r);n=!0);}catch(c){a=!0,i=c}finally{try{!n&&u["return"]&&u["return"]()}finally{if(a)throw i}}return t}return function(r,t){if(Array.isArray(r))return r;if(Symbol.iterator in Object(r))return e(r,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),id=function(e){return e},cleanLine=function(e){return String(e).trim().replace(/\s+/," ")},comments=function(e){return!e.match(/^\/\//)},splitLines=function(e){return e.split(/\n/g).map(cleanLine).filter(id).filter(comments)},parseLine=function(e){var r=e.match(/(?:([0-9.]+),)?(.*)/),t=_slicedToArray(r,3),n=t[1],a=t[2];return n?[Number(n),cleanLine(a)]:[1,a]},parseRemoteLine=function(e){var r=e.match(/([^:]+):(.*)/),t=_slicedToArray(r,3),n=t[1],a=t[2];return[a,{name:n,id:a}]},matchRemoteHeader=function(e){return e.match(/^;@(usa|use|remotes|tablas)/)},matchTemplateHeader=function(e){return e.match(/^;@(?:tpl|plantilla)\|(.*)/)},matchTableHeader=function(e){return e.match(/^;(.*)/)};module.exports=function(e,r){var t=r?r+".":"",n=splitLines(e),a=void 0,i=void 0,o="main",u="sources";return n.reduce(function(e,r){if(a=matchRemoteHeader(r))return u="remotes",e;if(a=matchTemplateHeader(r)){var n=a,c=_slicedToArray(n,2);return o=c[1],o=""+t+o,u="tpls",e}if(a=matchTableHeader(r)){var s=a,l=_slicedToArray(s,2);return o=l[1],o=""+t+o,u="sources",e}if("remotes"!==u&&(e[u][o]=e[u][o]||[]),"sources"===u&&(i=parseLine(r),i[1]&&e[u][o].push(i)),"tpls"===u&&(e[u][o]+=r+"\n"),"remotes"===u){var m=parseRemoteLine(r);e[u][m[0]]=m[1]}return e},{sources:{},tpls:{},remotes:{}})};

},{}],13:[function(require,module,exports){
"use strict";module.exports=Object.assign(require("./roleando_api"),{join:function(t){return t.data.remotes+"\n"+t.data.tpls+"\n"+t.data.tables}});

},{"./roleando_api":14}],14:[function(require,module,exports){
(function (process){
"use strict";var fetch=require("isomorphic-fetch"),host=process.env.HOST||"//roleando.herokuapp.com",baseUrl=host+"/api/generators",toJSON=function(e){return e.status>=400?e.json().then(function(e){return Promise.reject(e)}):e.json()},headers={Accept:"application/json","Content-Type":"application/json"},getHeaders=function(e){return Object.assign({Authorization:"Bearer "+e},headers)},RoleandoAPI=function(e){return{listFeatured:function(e){return fetch(baseUrl+"/tables/featured",{method:"GET",credentials:"same-origin",headers:headers}).then(toJSON)},load:function(e){return fetch(baseUrl+"/table/"+e,{method:"GET",credentials:"same-origin",headers:headers}).then(toJSON)},create:function(t){return fetch(baseUrl+"/table",{method:"POST",credentials:"same-origin",body:JSON.stringify(t),headers:getHeaders(e)}).then(toJSON)},update:function(t,r){return fetch(baseUrl+"/table/"+t,{method:"PUT",credentials:"same-origin",body:JSON.stringify(r),headers:getHeaders(e)}).then(toJSON)},remove:function(t,r){return fetch(baseUrl+"/table/"+t,{method:"DELETE",credentials:"same-origin",headers:getHeaders(e)})}}};module.exports=RoleandoAPI;

}).call(this,require('_process'))

},{"_process":5,"isomorphic-fetch":3}],15:[function(require,module,exports){
"use strict";var _slicedToArray=function(){function r(r,n){var e=[],t=!0,u=!1,o=void 0;try{for(var i,l=r[Symbol.iterator]();!(t=(i=l.next()).done)&&(e.push(i.value),!n||e.length!==n);t=!0);}catch(a){u=!0,o=a}finally{try{!t&&l["return"]&&l["return"]()}finally{if(u)throw o}}return e}return function(n,e){if(Array.isArray(n))return n;if(Symbol.iterator in Object(n))return r(n,e);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),range=function(r){return Array.apply(null,Array(r))},sum=function(r){return r.reduce(function(r,n){return r+n},0)},rand=function(r,n){return Math.round(Math.random()*(n-r))+r},isDiceRoll=function(r){return r.match(/([0-9]*)?d([0-9]+)(?:([+\-*\/])([0-9]+))?/)},rollDice=function(r,n){return sum(range(n||1).map(function(){return rand(1,r)}))},makeRoller=function(r){var n=isDiceRoll(r);if(!n)return 0;var e=_slicedToArray(n,5),t=e[1],u=e[2],o=e[3],i=e[4];return i=Number(i),u=Number(u),t=Number(t),function(){var r=rollDice(u,t);return o&&i&&0!==i?"+"===o?r+i:"-"===o?r-i:"*"===o?r*i:"/"===o?Math.round(r/i):r:r}};module.exports={makeRoller:makeRoller,isDiceRoll:isDiceRoll,rollDice:rollDice};

},{}],16:[function(require,module,exports){
"use strict";module.exports=function(r,e){return Object.keys(r).reduce(function(e,t){return e[t]=createWeightedSelector(r[t]),e},e)};var createWeightedSelector=function(r){var e=r.map(function(r){return r[1]}),t=r.map(function(r){return r[0]});if(!Array.isArray(e)||!Array.isArray(t))throw new TypeError("Set and Weights must be arrays.");var n=t?t.map(function(r){return Number(r)}):e.map(function(){return 1});if(e.length!==t.length)throw new TypeError("Set and Weights are different sizes.");var u=n.reduce(function(r,e){return r+e},0),a=n.map(function(r){return r/u});return function(){for(var r=Math.random(),t=0;t<a.length;t++)if(r-=a[t],0>r)return e[t]}};

},{}],17:[function(require,module,exports){
"use strict";var deepAssign=require("deep-assign"),RANGES=[3,4,6,8,10,12,20,100],min=function(e){return e.reduce(function(e,r){return Math.min(e,r[0])},e[0][0])},sourceToRollTable=function(e){var r=e.reduce(function(e,r){return e+r[0]},0),t=min(e),n=t*e.length===r;r=n?e.length:r;var l=RANGES.find(function(e){return e>=r})||100,o=l/r,a=Math.floor(o),u=o%1,c=0,i=0,s=0;return e.reduce(function(e,t){var o=n?1:t[0],d=c+1,h=c+o*a;s+=o,i+=u*o,i>1&&(h+=Math.floor(i),i-=Math.floor(i)),s===r&&l>h&&(h=l),c=h;var f=h-d===0?d:d+"-"+h;return e.push([f,t[1]]),e},[])},header=function(e,r){return e.header.replace("[name]",r)};module.exports=function(e,r){var t=deepAssign({},{container:'<table class="rolltable">[rows]</table>',header:'<tr><th></th><th class="title">[name]</th></tr>',row:'<tr><td class="roll">[roll]</td><td class="line">[line]</td></tr>'},r);return Object.keys(e).reduce(function(r,n){var l=sourceToRollTable(e[n]);return r[n]=t.container.replace("[rows]",l.reduce(function(e,r){return e+t.row.replace("[roll]",r[0]).replace("[line]",r[1])},header(t,n))),r},{})};

},{"deep-assign":1}]},{},[11])(11)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZGVlcC1hc3NpZ24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtb2JqL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzb21vcnBoaWMtZmV0Y2gvZmV0Y2gtbnBtLWJyb3dzZXJpZnkuanMiLCJub2RlX21vZHVsZXMvbWFya2VkL2xpYi9tYXJrZWQuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9mZXRjaC5qcyIsIkQ6XFx3b3Jrc3BhY2VcXGNvbXBhcnRpZG9cXEhFUk9LVVxccm9sZWFuZG9cXHNyY1xcZ2VuZXJhdG9yX2VuZ2luZVxcZmlsdGVyc1xcaW5kZXguanMiLCJEOlxcd29ya3NwYWNlXFxjb21wYXJ0aWRvXFxIRVJPS1VcXHJvbGVhbmRvXFxzcmNcXGdlbmVyYXRvcl9lbmdpbmVcXGdlbmVyYXRvci5qcyIsIkQ6XFx3b3Jrc3BhY2VcXGNvbXBhcnRpZG9cXEhFUk9LVVxccm9sZWFuZG9cXHNyY1xcZ2VuZXJhdG9yX2VuZ2luZVxcZ2VuZXJhdG9yX2ZpbHRlcnMuanMiLCJEOlxcd29ya3NwYWNlXFxjb21wYXJ0aWRvXFxIRVJPS1VcXHJvbGVhbmRvXFxzcmNcXGdlbmVyYXRvcl9lbmdpbmVcXGdlbmVyYXRvcl9tb2RzLmpzIiwiRDpcXHdvcmtzcGFjZVxcY29tcGFydGlkb1xcSEVST0tVXFxyb2xlYW5kb1xcc3JjXFxnZW5lcmF0b3JfZW5naW5lXFxpbmRleC5qcyIsIkQ6XFx3b3Jrc3BhY2VcXGNvbXBhcnRpZG9cXEhFUk9LVVxccm9sZWFuZG9cXHNyY1xcZ2VuZXJhdG9yX2VuZ2luZVxccGFyc2VyLmpzIiwiRDpcXHdvcmtzcGFjZVxcY29tcGFydGlkb1xcSEVST0tVXFxyb2xlYW5kb1xcc3JjXFxnZW5lcmF0b3JfZW5naW5lXFxyZW1vdGVzXFxpbmRleC5qcyIsIkQ6XFx3b3Jrc3BhY2VcXGNvbXBhcnRpZG9cXEhFUk9LVVxccm9sZWFuZG9cXHNyY1xcZ2VuZXJhdG9yX2VuZ2luZVxccmVtb3Rlc1xccm9sZWFuZG9fYXBpLmpzIiwiRDpcXHdvcmtzcGFjZVxcY29tcGFydGlkb1xcSEVST0tVXFxyb2xlYW5kb1xcc3JjXFxnZW5lcmF0b3JfZW5naW5lXFxyb2xsZXIuanMiLCJEOlxcd29ya3NwYWNlXFxjb21wYXJ0aWRvXFxIRVJPS1VcXHJvbGVhbmRvXFxzcmNcXGdlbmVyYXRvcl9lbmdpbmVcXHNlbGVjdG9yLmpzIiwiRDpcXHdvcmtzcGFjZVxcY29tcGFydGlkb1xcSEVST0tVXFxyb2xlYW5kb1xcc3JjXFxnZW5lcmF0b3JfZW5naW5lXFx0cmFuc2Zvcm1zXFxzb3VyY2VfdG9fdGFibGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3J3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqYkEsWUFFQSxJQUFNLGFBQWMsK0RB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RUFDQyxFQUNILE9BQU8sUUFBTyxLQUFLLEdBQVMsT0FBTyxTQUFDLEVBQUssR0FDdkMsR0FBTSxHQUFPLGtCQUFrQixFQUFRLEdBS3ZDLE9BSEEsR0FBSSxHQUFVLEVBQVEsVUFBVSxRQUFRLFNBQVUsRUFBSyxPQUFPLFNBQUMsRUFBTSxHQUNuRSxNQUFPLEdBQU8sRUFBUSxJQUFJLFFBQVEsU0FBVSxFQUFJLElBQUksUUFBUSxTQUFVLEVBQUksS0FDekUsT0FBTyxFQUFTLEtBQ1oiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGlzT2JqID0gcmVxdWlyZSgnaXMtb2JqJyk7XG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHByb3BJc0VudW1lcmFibGUgPSBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG5mdW5jdGlvbiB0b09iamVjdCh2YWwpIHtcblx0aWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ1NvdXJjZXMgY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0KHZhbCk7XG59XG5cbmZ1bmN0aW9uIGFzc2lnbktleSh0bywgZnJvbSwga2V5KSB7XG5cdHZhciB2YWwgPSBmcm9tW2tleV07XG5cblx0aWYgKHZhbCA9PT0gdW5kZWZpbmVkIHx8IHZhbCA9PT0gbnVsbCkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKHRvLCBrZXkpKSB7XG5cdFx0aWYgKHRvW2tleV0gPT09IHVuZGVmaW5lZCB8fCB0b1trZXldID09PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCB1bmRlZmluZWQgb3IgbnVsbCB0byBvYmplY3QgKCcgKyBrZXkgKyAnKScpO1xuXHRcdH1cblx0fVxuXG5cdGlmICghaGFzT3duUHJvcGVydHkuY2FsbCh0bywga2V5KSB8fCAhaXNPYmoodmFsKSkge1xuXHRcdHRvW2tleV0gPSB2YWw7XG5cdH0gZWxzZSB7XG5cdFx0dG9ba2V5XSA9IGFzc2lnbihPYmplY3QodG9ba2V5XSksIGZyb21ba2V5XSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gYXNzaWduKHRvLCBmcm9tKSB7XG5cdGlmICh0byA9PT0gZnJvbSkge1xuXHRcdHJldHVybiB0bztcblx0fVxuXG5cdGZyb20gPSBPYmplY3QoZnJvbSk7XG5cblx0Zm9yICh2YXIga2V5IGluIGZyb20pIHtcblx0XHRpZiAoaGFzT3duUHJvcGVydHkuY2FsbChmcm9tLCBrZXkpKSB7XG5cdFx0XHRhc3NpZ25LZXkodG8sIGZyb20sIGtleSk7XG5cdFx0fVxuXHR9XG5cblx0aWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcblx0XHR2YXIgc3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZnJvbSk7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN5bWJvbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmIChwcm9wSXNFbnVtZXJhYmxlLmNhbGwoZnJvbSwgc3ltYm9sc1tpXSkpIHtcblx0XHRcdFx0YXNzaWduS2V5KHRvLCBmcm9tLCBzeW1ib2xzW2ldKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdG87XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVlcEFzc2lnbih0YXJnZXQpIHtcblx0dGFyZ2V0ID0gdG9PYmplY3QodGFyZ2V0KTtcblxuXHRmb3IgKHZhciBzID0gMTsgcyA8IGFyZ3VtZW50cy5sZW5ndGg7IHMrKykge1xuXHRcdGFzc2lnbih0YXJnZXQsIGFyZ3VtZW50c1tzXSk7XG5cdH1cblxuXHRyZXR1cm4gdGFyZ2V0O1xufTtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcblx0dmFyIHR5cGUgPSB0eXBlb2YgeDtcblx0cmV0dXJuIHggIT09IG51bGwgJiYgKHR5cGUgPT09ICdvYmplY3QnIHx8IHR5cGUgPT09ICdmdW5jdGlvbicpO1xufTtcbiIsIi8vIHRoZSB3aGF0d2ctZmV0Y2ggcG9seWZpbGwgaW5zdGFsbHMgdGhlIGZldGNoKCkgZnVuY3Rpb25cbi8vIG9uIHRoZSBnbG9iYWwgb2JqZWN0ICh3aW5kb3cgb3Igc2VsZilcbi8vXG4vLyBSZXR1cm4gdGhhdCBhcyB0aGUgZXhwb3J0IGZvciB1c2UgaW4gV2VicGFjaywgQnJvd3NlcmlmeSBldGMuXG5yZXF1aXJlKCd3aGF0d2ctZmV0Y2gnKTtcbm1vZHVsZS5leHBvcnRzID0gc2VsZi5mZXRjaC5iaW5kKHNlbGYpO1xuIiwiLyoqXG4gKiBtYXJrZWQgLSBhIG1hcmtkb3duIHBhcnNlclxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTQsIENocmlzdG9waGVyIEplZmZyZXkuIChNSVQgTGljZW5zZWQpXG4gKiBodHRwczovL2dpdGh1Yi5jb20vY2hqai9tYXJrZWRcbiAqL1xuXG47KGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIEJsb2NrLUxldmVsIEdyYW1tYXJcbiAqL1xuXG52YXIgYmxvY2sgPSB7XG4gIG5ld2xpbmU6IC9eXFxuKy8sXG4gIGNvZGU6IC9eKCB7NH1bXlxcbl0rXFxuKikrLyxcbiAgZmVuY2VzOiBub29wLFxuICBocjogL14oICpbLSpfXSl7Myx9ICooPzpcXG4rfCQpLyxcbiAgaGVhZGluZzogL14gKigjezEsNn0pICooW15cXG5dKz8pICojKiAqKD86XFxuK3wkKS8sXG4gIG5wdGFibGU6IG5vb3AsXG4gIGxoZWFkaW5nOiAvXihbXlxcbl0rKVxcbiAqKD18LSl7Mix9ICooPzpcXG4rfCQpLyxcbiAgYmxvY2txdW90ZTogL14oICo+W15cXG5dKyhcXG4oPyFkZWYpW15cXG5dKykqXFxuKikrLyxcbiAgbGlzdDogL14oICopKGJ1bGwpIFtcXHNcXFNdKz8oPzpocnxkZWZ8XFxuezIsfSg/ISApKD8hXFwxYnVsbCApXFxuKnxcXHMqJCkvLFxuICBodG1sOiAvXiAqKD86Y29tbWVudCAqKD86XFxufFxccyokKXxjbG9zZWQgKig/OlxcbnsyLH18XFxzKiQpfGNsb3NpbmcgKig/OlxcbnsyLH18XFxzKiQpKS8sXG4gIGRlZjogL14gKlxcWyhbXlxcXV0rKVxcXTogKjw/KFteXFxzPl0rKT4/KD86ICtbXCIoXShbXlxcbl0rKVtcIildKT8gKig/Olxcbit8JCkvLFxuICB0YWJsZTogbm9vcCxcbiAgcGFyYWdyYXBoOiAvXigoPzpbXlxcbl0rXFxuPyg/IWhyfGhlYWRpbmd8bGhlYWRpbmd8YmxvY2txdW90ZXx0YWd8ZGVmKSkrKVxcbiovLFxuICB0ZXh0OiAvXlteXFxuXSsvXG59O1xuXG5ibG9jay5idWxsZXQgPSAvKD86WyorLV18XFxkK1xcLikvO1xuYmxvY2suaXRlbSA9IC9eKCAqKShidWxsKSBbXlxcbl0qKD86XFxuKD8hXFwxYnVsbCApW15cXG5dKikqLztcbmJsb2NrLml0ZW0gPSByZXBsYWNlKGJsb2NrLml0ZW0sICdnbScpXG4gICgvYnVsbC9nLCBibG9jay5idWxsZXQpXG4gICgpO1xuXG5ibG9jay5saXN0ID0gcmVwbGFjZShibG9jay5saXN0KVxuICAoL2J1bGwvZywgYmxvY2suYnVsbGV0KVxuICAoJ2hyJywgJ1xcXFxuKyg/PVxcXFwxPyg/OlstKl9dICopezMsfSg/OlxcXFxuK3wkKSknKVxuICAoJ2RlZicsICdcXFxcbisoPz0nICsgYmxvY2suZGVmLnNvdXJjZSArICcpJylcbiAgKCk7XG5cbmJsb2NrLmJsb2NrcXVvdGUgPSByZXBsYWNlKGJsb2NrLmJsb2NrcXVvdGUpXG4gICgnZGVmJywgYmxvY2suZGVmKVxuICAoKTtcblxuYmxvY2suX3RhZyA9ICcoPyEoPzonXG4gICsgJ2F8ZW18c3Ryb25nfHNtYWxsfHN8Y2l0ZXxxfGRmbnxhYmJyfGRhdGF8dGltZXxjb2RlJ1xuICArICd8dmFyfHNhbXB8a2JkfHN1YnxzdXB8aXxifHV8bWFya3xydWJ5fHJ0fHJwfGJkaXxiZG8nXG4gICsgJ3xzcGFufGJyfHdicnxpbnN8ZGVsfGltZylcXFxcYilcXFxcdysoPyE6L3xbXlxcXFx3XFxcXHNAXSpAKVxcXFxiJztcblxuYmxvY2suaHRtbCA9IHJlcGxhY2UoYmxvY2suaHRtbClcbiAgKCdjb21tZW50JywgLzwhLS1bXFxzXFxTXSo/LS0+LylcbiAgKCdjbG9zZWQnLCAvPCh0YWcpW1xcc1xcU10rPzxcXC9cXDE+LylcbiAgKCdjbG9zaW5nJywgLzx0YWcoPzpcIlteXCJdKlwifCdbXiddKid8W14nXCI+XSkqPz4vKVxuICAoL3RhZy9nLCBibG9jay5fdGFnKVxuICAoKTtcblxuYmxvY2sucGFyYWdyYXBoID0gcmVwbGFjZShibG9jay5wYXJhZ3JhcGgpXG4gICgnaHInLCBibG9jay5ocilcbiAgKCdoZWFkaW5nJywgYmxvY2suaGVhZGluZylcbiAgKCdsaGVhZGluZycsIGJsb2NrLmxoZWFkaW5nKVxuICAoJ2Jsb2NrcXVvdGUnLCBibG9jay5ibG9ja3F1b3RlKVxuICAoJ3RhZycsICc8JyArIGJsb2NrLl90YWcpXG4gICgnZGVmJywgYmxvY2suZGVmKVxuICAoKTtcblxuLyoqXG4gKiBOb3JtYWwgQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLm5vcm1hbCA9IG1lcmdlKHt9LCBibG9jayk7XG5cbi8qKlxuICogR0ZNIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay5nZm0gPSBtZXJnZSh7fSwgYmxvY2subm9ybWFsLCB7XG4gIGZlbmNlczogL14gKihgezMsfXx+ezMsfSlbIFxcLl0qKFxcUyspPyAqXFxuKFtcXHNcXFNdKj8pXFxzKlxcMSAqKD86XFxuK3wkKS8sXG4gIHBhcmFncmFwaDogL14vLFxuICBoZWFkaW5nOiAvXiAqKCN7MSw2fSkgKyhbXlxcbl0rPykgKiMqICooPzpcXG4rfCQpL1xufSk7XG5cbmJsb2NrLmdmbS5wYXJhZ3JhcGggPSByZXBsYWNlKGJsb2NrLnBhcmFncmFwaClcbiAgKCcoPyEnLCAnKD8hJ1xuICAgICsgYmxvY2suZ2ZtLmZlbmNlcy5zb3VyY2UucmVwbGFjZSgnXFxcXDEnLCAnXFxcXDInKSArICd8J1xuICAgICsgYmxvY2subGlzdC5zb3VyY2UucmVwbGFjZSgnXFxcXDEnLCAnXFxcXDMnKSArICd8JylcbiAgKCk7XG5cbi8qKlxuICogR0ZNICsgVGFibGVzIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay50YWJsZXMgPSBtZXJnZSh7fSwgYmxvY2suZ2ZtLCB7XG4gIG5wdGFibGU6IC9eICooXFxTLipcXHwuKilcXG4gKihbLTpdKyAqXFx8Wy18IDpdKilcXG4oKD86LipcXHwuKig/OlxcbnwkKSkqKVxcbiovLFxuICB0YWJsZTogL14gKlxcfCguKylcXG4gKlxcfCggKlstOl0rWy18IDpdKilcXG4oKD86ICpcXHwuKig/OlxcbnwkKSkqKVxcbiovXG59KTtcblxuLyoqXG4gKiBCbG9jayBMZXhlclxuICovXG5cbmZ1bmN0aW9uIExleGVyKG9wdGlvbnMpIHtcbiAgdGhpcy50b2tlbnMgPSBbXTtcbiAgdGhpcy50b2tlbnMubGlua3MgPSB7fTtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMucnVsZXMgPSBibG9jay5ub3JtYWw7XG5cbiAgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnRhYmxlcykge1xuICAgICAgdGhpcy5ydWxlcyA9IGJsb2NrLnRhYmxlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ydWxlcyA9IGJsb2NrLmdmbTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvc2UgQmxvY2sgUnVsZXNcbiAqL1xuXG5MZXhlci5ydWxlcyA9IGJsb2NrO1xuXG4vKipcbiAqIFN0YXRpYyBMZXggTWV0aG9kXG4gKi9cblxuTGV4ZXIubGV4ID0gZnVuY3Rpb24oc3JjLCBvcHRpb25zKSB7XG4gIHZhciBsZXhlciA9IG5ldyBMZXhlcihvcHRpb25zKTtcbiAgcmV0dXJuIGxleGVyLmxleChzcmMpO1xufTtcblxuLyoqXG4gKiBQcmVwcm9jZXNzaW5nXG4gKi9cblxuTGV4ZXIucHJvdG90eXBlLmxleCA9IGZ1bmN0aW9uKHNyYykge1xuICBzcmMgPSBzcmNcbiAgICAucmVwbGFjZSgvXFxyXFxufFxcci9nLCAnXFxuJylcbiAgICAucmVwbGFjZSgvXFx0L2csICcgICAgJylcbiAgICAucmVwbGFjZSgvXFx1MDBhMC9nLCAnICcpXG4gICAgLnJlcGxhY2UoL1xcdTI0MjQvZywgJ1xcbicpO1xuXG4gIHJldHVybiB0aGlzLnRva2VuKHNyYywgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIExleGluZ1xuICovXG5cbkxleGVyLnByb3RvdHlwZS50b2tlbiA9IGZ1bmN0aW9uKHNyYywgdG9wLCBicSkge1xuICB2YXIgc3JjID0gc3JjLnJlcGxhY2UoL14gKyQvZ20sICcnKVxuICAgICwgbmV4dFxuICAgICwgbG9vc2VcbiAgICAsIGNhcFxuICAgICwgYnVsbFxuICAgICwgYlxuICAgICwgaXRlbVxuICAgICwgc3BhY2VcbiAgICAsIGlcbiAgICAsIGw7XG5cbiAgd2hpbGUgKHNyYykge1xuICAgIC8vIG5ld2xpbmVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5uZXdsaW5lLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGlmIChjYXBbMF0ubGVuZ3RoID4gMSkge1xuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnc3BhY2UnXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNvZGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5jb2RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGNhcCA9IGNhcFswXS5yZXBsYWNlKC9eIHs0fS9nbSwgJycpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdjb2RlJyxcbiAgICAgICAgdGV4dDogIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICAgID8gY2FwLnJlcGxhY2UoL1xcbiskLywgJycpXG4gICAgICAgICAgOiBjYXBcbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZmVuY2VzIChnZm0pXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZmVuY2VzLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnY29kZScsXG4gICAgICAgIGxhbmc6IGNhcFsyXSxcbiAgICAgICAgdGV4dDogY2FwWzNdIHx8ICcnXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGhlYWRpbmdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5oZWFkaW5nLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaGVhZGluZycsXG4gICAgICAgIGRlcHRoOiBjYXBbMV0ubGVuZ3RoLFxuICAgICAgICB0ZXh0OiBjYXBbMl1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGFibGUgbm8gbGVhZGluZyBwaXBlIChnZm0pXG4gICAgaWYgKHRvcCAmJiAoY2FwID0gdGhpcy5ydWxlcy5ucHRhYmxlLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgIGl0ZW0gPSB7XG4gICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgIGhlYWRlcjogY2FwWzFdLnJlcGxhY2UoL14gKnwgKlxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgYWxpZ246IGNhcFsyXS5yZXBsYWNlKC9eICp8XFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBjZWxsczogY2FwWzNdLnJlcGxhY2UoL1xcbiQvLCAnJykuc3BsaXQoJ1xcbicpXG4gICAgICB9O1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5hbGlnbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAncmlnaHQnO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdjZW50ZXInO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSsgKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2xlZnQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZW0uY2VsbHNbaV0gPSBpdGVtLmNlbGxzW2ldLnNwbGl0KC8gKlxcfCAqLyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goaXRlbSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxoZWFkaW5nXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubGhlYWRpbmcuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgZGVwdGg6IGNhcFsyXSA9PT0gJz0nID8gMSA6IDIsXG4gICAgICAgIHRleHQ6IGNhcFsxXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBoclxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmhyLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaHInXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGJsb2NrcXVvdGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5ibG9ja3F1b3RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdibG9ja3F1b3RlX3N0YXJ0J1xuICAgICAgfSk7XG5cbiAgICAgIGNhcCA9IGNhcFswXS5yZXBsYWNlKC9eICo+ID8vZ20sICcnKTtcblxuICAgICAgLy8gUGFzcyBgdG9wYCB0byBrZWVwIHRoZSBjdXJyZW50XG4gICAgICAvLyBcInRvcGxldmVsXCIgc3RhdGUuIFRoaXMgaXMgZXhhY3RseVxuICAgICAgLy8gaG93IG1hcmtkb3duLnBsIHdvcmtzLlxuICAgICAgdGhpcy50b2tlbihjYXAsIHRvcCwgdHJ1ZSk7XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnYmxvY2txdW90ZV9lbmQnXG4gICAgICB9KTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGlzdFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxpc3QuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgYnVsbCA9IGNhcFsyXTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdsaXN0X3N0YXJ0JyxcbiAgICAgICAgb3JkZXJlZDogYnVsbC5sZW5ndGggPiAxXG4gICAgICB9KTtcblxuICAgICAgLy8gR2V0IGVhY2ggdG9wLWxldmVsIGl0ZW0uXG4gICAgICBjYXAgPSBjYXBbMF0ubWF0Y2godGhpcy5ydWxlcy5pdGVtKTtcblxuICAgICAgbmV4dCA9IGZhbHNlO1xuICAgICAgbCA9IGNhcC5sZW5ndGg7XG4gICAgICBpID0gMDtcblxuICAgICAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaXRlbSA9IGNhcFtpXTtcblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGxpc3QgaXRlbSdzIGJ1bGxldFxuICAgICAgICAvLyBzbyBpdCBpcyBzZWVuIGFzIHRoZSBuZXh0IHRva2VuLlxuICAgICAgICBzcGFjZSA9IGl0ZW0ubGVuZ3RoO1xuICAgICAgICBpdGVtID0gaXRlbS5yZXBsYWNlKC9eICooWyorLV18XFxkK1xcLikgKy8sICcnKTtcblxuICAgICAgICAvLyBPdXRkZW50IHdoYXRldmVyIHRoZVxuICAgICAgICAvLyBsaXN0IGl0ZW0gY29udGFpbnMuIEhhY2t5LlxuICAgICAgICBpZiAofml0ZW0uaW5kZXhPZignXFxuICcpKSB7XG4gICAgICAgICAgc3BhY2UgLT0gaXRlbS5sZW5ndGg7XG4gICAgICAgICAgaXRlbSA9ICF0aGlzLm9wdGlvbnMucGVkYW50aWNcbiAgICAgICAgICAgID8gaXRlbS5yZXBsYWNlKG5ldyBSZWdFeHAoJ14gezEsJyArIHNwYWNlICsgJ30nLCAnZ20nKSwgJycpXG4gICAgICAgICAgICA6IGl0ZW0ucmVwbGFjZSgvXiB7MSw0fS9nbSwgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIG5leHQgbGlzdCBpdGVtIGJlbG9uZ3MgaGVyZS5cbiAgICAgICAgLy8gQmFja3BlZGFsIGlmIGl0IGRvZXMgbm90IGJlbG9uZyBpbiB0aGlzIGxpc3QuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc21hcnRMaXN0cyAmJiBpICE9PSBsIC0gMSkge1xuICAgICAgICAgIGIgPSBibG9jay5idWxsZXQuZXhlYyhjYXBbaSArIDFdKVswXTtcbiAgICAgICAgICBpZiAoYnVsbCAhPT0gYiAmJiAhKGJ1bGwubGVuZ3RoID4gMSAmJiBiLmxlbmd0aCA+IDEpKSB7XG4gICAgICAgICAgICBzcmMgPSBjYXAuc2xpY2UoaSArIDEpLmpvaW4oJ1xcbicpICsgc3JjO1xuICAgICAgICAgICAgaSA9IGwgLSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERldGVybWluZSB3aGV0aGVyIGl0ZW0gaXMgbG9vc2Ugb3Igbm90LlxuICAgICAgICAvLyBVc2U6IC8oXnxcXG4pKD8hIClbXlxcbl0rXFxuXFxuKD8hXFxzKiQpL1xuICAgICAgICAvLyBmb3IgZGlzY291bnQgYmVoYXZpb3IuXG4gICAgICAgIGxvb3NlID0gbmV4dCB8fCAvXFxuXFxuKD8hXFxzKiQpLy50ZXN0KGl0ZW0pO1xuICAgICAgICBpZiAoaSAhPT0gbCAtIDEpIHtcbiAgICAgICAgICBuZXh0ID0gaXRlbS5jaGFyQXQoaXRlbS5sZW5ndGggLSAxKSA9PT0gJ1xcbic7XG4gICAgICAgICAgaWYgKCFsb29zZSkgbG9vc2UgPSBuZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogbG9vc2VcbiAgICAgICAgICAgID8gJ2xvb3NlX2l0ZW1fc3RhcnQnXG4gICAgICAgICAgICA6ICdsaXN0X2l0ZW1fc3RhcnQnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJlY3Vyc2UuXG4gICAgICAgIHRoaXMudG9rZW4oaXRlbSwgZmFsc2UsIGJxKTtcblxuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnbGlzdF9pdGVtX2VuZCdcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnbGlzdF9lbmQnXG4gICAgICB9KTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaHRtbFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmh0bWwuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICAgID8gJ3BhcmFncmFwaCdcbiAgICAgICAgICA6ICdodG1sJyxcbiAgICAgICAgcHJlOiAhdGhpcy5vcHRpb25zLnNhbml0aXplclxuICAgICAgICAgICYmIChjYXBbMV0gPT09ICdwcmUnIHx8IGNhcFsxXSA9PT0gJ3NjcmlwdCcgfHwgY2FwWzFdID09PSAnc3R5bGUnKSxcbiAgICAgICAgdGV4dDogY2FwWzBdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGRlZlxuICAgIGlmICgoIWJxICYmIHRvcCkgJiYgKGNhcCA9IHRoaXMucnVsZXMuZGVmLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5saW5rc1tjYXBbMV0udG9Mb3dlckNhc2UoKV0gPSB7XG4gICAgICAgIGhyZWY6IGNhcFsyXSxcbiAgICAgICAgdGl0bGU6IGNhcFszXVxuICAgICAgfTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRhYmxlIChnZm0pXG4gICAgaWYgKHRvcCAmJiAoY2FwID0gdGhpcy5ydWxlcy50YWJsZS5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuXG4gICAgICBpdGVtID0ge1xuICAgICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgICBoZWFkZXI6IGNhcFsxXS5yZXBsYWNlKC9eICp8ICpcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGFsaWduOiBjYXBbMl0ucmVwbGFjZSgvXiAqfFxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgY2VsbHM6IGNhcFszXS5yZXBsYWNlKC8oPzogKlxcfCAqKT9cXG4kLywgJycpLnNwbGl0KCdcXG4nKVxuICAgICAgfTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uYWxpZ24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKC9eICotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ3JpZ2h0JztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnY2VudGVyJztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdsZWZ0JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5jZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVtLmNlbGxzW2ldID0gaXRlbS5jZWxsc1tpXVxuICAgICAgICAgIC5yZXBsYWNlKC9eICpcXHwgKnwgKlxcfCAqJC9nLCAnJylcbiAgICAgICAgICAuc3BsaXQoLyAqXFx8ICovKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b2tlbnMucHVzaChpdGVtKTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdG9wLWxldmVsIHBhcmFncmFwaFxuICAgIGlmICh0b3AgJiYgKGNhcCA9IHRoaXMucnVsZXMucGFyYWdyYXBoLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ3BhcmFncmFwaCcsXG4gICAgICAgIHRleHQ6IGNhcFsxXS5jaGFyQXQoY2FwWzFdLmxlbmd0aCAtIDEpID09PSAnXFxuJ1xuICAgICAgICAgID8gY2FwWzFdLnNsaWNlKDAsIC0xKVxuICAgICAgICAgIDogY2FwWzFdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRleHRcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy50ZXh0LmV4ZWMoc3JjKSkge1xuICAgICAgLy8gVG9wLWxldmVsIHNob3VsZCBuZXZlciByZWFjaCBoZXJlLlxuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIHRleHQ6IGNhcFswXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoc3JjKSB7XG4gICAgICB0aHJvdyBuZXdcbiAgICAgICAgRXJyb3IoJ0luZmluaXRlIGxvb3Agb24gYnl0ZTogJyArIHNyYy5jaGFyQ29kZUF0KDApKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcy50b2tlbnM7XG59O1xuXG4vKipcbiAqIElubGluZS1MZXZlbCBHcmFtbWFyXG4gKi9cblxudmFyIGlubGluZSA9IHtcbiAgZXNjYXBlOiAvXlxcXFwoW1xcXFxgKnt9XFxbXFxdKCkjK1xcLS4hXz5dKS8sXG4gIGF1dG9saW5rOiAvXjwoW14gPl0rKEB8OlxcLylbXiA+XSspPi8sXG4gIHVybDogbm9vcCxcbiAgdGFnOiAvXjwhLS1bXFxzXFxTXSo/LS0+fF48XFwvP1xcdysoPzpcIlteXCJdKlwifCdbXiddKid8W14nXCI+XSkqPz4vLFxuICBsaW5rOiAvXiE/XFxbKGluc2lkZSlcXF1cXChocmVmXFwpLyxcbiAgcmVmbGluazogL14hP1xcWyhpbnNpZGUpXFxdXFxzKlxcWyhbXlxcXV0qKVxcXS8sXG4gIG5vbGluazogL14hP1xcWygoPzpcXFtbXlxcXV0qXFxdfFteXFxbXFxdXSkqKVxcXS8sXG4gIHN0cm9uZzogL15fXyhbXFxzXFxTXSs/KV9fKD8hXyl8XlxcKlxcKihbXFxzXFxTXSs/KVxcKlxcKig/IVxcKikvLFxuICBlbTogL15cXGJfKCg/OlteX118X18pKz8pX1xcYnxeXFwqKCg/OlxcKlxcKnxbXFxzXFxTXSkrPylcXCooPyFcXCopLyxcbiAgY29kZTogL14oYCspXFxzKihbXFxzXFxTXSo/W15gXSlcXHMqXFwxKD8hYCkvLFxuICBicjogL14gezIsfVxcbig/IVxccyokKS8sXG4gIGRlbDogbm9vcCxcbiAgdGV4dDogL15bXFxzXFxTXSs/KD89W1xcXFw8IVxcW18qYF18IHsyLH1cXG58JCkvXG59O1xuXG5pbmxpbmUuX2luc2lkZSA9IC8oPzpcXFtbXlxcXV0qXFxdfFteXFxbXFxdXXxcXF0oPz1bXlxcW10qXFxdKSkqLztcbmlubGluZS5faHJlZiA9IC9cXHMqPD8oW1xcc1xcU10qPyk+Pyg/OlxccytbJ1wiXShbXFxzXFxTXSo/KVsnXCJdKT9cXHMqLztcblxuaW5saW5lLmxpbmsgPSByZXBsYWNlKGlubGluZS5saW5rKVxuICAoJ2luc2lkZScsIGlubGluZS5faW5zaWRlKVxuICAoJ2hyZWYnLCBpbmxpbmUuX2hyZWYpXG4gICgpO1xuXG5pbmxpbmUucmVmbGluayA9IHJlcGxhY2UoaW5saW5lLnJlZmxpbmspXG4gICgnaW5zaWRlJywgaW5saW5lLl9pbnNpZGUpXG4gICgpO1xuXG4vKipcbiAqIE5vcm1hbCBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5ub3JtYWwgPSBtZXJnZSh7fSwgaW5saW5lKTtcblxuLyoqXG4gKiBQZWRhbnRpYyBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5wZWRhbnRpYyA9IG1lcmdlKHt9LCBpbmxpbmUubm9ybWFsLCB7XG4gIHN0cm9uZzogL15fXyg/PVxcUykoW1xcc1xcU10qP1xcUylfXyg/IV8pfF5cXCpcXCooPz1cXFMpKFtcXHNcXFNdKj9cXFMpXFwqXFwqKD8hXFwqKS8sXG4gIGVtOiAvXl8oPz1cXFMpKFtcXHNcXFNdKj9cXFMpXyg/IV8pfF5cXCooPz1cXFMpKFtcXHNcXFNdKj9cXFMpXFwqKD8hXFwqKS9cbn0pO1xuXG4vKipcbiAqIEdGTSBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5nZm0gPSBtZXJnZSh7fSwgaW5saW5lLm5vcm1hbCwge1xuICBlc2NhcGU6IHJlcGxhY2UoaW5saW5lLmVzY2FwZSkoJ10pJywgJ358XSknKSgpLFxuICB1cmw6IC9eKGh0dHBzPzpcXC9cXC9bXlxcczxdK1tePC4sOjtcIicpXFxdXFxzXSkvLFxuICBkZWw6IC9efn4oPz1cXFMpKFtcXHNcXFNdKj9cXFMpfn4vLFxuICB0ZXh0OiByZXBsYWNlKGlubGluZS50ZXh0KVxuICAgICgnXXwnLCAnfl18JylcbiAgICAoJ3wnLCAnfGh0dHBzPzovL3wnKVxuICAgICgpXG59KTtcblxuLyoqXG4gKiBHRk0gKyBMaW5lIEJyZWFrcyBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5icmVha3MgPSBtZXJnZSh7fSwgaW5saW5lLmdmbSwge1xuICBicjogcmVwbGFjZShpbmxpbmUuYnIpKCd7Mix9JywgJyonKSgpLFxuICB0ZXh0OiByZXBsYWNlKGlubGluZS5nZm0udGV4dCkoJ3syLH0nLCAnKicpKClcbn0pO1xuXG4vKipcbiAqIElubGluZSBMZXhlciAmIENvbXBpbGVyXG4gKi9cblxuZnVuY3Rpb24gSW5saW5lTGV4ZXIobGlua3MsIG9wdGlvbnMpIHtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMubGlua3MgPSBsaW5rcztcbiAgdGhpcy5ydWxlcyA9IGlubGluZS5ub3JtYWw7XG4gIHRoaXMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXIgfHwgbmV3IFJlbmRlcmVyO1xuICB0aGlzLnJlbmRlcmVyLm9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgaWYgKCF0aGlzLmxpbmtzKSB7XG4gICAgdGhyb3cgbmV3XG4gICAgICBFcnJvcignVG9rZW5zIGFycmF5IHJlcXVpcmVzIGEgYGxpbmtzYCBwcm9wZXJ0eS4nKTtcbiAgfVxuXG4gIGlmICh0aGlzLm9wdGlvbnMuZ2ZtKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5icmVha3MpIHtcbiAgICAgIHRoaXMucnVsZXMgPSBpbmxpbmUuYnJlYWtzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJ1bGVzID0gaW5saW5lLmdmbTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgdGhpcy5ydWxlcyA9IGlubGluZS5wZWRhbnRpYztcbiAgfVxufVxuXG4vKipcbiAqIEV4cG9zZSBJbmxpbmUgUnVsZXNcbiAqL1xuXG5JbmxpbmVMZXhlci5ydWxlcyA9IGlubGluZTtcblxuLyoqXG4gKiBTdGF0aWMgTGV4aW5nL0NvbXBpbGluZyBNZXRob2RcbiAqL1xuXG5JbmxpbmVMZXhlci5vdXRwdXQgPSBmdW5jdGlvbihzcmMsIGxpbmtzLCBvcHRpb25zKSB7XG4gIHZhciBpbmxpbmUgPSBuZXcgSW5saW5lTGV4ZXIobGlua3MsIG9wdGlvbnMpO1xuICByZXR1cm4gaW5saW5lLm91dHB1dChzcmMpO1xufTtcblxuLyoqXG4gKiBMZXhpbmcvQ29tcGlsaW5nXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLm91dHB1dCA9IGZ1bmN0aW9uKHNyYykge1xuICB2YXIgb3V0ID0gJydcbiAgICAsIGxpbmtcbiAgICAsIHRleHRcbiAgICAsIGhyZWZcbiAgICAsIGNhcDtcblxuICB3aGlsZSAoc3JjKSB7XG4gICAgLy8gZXNjYXBlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZXNjYXBlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSBjYXBbMV07XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBhdXRvbGlua1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmF1dG9saW5rLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGlmIChjYXBbMl0gPT09ICdAJykge1xuICAgICAgICB0ZXh0ID0gY2FwWzFdLmNoYXJBdCg2KSA9PT0gJzonXG4gICAgICAgICAgPyB0aGlzLm1hbmdsZShjYXBbMV0uc3Vic3RyaW5nKDcpKVxuICAgICAgICAgIDogdGhpcy5tYW5nbGUoY2FwWzFdKTtcbiAgICAgICAgaHJlZiA9IHRoaXMubWFuZ2xlKCdtYWlsdG86JykgKyB0ZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMV0pO1xuICAgICAgICBocmVmID0gdGV4dDtcbiAgICAgIH1cbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgbnVsbCwgdGV4dCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB1cmwgKGdmbSlcbiAgICBpZiAoIXRoaXMuaW5MaW5rICYmIChjYXAgPSB0aGlzLnJ1bGVzLnVybC5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMV0pO1xuICAgICAgaHJlZiA9IHRleHQ7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5saW5rKGhyZWYsIG51bGwsIHRleHQpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGFnXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMudGFnLmV4ZWMoc3JjKSkge1xuICAgICAgaWYgKCF0aGlzLmluTGluayAmJiAvXjxhIC9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmluTGluayA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaW5MaW5rICYmIC9ePFxcL2E+L2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMuaW5MaW5rID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICA/IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXJcbiAgICAgICAgICA/IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIoY2FwWzBdKVxuICAgICAgICAgIDogZXNjYXBlKGNhcFswXSlcbiAgICAgICAgOiBjYXBbMF1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxpbmtcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5saW5rLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMuaW5MaW5rID0gdHJ1ZTtcbiAgICAgIG91dCArPSB0aGlzLm91dHB1dExpbmsoY2FwLCB7XG4gICAgICAgIGhyZWY6IGNhcFsyXSxcbiAgICAgICAgdGl0bGU6IGNhcFszXVxuICAgICAgfSk7XG4gICAgICB0aGlzLmluTGluayA9IGZhbHNlO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gcmVmbGluaywgbm9saW5rXG4gICAgaWYgKChjYXAgPSB0aGlzLnJ1bGVzLnJlZmxpbmsuZXhlYyhzcmMpKVxuICAgICAgICB8fCAoY2FwID0gdGhpcy5ydWxlcy5ub2xpbmsuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGxpbmsgPSAoY2FwWzJdIHx8IGNhcFsxXSkucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xuICAgICAgbGluayA9IHRoaXMubGlua3NbbGluay50b0xvd2VyQ2FzZSgpXTtcbiAgICAgIGlmICghbGluayB8fCAhbGluay5ocmVmKSB7XG4gICAgICAgIG91dCArPSBjYXBbMF0uY2hhckF0KDApO1xuICAgICAgICBzcmMgPSBjYXBbMF0uc3Vic3RyaW5nKDEpICsgc3JjO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaW5MaW5rID0gdHJ1ZTtcbiAgICAgIG91dCArPSB0aGlzLm91dHB1dExpbmsoY2FwLCBsaW5rKTtcbiAgICAgIHRoaXMuaW5MaW5rID0gZmFsc2U7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBzdHJvbmdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5zdHJvbmcuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuc3Ryb25nKHRoaXMub3V0cHV0KGNhcFsyXSB8fCBjYXBbMV0pKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGVtXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZW0uZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuZW0odGhpcy5vdXRwdXQoY2FwWzJdIHx8IGNhcFsxXSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gY29kZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmNvZGUuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuY29kZXNwYW4oZXNjYXBlKGNhcFsyXSwgdHJ1ZSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gYnJcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5ici5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5icigpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZGVsIChnZm0pXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZGVsLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmRlbCh0aGlzLm91dHB1dChjYXBbMV0pKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRleHRcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy50ZXh0LmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnRleHQoZXNjYXBlKHRoaXMuc21hcnR5cGFudHMoY2FwWzBdKSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHNyYykge1xuICAgICAgdGhyb3cgbmV3XG4gICAgICAgIEVycm9yKCdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29tcGlsZSBMaW5rXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLm91dHB1dExpbmsgPSBmdW5jdGlvbihjYXAsIGxpbmspIHtcbiAgdmFyIGhyZWYgPSBlc2NhcGUobGluay5ocmVmKVxuICAgICwgdGl0bGUgPSBsaW5rLnRpdGxlID8gZXNjYXBlKGxpbmsudGl0bGUpIDogbnVsbDtcblxuICByZXR1cm4gY2FwWzBdLmNoYXJBdCgwKSAhPT0gJyEnXG4gICAgPyB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgdGl0bGUsIHRoaXMub3V0cHV0KGNhcFsxXSkpXG4gICAgOiB0aGlzLnJlbmRlcmVyLmltYWdlKGhyZWYsIHRpdGxlLCBlc2NhcGUoY2FwWzFdKSk7XG59O1xuXG4vKipcbiAqIFNtYXJ0eXBhbnRzIFRyYW5zZm9ybWF0aW9uc1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5zbWFydHlwYW50cyA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgaWYgKCF0aGlzLm9wdGlvbnMuc21hcnR5cGFudHMpIHJldHVybiB0ZXh0O1xuICByZXR1cm4gdGV4dFxuICAgIC8vIGVtLWRhc2hlc1xuICAgIC5yZXBsYWNlKC8tLS0vZywgJ1xcdTIwMTQnKVxuICAgIC8vIGVuLWRhc2hlc1xuICAgIC5yZXBsYWNlKC8tLS9nLCAnXFx1MjAxMycpXG4gICAgLy8gb3BlbmluZyBzaW5nbGVzXG4gICAgLnJlcGxhY2UoLyhefFstXFx1MjAxNC8oXFxbe1wiXFxzXSknL2csICckMVxcdTIwMTgnKVxuICAgIC8vIGNsb3Npbmcgc2luZ2xlcyAmIGFwb3N0cm9waGVzXG4gICAgLnJlcGxhY2UoLycvZywgJ1xcdTIwMTknKVxuICAgIC8vIG9wZW5pbmcgZG91Ymxlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcXHUyMDE4XFxzXSlcIi9nLCAnJDFcXHUyMDFjJylcbiAgICAvLyBjbG9zaW5nIGRvdWJsZXNcbiAgICAucmVwbGFjZSgvXCIvZywgJ1xcdTIwMWQnKVxuICAgIC8vIGVsbGlwc2VzXG4gICAgLnJlcGxhY2UoL1xcLnszfS9nLCAnXFx1MjAyNicpO1xufTtcblxuLyoqXG4gKiBNYW5nbGUgTGlua3NcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUubWFuZ2xlID0gZnVuY3Rpb24odGV4dCkge1xuICBpZiAoIXRoaXMub3B0aW9ucy5tYW5nbGUpIHJldHVybiB0ZXh0O1xuICB2YXIgb3V0ID0gJydcbiAgICAsIGwgPSB0ZXh0Lmxlbmd0aFxuICAgICwgaSA9IDBcbiAgICAsIGNoO1xuXG4gIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgY2ggPSB0ZXh0LmNoYXJDb2RlQXQoaSk7XG4gICAgaWYgKE1hdGgucmFuZG9tKCkgPiAwLjUpIHtcbiAgICAgIGNoID0gJ3gnICsgY2gudG9TdHJpbmcoMTYpO1xuICAgIH1cbiAgICBvdXQgKz0gJyYjJyArIGNoICsgJzsnO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmVuZGVyZXJcbiAqL1xuXG5mdW5jdGlvbiBSZW5kZXJlcihvcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG59XG5cblJlbmRlcmVyLnByb3RvdHlwZS5jb2RlID0gZnVuY3Rpb24oY29kZSwgbGFuZywgZXNjYXBlZCkge1xuICBpZiAodGhpcy5vcHRpb25zLmhpZ2hsaWdodCkge1xuICAgIHZhciBvdXQgPSB0aGlzLm9wdGlvbnMuaGlnaGxpZ2h0KGNvZGUsIGxhbmcpO1xuICAgIGlmIChvdXQgIT0gbnVsbCAmJiBvdXQgIT09IGNvZGUpIHtcbiAgICAgIGVzY2FwZWQgPSB0cnVlO1xuICAgICAgY29kZSA9IG91dDtcbiAgICB9XG4gIH1cblxuICBpZiAoIWxhbmcpIHtcbiAgICByZXR1cm4gJzxwcmU+PGNvZGU+J1xuICAgICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUoY29kZSwgdHJ1ZSkpXG4gICAgICArICdcXG48L2NvZGU+PC9wcmU+JztcbiAgfVxuXG4gIHJldHVybiAnPHByZT48Y29kZSBjbGFzcz1cIidcbiAgICArIHRoaXMub3B0aW9ucy5sYW5nUHJlZml4XG4gICAgKyBlc2NhcGUobGFuZywgdHJ1ZSlcbiAgICArICdcIj4nXG4gICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUoY29kZSwgdHJ1ZSkpXG4gICAgKyAnXFxuPC9jb2RlPjwvcHJlPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuYmxvY2txdW90ZSA9IGZ1bmN0aW9uKHF1b3RlKSB7XG4gIHJldHVybiAnPGJsb2NrcXVvdGU+XFxuJyArIHF1b3RlICsgJzwvYmxvY2txdW90ZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmh0bWwgPSBmdW5jdGlvbihodG1sKSB7XG4gIHJldHVybiBodG1sO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmhlYWRpbmcgPSBmdW5jdGlvbih0ZXh0LCBsZXZlbCwgcmF3KSB7XG4gIHJldHVybiAnPGgnXG4gICAgKyBsZXZlbFxuICAgICsgJyBpZD1cIidcbiAgICArIHRoaXMub3B0aW9ucy5oZWFkZXJQcmVmaXhcbiAgICArIHJhdy50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teXFx3XSsvZywgJy0nKVxuICAgICsgJ1wiPidcbiAgICArIHRleHRcbiAgICArICc8L2gnXG4gICAgKyBsZXZlbFxuICAgICsgJz5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmhyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9wdGlvbnMueGh0bWwgPyAnPGhyLz5cXG4nIDogJzxocj5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmxpc3QgPSBmdW5jdGlvbihib2R5LCBvcmRlcmVkKSB7XG4gIHZhciB0eXBlID0gb3JkZXJlZCA/ICdvbCcgOiAndWwnO1xuICByZXR1cm4gJzwnICsgdHlwZSArICc+XFxuJyArIGJvZHkgKyAnPC8nICsgdHlwZSArICc+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5saXN0aXRlbSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8bGk+JyArIHRleHQgKyAnPC9saT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnBhcmFncmFwaCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8cD4nICsgdGV4dCArICc8L3A+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50YWJsZSA9IGZ1bmN0aW9uKGhlYWRlciwgYm9keSkge1xuICByZXR1cm4gJzx0YWJsZT5cXG4nXG4gICAgKyAnPHRoZWFkPlxcbidcbiAgICArIGhlYWRlclxuICAgICsgJzwvdGhlYWQ+XFxuJ1xuICAgICsgJzx0Ym9keT5cXG4nXG4gICAgKyBib2R5XG4gICAgKyAnPC90Ym9keT5cXG4nXG4gICAgKyAnPC90YWJsZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRhYmxlcm93ID0gZnVuY3Rpb24oY29udGVudCkge1xuICByZXR1cm4gJzx0cj5cXG4nICsgY29udGVudCArICc8L3RyPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGFibGVjZWxsID0gZnVuY3Rpb24oY29udGVudCwgZmxhZ3MpIHtcbiAgdmFyIHR5cGUgPSBmbGFncy5oZWFkZXIgPyAndGgnIDogJ3RkJztcbiAgdmFyIHRhZyA9IGZsYWdzLmFsaWduXG4gICAgPyAnPCcgKyB0eXBlICsgJyBzdHlsZT1cInRleHQtYWxpZ246JyArIGZsYWdzLmFsaWduICsgJ1wiPidcbiAgICA6ICc8JyArIHR5cGUgKyAnPic7XG4gIHJldHVybiB0YWcgKyBjb250ZW50ICsgJzwvJyArIHR5cGUgKyAnPlxcbic7XG59O1xuXG4vLyBzcGFuIGxldmVsIHJlbmRlcmVyXG5SZW5kZXJlci5wcm90b3R5cGUuc3Ryb25nID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxzdHJvbmc+JyArIHRleHQgKyAnPC9zdHJvbmc+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5lbSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8ZW0+JyArIHRleHQgKyAnPC9lbT4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmNvZGVzcGFuID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxjb2RlPicgKyB0ZXh0ICsgJzwvY29kZT4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmJyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9wdGlvbnMueGh0bWwgPyAnPGJyLz4nIDogJzxicj4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmRlbCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8ZGVsPicgKyB0ZXh0ICsgJzwvZGVsPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUubGluayA9IGZ1bmN0aW9uKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gIGlmICh0aGlzLm9wdGlvbnMuc2FuaXRpemUpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHByb3QgPSBkZWNvZGVVUklDb21wb25lbnQodW5lc2NhcGUoaHJlZikpXG4gICAgICAgIC5yZXBsYWNlKC9bXlxcdzpdL2csICcnKVxuICAgICAgICAudG9Mb3dlckNhc2UoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGlmIChwcm90LmluZGV4T2YoJ2phdmFzY3JpcHQ6JykgPT09IDAgfHwgcHJvdC5pbmRleE9mKCd2YnNjcmlwdDonKSA9PT0gMCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgfVxuICB2YXIgb3V0ID0gJzxhIGhyZWY9XCInICsgaHJlZiArICdcIic7XG4gIGlmICh0aXRsZSkge1xuICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgfVxuICBvdXQgKz0gJz4nICsgdGV4dCArICc8L2E+JztcbiAgcmV0dXJuIG91dDtcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5pbWFnZSA9IGZ1bmN0aW9uKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gIHZhciBvdXQgPSAnPGltZyBzcmM9XCInICsgaHJlZiArICdcIiBhbHQ9XCInICsgdGV4dCArICdcIic7XG4gIGlmICh0aXRsZSkge1xuICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgfVxuICBvdXQgKz0gdGhpcy5vcHRpb25zLnhodG1sID8gJy8+JyA6ICc+JztcbiAgcmV0dXJuIG91dDtcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50ZXh0ID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gdGV4dDtcbn07XG5cbi8qKlxuICogUGFyc2luZyAmIENvbXBpbGluZ1xuICovXG5cbmZ1bmN0aW9uIFBhcnNlcihvcHRpb25zKSB7XG4gIHRoaXMudG9rZW5zID0gW107XG4gIHRoaXMudG9rZW4gPSBudWxsO1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG1hcmtlZC5kZWZhdWx0cztcbiAgdGhpcy5vcHRpb25zLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyIHx8IG5ldyBSZW5kZXJlcjtcbiAgdGhpcy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlcjtcbiAgdGhpcy5yZW5kZXJlci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xufVxuXG4vKipcbiAqIFN0YXRpYyBQYXJzZSBNZXRob2RcbiAqL1xuXG5QYXJzZXIucGFyc2UgPSBmdW5jdGlvbihzcmMsIG9wdGlvbnMsIHJlbmRlcmVyKSB7XG4gIHZhciBwYXJzZXIgPSBuZXcgUGFyc2VyKG9wdGlvbnMsIHJlbmRlcmVyKTtcbiAgcmV0dXJuIHBhcnNlci5wYXJzZShzcmMpO1xufTtcblxuLyoqXG4gKiBQYXJzZSBMb29wXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKHNyYykge1xuICB0aGlzLmlubGluZSA9IG5ldyBJbmxpbmVMZXhlcihzcmMubGlua3MsIHRoaXMub3B0aW9ucywgdGhpcy5yZW5kZXJlcik7XG4gIHRoaXMudG9rZW5zID0gc3JjLnJldmVyc2UoKTtcblxuICB2YXIgb3V0ID0gJyc7XG4gIHdoaWxlICh0aGlzLm5leHQoKSkge1xuICAgIG91dCArPSB0aGlzLnRvaygpO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogTmV4dCBUb2tlblxuICovXG5cblBhcnNlci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy50b2tlbiA9IHRoaXMudG9rZW5zLnBvcCgpO1xufTtcblxuLyoqXG4gKiBQcmV2aWV3IE5leHQgVG9rZW5cbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudG9rZW5zW3RoaXMudG9rZW5zLmxlbmd0aCAtIDFdIHx8IDA7XG59O1xuXG4vKipcbiAqIFBhcnNlIFRleHQgVG9rZW5zXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5wYXJzZVRleHQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGJvZHkgPSB0aGlzLnRva2VuLnRleHQ7XG5cbiAgd2hpbGUgKHRoaXMucGVlaygpLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgIGJvZHkgKz0gJ1xcbicgKyB0aGlzLm5leHQoKS50ZXh0O1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuaW5saW5lLm91dHB1dChib2R5KTtcbn07XG5cbi8qKlxuICogUGFyc2UgQ3VycmVudCBUb2tlblxuICovXG5cblBhcnNlci5wcm90b3R5cGUudG9rID0gZnVuY3Rpb24oKSB7XG4gIHN3aXRjaCAodGhpcy50b2tlbi50eXBlKSB7XG4gICAgY2FzZSAnc3BhY2UnOiB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGNhc2UgJ2hyJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaHIoKTtcbiAgICB9XG4gICAgY2FzZSAnaGVhZGluZyc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmhlYWRpbmcoXG4gICAgICAgIHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLnRleHQpLFxuICAgICAgICB0aGlzLnRva2VuLmRlcHRoLFxuICAgICAgICB0aGlzLnRva2VuLnRleHQpO1xuICAgIH1cbiAgICBjYXNlICdjb2RlJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuY29kZSh0aGlzLnRva2VuLnRleHQsXG4gICAgICAgIHRoaXMudG9rZW4ubGFuZyxcbiAgICAgICAgdGhpcy50b2tlbi5lc2NhcGVkKTtcbiAgICB9XG4gICAgY2FzZSAndGFibGUnOiB7XG4gICAgICB2YXIgaGVhZGVyID0gJydcbiAgICAgICAgLCBib2R5ID0gJydcbiAgICAgICAgLCBpXG4gICAgICAgICwgcm93XG4gICAgICAgICwgY2VsbFxuICAgICAgICAsIGZsYWdzXG4gICAgICAgICwgajtcblxuICAgICAgLy8gaGVhZGVyXG4gICAgICBjZWxsID0gJyc7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy50b2tlbi5oZWFkZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZmxhZ3MgPSB7IGhlYWRlcjogdHJ1ZSwgYWxpZ246IHRoaXMudG9rZW4uYWxpZ25baV0gfTtcbiAgICAgICAgY2VsbCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlY2VsbChcbiAgICAgICAgICB0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi5oZWFkZXJbaV0pLFxuICAgICAgICAgIHsgaGVhZGVyOiB0cnVlLCBhbGlnbjogdGhpcy50b2tlbi5hbGlnbltpXSB9XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBoZWFkZXIgKz0gdGhpcy5yZW5kZXJlci50YWJsZXJvdyhjZWxsKTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMudG9rZW4uY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcm93ID0gdGhpcy50b2tlbi5jZWxsc1tpXTtcblxuICAgICAgICBjZWxsID0gJyc7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCByb3cubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBjZWxsICs9IHRoaXMucmVuZGVyZXIudGFibGVjZWxsKFxuICAgICAgICAgICAgdGhpcy5pbmxpbmUub3V0cHV0KHJvd1tqXSksXG4gICAgICAgICAgICB7IGhlYWRlcjogZmFsc2UsIGFsaWduOiB0aGlzLnRva2VuLmFsaWduW2pdIH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgYm9keSArPSB0aGlzLnJlbmRlcmVyLnRhYmxlcm93KGNlbGwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIudGFibGUoaGVhZGVyLCBib2R5KTtcbiAgICB9XG4gICAgY2FzZSAnYmxvY2txdW90ZV9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJyc7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnYmxvY2txdW90ZV9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuYmxvY2txdW90ZShib2R5KTtcbiAgICB9XG4gICAgY2FzZSAnbGlzdF9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJydcbiAgICAgICAgLCBvcmRlcmVkID0gdGhpcy50b2tlbi5vcmRlcmVkO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2xpc3RfZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3QoYm9keSwgb3JkZXJlZCk7XG4gICAgfVxuICAgIGNhc2UgJ2xpc3RfaXRlbV9zdGFydCc6IHtcbiAgICAgIHZhciBib2R5ID0gJyc7XG5cbiAgICAgIHdoaWxlICh0aGlzLm5leHQoKS50eXBlICE9PSAnbGlzdF9pdGVtX2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRva2VuLnR5cGUgPT09ICd0ZXh0J1xuICAgICAgICAgID8gdGhpcy5wYXJzZVRleHQoKVxuICAgICAgICAgIDogdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIubGlzdGl0ZW0oYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2xvb3NlX2l0ZW1fc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2xpc3RfaXRlbV9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIubGlzdGl0ZW0oYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2h0bWwnOiB7XG4gICAgICB2YXIgaHRtbCA9ICF0aGlzLnRva2VuLnByZSAmJiAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgID8gdGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4udGV4dClcbiAgICAgICAgOiB0aGlzLnRva2VuLnRleHQ7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5odG1sKGh0bWwpO1xuICAgIH1cbiAgICBjYXNlICdwYXJhZ3JhcGgnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5wYXJhZ3JhcGgodGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4udGV4dCkpO1xuICAgIH1cbiAgICBjYXNlICd0ZXh0Jzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRoaXMucGFyc2VUZXh0KCkpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBIZWxwZXJzXG4gKi9cblxuZnVuY3Rpb24gZXNjYXBlKGh0bWwsIGVuY29kZSkge1xuICByZXR1cm4gaHRtbFxuICAgIC5yZXBsYWNlKCFlbmNvZGUgPyAvJig/ISM/XFx3KzspL2cgOiAvJi9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgIC5yZXBsYWNlKC8nL2csICcmIzM5OycpO1xufVxuXG5mdW5jdGlvbiB1bmVzY2FwZShodG1sKSB7XG4gIHJldHVybiBodG1sLnJlcGxhY2UoLyYoWyNcXHddKyk7L2csIGZ1bmN0aW9uKF8sIG4pIHtcbiAgICBuID0gbi50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChuID09PSAnY29sb24nKSByZXR1cm4gJzonO1xuICAgIGlmIChuLmNoYXJBdCgwKSA9PT0gJyMnKSB7XG4gICAgICByZXR1cm4gbi5jaGFyQXQoMSkgPT09ICd4J1xuICAgICAgICA/IFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQobi5zdWJzdHJpbmcoMiksIDE2KSlcbiAgICAgICAgOiBTdHJpbmcuZnJvbUNoYXJDb2RlKCtuLnN1YnN0cmluZygxKSk7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2UocmVnZXgsIG9wdCkge1xuICByZWdleCA9IHJlZ2V4LnNvdXJjZTtcbiAgb3B0ID0gb3B0IHx8ICcnO1xuICByZXR1cm4gZnVuY3Rpb24gc2VsZihuYW1lLCB2YWwpIHtcbiAgICBpZiAoIW5hbWUpIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4LCBvcHQpO1xuICAgIHZhbCA9IHZhbC5zb3VyY2UgfHwgdmFsO1xuICAgIHZhbCA9IHZhbC5yZXBsYWNlKC8oXnxbXlxcW10pXFxeL2csICckMScpO1xuICAgIHJlZ2V4ID0gcmVnZXgucmVwbGFjZShuYW1lLCB2YWwpO1xuICAgIHJldHVybiBzZWxmO1xuICB9O1xufVxuXG5mdW5jdGlvbiBub29wKCkge31cbm5vb3AuZXhlYyA9IG5vb3A7XG5cbmZ1bmN0aW9uIG1lcmdlKG9iaikge1xuICB2YXIgaSA9IDFcbiAgICAsIHRhcmdldFxuICAgICwga2V5O1xuXG4gIGZvciAoOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdGFyZ2V0ID0gYXJndW1lbnRzW2ldO1xuICAgIGZvciAoa2V5IGluIHRhcmdldCkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0YXJnZXQsIGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSB0YXJnZXRba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG5cbi8qKlxuICogTWFya2VkXG4gKi9cblxuZnVuY3Rpb24gbWFya2VkKHNyYywgb3B0LCBjYWxsYmFjaykge1xuICBpZiAoY2FsbGJhY2sgfHwgdHlwZW9mIG9wdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrID0gb3B0O1xuICAgICAgb3B0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBvcHQgPSBtZXJnZSh7fSwgbWFya2VkLmRlZmF1bHRzLCBvcHQgfHwge30pO1xuXG4gICAgdmFyIGhpZ2hsaWdodCA9IG9wdC5oaWdobGlnaHRcbiAgICAgICwgdG9rZW5zXG4gICAgICAsIHBlbmRpbmdcbiAgICAgICwgaSA9IDA7XG5cbiAgICB0cnkge1xuICAgICAgdG9rZW5zID0gTGV4ZXIubGV4KHNyYywgb3B0KVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlKTtcbiAgICB9XG5cbiAgICBwZW5kaW5nID0gdG9rZW5zLmxlbmd0aDtcblxuICAgIHZhciBkb25lID0gZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIG9wdC5oaWdobGlnaHQgPSBoaWdobGlnaHQ7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgfVxuXG4gICAgICB2YXIgb3V0O1xuXG4gICAgICB0cnkge1xuICAgICAgICBvdXQgPSBQYXJzZXIucGFyc2UodG9rZW5zLCBvcHQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBlcnIgPSBlO1xuICAgICAgfVxuXG4gICAgICBvcHQuaGlnaGxpZ2h0ID0gaGlnaGxpZ2h0O1xuXG4gICAgICByZXR1cm4gZXJyXG4gICAgICAgID8gY2FsbGJhY2soZXJyKVxuICAgICAgICA6IGNhbGxiYWNrKG51bGwsIG91dCk7XG4gICAgfTtcblxuICAgIGlmICghaGlnaGxpZ2h0IHx8IGhpZ2hsaWdodC5sZW5ndGggPCAzKSB7XG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH1cblxuICAgIGRlbGV0ZSBvcHQuaGlnaGxpZ2h0O1xuXG4gICAgaWYgKCFwZW5kaW5nKSByZXR1cm4gZG9uZSgpO1xuXG4gICAgZm9yICg7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIChmdW5jdGlvbih0b2tlbikge1xuICAgICAgICBpZiAodG9rZW4udHlwZSAhPT0gJ2NvZGUnKSB7XG4gICAgICAgICAgcmV0dXJuIC0tcGVuZGluZyB8fCBkb25lKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhpZ2hsaWdodCh0b2tlbi50ZXh0LCB0b2tlbi5sYW5nLCBmdW5jdGlvbihlcnIsIGNvZGUpIHtcbiAgICAgICAgICBpZiAoZXJyKSByZXR1cm4gZG9uZShlcnIpO1xuICAgICAgICAgIGlmIChjb2RlID09IG51bGwgfHwgY29kZSA9PT0gdG9rZW4udGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIC0tcGVuZGluZyB8fCBkb25lKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRva2VuLnRleHQgPSBjb2RlO1xuICAgICAgICAgIHRva2VuLmVzY2FwZWQgPSB0cnVlO1xuICAgICAgICAgIC0tcGVuZGluZyB8fCBkb25lKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSkodG9rZW5zW2ldKTtcbiAgICB9XG5cbiAgICByZXR1cm47XG4gIH1cbiAgdHJ5IHtcbiAgICBpZiAob3B0KSBvcHQgPSBtZXJnZSh7fSwgbWFya2VkLmRlZmF1bHRzLCBvcHQpO1xuICAgIHJldHVybiBQYXJzZXIucGFyc2UoTGV4ZXIubGV4KHNyYywgb3B0KSwgb3B0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGUubWVzc2FnZSArPSAnXFxuUGxlYXNlIHJlcG9ydCB0aGlzIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9jaGpqL21hcmtlZC4nO1xuICAgIGlmICgob3B0IHx8IG1hcmtlZC5kZWZhdWx0cykuc2lsZW50KSB7XG4gICAgICByZXR1cm4gJzxwPkFuIGVycm9yIG9jY3VyZWQ6PC9wPjxwcmU+J1xuICAgICAgICArIGVzY2FwZShlLm1lc3NhZ2UgKyAnJywgdHJ1ZSlcbiAgICAgICAgKyAnPC9wcmU+JztcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuXG4vKipcbiAqIE9wdGlvbnNcbiAqL1xuXG5tYXJrZWQub3B0aW9ucyA9XG5tYXJrZWQuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdCkge1xuICBtZXJnZShtYXJrZWQuZGVmYXVsdHMsIG9wdCk7XG4gIHJldHVybiBtYXJrZWQ7XG59O1xuXG5tYXJrZWQuZGVmYXVsdHMgPSB7XG4gIGdmbTogdHJ1ZSxcbiAgdGFibGVzOiB0cnVlLFxuICBicmVha3M6IGZhbHNlLFxuICBwZWRhbnRpYzogZmFsc2UsXG4gIHNhbml0aXplOiBmYWxzZSxcbiAgc2FuaXRpemVyOiBudWxsLFxuICBtYW5nbGU6IHRydWUsXG4gIHNtYXJ0TGlzdHM6IGZhbHNlLFxuICBzaWxlbnQ6IGZhbHNlLFxuICBoaWdobGlnaHQ6IG51bGwsXG4gIGxhbmdQcmVmaXg6ICdsYW5nLScsXG4gIHNtYXJ0eXBhbnRzOiBmYWxzZSxcbiAgaGVhZGVyUHJlZml4OiAnJyxcbiAgcmVuZGVyZXI6IG5ldyBSZW5kZXJlcixcbiAgeGh0bWw6IGZhbHNlXG59O1xuXG4vKipcbiAqIEV4cG9zZVxuICovXG5cbm1hcmtlZC5QYXJzZXIgPSBQYXJzZXI7XG5tYXJrZWQucGFyc2VyID0gUGFyc2VyLnBhcnNlO1xuXG5tYXJrZWQuUmVuZGVyZXIgPSBSZW5kZXJlcjtcblxubWFya2VkLkxleGVyID0gTGV4ZXI7XG5tYXJrZWQubGV4ZXIgPSBMZXhlci5sZXg7XG5cbm1hcmtlZC5JbmxpbmVMZXhlciA9IElubGluZUxleGVyO1xubWFya2VkLmlubGluZUxleGVyID0gSW5saW5lTGV4ZXIub3V0cHV0O1xuXG5tYXJrZWQucGFyc2UgPSBtYXJrZWQ7XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBtYXJrZWQ7XG59IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBtYXJrZWQ7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy5tYXJrZWQgPSBtYXJrZWQ7XG59XG5cbn0pLmNhbGwoZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzIHx8ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbCk7XG59KCkpO1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIoZnVuY3Rpb24oc2VsZikge1xuICAndXNlIHN0cmljdCc7XG5cbiAgaWYgKHNlbGYuZmV0Y2gpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIHNlYXJjaFBhcmFtczogJ1VSTFNlYXJjaFBhcmFtcycgaW4gc2VsZixcbiAgICBpdGVyYWJsZTogJ1N5bWJvbCcgaW4gc2VsZiAmJiAnaXRlcmF0b3InIGluIFN5bWJvbCxcbiAgICBibG9iOiAnRmlsZVJlYWRlcicgaW4gc2VsZiAmJiAnQmxvYicgaW4gc2VsZiAmJiAoZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBuZXcgQmxvYigpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBzZWxmLFxuICAgIGFycmF5QnVmZmVyOiAnQXJyYXlCdWZmZXInIGluIHNlbGZcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU5hbWUobmFtZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIG5hbWUgPSBTdHJpbmcobmFtZSlcbiAgICB9XG4gICAgaWYgKC9bXmEtejAtOVxcLSMkJSYnKisuXFxeX2B8fl0vaS50ZXN0KG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNoYXJhY3RlciBpbiBoZWFkZXIgZmllbGQgbmFtZScpXG4gICAgfVxuICAgIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIC8vIEJ1aWxkIGEgZGVzdHJ1Y3RpdmUgaXRlcmF0b3IgZm9yIHRoZSB2YWx1ZSBsaXN0XG4gIGZ1bmN0aW9uIGl0ZXJhdG9yRm9yKGl0ZW1zKSB7XG4gICAgdmFyIGl0ZXJhdG9yID0ge1xuICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGl0ZW1zLnNoaWZ0KClcbiAgICAgICAgcmV0dXJuIHtkb25lOiB2YWx1ZSA9PT0gdW5kZWZpbmVkLCB2YWx1ZTogdmFsdWV9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICAgIGl0ZXJhdG9yW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZXJhdG9yXG4gIH1cblxuICBmdW5jdGlvbiBIZWFkZXJzKGhlYWRlcnMpIHtcbiAgICB0aGlzLm1hcCA9IHt9XG5cbiAgICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgIH0sIHRoaXMpXG5cbiAgICB9IGVsc2UgaWYgKGhlYWRlcnMpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGhlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCBoZWFkZXJzW25hbWVdKVxuICAgICAgfSwgdGhpcylcbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gICAgdmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgICB2YXIgbGlzdCA9IHRoaXMubWFwW25hbWVdXG4gICAgaWYgKCFsaXN0KSB7XG4gICAgICBsaXN0ID0gW11cbiAgICAgIHRoaXMubWFwW25hbWVdID0gbGlzdFxuICAgIH1cbiAgICBsaXN0LnB1c2godmFsdWUpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIHZhbHVlcyA9IHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gICAgcmV0dXJuIHZhbHVlcyA/IHZhbHVlc1swXSA6IG51bGxcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldEFsbCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gfHwgW11cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuaGFzT3duUHJvcGVydHkobm9ybWFsaXplTmFtZShuYW1lKSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gPSBbbm9ybWFsaXplVmFsdWUodmFsdWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGhpcy5tYXApLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgdGhpcy5tYXBbbmFtZV0uZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHZhbHVlLCBuYW1lLCB0aGlzKVxuICAgICAgfSwgdGhpcylcbiAgICB9LCB0aGlzKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2gobmFtZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkgeyBpdGVtcy5wdXNoKHZhbHVlKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKFtuYW1lLCB2YWx1ZV0pIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICBIZWFkZXJzLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdID0gSGVhZGVycy5wcm90b3R5cGUuZW50cmllc1xuICB9XG5cbiAgZnVuY3Rpb24gY29uc3VtZWQoYm9keSkge1xuICAgIGlmIChib2R5LmJvZHlVc2VkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJykpXG4gICAgfVxuICAgIGJvZHkuYm9keVVzZWQgPSB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKHJlYWRlci5yZXN1bHQpXG4gICAgICB9XG4gICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QocmVhZGVyLmVycm9yKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzQXJyYXlCdWZmZXIoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpXG4gICAgcmV0dXJuIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzVGV4dChibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICByZWFkZXIucmVhZEFzVGV4dChibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgZnVuY3Rpb24gQm9keSgpIHtcbiAgICB0aGlzLmJvZHlVc2VkID0gZmFsc2VcblxuICAgIHRoaXMuX2luaXRCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5XG4gICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmJsb2IgJiYgQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QmxvYiA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHkudG9TdHJpbmcoKVxuICAgICAgfSBlbHNlIGlmICghYm9keSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgQXJyYXlCdWZmZXIucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgLy8gT25seSBzdXBwb3J0IEFycmF5QnVmZmVycyBmb3IgUE9TVCBtZXRob2QuXG4gICAgICAgIC8vIFJlY2VpdmluZyBBcnJheUJ1ZmZlcnMgaGFwcGVucyB2aWEgQmxvYnMsIGluc3RlYWQuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIEJvZHlJbml0IHR5cGUnKVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QmxvYiAmJiB0aGlzLl9ib2R5QmxvYi50eXBlKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgdGhpcy5fYm9keUJsb2IudHlwZSlcbiAgICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuYmxvYikge1xuICAgICAgdGhpcy5ibG9iID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgYmxvYicpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keVRleHRdKSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFycmF5QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2IoKS50aGVuKHJlYWRCbG9iQXNBcnJheUJ1ZmZlcilcbiAgICAgIH1cblxuICAgICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIHJlYWRCbG9iQXNUZXh0KHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0JylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICByZXR1cm4gcmVqZWN0ZWQgPyByZWplY3RlZCA6IFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5mb3JtRGF0YSkge1xuICAgICAgdGhpcy5mb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5qc29uID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBIVFRQIG1ldGhvZHMgd2hvc2UgY2FwaXRhbGl6YXRpb24gc2hvdWxkIGJlIG5vcm1hbGl6ZWRcbiAgdmFyIG1ldGhvZHMgPSBbJ0RFTEVURScsICdHRVQnLCAnSEVBRCcsICdPUFRJT05TJywgJ1BPU1QnLCAnUFVUJ11cblxuICBmdW5jdGlvbiBub3JtYWxpemVNZXRob2QobWV0aG9kKSB7XG4gICAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICAgIHJldHVybiAobWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEpID8gdXBjYXNlZCA6IG1ldGhvZFxuICB9XG5cbiAgZnVuY3Rpb24gUmVxdWVzdChpbnB1dCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHlcbiAgICBpZiAoUmVxdWVzdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihpbnB1dCkpIHtcbiAgICAgIGlmIChpbnB1dC5ib2R5VXNlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKVxuICAgICAgfVxuICAgICAgdGhpcy51cmwgPSBpbnB1dC51cmxcbiAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFsc1xuICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5wdXQuaGVhZGVycylcbiAgICAgIH1cbiAgICAgIHRoaXMubWV0aG9kID0gaW5wdXQubWV0aG9kXG4gICAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlXG4gICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgYm9keSA9IGlucHV0Ll9ib2R5SW5pdFxuICAgICAgICBpbnB1dC5ib2R5VXNlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cmwgPSBpbnB1dFxuICAgIH1cblxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8IHRoaXMuY3JlZGVudGlhbHMgfHwgJ29taXQnXG4gICAgaWYgKG9wdGlvbnMuaGVhZGVycyB8fCAhdGhpcy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgfVxuICAgIHRoaXMubWV0aG9kID0gbm9ybWFsaXplTWV0aG9kKG9wdGlvbnMubWV0aG9kIHx8IHRoaXMubWV0aG9kIHx8ICdHRVQnKVxuICAgIHRoaXMubW9kZSA9IG9wdGlvbnMubW9kZSB8fCB0aGlzLm1vZGUgfHwgbnVsbFxuICAgIHRoaXMucmVmZXJyZXIgPSBudWxsXG5cbiAgICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KGJvZHkpXG4gIH1cblxuICBSZXF1ZXN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzKVxuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlKGJvZHkpIHtcbiAgICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgYm9keS50cmltKCkuc3BsaXQoJyYnKS5mb3JFYWNoKGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBpZiAoYnl0ZXMpIHtcbiAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKVxuICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBoZWFkZXJzKHhocikge1xuICAgIHZhciBoZWFkID0gbmV3IEhlYWRlcnMoKVxuICAgIHZhciBwYWlycyA9ICh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkgfHwgJycpLnRyaW0oKS5zcGxpdCgnXFxuJylcbiAgICBwYWlycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgdmFyIHNwbGl0ID0gaGVhZGVyLnRyaW0oKS5zcGxpdCgnOicpXG4gICAgICB2YXIga2V5ID0gc3BsaXQuc2hpZnQoKS50cmltKClcbiAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJzonKS50cmltKClcbiAgICAgIGhlYWQuYXBwZW5kKGtleSwgdmFsdWUpXG4gICAgfSlcbiAgICByZXR1cm4gaGVhZFxuICB9XG5cbiAgQm9keS5jYWxsKFJlcXVlc3QucHJvdG90eXBlKVxuXG4gIGZ1bmN0aW9uIFJlc3BvbnNlKGJvZHlJbml0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0ge31cbiAgICB9XG5cbiAgICB0aGlzLnR5cGUgPSAnZGVmYXVsdCdcbiAgICB0aGlzLnN0YXR1cyA9IG9wdGlvbnMuc3RhdHVzXG4gICAgdGhpcy5vayA9IHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMFxuICAgIHRoaXMuc3RhdHVzVGV4dCA9IG9wdGlvbnMuc3RhdHVzVGV4dFxuICAgIHRoaXMuaGVhZGVycyA9IG9wdGlvbnMuaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMgPyBvcHRpb25zLmhlYWRlcnMgOiBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgdGhpcy51cmwgPSBvcHRpb25zLnVybCB8fCAnJ1xuICAgIHRoaXMuX2luaXRCb2R5KGJvZHlJbml0KVxuICB9XG5cbiAgQm9keS5jYWxsKFJlc3BvbnNlLnByb3RvdHlwZSlcblxuICBSZXNwb25zZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHRoaXMuX2JvZHlJbml0LCB7XG4gICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogdGhpcy5zdGF0dXNUZXh0LFxuICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnModGhpcy5oZWFkZXJzKSxcbiAgICAgIHVybDogdGhpcy51cmxcbiAgICB9KVxuICB9XG5cbiAgUmVzcG9uc2UuZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogMCwgc3RhdHVzVGV4dDogJyd9KVxuICAgIHJlc3BvbnNlLnR5cGUgPSAnZXJyb3InXG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH1cblxuICB2YXIgcmVkaXJlY3RTdGF0dXNlcyA9IFszMDEsIDMwMiwgMzAzLCAzMDcsIDMwOF1cblxuICBSZXNwb25zZS5yZWRpcmVjdCA9IGZ1bmN0aW9uKHVybCwgc3RhdHVzKSB7XG4gICAgaWYgKHJlZGlyZWN0U3RhdHVzZXMuaW5kZXhPZihzdGF0dXMpID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgc3RhdHVzIGNvZGUnKVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogc3RhdHVzLCBoZWFkZXJzOiB7bG9jYXRpb246IHVybH19KVxuICB9XG5cbiAgc2VsZi5IZWFkZXJzID0gSGVhZGVyc1xuICBzZWxmLlJlcXVlc3QgPSBSZXF1ZXN0XG4gIHNlbGYuUmVzcG9uc2UgPSBSZXNwb25zZVxuXG4gIHNlbGYuZmV0Y2ggPSBmdW5jdGlvbihpbnB1dCwgaW5pdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZXF1ZXN0XG4gICAgICBpZiAoUmVxdWVzdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihpbnB1dCkgJiYgIWluaXQpIHtcbiAgICAgICAgcmVxdWVzdCA9IGlucHV0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXF1ZXN0ID0gbmV3IFJlcXVlc3QoaW5wdXQsIGluaXQpXG4gICAgICB9XG5cbiAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICBmdW5jdGlvbiByZXNwb25zZVVSTCgpIHtcbiAgICAgICAgaWYgKCdyZXNwb25zZVVSTCcgaW4geGhyKSB7XG4gICAgICAgICAgcmV0dXJuIHhoci5yZXNwb25zZVVSTFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXZvaWQgc2VjdXJpdHkgd2FybmluZ3Mgb24gZ2V0UmVzcG9uc2VIZWFkZXIgd2hlbiBub3QgYWxsb3dlZCBieSBDT1JTXG4gICAgICAgIGlmICgvXlgtUmVxdWVzdC1VUkw6L20udGVzdCh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHhoci5nZXRSZXNwb25zZUhlYWRlcignWC1SZXF1ZXN0LVVSTCcpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQsXG4gICAgICAgICAgaGVhZGVyczogaGVhZGVycyh4aHIpLFxuICAgICAgICAgIHVybDogcmVzcG9uc2VVUkwoKVxuICAgICAgICB9XG4gICAgICAgIHZhciBib2R5ID0gJ3Jlc3BvbnNlJyBpbiB4aHIgPyB4aHIucmVzcG9uc2UgOiB4aHIucmVzcG9uc2VUZXh0XG4gICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKGJvZHksIG9wdGlvbnMpKVxuICAgICAgfVxuXG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub250aW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vcGVuKHJlcXVlc3QubWV0aG9kLCByZXF1ZXN0LnVybCwgdHJ1ZSlcblxuICAgICAgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdpbmNsdWRlJykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAoJ3Jlc3BvbnNlVHlwZScgaW4geGhyICYmIHN1cHBvcnQuYmxvYikge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InXG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKVxuICAgICAgfSlcblxuICAgICAgeGhyLnNlbmQodHlwZW9mIHJlcXVlc3QuX2JvZHlJbml0ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiByZXF1ZXN0Ll9ib2R5SW5pdClcbiAgICB9KVxuICB9XG4gIHNlbGYuZmV0Y2gucG9seWZpbGwgPSB0cnVlXG59KSh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogdGhpcyk7XG4iLCIndXNlIHN0cmljdCdcclxuXHJcbmNvbnN0IG5hbWVMb3dlclJFID0gLyhcXHMqKGRlbHxlbHxhbHxsYXxkZXx1bnx1bmF8dW5hc3x1bm9zfHVub3x0aGV8b2Z8ZnJvbSlcXHMrKS9naVxyXG5cclxuY29uc3QgTUFMRV9QQVRURVJOUyA9IFtcclxuICAvL1NpIGVsIGFkamV0aXZvIHRlcm1pbmEgZW4g4oCcLW/igJ0gZm9ybWFtb3MgZWwgZmVtZW5pbm8gY2FtYmlhbmRvIGxhIOKAnG/igJ0gcG9yIOKAnGHigJ0uXHJcbiAgWy8oLikobykkL2ksIChfLGIpID0+IGAke2J9YWBdLFxyXG5cclxuICAvL1NpIGVsIGFkamV0aXZvIHRlcm1pbmEgZW4g4oCcLW/igJ0gZm9ybWFtb3MgZWwgZmVtZW5pbm8gY2FtYmlhbmRvIGxhIOKAnG/igJ0gcG9yIOKAnGHigJ0uXHJcbiAgWy8oLikoZXR8b3QpKGV8bykkL2ksIChfLGIsYykgPT4gYCR7Yn0ke2N9YWBdLFxyXG5cclxuICAvLyBTaSBlbCBhZGpldGl2byB0ZXJtaW5hIGVuIOKAnC3DoW4sIC3Ds24sIC1vcuKAnSwgZm9ybWFtb3MgZWwgZmVtZW5pbm8gYcOxYWRpZW5kbyDigJxh4oCdXHJcbiAgWy8oLikoYW58b258w7NufMOhbnzDs3J8b3IpJC9pLCAoXyxiLGMpID0+IGAke2J9JHtjfWFgXVxyXG5dXHJcbmNvbnN0IEZFTUFMRV9QQVRURVJOUyA9IFtcclxuICBbLyguKShhbnxvbnzDs258w6FufMOzcnxvcikoYSkkL2ksIChfLGIsYykgPT4gYCR7Yn0ke2N9YF0sXHJcbiAgWy8oLikoZXR8b3QpKGEpJC9pLCAoXyxiLGMpID0+IGAke2J9JHtjfW9gXSxcclxuICBbLyguKShhKSQvaSwgKF8sYikgPT4gYCR7Yn1vYF1cclxuXVxyXG5cclxuLy8gQ0FTSU5HIFxyXG5jb25zdCB0b1RpdGxlQ2FzZSA9IHN0ciA9PiBzdHIucmVwbGFjZSgvXFx3XFxTKi9nLCB0eHQgPT4gdHh0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdHh0LnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpKVxyXG5jb25zdCB0b1VwcGVyQ2FzZSA9IHN0ciA9PiBzdHIuc3BsaXQoL1xcbi8pLm1hcChzdHIgPT4gc3RyLnRvVXBwZXJDYXNlKCkpLmpvaW4oJ1xcbicpXHJcbmNvbnN0IHRvTG93ZXJDYXNlID0gc3RyID0+IHN0ci50b0xvd2VyQ2FzZSgpXHJcbmNvbnN0IHVjRmlyc3QgPSBzdHIgPT4gc3RyLnJlcGxhY2UoL14oXFxzKyk/KC4pKC4qKS8sICh0LCBhLCBiLCBjKSA9PiBgJHthfHwnJ30keyhifHwnJykudG9VcHBlckNhc2UoKX0keyhjfHwnJykudG9Mb3dlckNhc2UoKX1gIClcclxuY29uc3QgdG9OYW1lID0gc3RyID0+IHRvVGl0bGVDYXNlKHN0cilcclxuICAucmVwbGFjZShuYW1lTG93ZXJSRSwgKF8sIG0pID0+ICBtLnRvTG93ZXJDYXNlKCkpXHJcbiAgLnJlcGxhY2UoLygoPz1cXFMqKVthLXpdfF5bYS16XSkvaSwgKF8sYSxiKSA9PiBgJHsoYXx8JycpLnRvVXBwZXJDYXNlKCl9YClcclxuXHJcbi8vIEFESkVUSVZPUyBcclxuY29uc3QgaXNNYWxlID0gc3RyID0+ICEhKE1BTEVfUEFUVEVSTlMuZmluZCh0ZXN0ID0+ICEhc3RyLm1hdGNoKHRlc3RbMF0pKSlcclxuY29uc3QgaXNGZW1hbGUgPSBzdHIgPT4gIWlzTWFsZShzdHIpXHJcbmNvbnN0IGlzR2VuZXJpYyA9IHN0ciA9PiFpc01hbGUoc3RyKSAmJiAoc3RyLm1hdGNoKC9bYS16XVtiLWRmLWhqLW5wLXR2LXpdJC9pKSB8fCBzdHIubWF0Y2goL2UkL2kpIClcclxuXHJcbmNvbnN0IGFkZEFydGljbGUgPSAoc3RyLCBtYWxlR2VuZXJpYz10cnVlKT0+IGAkeyhpc01hbGUoc3RyKSB8fCAoaXNHZW5lcmljKHN0cikgJiYgbWFsZUdlbmVyaWMpKSA/ICdlbCcgOiAnbGEnfSAke3N0cn1gXHJcbmNvbnN0IGFkZEFydGljbGVNYWxlID0gc3RyID0+IGFkZEFydGljbGUoc3RyLCB0cnVlKVxyXG5jb25zdCBhZGRBcnRpY2xlRmVtYWxlID0gc3RyID0+IGFkZEFydGljbGUoc3RyLCBmYWxzZSlcclxuXHJcbmNvbnN0IGFkZFVuZGVmID0gKHN0ciwgbWFsZUdlbmVyaWM9dHJ1ZSk9PiBgJHsoaXNNYWxlKHN0cikgfHwgKGlzR2VuZXJpYyhzdHIpICYmIG1hbGVHZW5lcmljKSkgPyAndW4nIDogJ3VuYSd9ICR7c3RyfWBcclxuY29uc3QgYWRkVW5kZWZNYWxlID0gc3RyID0+IGFkZFVuZGVmKHN0ciwgdHJ1ZSlcclxuY29uc3QgYWRkVW5kZWZGZW1hbGUgPSBzdHIgPT4gYWRkVW5kZWYoc3RyLCBmYWxzZSlcclxuXHJcbmNvbnN0IHRvRmVtYWxlID0gc3RyID0+IHtcclxuICBpZiAoaXNGZW1hbGUoc3RyKSkgcmV0dXJuIHN0clxyXG4gIGxldCBwYXR0ID0gTUFMRV9QQVRURVJOUy5maW5kKHRlc3QgPT4gc3RyLm1hdGNoKHRlc3RbMF0pID8gdGVzdFsxXSA6IGZhbHNlKVxyXG4gIHJldHVybiBwYXR0ID8gc3RyLnJlcGxhY2UocGF0dFswXSwgcGF0dFsxXSkgOiBzdHJcclxufVxyXG5cclxuY29uc3QgdG9NYWxlID0gc3RyID0+IHtcclxuICBpZiAoaXNNYWxlKHN0cikgJiYgIWlzR2VuZXJpYyhzdHIpKSByZXR1cm4gc3RyXHJcbiAgbGV0IHBhdHQgPSBGRU1BTEVfUEFUVEVSTlMuZmluZCh0ZXN0ID0+IHN0ci5tYXRjaCh0ZXN0WzBdKSA/IHRlc3RbMV0gOiBmYWxzZSlcclxuICByZXR1cm4gcGF0dCA/IHN0ci5yZXBsYWNlKHBhdHRbMF0sIHBhdHRbMV0pIDogc3RyXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHRvVGl0bGVDYXNlLCB0b1VwcGVyQ2FzZSwgdG9Mb3dlckNhc2UsIHVjRmlyc3QsIHRvTmFtZSxcclxuICBhZGRBcnRpY2xlLCBhZGRBcnRpY2xlRmVtYWxlLCBhZGRBcnRpY2xlTWFsZSxcclxuICBhZGRVbmRlZiwgYWRkVW5kZWZGZW1hbGUsIGFkZFVuZGVmTWFsZSxcclxuICB0b0ZlbWFsZSwgdG9NYWxlLGlzR2VuZXJpYywgaXNNYWxlLCBpc0ZlbWFsZVxyXG59XHJcbiIsIid1c2Ugc3RyaWN0J1xyXG5cclxuY29uc3QgZ2V0TW9kZGVkR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9nZW5lcmF0b3JfbW9kcycpXHJcbmNvbnN0IGdldEZpbHRlcmVkR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9nZW5lcmF0b3JfZmlsdGVycycpXHJcbmNvbnN0IHsgaXNEaWNlUm9sbCwgbWFrZVJvbGxlciB9ID0gcmVxdWlyZSgnLi9yb2xsZXInKVxyXG5cclxuY29uc3QgY29udGV4dFJFID0gLyg/OihbXlxcLl0rKVxcLik/KC4qKS9cclxuY29uc3QgZ2VuZXJhdG9yUkUgPSAvXFxbKD86KFteQFxcXV0rKUApPyhbXlxcW1xcXXxdKikoPzpcXHwoW15cXFtcXF1dKikpP1xcXS9nbVxyXG5jb25zdCBpbmxpbmVUYWJsZVJFID0gL1xcWyg/OihbXkBcXF1dKylAKT8+KChbXjtcXEBcXFtcXF1cXHxdKzsqKSspXFxdL2dcclxuXHJcbmNvbnN0IGhhc01vcmVTZWxlY3RvcnMgPSBzdHIgPT4gc3RyLm1hdGNoKGdlbmVyYXRvclJFKVxyXG5cclxuY29uc3QgbWFrZUlubGluZUdlbmVyYXRvciA9IHN0ciA9PiB7XHJcblxyXG4gIGNvbnN0IFssLCBpbmxpbmVdID0gaW5saW5lVGFibGVSRS5leGVjKHN0cilcclxuICBjb25zdCBvcHRpb25zID0gaW5saW5lLnNwbGl0KC87LylcclxuXHJcbiAgcmV0dXJuICgpID0+IHtcclxuICAgIHJldHVybiBvcHRpb25zW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG9wdGlvbnMubGVuZ3RoKV1cclxuICB9XHJcbn1cclxuXHJcblxyXG5jb25zdCBleGVjUmVwbGFjZW1lbnQgPSAoc3RyLCBzZWxlY3RvcnMsIGZyb21Db250ZXh0LCByZWN1cnNpdmUpID0+IHtcclxuICBjb25zdCBsaW5lcyA9IHN0ci5zcGxpdCgvXFxuLylcclxuXHJcbiAgcmV0dXJuIGxpbmVzLnJlZHVjZSgoZmluYWwsIGxpbmUpID0+IHtcclxuICAgIGxldCBtYXRjaFxyXG4gICAgaWYgKCFoYXNNb3JlU2VsZWN0b3JzKGxpbmUpKSB7XHJcbiAgICAgIHJldHVybiBgJHtmaW5hbH1cXG4ke2xpbmV9YFxyXG4gICAgfVxyXG5cclxuICAgIHdoaWxlIChtYXRjaCA9IGdlbmVyYXRvclJFLmV4ZWMobGluZSkpIHtcclxuICAgICAgbGV0IFtwYXR0ZXJuLCBtb2QsIGZ1bGxOYW1lLCBmaWx0ZXJzXSA9IG1hdGNoXHJcbiAgICAgIGxldCBbLGNvbnRleHQsbmFtZV0gPSAoZnVsbE5hbWUgfHwgJycpLm1hdGNoKGNvbnRleHRSRSlcclxuICAgICAgY29udGV4dCA9IGNvbnRleHQgfHwgZnJvbUNvbnRleHQgfHwgJ21haW4nXHJcbiAgICAgIGxldCBpbmxpbmVHZW5lcmF0b3JcclxuXHJcbiAgICAgIGlmIChwYXR0ZXJuLm1hdGNoKGlubGluZVRhYmxlUkUpKSB7XHJcbiAgICAgICAgaW5saW5lR2VuZXJhdG9yID0gbWFrZUlubGluZUdlbmVyYXRvcihwYXR0ZXJuKVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBvbmx5IGFkZCBrbm93biBnZW5lcmF0b3JzIHRvIHRoZSBxdWV1ZVxyXG4gICAgICBsZXQgZGljZVxyXG4gICAgICBpZiAoZGljZSA9IGlzRGljZVJvbGwobmFtZSkpIHtcclxuICAgICAgICBsZXQgcm9sbGVyID0gbWFrZVJvbGxlcihuYW1lKVxyXG4gICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UocGF0dGVybiwgcm9sbGVyKCkpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBnZW5lcmF0b3IgPSBpbmxpbmVHZW5lcmF0b3IgfHwgc2VsZWN0b3JzW2Ake2NvbnRleHR9LiR7bmFtZX1gXSB8fCBzZWxlY3RvcnNbbmFtZV1cclxuXHJcblxyXG4gICAgICBpZiAoZ2VuZXJhdG9yKSB7XHJcbiAgICAgICAgbGV0IG1vZGRlZEZuID0gZ2V0TW9kZGVkR2VuZXJhdG9yKG1vZCwgZ2VuZXJhdG9yKVxyXG4gICAgICAgIGxldCBwYXJzZWQgPSBtb2RkZWRGbigpXHJcblxyXG4gICAgICAgIGlmIChoYXNNb3JlU2VsZWN0b3JzKHBhcnNlZCkpIHtcclxuICAgICAgICAgIHBhcnNlZCA9IGV4ZWNSZXBsYWNlbWVudChwYXJzZWQsIHNlbGVjdG9ycywgY29udGV4dCwgdHJ1ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGZpbHRlcmVkID0gZ2V0RmlsdGVyZWRHZW5lcmF0b3IoZmlsdGVycylcclxuICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlKHBhdHRlcm4sIGZpbHRlcmVkKHBhcnNlZCkpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBgJHtmaW5hbH0keyhyZWN1cnNpdmUpPycnOidcXG4nfSR7bGluZX1gXHJcblxyXG4gIH0sICcnKVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IChkYXRhLCBzZWxlY3RvcnMpID0+IHtcclxuICByZXR1cm4gT2JqZWN0LmtleXMoZGF0YS50cGxzKS5yZWR1Y2UoKG9iaiwgdHBsKSA9PiB7XHJcbiAgICBvYmpbdHBsXSA9ICgpID0+IHtcclxuICAgICAgbGV0IFssY29udGV4dF0gPSAodHBsIHx8ICcnKS5tYXRjaChjb250ZXh0UkUpXHJcbiAgICAgIGNvbnRleHQgPSBjb250ZXh0IHx8ICdtYWluJ1xyXG4gICAgICByZXR1cm4gZXhlY1JlcGxhY2VtZW50KGRhdGEudHBsc1t0cGxdLCBzZWxlY3RvcnMsIGNvbnRleHQpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gb2JqXHJcbiAgfSwgc2VsZWN0b3JzKVxyXG59XHJcbiIsIid1c2Ugc3RyaWN0J1xyXG5cclxuY29uc3QgaWQgPSB4ID0+IHhcclxuY29uc3Qge1xyXG4gIHRvVGl0bGVDYXNlLCB0b1VwcGVyQ2FzZSwgdG9Mb3dlckNhc2UsIHVjRmlyc3QsIHRvTmFtZSxcclxuICBhZGRBcnRpY2xlLCBhZGRBcnRpY2xlRmVtYWxlLCBhZGRBcnRpY2xlTWFsZSxcclxuICBhZGRVbmRlZiwgYWRkVW5kZWZGZW1hbGUsIGFkZFVuZGVmTWFsZSxcclxuICB0b0ZlbWFsZSwgdG9NYWxlXHJcbn0gPSByZXF1aXJlKCcuL2ZpbHRlcnMnKVxyXG5cclxuY29uc3QgZ2VuZXJhdG9yUkUgPSAvKFteXFxbXSopXFxbKD86KFteQFxcXV0rKUApPyhbXlxcW1xcXXxdKikoPzpcXHwoW15cXFtcXF1dKikpP1xcXS9nbVxyXG5jb25zdCBsYXN0cGFydFJFID0gLygoPzouKylcXF0pPyguKikkL1xyXG5cclxuY29uc3QgRklMVEVSUyA9IHtcclxuXHJcbiAgbmFtZTogdG9OYW1lLFxyXG4gIGZyYXNlOiB1Y0ZpcnN0LFxyXG4gIHRpdGxlOiB0b1RpdGxlQ2FzZSxcclxuICB1cHBlcjogdG9VcHBlckNhc2UsXHJcbiAgbG93ZXI6IHRvTG93ZXJDYXNlLFxyXG4gIG1hbGU6IHRvTWFsZSxcclxuICBmZW1hbGU6IHRvRmVtYWxlLFxyXG5cclxuICAnK2FyLmdlbic6IGFkZEFydGljbGUsXHJcbiAgJythci5nZW5tJzogYWRkQXJ0aWNsZU1hbGUsXHJcbiAgJythci5nZW5mJzogYWRkQXJ0aWNsZUZlbWFsZSxcclxuICAnK2FyLmluZCc6IGFkZFVuZGVmLFxyXG4gICcrYXIuaW5kbSc6IGFkZFVuZGVmTWFsZSxcclxuICAnK2FyLmluZGYnOiBhZGRVbmRlZkZlbWFsZSxcclxuXHJcbiAgdWNmaXJzdDogdWNGaXJzdCxcclxuICBub21icmU6IHRvTmFtZSxcclxuICB0aXR1bG86IHRvVGl0bGVDYXNlLFxyXG4gIG1heTogdG9VcHBlckNhc2UsXHJcbiAgbWluOiB0b0xvd2VyQ2FzZSxcclxuICBtYXNjOiB0b01hbGUsXHJcbiAgZmVtOiB0b0ZlbWFsZVxyXG59XHJcblxyXG5jb25zdCBhcHBseU91dGVyID0gKHN0ciwgZm4pID0+IHtcclxuICBsZXQgbmV3U3RyID0gc3RyLCBsYXN0SW5kZXgsIG1hdGNoO1xyXG4gIHdoaWxlIChtYXRjaCA9IGdlbmVyYXRvclJFLmV4ZWMoc3RyKSkge1xyXG4gICAgbmV3U3RyID0gbmV3U3RyLnJlcGxhY2UobWF0Y2hbMV0sIGZuKG1hdGNoWzFdKSlcclxuICAgIGxhc3RJbmRleCA9IG1hdGNoLmluZGV4XHJcbiAgfVxyXG4gIHJldHVybiAgbmV3U3RyLnJlcGxhY2UobGFzdHBhcnRSRSwgKHN0ciwgbTEsIG0yKSA9PiBgJHttMSB8fCAnJ30ke2ZuKG0yKX1gIClcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzdHJGaWx0ZXJzID0+IHtcclxuICBjb25zdCBmaWx0ZXJzID0gc3RyRmlsdGVycyA/IHN0ckZpbHRlcnMuc3BsaXQoJ3wnKSA6IG51bGxcclxuICBpZiAoIXN0ckZpbHRlcnMgfHwgIWZpbHRlcnMpIHtcclxuICAgIHJldHVybiBpZFxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHN0ciA9PiB7XHJcbiAgICByZXR1cm4gZmlsdGVycy5maWx0ZXIoaWQpLnJlZHVjZSgobW9kZGVkU3RyLCBmaWx0ZXIpID0+IHtcclxuICAgICAgbGV0IGZuICA9IEZJTFRFUlNbZmlsdGVyXVxyXG5cclxuICAgICAgcmV0dXJuIGZuID8gYXBwbHlPdXRlcihtb2RkZWRTdHIsIGZuKSA6IG1vZGRlZFN0clxyXG4gICAgfSwgc3RyKVxyXG4gIH1cclxufVxyXG4iLCIndXNlIHN0cmljdCdcclxuY29uc3QgcmFuZ2UgPSBzaXplID0+IEFycmF5LmFwcGx5KG51bGwsIEFycmF5KHNpemUpKVxyXG5jb25zdCBkaWNlID0gcmVxdWlyZSgnLi9yb2xsZXInKVxyXG5jb25zdCBpc0RpY2VSb2xsID0gZGljZS5pc0RpY2VSb2xsXHJcbmNvbnN0IG1ha2VSb2xsZXIgPSBkaWNlLm1ha2VSb2xsZXJcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gKG1vZCwgZ2VuKSA9PiB7XHJcbiAgaWYgKCFtb2QpIHtcclxuICAgIHJldHVybiBnZW5cclxuICB9XHJcblxyXG4gIGxldCBtYXRjaFxyXG5cclxuICAvLyBbeDNAc3RyaW5nXSByZXBlYXQgeE5cclxuICBpZiAobWF0Y2ggPSBtb2QubWF0Y2goL154KFswLTldKykvKSkge1xyXG4gICAgY29uc3QgbGlzdCA9IHJhbmdlKE51bWJlcihtYXRjaFsxXSkpLm1hcCgoKSA9PiAoKSA9PiBnZW4oKSlcclxuICAgIHJldHVybiAoKSA9PiBsaXN0LnJlZHVjZSgobWVyZ2VkLCBmbikgPT4gYCR7bWVyZ2VkfSR7Zm4oKX0gYCwgJycpXHJcbiAgfVxyXG5cclxuICAvLyBbM2Q2QHN0cmluZ10gcmVwZWF0IGRpY2VkIGRYXHJcbiAgaWYgKG1hdGNoID0gaXNEaWNlUm9sbChtb2QpKSB7XHJcbiAgICBsZXQgcm9sbGVyID0gbWFrZVJvbGxlcihtb2QpXHJcbiAgICByZXR1cm4gKCkgPT4gcmFuZ2Uocm9sbGVyKCkpLm1hcCgoKSA9PiAoKSA9PiBnZW4oKSkucmVkdWNlKChtZXJnZWQsIGZuKSA9PiBgJHttZXJnZWR9JHtmbigpfSBgLCAnJylcclxuICB9XHJcblxyXG4gIC8vIFsxLzNAc3RyaW5nXSBkaWNlIHByb2JhYmlsaXR5IG9mIGFwcGVhcmFuY2VcclxuICBpZiAobWF0Y2ggPSBtb2QubWF0Y2goL14oWzAtOV0rKVxcLyhbMC05XSspLykpIHtcclxuICAgIGNvbnN0IFssIHByb2IsIHRvdGFsXSA9IG1hdGNoXHJcblxyXG4gICAgaWYgKCF0b3RhbCkgcmV0dXJuIGdlblxyXG5cclxuICAgIGxldCByb2xsZXIgPSBtYWtlUm9sbGVyKGAxZCR7dG90YWx9YClcclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIHJldHVybiByb2xsZXIoKSA8PSBwcm9iID8gZ2VuKCkgOiAnJ1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gW3glQHN0cmluZ10gJSBwcm9iYWJpbGl0eSBvZiBhcHBlYXJhbmNlXHJcbiAgaWYgKG1hdGNoID0gbW9kLm1hdGNoKC9eKFswLTldKyklLykpIHtcclxuICAgIGNvbnN0IFssIHByb2JdID0gbWF0Y2hcclxuXHJcbiAgICBpZighcHJvYikge1xyXG4gICAgICByZXR1cm4gJydcclxuICAgIH1cclxuXHJcbiAgICBpZiAocHJvYj49MTAwKSB7XHJcbiAgICAgIHJldHVybiBnZW5cclxuICAgIH1cclxuXHJcbiAgICBsZXQgcm9sbGVyID0gbWFrZVJvbGxlcignMWQxMDAnKVxyXG4gICAgcmV0dXJuICgpID0+IHJvbGxlcigpIDw9IHByb2IgPyBnZW4oKSA6ICcnXHJcbiAgfVxyXG5cclxuXHJcbiAgcmV0dXJuIGdlblxyXG59XHJcbiIsIid1c2Ugc3RyaWN0J1xyXG5cclxuY29uc3QgbWFya2VkID0gcmVxdWlyZSgnbWFya2VkJylcclxuY29uc3QgZGVlcEFzc2lnbiA9IHJlcXVpcmUoJ2RlZXAtYXNzaWduJylcclxuY29uc3QgZmV0Y2ggPSByZXF1aXJlKCdpc29tb3JwaGljLWZldGNoJylcclxuXHJcbmNvbnN0IHBhcnNlciA9IHJlcXVpcmUoJy4vcGFyc2VyJylcclxuY29uc3QgY3JlYXRlU2VsZWN0b3JzID0gcmVxdWlyZSgnLi9zZWxlY3RvcicpXHJcbmNvbnN0IG1ha2VHZW5lcmF0b3JzID0gcmVxdWlyZSgnLi9nZW5lcmF0b3InKVxyXG5jb25zdCByZW1vdGVzID0gcmVxdWlyZSgnLi9yZW1vdGVzJylcclxuY29uc3Qgc291cmNlVG9Sb2xsVGFibGUgPSByZXF1aXJlKCcuL3RyYW5zZm9ybXMvc291cmNlX3RvX3RhYmxlJylcclxuLy8gY29uc3QgY29udmVydFRvQ29udGVudCA9IHJlcXVpcmUoJy4vdG9fY29udGVudCcpXHJcblxyXG5jb25zdCBIT1NUID0gJy8vcm9sZWFuZG8uaGVyb2t1YXBwLmNvbSdcclxuLy8gY29uc3QgSE9TVCA9ICcvL2xvY2FsaG9zdDo4MDgwJ1xyXG5cclxuY2xhc3MgR2VuZXJhZG9yIHtcclxuXHJcbiAgY29uc3RydWN0b3IgKHsgdG9rZW4sIGhvc3Q9SE9TVCB9PXt9KSB7XHJcbiAgICB0aGlzLnRva2VuID0gdG9rZW5cclxuICAgIHRoaXMuaG9zdCA9IGhvc3RcclxuICAgIHRoaXMucmVtb3RlcyA9IHJlbW90ZXModGhpcy50b2tlbilcclxuICAgIHRoaXMuY29udGV4dExpc3QgPSBbIG51bGwgXVxyXG4gIH1cclxuXHJcbiAgZ2V0VG9rZW5Gcm9tQXV0aCgpIHtcclxuICAgIHJldHVybiBmZXRjaChgJHt0aGlzLmhvc3R9L2F1dGgvdG9rZW5gLCB7XHJcbiAgICAgIGhlYWRlcnM6IHtcImNvbnRlbnQtdHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIn0sXHJcbiAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nXHJcbiAgICB9KVxyXG4gICAgICAudGhlbihyZXMgPT4gcmVzLmpzb24oKSlcclxuICAgICAgLnRoZW4ocmVzID0+IHtcclxuICAgICAgICBpZiAoIXJlcy50b2tlbikge1xyXG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KClcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZXRUb2tlbihyZXMudG9rZW4pXHJcbiAgICAgICAgcmV0dXJuIHJlcy50b2tlblxyXG4gICAgICB9KVxyXG4gIH1cclxuXHJcbiAgc2V0VG9rZW4odG9rZW4pIHtcclxuICAgIHRoaXMudG9rZW4gPSB0b2tlblxyXG4gICAgdGhpcy5yZW1vdGVzID0gcmVtb3Rlcyh0aGlzLnRva2VuKVxyXG4gIH1cclxuXHJcbiAgcGFyc2VTdHJpbmcoc3RyKSB7XHJcbiAgICB0aGlzLmRhdGEgPSBkZWVwQXNzaWduKHt9LCB0aGlzLmRhdGEsIHBhcnNlcihzdHIpKVxyXG5cclxuICAgIGNvbnN0IHByb21pc2UgPSB0aGlzLmRhdGEucmVtb3RlcyA/IHRoaXMubG9hZFJlbW90ZXModGhpcy5kYXRhLnJlbW90ZXMpIDogIFByb21pc2UucmVzb2x2ZSh0aGlzKVxyXG4gICAgcmV0dXJuIHByb21pc2UudGhlbigoKSA9PiB7XHJcblxyXG4gICAgICB0aGlzLnNlbGVjdG9ycyA9IGNyZWF0ZVNlbGVjdG9ycyh0aGlzLmRhdGEuc291cmNlcywgdGhpcy5zZWxlY3RvcnMgfHwge30pXHJcbiAgICAgIHRoaXMuc2VsZWN0b3JzID0gbWFrZUdlbmVyYXRvcnModGhpcy5kYXRhLCB0aGlzLnNlbGVjdG9ycylcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBsb2FkUmVtb3RlcyhyZW1vdGVMaXN0KSB7XHJcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoT2JqZWN0LmtleXMocmVtb3RlTGlzdCkubWFwKHJlbW90ZUlkID0+IHtcclxuICAgICAgLy8gVE9ETzogY2hlY2sgZm9yIGFscmVhZHkgbG9hZGVkIHJlbW90ZXNcclxuICAgICAgcmV0dXJuIHRoaXMucmVtb3Rlcy5sb2FkKHJlbW90ZUlkKVxyXG4gICAgICAgIC50aGVuKHJlcyA9PiB7XHJcbiAgICAgICAgICBjb25zdCBzdHIgPSBgJHtyZXMuZGF0YS50cGxzfVxcbiR7cmVzLmRhdGEudGFibGVzfWBcclxuICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLmRhdGEucmVtb3Rlc1tyZW1vdGVJZF0ubmFtZVxyXG5cclxuICAgICAgICAgIGNvbnN0IG5ld0RhdGEgPSBwYXJzZXIoc3RyLCBjb250ZXh0KVxyXG4gICAgICAgICAgdGhpcy5kYXRhID0gZGVlcEFzc2lnbih7fSwgdGhpcy5kYXRhLCBuZXdEYXRhKVxyXG4gICAgICAgICAgdGhpcy5jb250ZXh0TGlzdC5wdXNoKGNvbnRleHQpXHJcblxyXG4gICAgICAgICAgaWYoIG5ld0RhdGEucmVtb3Rlcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sb2FkUmVtb3RlcyhuZXdEYXRhLnJlbW90ZXMpXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0pXHJcbiAgICB9KSlcclxuICB9XHJcblxyXG4gIGdlbmVyYXRlKGtleSkge1xyXG4gICAgaWYgKGtleSkgIHtcclxuICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0b3JzW2tleV0gPyB0aGlzLnNlbGVjdG9yc1trZXldKCkgOiAnJztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5kYXRhLnRwbHMpLnJlZHVjZSgoYWNjLCBuYW1lKSA9PiB7XHJcbiAgICAgIHJldHVybiBgJHthY2N9ICR7dGhpcy5zZWxlY3RvcnNbbmFtZV0oKX1gXHJcbiAgICB9LCAnJylcclxuICB9XHJcblxyXG4gIHRvSHRtbChzdHIpIHtcclxuICAgIHJldHVybiBtYXJrZWQoc3RyKVxyXG4gIH1cclxuXHJcbiAgc291cmNlc1RvUm9sbFRhYmxlKG9wdHMpIHtcclxuICAgIHJldHVybiBzb3VyY2VUb1JvbGxUYWJsZSh0aGlzLmRhdGEuc291cmNlcywgb3B0cylcclxuICB9XHJcbiAgLy8gcmVtb3RlVG9Db250ZW50KHJlbW90ZSkge1xyXG4gIC8vICAgcmV0dXJuIGNvbnZlcnRUb0NvbnRlbnQocmVtb3RlKVxyXG4gIC8vIH1cclxuXHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSBHZW5lcmFkb3JcclxuXHJcbnByb2Nlc3Mub24oJ3VuaGFuZGxlZFJlamVjdGlvbicsIChyZWFzb24sIHApID0+IHtcclxuICBjb25zb2xlLmxvZyhcIlVuaGFuZGxlZCBSZWplY3Rpb24gYXQ6IFByb21pc2UgXCIsIHAsIFwiIHJlYXNvbjogXCIsIHJlYXNvbik7XHJcblxyXG59KTsiLCIndXNlIHN0cmljdCdcclxuXHJcbmNvbnN0IGlkID0geCA9PiB4XHJcbmNvbnN0IGNsZWFuTGluZSA9IHN0ciA9PiBTdHJpbmcoc3RyKS50cmltKCkucmVwbGFjZSgvXFxzKy8sICcgJylcclxuY29uc3QgY29tbWVudHMgPSBzdHIgPT4gIXN0ci5tYXRjaCgvXlxcL1xcLy8pXHJcbmNvbnN0IHNwbGl0TGluZXMgPSBzdHIgPT4gc3RyLnNwbGl0KC9cXG4vZykubWFwKGNsZWFuTGluZSkuZmlsdGVyKGlkKS5maWx0ZXIoY29tbWVudHMpXHJcblxyXG5jb25zdCBwYXJzZUxpbmUgPSBzdHIgPT4ge1xyXG4gIGNvbnN0IFssIG51bSwgbGluZV0gPSBzdHIubWF0Y2goLyg/OihbMC05Ll0rKSwpPyguKikvKVxyXG4gIHJldHVybiBudW0gPyBbTnVtYmVyKG51bSksIGNsZWFuTGluZShsaW5lKV0gOiBbMSwgbGluZV1cclxufVxyXG5cclxuY29uc3QgcGFyc2VSZW1vdGVMaW5lID0gc3RyID0+IHtcclxuICBjb25zdCBbLCBuYW1lLCBpZF0gPSBzdHIubWF0Y2goLyhbXjpdKyk6KC4qKS8pICAvL3JlZ2V4IHdpdGggc3JjICgvKFteOl0rKTooW146XSspOiguKikvKVxyXG4gIHJldHVybiBbaWQsIHtuYW1lLCBpZH1dXHJcbn1cclxuXHJcbmNvbnN0IG1hdGNoUmVtb3RlSGVhZGVyID0gc3RyID0+IHN0ci5tYXRjaCgvXjtAKHVzYXx1c2V8cmVtb3Rlc3x0YWJsYXMpLylcclxuY29uc3QgbWF0Y2hUZW1wbGF0ZUhlYWRlciA9IHN0ciA9PiBzdHIubWF0Y2goL147QCg/OnRwbHxwbGFudGlsbGEpXFx8KC4qKS8pXHJcbmNvbnN0IG1hdGNoVGFibGVIZWFkZXIgPSBzdHIgPT4gc3RyLm1hdGNoKC9eOyguKikvKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSAoc3RyLCBmcm9tQ29udGV4dCkgPT4ge1xyXG4gIGNvbnN0IGNvbnRleHQgPSBmcm9tQ29udGV4dCA/IGAke2Zyb21Db250ZXh0fS5gIDogJydcclxuICBjb25zdCBsaW5lcyA9IHNwbGl0TGluZXMoc3RyKVxyXG4gIGxldCBtYXRjaCwgY2xlYW5cclxuICBsZXQga2V5ID0gJ21haW4nXHJcbiAgbGV0IHR5cGUgPSAnc291cmNlcydcclxuICByZXR1cm4gbGluZXMucmVkdWNlKChzb3VyY2VzLCBsaW5lKSA9PiB7XHJcblxyXG4gICAgLy8gaXMgcmVtb3RlIHRhYmxlXHJcbiAgICBpZiAobWF0Y2ggPSBtYXRjaFJlbW90ZUhlYWRlcihsaW5lKSkge1xyXG4gICAgICB0eXBlID0gJ3JlbW90ZXMnXHJcbiAgICAgIHJldHVybiBzb3VyY2VzXHJcbiAgICB9XHJcblxyXG4gICAgLy8gaXMgdGVtcGxhdGVcclxuICAgIGlmIChtYXRjaCA9IG1hdGNoVGVtcGxhdGVIZWFkZXIobGluZSkpIHtcclxuXHJcbiAgICAgIFssIGtleV0gPSBtYXRjaFxyXG4gICAgICBrZXkgPSBgJHtjb250ZXh0fSR7a2V5fWBcclxuICAgICAgdHlwZSA9ICd0cGxzJ1xyXG4gICAgICByZXR1cm4gc291cmNlc1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG5vcm1hbCB0YWJsZVxyXG4gICAgaWYgKG1hdGNoID0gbWF0Y2hUYWJsZUhlYWRlcihsaW5lKSkge1xyXG4gICAgICBbLCBrZXldID0gbWF0Y2hcclxuICAgICAga2V5ID0gYCR7Y29udGV4dH0ke2tleX1gXHJcbiAgICAgIHR5cGUgPSAnc291cmNlcydcclxuICAgICAgcmV0dXJuIHNvdXJjZXNcclxuICAgIH1cclxuXHJcbiAgICAvLyBJUyBOT1QgSEVBREVSLCBBREQgTElORVxyXG4gICAgaWYgKHR5cGUgIT09ICdyZW1vdGVzJykge1xyXG4gICAgICBzb3VyY2VzW3R5cGVdW2tleV0gPSBzb3VyY2VzW3R5cGVdW2tleV0gfHwgW11cclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZSA9PT0gJ3NvdXJjZXMnKSB7XHJcbiAgICAgIGNsZWFuID0gcGFyc2VMaW5lKGxpbmUpXHJcbiAgICAgIGlmIChjbGVhblsxXSkge1xyXG4gICAgICAgIHNvdXJjZXNbdHlwZV1ba2V5XS5wdXNoKGNsZWFuKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGUgPT09ICd0cGxzJykge1xyXG4gICAgICBzb3VyY2VzW3R5cGVdW2tleV0gKz0gbGluZSArIFwiXFxuXCJcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZSA9PT0gJ3JlbW90ZXMnKSB7XHJcbiAgICAgIGNvbnN0IHJlbW90ZSA9IHBhcnNlUmVtb3RlTGluZShsaW5lKVxyXG4gICAgICBzb3VyY2VzW3R5cGVdW3JlbW90ZVswXV0gPSByZW1vdGVbMV1cclxuICAgIH1cclxuICAgIHJldHVybiBzb3VyY2VzXHJcbiAgfSwge1xyXG4gICAgc291cmNlczoge30sXHJcbiAgICB0cGxzOiB7fSxcclxuICAgIHJlbW90ZXM6IHt9XHJcbiAgfSlcclxufVxyXG5cclxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbihyZXF1aXJlKCcuL3JvbGVhbmRvX2FwaScpLCB7XG4gIGpvaW46IHJlbW90ZSA9PiBgJHtyZW1vdGUuZGF0YS5yZW1vdGVzfVxcbiR7cmVtb3RlLmRhdGEudHBsc31cXG4ke3JlbW90ZS5kYXRhLnRhYmxlc31gXG59KSIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBmZXRjaCA9IHJlcXVpcmUoJ2lzb21vcnBoaWMtZmV0Y2gnKVxuXG5jb25zdCBob3N0ID0gcHJvY2Vzcy5lbnYuSE9TVCB8fCBgLy9yb2xlYW5kby5oZXJva3VhcHAuY29tYFxuY29uc3QgYmFzZVVybCA9IGAke2hvc3R9L2FwaS9nZW5lcmF0b3JzYFxuXG5jb25zdCB0b0pTT04gPSByZXMgPT4ge1xuICBpZiAocmVzLnN0YXR1cyA+PSA0MDApIHJldHVybiByZXMuanNvbigpLnRoZW4oZXJyID0+IFByb21pc2UucmVqZWN0KGVycikpXG4gIHJldHVybiByZXMuanNvbigpXG59XG5cbmNvbnN0IGhlYWRlcnMgPSB7XG4gICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbn1cbmNvbnN0IGdldEhlYWRlcnMgPSB0b2tlbiAgPT4ge1xuICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7dG9rZW59YFxuICB9LCBoZWFkZXJzKVxufVxuY29uc3QgUm9sZWFuZG9BUEkgPSB0b2tlbiA9PiAoe1xuICBsaXN0RmVhdHVyZWQ6IGlkID0+IGZldGNoKGAke2Jhc2VVcmx9L3RhYmxlcy9mZWF0dXJlZGAsIHtcbiAgICBtZXRob2Q6ICdHRVQnLFxuICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgIGhlYWRlcnNcbiAgfSkudGhlbih0b0pTT04pLFxuICBsb2FkOiBpZCA9PiBmZXRjaChgJHtiYXNlVXJsfS90YWJsZS8ke2lkfWAsIHtcbiAgICBtZXRob2Q6ICdHRVQnLFxuICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgIGhlYWRlcnNcbiAgfSkudGhlbih0b0pTT04pLFxuICBjcmVhdGU6IGRhdGEgPT4gZmV0Y2goYCR7YmFzZVVybH0vdGFibGVgLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG4gICAgaGVhZGVyczogZ2V0SGVhZGVycyh0b2tlbilcbiAgfSkudGhlbih0b0pTT04pLFxuICB1cGRhdGU6IChpZCwgZGF0YSkgPT4gZmV0Y2goYCR7YmFzZVVybH0vdGFibGUvJHtpZH1gLCB7XG4gICAgbWV0aG9kOiAnUFVUJyxcbiAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeShkYXRhKSxcbiAgICBoZWFkZXJzOiBnZXRIZWFkZXJzKHRva2VuKVxuICB9KS50aGVuKHRvSlNPTiksXG4gIHJlbW92ZTogKGlkLCBkYXRhKSA9PiBmZXRjaChgJHtiYXNlVXJsfS90YWJsZS8ke2lkfWAsIHtcbiAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgIGhlYWRlcnM6IGdldEhlYWRlcnModG9rZW4pXG4gIH0pXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJvbGVhbmRvQVBJXG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgcmFuZ2UgPSBzaXplID0+IEFycmF5LmFwcGx5KG51bGwsIEFycmF5KHNpemUpKVxuY29uc3Qgc3VtID0gYXJyID0+IGFyci5yZWR1Y2UoKHRvdGFsLCBjdXJyKSA9PiB0b3RhbCArIGN1cnIsMClcbmNvbnN0IHJhbmQgPSAobWluLCBtYXgpID0+IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIChtYXgtbWluKSkgKyBtaW5cbmNvbnN0IGlzRGljZVJvbGwgPSBzdHIgPT4gc3RyLm1hdGNoKC8oWzAtOV0qKT9kKFswLTldKykoPzooWytcXC0qL10pKFswLTldKykpPy8pXG5jb25zdCByb2xsRGljZSA9IChzaWRlcywgYW1vdW50KSA9PiBzdW0ocmFuZ2UoYW1vdW50fHwxKS5tYXAoKCkgPT4gcmFuZCgxLCBzaWRlcykpKVxuY29uc3QgbWFrZVJvbGxlciA9IHN0ciA9PiB7XG5cdGNvbnN0IHBhcnRzID0gaXNEaWNlUm9sbChzdHIpXG4gIGlmICghcGFydHMpIHtcbiAgICByZXR1cm4gMFxuICB9XG5cbiAgbGV0IFssYW1vdW50LHNpZGVzLCBvcCwgbW9kXSA9IHBhcnRzXG4gIG1vZCA9IE51bWJlcihtb2QpXG4gIHNpZGVzID0gTnVtYmVyKHNpZGVzKVxuICBhbW91bnQgPSBOdW1iZXIoYW1vdW50KVxuICByZXR1cm4gKCkgPT4ge1xuICAgIGNvbnN0IHJvbGwgPSByb2xsRGljZShzaWRlcywgYW1vdW50KVxuICAgIGlmICghb3AgfHwgIW1vZCB8fCBtb2QgPT09IDApIHtcbiAgICAgIHJldHVybiByb2xsXG4gICAgfVxuICAgIGlmIChvcCA9PT0gJysnKSByZXR1cm4gcm9sbCArIG1vZFxuICAgIGlmIChvcCA9PT0gJy0nKSByZXR1cm4gcm9sbCAtIG1vZFxuICAgIGlmIChvcCA9PT0gJyonKSByZXR1cm4gcm9sbCAqIG1vZFxuICAgIGlmIChvcCA9PT0gJy8nKSByZXR1cm4gTWF0aC5yb3VuZChyb2xsIC8gbW9kKVxuICAgIHJldHVybiByb2xsXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1ha2VSb2xsZXIsXG4gIGlzRGljZVJvbGwsXG4gIHJvbGxEaWNlXG59XG5cbiIsIid1c2Ugc3RyaWN0J1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSAodGFibGVzLCBzZWxlY3RvcnMpID0+IHtcclxuICByZXR1cm4gT2JqZWN0LmtleXModGFibGVzKS5yZWR1Y2UoKG9iaiwga2V5KSA9PiB7XHJcbiAgICBvYmpba2V5XSA9IGNyZWF0ZVdlaWdodGVkU2VsZWN0b3IodGFibGVzW2tleV0pXHJcbiAgICByZXR1cm4gb2JqXHJcbiAgfSwgc2VsZWN0b3JzKVxyXG59XHJcblxyXG5jb25zdCBjcmVhdGVXZWlnaHRlZFNlbGVjdG9yID0gdGFibGUgPT4ge1xyXG4gIGNvbnN0IGluU2V0ID0gdGFibGUubWFwKHJvdyA9PiByb3dbMV0pXHJcbiAgY29uc3QgaW5XZWlnaHRzID0gIHRhYmxlLm1hcChyb3cgPT4gcm93WzBdKVxyXG4gIGlmICghQXJyYXkuaXNBcnJheShpblNldCkgfHwgIUFycmF5LmlzQXJyYXkoaW5XZWlnaHRzKSkge1xyXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU2V0IGFuZCBXZWlnaHRzIG11c3QgYmUgYXJyYXlzLicpXHJcbiAgfVxyXG4gIGNvbnN0IHdlaWdodHMgPSAoIWluV2VpZ2h0cykgPyBpblNldC5tYXAoKCkgPT4gMSkgOiBpbldlaWdodHMubWFwKHggPT4gTnVtYmVyKHgpKVxyXG4gIGlmIChpblNldC5sZW5ndGggIT09IGluV2VpZ2h0cy5sZW5ndGgpIHtcclxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1NldCBhbmQgV2VpZ2h0cyBhcmUgZGlmZmVyZW50IHNpemVzLicpXHJcbiAgfVxyXG5cclxuICBjb25zdCBzdW0gPSB3ZWlnaHRzLnJlZHVjZSgoc3VtLCB3ZWlnaHQpID0+IHN1bSArIHdlaWdodCwgMClcclxuICBjb25zdCB3ZWlnaHRlZCA9IHdlaWdodHMubWFwKHJhdyA9PiByYXcgLyBzdW0pXHJcblxyXG4gIHJldHVybiAoKSA9PiB7XHJcbiAgICBsZXQga2V5ID0gTWF0aC5yYW5kb20oKVxyXG4gICAgbGV0IGluZGV4ID0gMFxyXG5cclxuICAgIGZvciAoO2luZGV4IDwgd2VpZ2h0ZWQubGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgIGtleSAtPSB3ZWlnaHRlZFtpbmRleF1cclxuXHJcbiAgICAgIGlmIChrZXkgPCAwKSB7XHJcbiAgICAgICAgcmV0dXJuIGluU2V0W2luZGV4XVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4iLCIndXNlIHN0cmljdCdcclxuXHJcbmNvbnN0IGRlZXBBc3NpZ24gPSByZXF1aXJlKCdkZWVwLWFzc2lnbicpXHJcblxyXG5jb25zdCBSQU5HRVMgPSBbMywgNCwgNiwgOCwgMTAsIDEyLCAyMCwgMTAwXVxyXG5jb25zdCBtaW4gPSBhcnIgPT4gYXJyLnJlZHVjZSgocHJldiwgbmV4dCkgPT4gTWF0aC5taW4ocHJldixuZXh0WzBdKSwgYXJyWzBdWzBdKVxyXG5cclxuY29uc3Qgc291cmNlVG9Sb2xsVGFibGUgPSBzb3VyY2UgPT4ge1xyXG5cclxuICBsZXQgdG90YWwgPSBzb3VyY2UucmVkdWNlKCh0b3RhbCwgaXRlbSkgPT4gdG90YWwgKyBpdGVtWzBdLCAwKVxyXG4gIGNvbnN0IG1pblZhbCA9IG1pbihzb3VyY2UpXHJcbiAgY29uc3QgZXZlbmx5RGlzdHJpYnV0ZWQgPSAobWluVmFsICogc291cmNlLmxlbmd0aCkgPT09IHRvdGFsXHJcbiAgdG90YWwgPSBldmVubHlEaXN0cmlidXRlZCA/IHNvdXJjZS5sZW5ndGggOiB0b3RhbFxyXG5cclxuICBjb25zdCBjb252ZXJ0aXIgPSBSQU5HRVMuZmluZCh4ID0+IHRvdGFsIDw9IHgpIHx8IDEwMFxyXG4gIGNvbnN0IHN0ZXAgPSBjb252ZXJ0aXIvdG90YWxcclxuICBjb25zdCB1bml0ID0gTWF0aC5mbG9vcihzdGVwKVxyXG4gIGNvbnN0IG9mZnNldCA9IHN0ZXAgJSAxXHJcblxyXG4gIGxldCBsYXN0SW5kZXggPSAwXHJcbiAgbGV0IHJlbWluZGVyQWNjID0gMFxyXG4gIGxldCBzdW0gPSAwXHJcblxyXG4gIHJldHVybiBzb3VyY2UucmVkdWNlKChsaXN0LCByYXdJdGVtKSA9PiB7XHJcbiAgICBsZXQgeCA9IGV2ZW5seURpc3RyaWJ1dGVkID8gMSA6IHJhd0l0ZW1bMF1cclxuICAgIGxldCBib3R0b20gPSBsYXN0SW5kZXgrMVxyXG4gICAgbGV0IHRvcCA9IGxhc3RJbmRleCArICh4KnVuaXQpXHJcbiAgICBzdW0gKz0geFxyXG4gICAgcmVtaW5kZXJBY2MgKz0gKG9mZnNldCp4KVxyXG5cclxuICAgIGlmIChyZW1pbmRlckFjYyA+IDEpIHtcclxuICAgICAgdG9wICs9IE1hdGguZmxvb3IocmVtaW5kZXJBY2MpXHJcbiAgICAgIHJlbWluZGVyQWNjIC09ICBNYXRoLmZsb29yKHJlbWluZGVyQWNjKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChzdW0gPT09IHRvdGFsICYmIHRvcCA8IGNvbnZlcnRpcikge1xyXG4gICAgICB0b3AgPSBjb252ZXJ0aXJcclxuICAgIH1cclxuICAgIGxhc3RJbmRleCA9IHRvcFxyXG4gICAgbGV0IGxhYmVsID0gdG9wLWJvdHRvbSA9PT0gMCA/IGJvdHRvbSA6IGAke2JvdHRvbX0tJHt0b3B9YFxyXG5cclxuICAgIGxpc3QucHVzaChbbGFiZWwsIHJhd0l0ZW1bMV1dKVxyXG5cclxuICAgIHJldHVybiBsaXN0XHJcbiAgfSwgW10pXHJcbn1cclxuXHJcbmNvbnN0IGhlYWRlciA9IChvcHRzLCBuYW1lKSA9PiBvcHRzLmhlYWRlci5yZXBsYWNlKCdbbmFtZV0nLCBuYW1lKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSAoc291cmNlcywgb3B0cykgPT4ge1xyXG4gIGNvbnN0IG9wdGlvbnMgPSBkZWVwQXNzaWduKHt9LCB7XHJcbiAgICBjb250YWluZXI6IGA8dGFibGUgY2xhc3M9XCJyb2xsdGFibGVcIj5bcm93c108L3RhYmxlPmAsXHJcbiAgICBoZWFkZXI6IGA8dHI+PHRoPjwvdGg+PHRoIGNsYXNzPVwidGl0bGVcIj5bbmFtZV08L3RoPjwvdHI+YCxcclxuICAgIHJvdzogYDx0cj48dGQgY2xhc3M9XCJyb2xsXCI+W3JvbGxdPC90ZD48dGQgY2xhc3M9XCJsaW5lXCI+W2xpbmVdPC90ZD48L3RyPmBcclxuICB9LCBvcHRzKVxyXG4gIHJldHVybiBPYmplY3Qua2V5cyhzb3VyY2VzKS5yZWR1Y2UoKG9iaiwgc291cmNlKSA9PiB7XHJcbiAgICBjb25zdCByb3dzID0gc291cmNlVG9Sb2xsVGFibGUoc291cmNlc1tzb3VyY2VdKVxyXG5cclxuICAgIG9ialtzb3VyY2VdID0gb3B0aW9ucy5jb250YWluZXIucmVwbGFjZSgnW3Jvd3NdJywgcm93cy5yZWR1Y2UoKGh0bWwsIHJvdykgPT4ge1xyXG4gICAgICByZXR1cm4gaHRtbCArIG9wdGlvbnMucm93LnJlcGxhY2UoJ1tyb2xsXScsIHJvd1swXSkucmVwbGFjZSgnW2xpbmVdJywgcm93WzFdKVxyXG4gICAgfSwgaGVhZGVyKG9wdGlvbnMsIHNvdXJjZSkpKVxyXG4gICAgcmV0dXJuIG9ialxyXG4gIH0sIHt9KVxyXG59XHJcbiJdfQ==
