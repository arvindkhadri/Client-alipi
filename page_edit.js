function page_edit( boltSlug, pageSlug, uploadSlug, editMode, hasEditPermission, successUrl) 
{

    var console, PopupControl, M4ImageElement,locName='',langName = '',styleName='',authorValue;
    var editAttributes, elementAttributes, fontTypeAttributes, normalFontAttributes, popupContainerAttributes, editButtonAttributes, editTextInputAttributes, editSubmitAttributes, editTitleAttributes, panelButtonAttributes, buttonPanelAttributes, actionPanelAttributes, closeButtonAttributes, actionButtonAttributes, redButtonAttributes, leftBorderStyle, rightBorderStyle, titleButtonImageAttributes, titleButtonDisplayTextAttributes, actionButtonImageAttributes, actionButtonDisplayTextAttributes,greyArrowAttributes, pageEditor, splashWindow, loadingTimerId, keepOriginal = false;

    /**
     * General utility class / functions.
     */
    var UTIL = UTIL || {};

    (function(UTIL) {
	UTIL.addEvent = function addEvent(node, event, callback) {
	    if (node.addEventListener) {
		node.addEventListener(event, callback, false);
		return true;
	    } else if (node.attachEvent) {
		// Simulates W3C event model in IE
		return node.attachEvent('on' + event, function() {
		    callback( {
			target : window.event.srcElement,
			pageX : window.event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft),
			pageY : window.event.clientY  + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop),
			clientX : window.event.clientX,
			clientY : window.event.clientY,
			keyCode : window.event.keyCode,
			ctrlKey : window.event.ctrlKey,
			altKey : window.event.altKey,
			shiftKey : window.event.shiftKey,
			type : window.event.type,
			preventDefault : function() {
			    window.event.returnValue = false;
			},
			stopPropagation : function() {
			    window.event.cancelBubble = true;
			}
		    });
		});
	    }
	    return false;
	};

	// String concatenation in <IE9 is really slow.
	UTIL.StringBuffer = function StringBuffer() {
	    var buffer = [];

	    this.append = function append(string) {
		buffer.push(string);
		return this;
	    };

	    this.toString = function toString() {
		return buffer.join('');
	    };
	};

	UTIL.forEach = function forEach(array, callback) {
	    var i = 0, length = array.length, value;

	    if (length) {
		for (value = array[0]; i < length && callback.call(value, i, value) !== false; value = array[++i]) {
		}
	    }
	};

	UTIL.animate = function animate(callback, steps, delay) {
	    var index = 1, timer;

	    timer = window.setInterval(function() {
		if (index < steps) {
		    callback(index, false);
		    index += 1;
		} else {
		    clearInterval(timer);
		    callback(index, true);
		}
	    }, delay);
	};

	UTIL.hashToQueryString = function hashToQueryString(hash) {
	    var first = true, buffer = new UTIL.StringBuffer();

	    for (var key in hash) {
		if (first) {
		    first = false;
		} else {
		    buffer.append('&');
		}
		buffer.append(encodeURIComponent(key));
		buffer.append('=');
		buffer.append(encodeURIComponent(hash[key]));
	    }

	    return buffer.toString();
	};
    })(UTIL);
    // //

    /**
     * DOM utility class / functions.
     */
    var DOM = DOM || {};

    (function(DOM) {
	// //

	(function(__global__, undefined)
	 {

	     var modules = (typeof module !== 'undefined' && module.exports);

	     var document = (__global__.document || {
		 // Provide a dummy document object if we're not in a browser, to keep
		 // interpreters happy.
		 createElement: function(){},
		 createDocumentFragment: function(){},
		 createTextNode: function(){},
		 getElementById: function(){}
	     }),
	     toString = Object.prototype.toString,
	     slice = Array.prototype.slice,
	     // Functioms and objects involved in implementing cross-crowser workarounds
	     createElement,
	     eventAttrs,
	     addEvent,
	     setInnerHTML,
	     /** Tag names defined in the HTML 4.01 Strict and Frameset DTDs. */
	     tagNames = ("a abbr acronym address area b bdo big blockquote body br " +
			 "button caption cite code col colgroup dd del dfn div dl dt em fieldset " +
			 "form frame frameset h1 h2 h3 h4 h5 h6 hr head html i iframe img input " +
			 "ins kbd label legend li link map meta noscript " /* :) */ + "object ol " +
			 "optgroup option p param pre q samp script select small span strong style " +
			 "sub sup table tbody td textarea tfoot th thead title tr tt ul var").split(" "),
	     /** Lookup for known tag names. */
	     tagNameLookup = lookup(tagNames),
	     /** * Lookup for tags defined as EMPTY in the HTML 4.01 Strict and Frameset DTDs. */
	     emptyTags = lookup("area base br col frame hr input img link meta param".split(" "));

	     // Utility functions -----------------------------------------------------------

	     /**
	      * Naively copies from ``source`` to ``dest``, returning ``dest``.
	      */
	     function extend(dest, source)
	     {
		 for (var name in source)
		 {
		     dest[name] = source[name];
		 }
		 return dest;
	     }

	     /**
	      * Creates a lookup object from an array of strings.
	      */
	     function lookup(a)
	     {
		 var obj = {}, i = 0, l = a.length;
		 for (; i < l; i++)
		 {
		     obj[a[i]] = true;
		 }
		 return obj;
	     }

	     /**
	      * Uses a dummy constructor to make a ``child`` constructor inherit from a
	      * ``parent`` constructor.
	      */
	     function inheritFrom(child, parent)
	     {
		 function F() {};
		 F.prototype = parent.prototype;
		 child.prototype = new F();
		 child.prototype.constructor = child;
	     }

	     function isArray(o)
	     {
		 return (toString.call(o) === "[object Array]");
	     }

	     function isFunction(o)
	     {
		 return (toString.call(o) === "[object Function]");
	     }

	     /**
	      * We primarily want to distinguish between Objects and Nodes.
	      */
	     function isObject(o)
	     {
		 return (!!o && toString.call(o) === "[object Object]" &&
			 !o.nodeType &&
			 !(o instanceof SafeString))
	     }

	     /**
	      * Flattens an Array in-place, replacing any Arrays it contains with their
	      * contents, and flattening their contents in turn.
	      */
	     function flatten(a)
	     {
		 for (var i = 0, l = a.length; i < l; i++)
		 {
		     var c = a[i];
		     if (isArray(c))
		     {
			 // Make sure we loop to the Array's new length
			 l += c.length - 1;
			 // Replace the current item with its contents
			 Array.prototype.splice.apply(a, [i, 1].concat(c));
			 // Stay on the current index so we continue looping at the first
			 // element of the array we just spliced in or removed.
			 i--;
		     }
		 }
	     }

	     /**
	      * Escapes sensitive HTML characters.
	      */
	     function escapeHTML(s)
	     {
		 return s.split("&").join("&amp;")
		     .split("<").join("&lt;")
		     .split(">").join("&gt;")
		     .split('"').join("&quot;")
                     .split("'").join("&#39;");
	     }


	     eventAttrs = lookup(
		 ("blur focus focusin focusout load resize scroll unload click dblclick " +
		  "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
		  "change select submit keydown keypress keyup error").split(" "));

	     if (!modules)
	     {
		 // jQuery is not available, implement the most essential workarounds
		 var supportsStyle = (function()
				      {
					  var div = document.createElement("div");
					  div.style.display = "none";
					  div.innerHTML = '<span style="color:silver;">s<span>';
					  return /silver/.test(div.getElementsByTagName("span")[0].getAttribute("style"));
				      })(),
		 specialRE = /^(?:href|src|style)$/,
		 attributeTranslations = {
                     cellspacing: "cellSpacing",
                     "class": "className",
                     colspan: "colSpan",
                     "for": "htmlFor",
                     frameborder: "frameBorder",
                     maxlength: "maxLength",
                     readonly: "readOnly",
                     rowspan: "rowSpan",
                     tabindex: "tabIndex",
                     usemap: "useMap"
		 };

		 createElement = function(tagName, attributes)
		 {
		     var el = document.createElement(tagName); // Damn you, IE

		     for (var name in attributes)
		     {
			 var value = attributes[name],
			 name = attributeTranslations[name] || name;

			 if (name in eventAttrs)
			 {
			     el["on" + name] = value;
			     continue;
			 }

			 var special = specialRE.test(name);
			 //if ((name in el || el[name] !== undefined) && !special)
			 //el[name] = value;
			 if (!supportsStyle && name == "style")
			     el.style.cssText = ""+value;
			 else
			     el.setAttribute(name, ""+value);
		     }

		     return el;
		 };

		 addEvent = function(id, event, handler)
		 {
		     document.getElementById(id)["on" + event] = handler;
		 };

		 setInnerHTML = function(el, html)
		 {
		     try
		     {
			 el.innerHTML = html;
		     }
		     catch (e)
		     {
			 var div = document.createElement("div");
			 div.innerHTML = html;
			 while (el.firstChild)
			     el.removeChild(el.firstChild);
			 while (div.firstChild)
			     el.appendChild(div.firstChild);
		     }
		 };
	     }


	     // HTML Escaping ---------------------------------------------------------------

	     /**
	      * If the given input is a ``SafeString``, returns its value; otherwise, coerces
	      * to ``String`` and escapes.
	      */
	     function conditionalEscape(html)
	     {
		 if (html instanceof SafeString)
		 {
		     return html.value;
		 }
		 return escapeHTML(""+html);
	     }

	     /**
	      * ``String`` subclass which marks the given string as safe for inclusion
	      * without escaping.
	      */
	     function SafeString(value)
	     {
		 this.value = value;
	     }

	     inheritFrom(SafeString, String);

	     SafeString.prototype.toString = SafeString.prototype.valueOf = function()
	     {
		 return this.value;
	     };

	     // Mock DOM Elements -----------------------------------------------------------

	     /**
	      * Partially emulates a DOM ``Node`` for HTML generation.
	      */
	     function HTMLNode(childNodes)
	     {
		 this.childNodes = childNodes || [];

		 // Ensure HTMLFragment contents are inlined, as if this object's child
		 // nodes were appended one-by-one.
		 this._inlineFragments();
	     }

	     inheritFrom(HTMLNode, Object);

	     /**
	      * Replaces any ``HTMLFragment`` objects in child nodes with their own
	      * child nodes and empties the fragment.
	      */
	     HTMLNode.prototype._inlineFragments = function()
	     {
		 for (var i = 0, l = this.childNodes.length; i < l; i++)
		 {
		     var child = this.childNodes[i];
		     if (child instanceof HTMLFragment)
		     {
			 this.childNodes.splice.apply(this.childNodes,
						      [i, 1].concat(child.childNodes));
			 // Clear the fragment on append, as per DocumentFragment
			 child.childNodes = [];
		     }
		 }
	     };

	     /**
	      * Emulates ``appendChild``, inserting fragment child node contents and
	      * emptying the fragment if one is given.
	      */
	     HTMLNode.prototype.appendChild = function(node)
	     {
		 if (node instanceof HTMLFragment)
		 {
		     this.childNodes = this.childNodes.concat(node.childNodes);
		     // Clear the fragment on append, as per DocumentFragment
		     node.childNodes = [];
		 }
		 else
		 {
		     this.childNodes.push(node);
		 }
	     };

	     /**
	      * Emulates ``cloneNode`` so cloning of ``HTMLFragment`` objects works
	      * as expected.
	      */
	     HTMLNode.prototype.cloneNode = function(deep)
	     {
		 var clone = this._clone();
		 if (deep === true)
		 {
		     for (var i = 0, l = this.childNodes.length; i < l; i++)
		     {
			 var node = this.childNodes[i];
			 if (node instanceof HTMLElement)
			 {
			     clone.childNodes.push(node.cloneNode(deep));
			 }
			 else
			 {
			     clone.childNodes.push(node);
			 }
		     }
		 }
		 return clone;
	     };

	     /**
	      * Creates the object to be used for deep cloning.
	      */
	     HTMLNode.prototype._clone = function()
	     {
		 return new Node();
	     };

	     /**
	      * Partially emulates a DOM ``Element ``for HTML generation.
	      */
	     function HTMLElement(tagName, attributes, childNodes)
	     {
		 HTMLNode.call(this, childNodes);

		 this.tagName = this.nodeName = tagName.toLowerCase();
		 this.attributes = attributes || {};

		 // Keep a record of whether or not closing slashes are needed, as the
		 // mode could change before this object is coerced to a String.
		 this.xhtml = (DOMBuilder.mode == "XHTML");
	     }

	     inheritFrom(HTMLElement, HTMLNode);

	     HTMLElement.eventTrackerId = 1;

	     HTMLElement.prototype.nodeType = 1;

	     HTMLElement.prototype._clone = function()
	     {
		 var clone = new HTMLElement(this.tagName, extend({}, this.attributes));
		 clone.xhtml = this.xhtml;
		 return clone;
	     };

	     /**
	      * Creates an HTML/XHTML representation of an HTMLElement.
	      *
	      * If ``true`` is passed as an argument and any event attributes are found, this
	      * method will ensure the resulting element has an id so  the handlers for the
	      * event attributes can be registered after the element has been inserted into
	      * the document via ``innerHTML``.
	      *
	      * If necessary, a unique id will be generated.
	      */
	     HTMLElement.prototype.toString = function()
	     {
		 var trackEvents = arguments[0] || false,
		 tagName = (tagNameLookup[this.tagName]
			    ? this.tagName
			    : conditionalEscape(this.tagName));

		 // Opening tag
		 var parts = ["<" + tagName];
		 for (var attr in this.attributes)
		 {
		     // innerHTML is a special case, as we can use it to (perhaps
		     // inadvisedly) to specify entire contents as a string.
		     if (attr === "innerHTML")
		     {
			 continue;
		     }
		     // Don't create attributes which wouldn't make sense in HTML mode -
		     // they can be dealt with afet insertion using addEvents().
		     if (attr in eventAttrs)
		     {
			 if (trackEvents === true && !this.eventsFound)
			 {
			     this.eventsFound = true;
			 }
			 continue;
		     }
		     parts.push(" " + conditionalEscape(attr.toLowerCase()) + "=\"" +
				conditionalEscape(this.attributes[attr]) + "\"");
		 }
		 if (this.eventsFound && !("id" in this.attributes))
		 {
		     // Ensure an id is present so we can grab this element later
		     this.id  = "__DB" + HTMLElement.eventTrackerId++ + "__";
		     parts.push(' id="' + this.id + '"');
		 }
		 parts.push(">");

		 if (emptyTags[tagName])
		 {
		     if (this.xhtml)
		     {
			 parts.splice(parts.length - 1, 1, " />");
		     }
		     return parts.join("");
		 }

		 // If innerHTML was given, use it exclusively for the contents
		 if ("innerHTML" in this.attributes)
		 {
		     parts.push(this.attributes.innerHTML);
		 }
		 else
		 {
		     for (var i = 0, l = this.childNodes.length; i < l; i++)
		     {
			 var node = this.childNodes[i];
			 if (node instanceof HTMLElement || node instanceof SafeString)
			 {
			     parts.push(node.toString(trackEvents));
			 }
			 else if (node === "\u00A0")
			 {
			     // Special case to convert these back to entities,
			     parts.push("&nbsp;");
			 }
			 else
			 {
			     // Coerce to string and escape
			     parts.push(escapeHTML(""+node));
			 }
		     }
		 }

		 // Closing tag
		 parts.push("</" + tagName + ">");
		 return parts.join("");
	     };

	     /**
	      * If event attributes were found when ``toString(true)`` was called, this
	      * method will retrieve the resulting DOM Element by id, attach event handlers
	      * to it and call ``addEvents`` on any HTMLElement children.
	      */
	     HTMLElement.prototype.addEvents = function()
	     {
		 if (this.eventsFound)
		 {
		     var id = ("id" in this.attributes
			       ? conditionalEscape(this.attributes.id)
			       : this.id);
		     for (var attr in this.attributes)
		     {
			 if (attr in eventAttrs)
			 {
			     addEvent(id, attr, this.attributes[attr]);
			 }
		     }

		     delete this.eventsFound;
		     delete this.id;
		 }

		 for (var i = 0, l = this.childNodes.length; i < l; i++)
		 {
		     var node = this.childNodes[i];
		     if (node instanceof HTMLElement)
		     {
			 node.addEvents();
		     }
		 }
	     };

	     HTMLElement.prototype.insertWithEvents = function(el)
	     {
		 setInnerHTML(el, this.toString(true));
		 this.addEvents();
	     };

	     /**
	      * Partially emulates a DOM ``DocumentFragment`` for HTML generation.
	      */
	     function HTMLFragment(childNodes)
	     {
		 HTMLNode.call(this, childNodes);
	     }
	     inheritFrom(HTMLFragment, HTMLNode);

	     HTMLFragment.prototype._clone = function()
	     {
		 return new HTMLFragment();
	     };

	     HTMLFragment.prototype.nodeType = 11;
	     HTMLFragment.prototype.nodeName = "#document-fragment";

	     /**
	      * Creates an HTML/XHTML representation of an HTMLFragment.
	      *
	      * If ``true``is passed as an argument, it will be passed on to
	      * any child HTMLElements when their ``toString()`` is called.
	      */
	     HTMLFragment.prototype.toString = function()
	     {
		 var trackEvents = arguments[0] || false,
		 parts = [];

		 // Contents
		 for (var i = 0, l = this.childNodes.length; i < l; i++)
		 {
		     var node = this.childNodes[i];
		     if (node instanceof HTMLElement || node instanceof SafeString)
		     {
			 parts.push(node.toString(trackEvents));
		     }
		     else if (node === "\u00A0")
		     {
			 // Special case to convert these back to entities,
			 parts.push("&nbsp;");
		     }
		     else
		     {
			 // Coerce to string and escape
			 parts.push(escapeHTML(""+node));
		     }
		 }

		 return parts.join("");
	     };

	     /**
	      * Calls ``addEvents()`` on any HTMLElement children.
	      */
	     HTMLFragment.prototype.addEvents = function()
	     {
		 for (var i = 0, l = this.childNodes.length; i < l; i++)
		 {
		     var node = this.childNodes[i];
		     if (node instanceof HTMLElement)
		     {
			 node.addEvents();
		     }
		 }
	     };

	     HTMLFragment.prototype.insertWithEvents = function(el)
	     {
		 setInnerHTML(el, this.toString(true));
		 this.addEvents();
	     };

	     /**
	      * Creates a function which, when called, uses DOMBuilder to create an element
	      * with the given ``tagName``.
	      *
	      * The resulting function will also have a ``map`` function which calls
	      * ``DOMBuilder.map`` with the given ``tagName``.
	      */
	     function createElementFunction(tagName)
	     {
		 var elementFunction = function()
		 {
		     if (arguments.length === 0)
		     {
			 // Short circuit if there are no arguments, to avoid further
			 // argument inspection.
			 if (DOMBuilder.mode == "DOM")
			 {
			     return document.createElement(tagName);
			 }
			 else
			 {
			     return new HTMLElement(tagName);
			 }
		     }
		     else
		     {
			 return createElementFromArguments(tagName, slice.call(arguments));
		     }
		 };

		 // Add a ``map`` function which will call ``DOMBuilder.map`` with the
		 // appropriate ``tagName``.
		 elementFunction.map = function()
		 {
		     var mapArgs = slice.call(arguments);
		     mapArgs.unshift(tagName);
		     return DOMBuilder.map.apply(DOMBuilder, mapArgs);
		 };

		 return elementFunction;
	     }

	     /**
	      * Normalises a list of arguments in order to create a new DOM element
	      * using ``DOMBuilder.createElement``. Supported argument formats are:
	      *
	      * ``(attributes, child1, ...)``
	      *    an attributes object followed by an arbitrary number of children.
	      * ``(attributes, [child1, ...])``
	      *    an attributes object and an ``Array`` of children.
	      * ``(child1, ...)``
	      *    an arbitrary number of children.
	      * ``([child1, ...])``
	      *    an ``Array`` of children.
	      *
	      * At least one argument *must* be provided.
	      */
	     function createElementFromArguments(tagName, args)
	     {
		 var attributes, children,
		 // The short circuit in ``createElementFunction`` ensures we will
		 // always have at least one argument when called via element creation
		 // functions.
		 argsLength = args.length, firstArg = args[0];

		 if (argsLength === 1 &&
		     isArray(firstArg))
		 {
		     children = firstArg; // ([child1, ...])
		 }
		 else if (isObject(firstArg))
		 {
		     attributes = firstArg;
		     children = (argsLength == 2 && isArray(args[1])
				 ? args[1]               // (attributes, [child1, ...])
				 : slice.call(args, 1)); // (attributes, child1, ...)
		 }
		 else
		 {
		     children = slice.call(args); // (child1, ...)
		 }

		 return DOMBuilder.createElement(tagName, attributes, children);
	     }

	     // DOMBuilder API --------------------------------------------------------------

	     var DOMBuilder = {
		 version: "1.4.3",

		 /**
		  * Determines which mode the ``createElement`` function will operate in.
		  * Supported values are:
		  *
		  * ``"DOM"``
		  *    create DOM Elements.
		  * ``"HTML"``
		  *    create HTML Strings.
		  * ``"XHTML"``
		  *    create XHTML Strings.
		  *
		  * The value depends on the environment we're running in - if modules are
		  * available, we default to HTML mode, otherwise we assume we'te in a
		  * browser and default to DOM mode.
		  */
		 mode: (modules ? "HTML" : "DOM"),

		 /**
		  * Calls a function using DOMBuilder temporarily in the given mode and
		  * returns its output.
		  *
		  * This is primarily intended for using DOMBuilder to generate HTML
		  * strings when running in the browser without having to manage the
		  * mode flag yourself.
		  */
		 withMode: function(mode, func)
		 {
		     var originalMode = this.mode;
		     this.mode = mode;
		     try
		     {
			 return func();
		     }
		     finally
		     {
			 this.mode = originalMode;
		     }
		 },

		 /**
		  * An ``Object`` containing element creation functions.
		  */
		 elementFunctions: (function(obj)
				    {
					for (var i = 0, tagName; tagName = tagNames[i]; i++)
					{
					    obj[tagName.toUpperCase()] = createElementFunction(tagName);
					}
					return obj;
				    })({}),

		 /**
		  * Adds element creation functions to a given context ``Object``, or to
		  * a new object if none was given. Returns the object the functions were
		  * added to, either way.
		  *
		  * An ``NBSP`` property corresponding to the Unicode character for a
		  * non-breaking space is also added to the context object, for
		  * convenience.
		  */
		 apply: function(context)
		 {
		     context = context || {};
		     extend(context, this.elementFunctions);
		     context.NBSP = "\u00A0"; // Add NBSP for backwards-compatibility
		     return context;
		 },

		 /**
		  * Creates a DOM element with the given tag name and, optionally,
		  * the given attributes and children.
		  */
		 createElement: function(tagName, attributes, children)
		 {
		     attributes = attributes || {};
		     children = children || [];
		     flatten(children);

		     if (this.mode != "DOM")
		     {
			 return new HTMLElement(tagName, attributes, children);
		     }

		     // Create the element and set its attributes and event listeners
		     var el = createElement(tagName, attributes);

		     // If content was set via innerHTML, we're done...
		     if (!("innerHTML" in attributes))
		     {
			 // ...otherwise, append children
			 for (var i = 0, l = children.length; i < l; i++)
			 {
			     var child = children[i];
			     if (child && child.nodeType)
			     {
				 el.appendChild(child);
			     }
			     else
			     {
				 el.appendChild(document.createTextNode(""+child));
			     }
			 }
		     }
		     return el;
		 },

		 /**
		  * Creates an element for (potentially) every item in a list. Supported
		  * argument formats are:
		  *
		  * 1. ``(tagName, defaultAttributes, [item1, ...], mappingFunction)``
		  * 2. ``(tagName, [item1, ...], mappingFunction)``
		  *
		  * Arguments are as follows:
		  *
		  * ``tagName``
		  *    the name of the element to create.
		  * ``defaultAttributes`` (optional)
		  *    default attributes for the element.
		  * ``items``
		  *    the list of items to use as the basis for creating elements.
		  * ``mappingFunction`` (optional)
		  *    a function to be called with each item in the list to provide
		  *    contents for the element which will be created for that item.
		  *
		  *    Contents can consist of a single value  or a mixed ``Array``.
		  *
		  *    If provided, the function will be called with the following
		  *    arguments::
		  *
		  *       func(item, attributes, itemIndex)
		  *
		  *    Attributes on the element which will be created can be altered by
		  *    modifying the ``attributes argument, which will initially contain
		  *    the contents of ``defaultAttributes``, if it was provided.
		  *
		  *    The function can prevent an element being generated for a given
		  *    item by returning ``null``.
		  *
		  *    If not provided, each item will result in the creation of a new
		  *    element and the item itself will be used as the only contents.
		  */
		 map: function(tagName)
		 {
		     // Determine how the function was called
		     if (isArray(arguments[1]))
		     {
			 // (tagName, items, func)
			 var defaultAttrs = {},
			 items = arguments[1],
			 func = (isFunction(arguments[2]) ? arguments[2] : null);
		     }
		     else
		     {
			 // (tagName, attrs, items, func)
			 var defaultAttrs = arguments[1],
			 items = arguments[2],
			 func = (isFunction(arguments[3]) ? arguments[3] : null);
		     }

		     var results = [];
		     for (var i = 0, l = items.length; i < l; i++)
		     {
			 var attrs = extend({}, defaultAttrs);
			 // If we were given a mapping function, call it and use the
			 // return value as the contents, unless the function specifies
			 // that the item shouldn't generate an element by explicity
			 // returning null.
			 if (func !== null)
			 {
			     var children = func(items[i], attrs, i);
			     if (children === null)
			     {
				 continue;
			     }
			 }
			 else
			 {
			     // If we weren't given a mapping function, use the item as the
			     // contents.
			     var children = items[i];
			 }

			 // Ensure children are in an Array, as required by createElement
			 if (!isArray(children))
			 {
			     children = [children];
			 }

			 results.push(this.createElement(tagName, attrs, children));
		     }
		     return results;
		 },

		 /**
		  * Creates a ``DocumentFragment`` with the given children. Supported
		  * argument formats are:
		  *
		  * ``(child1, ...)``
		  *    an arbitrary number of children.
		  * ``([child1, ...])``
		  *    an ``Array`` of children.
		  *
		  * A ``DocumentFragment`` conveniently allows you to append its contents
		  * with a single call. If you're thinking of adding a wrapper ``<div>``
		  * solely to be able to insert a number of sibling elements at the same
		  * time, a ``DocumentFragment`` will do the same job without the need for
		  * a redundant wrapper element.
		  *
		  * See http://ejohn.org/blog/dom-documentfragments/ for more information
		  * about ``DocumentFragment`` objects.
		  */
		 fragment: function()
		 {
		     if (arguments.length === 1 &&
			 isArray(arguments[0]))
		     {
			 var children = arguments[0]; // ([child1, ...])
		     }
		     else
		     {
			 var children = slice.call(arguments) // (child1, ...)
		     }

		     // Inline the contents of any child Arrays
		     flatten(children);

		     if (this.mode != "DOM")
		     {
			 return new HTMLFragment(children);
		     }

		     var fragment = document.createDocumentFragment();
		     for (var i = 0, l = children.length; i < l; i++)
		     {
			 var child = children[i];
			 if (child.nodeType)
			 {
			     fragment.appendChild(child);
			 }
			 else
			 {
			     fragment.appendChild(document.createTextNode(""+child));
			 }
		     }

		     return fragment;
		 },

		 /**
		  * Marks a string as safe
		  */
		 markSafe: function(value)
		 {
		     return new SafeString(value);
		 },

		 /**
		  * Determines if a string is safe.
		  */
		 isSafe: function(value)
		 {
		     return (value instanceof SafeString);
		 },

		 HTMLElement: HTMLElement,
		 HTMLFragment: HTMLFragment,
		 HTMLNode: HTMLNode,
		 SafeString: SafeString
	     };

	     /**
	      * Creates a fragment wrapping content created for every item in a
	      * list.
	      *
	      * Arguments are as follows:
	      *
	      * ``items``
	      *    the list of items to use as the basis for creating fragment
	      *    contents.
	      * ``mappingFunction``
	      *    a function to be called with each item in the list, to provide
	      *    contents for the fragment.
	      *
	      *    Contents can consist of a single value or a mixed ``Array``.
	      *
	      *    The function will be called with the following arguments::
	      *
	      *       func(item, itemIndex)
	      *
	      *    The function can indicate that the given item shouldn't generate
	      *    any content for the fragment by returning ``null``.
	      */
	     DOMBuilder.fragment.map = function(items, func)
	     {
		 // If we weren't given a mapping function, the user may as well just
		 // have created a fragment directly, as we're just wrapping content
		 // here, not creating it.
		 if (!isFunction(func))
		 {
		     return DOMBuilder.fragment(items);
		 }

		 var results = [];
		 for (var i = 0, l = items.length; i < l; i++)
		 {
		     // Call the mapping function and add the return value to the
		     // fragment contents, unless the function specifies that the item
		     // shouldn't generate content by explicity returning null.
		     var children = func(items[i], i);
		     if (children === null)
		     {
			 continue;
		     }
		     results = results.concat(children);
		 }
		 return DOMBuilder.fragment(results);
	     };

	     // Export DOMBuilder or expose it to the global object
	     if (modules)
	     {
		 module.exports = DOMBuilder;
	     }
	     else
	     {
		 __global__.DOMBuilder = DOMBuilder;
	     }

	 })(this);


	DOM.BUILDER = DOMBuilder.apply();

	DOM.getIndex = function getIndex (currentNode)
	{
    	    var kids = currentNode.parentNode.childNodes;
    	    var j = 0;
    	    for(var i=0; i< kids.length; i++)
    	    {
    		if (currentNode.nodeName == kids[i].nodeName)
    		    j++;
    		if (currentNode == kids[i])
    		{
    		    return j;
    		}
    		else
    		    continue;
    	    }
    	    return -1;
	};

	DOM.getElementIdx = function getElementIdx(elt)
	{
	    var count = 1;
	    for (var sib = elt.previousSibling; sib ; sib = sib.previousSibling)
	    {
		if(sib.nodeType == 1 && sib.tagName == elt.tagName)count++
	    }
	    
	    return count;
	};
	
	DOM.makePath = function makePath(elt){
    	    var path = '';
	    for (; elt && elt.nodeType == 1; elt = elt.parentNode)
	    {
		if (elt.attributes['m4pageedittype'] === undefined || elt.attributes['m4pageedittype'].nodeValue != 'text')
		{
		    idx = DOM.getElementIdx(elt);
		    xname = elt.tagName;
		    if (idx > 1) xname += "[" + idx + "]";
		    path = "/" + xname + path;
		}
	    }
	    console.log(path);
	    return path;
	};

	DOM.evaluate = function evaluate(path,newcontent){
	    var nodes = document.evaluate(path, document, null, XPathResult.ANY_TYPE,null);
	    try{
		var result = nodes.iterateNext();
		while (result)
		{
		    if (result.tagName == "img" || result.tagName =='IMG'){
			url=newcontent.split(',')[1];
			size = newcontent.split(',')[0].split('x');
			width = size[0];
			height = size[1];
			result.setAttribute('src',url)
			result.setAttribute('width',width);
			result.setAttribute('height',height);
			
		    }
		    else{
			result.textContent = newcontent;
		    }
		    result=nodes.iterateNext();
		}
	    }
	    catch (e)
	    {
		dump( 'error: Document tree modified during iteration ' + e );
	    }
	    
	}
	
	DOM.getXPATH = function getXPath(element)
	{
    	    var doc = document;
    	    //we get the selections
    	    var selection =  window.getSelection();
    	    var str = '';
    	    //var currentNode = selection.getRangeAt(i).commonAncestorContainer;
    	    var currentNode = element;
    	    var path = '';
    	    var index = -1;

    	    if (currentNode.nodeName != "#text")
    	    {
    		path = DOM.makePath(currentNode);
    	    }
    	    else
    	    {
    		path = DOM.makePath(currentNode.parentNode);
    	    }

    	   
    	    return path;
	};

	DOM.findPosition = function findPosition(element) {
	    var currentLeft = 0, currentTop = 0;

	    if (element.offsetParent) {
		do {
		    currentLeft += element.offsetLeft;
		    currentTop += element.offsetTop;
		} while (element = element.offsetParent);
	    }

	    return { x : currentLeft, y : currentTop };
	};

	DOM.findSize = function findSize(element) {
	    return { width : element.clientWidth, height: element.clientHeight };
	};

	DOM.clickBlocker = function clickBlocker(element) {
	    var size = DOM.findSize(element), position;

	    if (size.width > 0 && size.height > 0) {
		position = DOM.findPosition(element);

		document.body.appendChild(DOM.BUILDER.DIV( { style : 'background: transparent; z-index: 2147483644; width:'
							     + (size.width + 'px') + '; height:' + (size.height + 'px')
							     + '; position: absolute; left:' + (position.x + 'px') + '; top:' + (position.y + 'px') + ';' }));
	    }
	};

	DOM.overrideStyleProperty = function overrideStyleProperty(object, property, value) {
	    var savedName = 'm4p' + property.toUpperCase();

	    object.style[savedName] = object.style[property];
	    object.style[property] = value;
	};

	DOM.restoreStyleProperty = function restoreStyleProperty(object, property, fallback) {
	    var savedName = 'm4p' + property.toUpperCase();

	    if (object.style[savedName] !== undefined) {
		object.style[property] = object.style[savedName];
	    } else {
		object.style[property] = fallback;
	    }

	    object.style[savedName] = undefined;
	};

	DOM.deleteStyleProperty = (function() {
	    if (typeof document.createElement('div').style.removeAttribute !== 'undefined') {
		// IE specific
		return function deleteStyleProperty(object, property) {
		    object.style.removeAttribute(property);
		};
	    } else {
		// W3C standard
		return function deleteStyleProperty(object, property) {
		    object.style.removeProperty(property);
		};
	    }
	})();

	// Not to be used for Style attributes. For style attributes use overrideStyleProperty instead
	DOM.overrideAttribute = function overrideAttribute (object, attributeName, value) {
	    var savedName = 'm4p' + attributeName.toUpperCase();
	    if (object[attributeName]) {
		var attributeValue = object.getAttribute(attributeName);
		if (attributeValue) {
		    object.setAttribute(savedName, attributeValue);
		}
	    }
	    object.setAttribute(attributeName, value);
	};

	// Not to be used for Style attributes. For style attributes use restoreStyleProperty instead
	DOM.restoreAttribute = function restoreAttribute (object, attributeName) {
	    var savedName = 'm4p' + attributeName.toUpperCase();
	    if (object[attributeName]) {
		var originalValue =  object.getAttribute(savedName);
		if (originalValue != null) {
		    object.setAttribute(attributeName, originalValue);
		    object.removeAttribute(savedName);
		} else {
		    object.removeAttribute(attributeName);
		}
	    }
	};

	DOM.addListener = (function() {
	    if (document.attachEvent) {
		// Simulates W3C event model in IE
		return function addListener(type, callback, capture) {
		    document.attachEvent('on' + type, function() {
			callback( {
			    target : window.event.srcElement,
			    pageX : window.event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft),
			    pageY : window.event.clientY  + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop),
			    clientX : window.event.clientX,
			    clientY : window.event.clientY,
			    keyCode : window.event.keyCode,
			    ctrlKey : window.event.ctrlKey,
			    preventDefault : function() {
				window.event.returnValue = false;
			    },
			    stopPropagation : function() {
				window.event.cancelBubble = true;
			    }
			});
		    });
		}
	    } else {
		return function addListener(type, callback, capture) {
		    document.addEventListener(type, callback, capture);
		};
	    }
	})();

	DOM.textContent = (function() {
	    if (document.all) {
		// IE specific
		return function textContent(element, content) {
		    if (content) {
			element.innerText = content;
		    }

		    return element.innerText;
		}
	    } else {
		return function textContent(element, content) {
		    if (content) {
			element.textContent = content;
		    }

		    return element.textContent;
		}
	    }
	})();

	DOM.viewDimension = function viewDimension() {
	    var width, height;
	    if (window.innerWidth) {
		width = window.innerWidth;
	    } else if (document.documentElement && document.documentElement.clientWidth) {
		width = document.documentElement.clientWidth;
	    } else if (document.body) {
		width = document.body.clientWidth;
	    }

	    if (window.innerHeight) {
		height = window.innerHeight;
	    } else if (document.documentElement && document.documentElement.clientHeight) {
		height = document.documentElement.clientHeight;
	    } else if (document.body) {
		height = document.body.clientHeight;
	    }

	    return [ width, height ];
	};

	DOM.isElementOfType = function isElementOfType(element, tagName) {
	    return (element && element.nodeName && tagName && element.tagName.toLowerCase() == tagName.toLowerCase()) ;
	};

	DOM.isQuirksMode = function isQuirksMode() {

	    return ( (document.documentMode && document.documentMode == 5)
		     || (document.compatMode && document.compatMode == 'BackCompat')) ;
	}

	/*
	 * Use this with caution..
	 */
	DOM.isIEBrowser = function isIEBrowser() {
	    return (window.navigator.appName == 'Microsoft Internet Explorer');
	}

	// Immutable set of DOM Element Attributes
	DOM.Attributes = function(initialAttributes, additionalAttributes) {
	    var self = this, attributes = {}, attribute;

	    var set = function(moreAttributes) {
		if (moreAttributes instanceof DOM.Attributes) {
		    moreAttributes = moreAttributes.values();
		}

		for (attribute in moreAttributes) {
		    attributes[attribute] = moreAttributes[attribute];
		}
	    };

	    set(initialAttributes);
	    if (additionalAttributes) {
		set(additionalAttributes)
	    }

	    this.addStyle =  function(value) {
		var style;

		if (attributes['style']) {
		    // later inline styles override
		    style = attributes['style'] + ' ' + value;
		} else {
		    style = value;
		}

		return new DOM.Attributes(attributes, { 'style': style });
	    };

	    this.put = function(moreAttributes) {
		return new DOM.Attributes(attributes, moreAttributes)
	    };

	    this.values = function() {
		var result = {};
		for (attribute in attributes) {
		    result[attribute] = attributes[attribute];
		}
		return result;
	    }
	};
    })(DOM);
    // //

    /**
     * AJAX utility class / functions.
     */
    var AJAX = AJAX || {};

    (function(AJAX) {
	AJAX.createXmlHttpRequest = function createXmlHttpRequest() {
	    if (window.ActiveXObject) {
		return new ActiveXObject("Microsoft.XMLHTTP");
	    } else {
		return new XMLHttpRequest();
	    }
	};

	AJAX.get = function get(url, callback) {
	    return AJAX.ajax('GET', url, null, callback);
	};

	AJAX.post = function post(url, data, callback, contentType) {
	    return AJAX.ajax('POST', url, data, callback, contentType);
	};

	// @param contentType, defaults to 'application/x-www-form-urlencoded; charset=UTF-8', optional
	AJAX.ajax = function ajax(method, url, data, callback, contentType) {
	    var http = AJAX.createXmlHttpRequest();
	    var defaultContentType = 'application/x-www-form-urlencoded; charset=UTF-8';
	    if (!contentType) {
		contentType = defaultContentType;
	    }
	    if (callback) {
		// async
		http.open(method, url, true);
		if (method === 'POST') {
		    // must be set after open()
		    http.setRequestHeader('Content-type', contentType);
		}
		http.onreadystatechange = function ajaxOnReadyStateChangeHandler() {
		    if (http.readyState === 4) {
			callback(http);
		    }
		};
		http.send(data);
	    } else {
		// sync
		http.open(method, url, false);
		if (method === 'POST') {
		    // must be set after open()
		    http.setRequestHeader('Content-type', contentType);
		}
		http.send(data);

		return http;
	    }
	};
    })(AJAX);

    if (typeof window.console == 'undefined') {
	console = {
	    log : function() {
	    },
	    error : function() {
	    },
	    warn : function() {
	    },
	    info : function() {
	    },
	    dir : function() {
	    }
	}
    } else {
	console = window.console;
    }

    editAttributes = new DOM.Attributes({ 'm4pageeditcontrol': true });
    elementAttributes = editAttributes.addStyle('margin:0; padding:0; border:none; text-indent: 0px; background: none;');
    fontTypeAttributes = elementAttributes.addStyle("font-family: Helvetica Neue, Helvetica, Arial, Sans-serif;");
    normalFontAttributes = fontTypeAttributes.addStyle("font-weight:bold; font-size:12px; line-height: 10px;");

    leftBorderStyle = 'border-top-left-radius:3px; border-bottom-left-radius:3px; -moz-border-radius-topleft:3px; -moz-border-radius-bottomleft:3px; -webkit-border-top-left-radius:3px; -webkit-border-bottom-left-radius:3px;';
    rightBorderStyle = 'border-top-right-radius:3px; border-bottom-right-radius:3px; -moz-border-radius-topright:3px; -moz-border-radius-bottomright:3px; -webkit-border-top-right-radius:3px; -webkit-border-bottom-right-radius:3px;';

    editTextInputAttributes = normalFontAttributes.put({ type : 'text' }).addStyle('width: 70%; float:left; font-weight:normal;color: #747474; border:1px solid #747474; outline-style:none; outline-width:0px; margin:0; padding:2px; margin-left: 0px;').addStyle(leftBorderStyle + rightBorderStyle);
    editTitleAttributes = normalFontAttributes.addStyle("color:#fff; background-color:#333; float:left; padding:3px; border-top-left-radius:3px; border-bottom-left-radius:3px; -moz-border-radius-topleft:3px; -moz-border-radius-bottomleft:3px; -webkit-border-top-left-radius:3px; -webkit-border-bottom-left-radius:3px;");

    panelButtonAttributes = fontTypeAttributes.addStyle('height:auto; cursor:pointer; float:right; font-weight:normal; font-size:14px; background-image:none; border-radius:5px; -moz-border-radius:5px; -webkit-border-radius:5px; margin: 16px 16px 0 0; padding: 0 0 4px 0;-khtml-box-sizing: none;-webkit-box-sizing: none;-moz-box-sizing: none;box-sizing: none;text-shadow:none;');
    editButtonAttributes = normalFontAttributes.addStyle(" height:45px;float:left;  position:relative; cursor:pointer;border-top:1px solid #BDBDBD;border-left:1px solid #BDBDBD;border-right:1px solid #BDBDBD;border-bottom:1px solid #BDBDBD;color:#000;background-color:#FFF;margin: 0px;padding: 0px;");

    var closeButtonIconPath = 'http://dev.a11y.in/alipi/images/close_button.png';
    closeButtonAttributes = editButtonAttributes.addStyle('top: -8px; left: -8px; position: absolute; border:none; background: url("' + closeButtonIconPath +'") no-repeat; width: 15px; height: 15px; z-index: 2;');

    var redArrowIconPath = './images/caret_red.png';
    redArrowAttributes =  elementAttributes.addStyle('width: 8px; height: 11px;position: relative;background: url(' + redArrowIconPath + ') no-repeat; float: left;margin-top: 10px;z-index:2;left: -1px;');

    var greyArrowIconPath = './images/caret_grey.png';
    greyArrowAttributes =  elementAttributes.addStyle('z-index: 2; position: relative; width:11px; height: 7px; background: url(' + greyArrowIconPath + ') no-repeat; float: left; margin-top: 3px; margin-left: 10px; display:none;');

    popupContainerAttributes = normalFontAttributes.addStyle('position:absolute; top:0; left:0; display:none; max-height:160px; width:auto; background:transparent; z-index:2147483645;');

    buttonPanelAttributes = normalFontAttributes.addStyle('width: auto; height: 53px; float: left; position: relative;');
    actionPanelAttributes = normalFontAttributes.addStyle(leftBorderStyle + rightBorderStyle).addStyle('position: relative; top: -1px; float: left; display: none; max-height:140px; background:#BDBDBD; border: 1px solid #BDBDBD; width: auto; height: auto; color: #747474; background-color: #DBDBDB; background: -webkit-gradient(linear, 0% 100%, 0% 0%, from(#D9D9D9), to(#F6F6F6));background: -moz-linear-gradient(bottom, #D9D9D9, #F6F6F6); text-shadow: 0px 1px 0px #FFF; -moz-text-shadow: 0px 1px 0px #FFF; -webkit-text-shadow: 0px 1px 0px #FFF;');

    actionButtonAttributes = editButtonAttributes.addStyle('font-size:11px; height: 50px; margin: 0; padding-left: 5px; padding-right: 5px; left: -6px; color: #747474; background-color: #DBDBDB; background: -webkit-gradient(linear, 0% 100%, 0% 0%, from(#D9D9D9), to(#F6F6F6));background: -moz-linear-gradient(bottom, #D9D9D9, #F6F6F6); text-shadow: 0px 1px 0px #FFF; -moz-text-shadow: 0px 1px 0px #FFF; -webkit-text-shadow: 0px 1px 0px #FFF;');

    redButtonAttributes = editButtonAttributes.addStyle('font-size:11px; height: 50px; margin: 0; border:1px solid #777; -moz-border-radius-topright:3px;-moz-border-radius-bottomright:3px;-moz-border-radius-topleft:3px; -moz-border-radius-bottomleft:3px;-webkit-border-top-right-radius:3px; -webkit-border-bottom-right-radius:3px;-webkit-border-top-left-radius:3px; -webkit-border-bottom-left-radius:3px;text-shadow: 2px 1px 1px #777;-moz-text-shadow: 2px 1px 0px #777;-webkit-text-shadow: 2px 1px 0px #777;background-color: #AAA;background: -webkit-gradient(linear, 0% 100%, 0% 5%, from(#777), to(#fff));background: -moz-linear-gradient(bottom, #777, #fff);');

    editSubmitAttributes = redButtonAttributes.put({ type: 'submit', value : 'OK' }).addStyle('height:20px; width: 32px; padding-left: 5px; padding-right: 5px; margin-left: 5px;');

    undoSubmitButton = redButtonAttributes.put({ type: 'submit', value : 'undo' }).addStyle('height:20px; width: 32px; padding-left: 5px; padding-right: 5px; margin-left: 5px;');

    titleButtonImageAttributes = elementAttributes.put({src: 'https://bo.lt/app/asset/page-edit/bo_icon_28x17.png?p=622fd096a39f5c36a6e06e41a9963dafaad61079'}).addStyle('display:block; width: 28px; height: 17px; margin-left: auto;margin-right: auto; margin-top: 2px; margin-bottom: 0px;');
    titleButtonDisplayTextAttributes = fontTypeAttributes.addStyle('text-align: center; height: auto; color: #FFF; display:block; margin-left: auto;margin-right: auto; margin-top: 5px; margin-bottom: 5px; font-style: normal; font-size: 11px; text-shadow: 2px 1px 1px #777 -moz-text-shadow: 2px 1px 0px #777;-webkit-text-shadow: 2px 1px 0px #777;');

    actionButtonImageAttributes = elementAttributes.addStyle('width: 16px; height: 17px; margin-left: auto; margin-right: auto; margin-top: 5px; padding-top: 2px; padding-bottom: 0px; margin-bottom: 0px; display:block;');
    actionButtonDisplayTextAttributes = fontTypeAttributes.addStyle('text-align: center; height: auto;  color: #777; text-shadow: 0px 1px 0px #FFF; -moz-text-shadow: 0px 1px 0px #FFF; -webkit-text-shadow: 0px 1px 0px #FFF; font-size: 11px; margin-left: auto;margin-right: auto; margin-top: 5px; margin-bottom: 5px; padding-left: 10px; padding-right: 10px; width: auto; display:block;');


    createActionButton = function createActionButton(buttonImage, displayText, buttonStyle) {
	var image = DOM.BUILDER.IMG(actionButtonImageAttributes.put({src: buttonImage}).values());
	var text = DOM.BUILDER.SPAN(actionButtonDisplayTextAttributes.values());
	text.innerHTML = displayText;
	var button = DOM.BUILDER.BUTTON(actionButtonAttributes.addStyle(buttonStyle).values());
	button.appendChild(image);
	button.appendChild(text);
	return button;
    };

    var createTitleButton = function createTitleButton(displayText, buttonStyle) {
	var image = DOM.BUILDER.IMG(titleButtonImageAttributes.values());
	var text = DOM.BUILDER.SPAN(titleButtonDisplayTextAttributes.values());
	text.innerHTML = displayText;
	var button = DOM.BUILDER.BUTTON(redButtonAttributes.addStyle(buttonStyle).addStyle(leftBorderStyle + rightBorderStyle).values());
	button.appendChild(image);
	button.appendChild(text);
	return button;
    };

    var displayUpArrowUnderButton = function displayUpArrowUnderButton(button, upArrow){
	upArrow.style.display = 'block';
	upArrow.style.marginLeft = (button.offsetLeft + button.offsetWidth/2) + 'px';
    };

    AjaxResultProcessor = function AjaxResultProcessor() {
	this.processSwitchModeResponse = function processSwitchModeResponse(result) {
	    if (result.status == 200) {
		window.location.href = eval("(" + result.responseText + ")").switchModeRedirectUrl;
	    } else {
		pageEditor.showMessage(result.statusText);
	    }
	};


	this.processPublishedResponse = function processPublishedResponse(result) {
	    var resultString = result.responseText;
	    if (resultString == 'ok'){
		alert("Re-narration successfuly posted");
		window.location.reload();
	    }
	    else{
		console.warn(resultString);
		alert("Re-narration failed, please try later!");
	    }
	};
    };


    M4ImageElement = function M4ImageElement(element) {
	var self = this;

	if (typeof element.m4boltOriginalWidth == 'undefined') {
	    element.m4boltOriginalWidth = element.width;
	}
	if (typeof element.m4boltOriginalHeight == 'undefined') {
	    element.m4boltOriginalHeight = element.height;
	}

	this.getOriginalSize = function getOriginalSize() {
	    return { width: element.m4boltOriginalWidth, height: element.m4boltOriginalHeight };
	};

	this.setRawImageSize = function setRawImageSize(size) {
	    element.m4boltRawImageWidth = size.width;
	    element.m4boltRawImageHeight = size.height;

	    return self;
	};

	this.getRawImageSize = function getRawImageSize() {
	    if (typeof element.m4boltRawImageWidth == 'undefined' || typeof element.m4boltRawImageHeight == 'undefined') {
		return { width : 0, height: 0 };
	    }
	    return { width : element.m4boltRawImageWidth, height : element.m4boltRawImageHeight };
	};

	this.getFittedSize = function getFittedSize() {
	    var size = self.getRawImageSize(), original = self.getOriginalSize();

	    if (size.width > original.width) {
		size.height = size.height * (original.width / size.width);
		size.width = original.width;
	    }
	    if (size.height > original.height) {
		size.width = size.width * (original.height / size.height);
		size.height = original.height;
	    }
	    size.height = Math.floor(size.height);
	    size.width = Math.floor(size.width);

	    return size;
	};

	this.isFittable = function isFittable() {
	    return (typeof element.m4boltRawImageWidth != 'undefined' && element.m4boltRawImageWidth > element.m4boltOriginalWidth)
		|| (typeof element.m4boltRawImageHeight != 'undefined' && element.m4boltRawImageHeight > element.m4boltOriginalHeight);
	};
    };

    SplashWindow = function SplashWindow(pageEditor ) {

	var self = this, messageOverlay, editButton, hideOverlayCheckbox, messageDescription, messageTitle, loadingImage, loadingText, loadingDiv;

	// because PageEditor is activated on "onload", we show a loading panel until
	// onload finally fires, which can be a while if any resource on the page is
	// slow to load.

	backgroundDiv = DOM.BUILDER.DIV(elementAttributes.put({id : 'bgdiv'}).addStyle(' z-index: 2147483646; width: 100%; height: 100%; min-height: 800px; min-width: 1024px; left: 0; top: 0; position: fixed; display: none; -ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=87)"; filter: alpha(opacity=87); background: #fff; background: -webkit-gradient(radial, center 40%, 900, center 40%, 0, from(rgba(0, 0, 0, 0.1)), to(rgba(0, 0, 0, 0.87))); background: -moz-radial-gradient( center 40%, circle , rgba(255, 255, 255, 0) 0px , rgba(255, 255, 255, 255) 900px);').values());

	messageOverlay = DOM.BUILDER.DIV(elementAttributes.put({id : 'msgoverlay'}).addStyle('z-index: 2147483647;opacity: 1.0; box-shadow: 0px 0px 5px #000; -webkit-box-shadow: 0px 0px 5px #000; -moz-box-shadow: 0px 0px 5px #000; -moz-border-radius:10px; -webkit-border-radius:10px; position:fixed; left:25%; top:25%; bottom:25%; right:25%; background:#000; display:none;').values());

	messageTitle = DOM.BUILDER.H1(normalFontAttributes.addStyle('position:fixed; top:27%; left:44.5%; color:#FFF; font-size:200%; line-height:120%; font-weight:normal; text-decoration:none;').values(), 'Page Editor');

	messageOverlay.appendChild(messageTitle);

	messageDescription = DOM.BUILDER.TEXTAREA(normalFontAttributes.put({readonly:true}).addStyle('position:fixed; top:40%; left:27.5%; min-width:48%; max-width:48%; min-height:48%; max-height:48%; text-align:justify; color:#FFF; font-weight: normal; font-size:105%; line-height:130%;').values(), 'Click on any part of the page, and you will activate buttons that allow you to modify text, replace images and add audio. Don\'t forget to hit "Publish" when you\'re finished editing so we can save your newly-crafted page... And at any moment if you need help then hit a "Help" button.');

	messageOverlay.appendChild(messageDescription);

	var text = DOM.BUILDER.SPAN(normalFontAttributes.addStyle('position:fixed; bottom:29.5%; left:43%; font-size:120%;').values(), 'OK');

	editButton = DOM.BUILDER.BUTTON(panelButtonAttributes.addStyle('position:fixed; left:40%; bottom:28%; color:#FFF; width:8%; height:5%; background: #777; background: -webkit-gradient(linear, left bottom, left top, color-stop(0, #777), color-stop(1, #fff)); background: -moz-linear-gradient(center bottom, #777 0%, #fff 100%); border: 1px solid #777; border-radius: 3px; border: 1px solid #777; box-shadow: #fff 0px 0px 2px 0px inset, rgba(0, 0, 0, .5) 0px 0px 2px 0px; -moz-box-shadow:#fff 0px 0px 2px 0px inset, rgba(0, 0, 0, .5) 0px 0px 2px 0px; -webkit-box-shadow:#fff 0px 0px 2px 0px inset, rgba(0, 0, 0, .5) 0px 0px 2px 0px;').values());
	editButton.onclick = function loadingEditButtonOnClick() {
	    self.hide();
	    return false;
	};

	editButton.appendChild(text);
	messageOverlay.appendChild(editButton);


	hideOverlayCheckbox = DOM.BUILDER.INPUT(editAttributes.put({ id:'hideoverlay', name:'Loading Checkbox', type:'checkbox', checked:'yes'}).addStyle('position:fixed; bottom:29%; right:48%; background: transparent; display: inline-block;').values());

	var checkboxLabel = DOM.BUILDER.LABEL(normalFontAttributes.addStyle('position:fixed; left:52.5%; bottom:29.5%; font-size:80%; font-weight:bold;  transparent; color: #FFF;display: inline-block;').values());
	checkboxLabel.innerHTML = 'Don\'t show this again.';


	messageOverlay.appendChild(DOM.BUILDER.DIV(elementAttributes.addStyle('margin-left: 10px; margin-right: 10px;').values(), hideOverlayCheckbox, checkboxLabel));
	editButton.appendChild(text);
	messageOverlay.appendChild(editButton);

	document.body.appendChild(backgroundDiv);
	document.body.appendChild(messageOverlay);


	this.show = function show( textToDisplay) {

	    if (textToDisplay) {
		DOM.textContent(loadingText, textToDisplay);
	    }
	    backgroundDiv.style.display = 'block';
	};
	
	this.hide = function hide() {
	    if (hideOverlayCheckbox.checked) {
		document.cookie ='m4.show.redbar.overlay=no;'
	    } else {
		var date = new Date();
		document.cookie ='m4.show.redbar.overlay=no;expires=' + date.toUTCString() + ';';
	    }

	    messageOverlay.style.display = 'none';
	    backgroundDiv.style.display = 'none';
	};

	this.activate = function activate() {
	    /*
	     *  Cookie logic is temporary. This needs to be part of a user preference.
	     *  Bug http://bugzilla.boltnet.com/bugzilla/boltnet/show_bug.cgi?id=2962
	     *  created for this purpose.
	     */
	    var allCookies = document.cookie;
	    if (allCookies.indexOf('m4.show.redbar.overlay=no') == -1) {
		messageOverlay.style.display = 'block';
	    }  else {
		self.hide();
	    }
	};
    } ;


    //------------------------------------ Target UI --------------------------------------------
    TargetWindow = function TargetWindow(pageEditor ) {

	var self = this, messageOverlay, editButton, hideOverlayCheckbox, messageDescription, messageTitle, loadingImage, loadingText, loadingDiv;
	tooltip = new DOM.Attributes({ 'title': 'Check this if you want to post to our blog. That is "http://alipi-workshop.blogspot.com/"'});

	backgroundDiv = DOM.BUILDER.DIV(elementAttributes.put({id : 'targetbgdiv'}).addStyle(' z-index: 2147483646; width: 100%; height: 100%; left: 0; top: 0; position: fixed; display: none; -ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=87)"; filter: alpha(opacity=87); background: #fff; background: -webkit-gradient(radial, center 40%, 900, center 40%, 0, from(rgba(0, 0, 0, 0.1)), to(rgba(0, 0, 0, 1))); background: -moz-radial-gradient( center 40%, circle , rgba(255, 255, 255, 0) 0px , rgba(255, 255, 255, 255) 900px);').values());

	messageOverlay = DOM.BUILDER.DIV(elementAttributes.put({id : 'targetoverlay'}).addStyle('z-index: 2147483647;opacity: 1.0; box-shadow: 0px 0px 5px #000; -webkit-box-shadow: 0px 0px 5px #000; -moz-box-shadow: 0px 0px 5px #000; -moz-border-radius:10px; -webkit-border-radius:10px; position:fixed; left:15%; top:15%; bottom:15%; right:15%; background:#000; display:none; vertical-align:middle;').values());

	step1 = DOM.BUILDER.H1(normalFontAttributes.addStyle('position:fixed; top:16%; left:40%; color:#FFF; font-size:100%; line-height: 36px; font-weight: bold; display: block; ').values(), 'Please provide all the details below');

	messageOverlay.appendChild(step1);

	var image = DOM.BUILDER.IMG(normalFontAttributes.put({src: 'http://dev.a11y.in/alipi/images/close_button.png'}).addStyle('position:fixed; top:13.5%; right:14%; width:25px; height:25px;').values());
	var text = DOM.BUILDER.SPAN(normalFontAttributes.addStyle('position: relative; line-height: 18px; height: 18px; font-size: 18px; margin-right: auto; vertical-align: middle;display: inline-block; float: none;').values(), 'OK');

	image.onclick=function(){
	    document.body.removeChild(document.getElementById('targetoverlay'));
	    document.body.removeChild(document.getElementById('targetbgdiv'));
	}


	//---------------------------- state & language target --------------------------
	locSelectLabel = DOM.BUILDER.LABEL(normalFontAttributes.addStyle('position:fixed; top:44%; left:25%; font-weight: bold; background: transparent; color: #FFF;').values());
	locSelectLabel.innerHTML = 'Select any state from the list';
	enterMailIdLabel = DOM.BUILDER.LABEL(normalFontAttributes.addStyle('position:fixed; top:44%; left:53.5%; font-weight: bold; background: transparent; color: #FFF;').values());
	enterMailIdLabel.innerHTML = 'Select any style from the list';


	locSelectAttributes = panelButtonAttributes.put({ id : 'loc-select'}).addStyle('position:fixed; top:45%; left:25%; width:20%; color:#FFF; text-align:center; background: #222; border:3px solid; border-radius:3px; -moz-border-radius:3px; -webkit-border-radius:3px; font-size:14px;').values();
	styleSelectAttributes = panelButtonAttributes.put({id : 'style-select'}).addStyle('position:fixed; top:45%; right:25%; width:20%; color:#FFF; text-align:center; background: #222; border:3px solid; border-radius:3px; -moz-border-radius:3px; -webkit-border-radius:3px; font-size:14px;').values();


	langSelectLabel = DOM.BUILDER.LABEL(normalFontAttributes.addStyle('position:fixed; top:59%; left:25%; font-weight: bold; background: transparent; color: #FFF;display: inline-block;').values());
	langSelectLabel.innerHTML = 'Languages of selected/all state(s)';
	authorLabel = DOM.BUILDER.LABEL(normalFontAttributes.addStyle('position:fixed; top:59%; left:53.5%; font-weight: bold; background: transparent; color: #FFF;display: inline-block;').values());
	authorLabel.innerHTML = 'Author name';

	langSelectAttributes = panelButtonAttributes.put({ id : 'lang-select'}).addStyle('position:fixed; top:60%; left:25%; width:20%; color:#FFF; text-align:center; background: #222; border:3px solid; border-radius:3px; -moz-border-radius:3px; -webkit-border-radius:3px; font-size:14px;').values();
	authorAttributes = DOM.BUILDER.INPUT(editAttributes.put({ id : 'author', placeholder:'E.g:- John Doe'}).addStyle('position:fixed; top:62.6%; right:26.2%; width:20%; color:#FFF; text-align:center; background: #222; border:3px solid; border-radius:3px; -moz-border-radius:3px; -webkit-border-radius:3px; font-size:14px;').values());

	blogLabel = DOM.BUILDER.LABEL(normalFontAttributes.addStyle('position:fixed; top:25%; left:20%; min-width:60%; max-width:60%; font-weight: bold; background: transparent; color: #FFF; line-height:100%;').values());
	blogLabel.innerHTML = 'If you have blogspot ID and want to post the changes to that blog then check "My blog" or you want to post to our blog then check "Our blog". If you have doubt then go with the default option.';

	ourBlogAttributes = DOM.BUILDER.INPUT(editAttributes.put({id : 'ourcheck', name : 'Loading Checkbox', type : 'radio', checked:'yes'}).addStyle('position:fixed; top:31.6%; left:30%; background: transparent; display: inline-block;').values());
	ourBlogLabel = DOM.BUILDER.LABEL(tooltip.addStyle('position:fixed; top:32%; left:33%; background: transparent; color: #FFF;display: inline-block; text-align:center; font-size:80%; font-weight: bold;').values());
	ourBlogLabel.innerHTML = 'Our blog  [?]';

	myBlogAttributes = DOM.BUILDER.INPUT(editAttributes.put({id : 'mycheck', name : 'Loading Checkbox', type : 'radio'}).addStyle('position:fixed; top:32%; left:57%; background: transparent; display: inline-block;').values());
	myBlogLabel = DOM.BUILDER.LABEL(normalFontAttributes.addStyle('position:fixed; top:32.5%; left:60%; background: transparent; color: #FFF;display: inline-block; text-align:center; font-size:80%; font-weight: bold;').values());
	myBlogLabel.innerHTML = 'My blog';

	//-----------------------------End of state & language target -------------------

	okButton = DOM.BUILDER.BUTTON(panelButtonAttributes.addStyle('position:fixed; right:20%; bottom:18.5%; color:#FFF; margin:auto; width: 100px; height: 36px; display: block; background: #777; background: -webkit-gradient(linear, left bottom, left top, color-stop(0, #777), color-stop(1, #fff)); background: -moz-linear-gradient(center bottom, #777 0%, #fff 100%); border: 1px solid #777; border-radius: 3px; border: 1px solid #777; box-shadow: #fff 0px 0px 2px 0px inset, rgba(0, 0, 0, .5) 0px 0px 2px 0px; -moz-box-shadow:#fff 0px 0px 2px 0px inset, rgba(0, 0, 0, .5) 0px 0px 2px 0px; -webkit-box-shadow:#fff 0px 0px 2px 0px inset, rgba(0, 0, 0, .5) 0px 0px 2px 0px;').values());

	this.okClick = function okClick() {
	    if(document.getElementById('loc-select').value == '--Locations--' || document.getElementById('lang-select').value == '---Languages---' || document.getElementById('style-select').value == '---Style---') {
		alert('Please select a Location, Language & Style');
	    }
	    else {
		overlayBar = new OverlayBar(pageEditor);
		overlayBar.blogpost();
		messageOverlay.style.display = 'none';
		backgroundDiv.style.display = 'none';

	    }
	};

	okButton.appendChild(text);
	messageOverlay.appendChild(okButton);
	messageOverlay.appendChild(image);

	
	//---------------------------------------------start locLang, locSelect & styleSelect -----------------------
	styleSelect = DOM.BUILDER.SELECT(styleSelectAttributes);

	style_list={"stylename":[{"name":"---Style---"},{"name":"Simplication"},{"name":"Abstract"},{"name":"Translation"},{"name":"Funny"},{"name":"Children"}]}
	for(var i=0;i<style_list.stylename.length;i++)
	{
	    y=DOM.BUILDER.OPTION(style_list.stylename[i].name);
	    styleSelect.appendChild(y);
	}

	//---------------------------------------------start locLang & locSelect -----------------------

	locSelect = DOM.BUILDER.SELECT(locSelectAttributes);
	langSelect = DOM.BUILDER.SELECT(langSelectAttributes);

	var xhrloc = new XMLHttpRequest();
	xhrloc.onreadystatechange = function()
    	{
    	    if(xhrloc.readyState == 4)
    	    {
		if (xhrloc.status == 200)
    		{
    		    json= JSON.parse(xhrloc.responseText);
		    /* parsing json response*/ 
		    var loc=[];
		    var texts=[];
		    loc.push('--Locations--');
		    texts.push('---Languages---');
		    var locations = json["state"];
		    for(var i=0; i< locations.length;i++)
		    {
			loc.push(locations[i]["name"]);
		    }
		    loc.push('None of the above');
      		    for(i=0;i<loc.length;i++)	{
	      		x=DOM.BUILDER.OPTION(loc[i]);
	      		locSelect.add(x,null);
	  	    }
		    
		    locSelect.onchange=function(){
                        var locindex=locSelect.selectedIndex;
			locName=loc[locindex];
			if(texts.length>1)
			{
			    for(var i=texts.length;i>1;i--){
				texts.pop()
			    }
			}
            		if(locName!='None of the above'){
			    for(var i=0;i<locations[locindex-1]["lang"].length;i++){
				texts.push(locations[locindex-1].lang[i]);
			    }
			   texts.push("---More---");
			    if(langSelect.firstChild==null){
				for(var vp=0;vp<texts.length;vp++)
				{	
                		    var op = document.createElement('option');
                		    op.text = texts[vp];
                		    langSelect.appendChild(op);
				}//end for
			    }//end if
			    else{
				while(langSelect.firstChild!=null){
				    langSelect.removeChild(langSelect.firstChild);
				}//end while
				for(var vp=0;vp<texts.length;vp++)
				{
				    
                		    var op = document.createElement('option');
                		    op.text = texts[vp];
                		    langSelect.appendChild(op);
				}//end for
			    }//end else 		
			    
			}//end if
			else{
			    while(langSelect.firstChild!=null){
				langSelect.removeChild(langSelect.firstChild);
			    }//end while
			    for(var i=0;i<locations.length;i++)
			    {	for (var j=0; j<locations[i].lang.length; j++)
				{ 
				    texts.push(locations[i].lang[j]);
				    texts.sort();
				    for(var k=1;k<texts.length;k++){
					if (texts[k] === texts[k-1]){ 
					    texts.splice(k, 1);
					    k--;
					}	
				    }
				    
				}//end inner for
			    }//end main for
			    for(var z=0; z<texts.length; z++)
			    { 
				var op = document.createElement('option');
				op.text=texts[z];
				langSelect.appendChild(op);
			    }
			}//end else
			
		    }//end onchange
		    langSelect.onchange=function(){
                        var langindex=langSelect.selectedIndex;
			langName=texts[langindex];
			if(langName=='---More---'){
			    while(langSelect.firstChild!=null){
				langSelect.removeChild(langSelect.firstChild);
			    }//end while
				texts.pop();
			    for(var i=0;i<locations.length;i++)
			    {	for (var j=0; j<locations[i].lang.length; j++)
				{ 
				    texts.push(locations[i].lang[j]);
				    texts.sort();
				    for(var k=1;k<texts.length;k++){
					if (texts[k] === texts[k-1]){ 
					    texts.splice(k, 1);
					    k--;
					}	
				    }
				    
				}//end inner for
			    }//end main for
			    for(var z=0; z<texts.length; z++)
			    { 
				var op = document.createElement('option');
				op.text=texts[z];
				langSelect.appendChild(op);
			    }
			}
		    }//end onchange
    		}
		
    		/* end parsing json response*/ 
		
    		else {
    		    alert("couldn't get data file: error number "+xhrloc.status);
    		}
    	    }
    	}
	
	xhrloc.open("GET","http://dev.a11y.in/getData",true);
	xhrloc.send();



	//---------------------------------------------end locLang & locSelect ------------------------

	//-------------------------------------------- start blog details ---------------------------
	ourBlog = ourBlogAttributes;
	myBlog = myBlogAttributes;
	author = authorAttributes;
	//-------------------------------------------- end blog details ------------------------------


	messageOverlay.appendChild(DOM.BUILDER.DIV(elementAttributes.addStyle('margin-left: 10px; margin-right: 10px;').values(), locSelect, locSelectLabel, langSelect, langSelectLabel, ourBlog, ourBlogLabel, myBlog, myBlogLabel, enterMailIdLabel, styleSelect, author, authorLabel, blogLabel));
	okButton.appendChild(text);
	messageOverlay.appendChild(okButton);

	document.body.appendChild(backgroundDiv);
	document.body.appendChild(messageOverlay);


	this.show = function show( textToDisplay) {

	    if (textToDisplay) {
		DOM.textContent(textToDisplay);
	    }
	};

	this.activate = function activate() {
	    backgroundDiv.style.display = 'block';
	    messageOverlay.style.display = 'block';
	};
    };

    // ------------------------------------ Target UI end ---------------------------------------------

// ========================================== Edit Window start ======================================================


    EditWindow = function EditWindow(pageEditor) {

	var self = this, messageOverlay, editButton, hideOverlayCheckbox, messageDescription, messageTitle, loadingImage, loadingText, loadingDiv, textElementPopup;


	backgroundDiv = DOM.BUILDER.DIV(elementAttributes.put({id : 'editorbgdiv'}).addStyle(' z-index: 2147483646; width: 100%; height: 100%; min-height: 800px; min-width: 1024px; left: 0; top: 0; position: fixed; display: none; -ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=87)"; filter: alpha(opacity=87); background: #fff; background: -webkit-gradient(radial, center 40%, 900, center 40%, 0, from(rgba(0, 0, 0, 0.1)), to(rgba(0, 0, 0, 0.87))); background: -moz-radial-gradient( center 40%, circle , rgba(255, 255, 255, 0) 0px , rgba(255, 255, 255, 255) 900px);').values());


	messageOverlay = DOM.BUILDER.DIV(elementAttributes.put({id : 'editoroverlay'}).addStyle('z-index: 2147483647;opacity: 1.0; box-shadow: 0px 0px 5px #000; -webkit-box-shadow: 0px 0px 5px #000; -moz-box-shadow: 0px 0px 5px #000; -moz-border-radius:10px; -webkit-border-radius:10px; position:fixed; left:10%; top:15%; bottom:10%; right:10%; background:#000; display:none;').values());


	leftEditor = DOM.BUILDER.H1(normalFontAttributes.addStyle('position:fixed; top:23%; left:27%; color:#FFF; font-size:150%; line-height:120%; font-weight:normal; text-decoration:none;').values(), 'Reference');

	rightEditor = DOM.BUILDER.H1(normalFontAttributes.addStyle('position:fixed; top:23%; right:28%; color:#FFF; font-size:150%; line-height:120%; font-weight:normal; text-decoration:none;').values(), 'Editor');

	messageOverlay.appendChild(leftEditor);
	messageOverlay.appendChild(rightEditor);

	messageDescription = DOM.BUILDER.TEXTAREA(normalFontAttributes.put({id : 'originaltext', readonly:'yes'}).addStyle('position:fixed; top:35%; left:13%; text-align:justify; color:#FFF; font-weight: normal; font-size:90%; line-height:130%; min-width:35%; min-height:43%; max-width:35%; max-height:43%; box-shadow: 0px 0px 5px #aaa; -webkit-box-shadow: 0px 0px 5px #aaa; -moz-box-shadow: 0px 0px 5px #aaa; -moz-border-radius:10px; -webkit-border-radius:10px; padding:5px;').values());

	textArea = DOM.BUILDER.TEXTAREA(normalFontAttributes.put({id : 'texteditor'}).addStyle('position:fixed; top:35%; left:52%; text-align:justify; color:#a84; font-weight: normal; font-size:90%; line-height:130%; max-width:35%; max-height:43%; min-width:35%; min-height:43%; box-shadow: 0px 0px 5px #aaa; -webkit-box-shadow: 0px 0px 5px #aaa; -moz-box-shadow: 0px 0px 5px #aaa; -moz-border-radius:10px; -webkit-border-radius:10px; padding:5px;').values());

	messageOverlay.appendChild(messageDescription);
	messageOverlay.appendChild(textArea);

	var text = DOM.BUILDER.SPAN(normalFontAttributes.addStyle('position:fixed; bottom:13.7%; left:49%; font-size:120%;').values(), 'OK');
	var image = DOM.BUILDER.IMG(normalFontAttributes.put({src: 'http://dev.a11y.in/alipi/images/close_button.png'}).addStyle('position:fixed; top:13%; right:9%; width:25px; height:25px;').values());

	okButton = DOM.BUILDER.BUTTON(panelButtonAttributes.addStyle('position:fixed; left:46%; bottom:12%; color:#FFF; width:8%; height:5%; background: #777; background: -webkit-gradient(linear, left bottom, left top, color-stop(0, #777), color-stop(1, #fff)); background: -moz-linear-gradient(center bottom, #777 0%, #fff 100%); border: 1px solid #777; border-radius: 3px; border: 1px solid #777; box-shadow: #fff 0px 0px 2px 0px inset, rgba(0, 0, 0, .5) 0px 0px 2px 0px; -moz-box-shadow:#fff 0px 0px 2px 0px inset, rgba(0, 0, 0, .5) 0px 0px 2px 0px; -webkit-box-shadow:#fff 0px 0px 2px 0px inset, rgba(0, 0, 0, .5) 0px 0px 2px 0px;').values());
	okButton.onclick = function loadingOkButtonOnClick() {
	    textElement = new TextElementPopup(pageEditor);
	    textElement.variable();
	};

	image.onclick=function(){
	    document.body.removeChild(document.getElementById('editoroverlay'));
	    document.body.removeChild(document.getElementById('editorbgdiv'));
	}

	okButton.appendChild(text);
	messageOverlay.appendChild(okButton);
	messageOverlay.appendChild(image);

	messageOverlay.appendChild(DOM.BUILDER.DIV(elementAttributes.addStyle('margin-left: 10px; margin-right: 10px;').values()));
	okButton.appendChild(text);
	messageOverlay.appendChild(okButton);

	document.body.appendChild(backgroundDiv);
	document.body.appendChild(messageOverlay);


	this.show = function show( textToDisplay) {

	    if (textToDisplay) {
		DOM.textContent(loadingText, textToDisplay);
	    }

	    backgroundDiv.style.display = 'block';
	};
	
	this.activate = function activate() {
	    backgroundDiv.style.display = 'block';
	    messageOverlay.style.display = 'block';
	};
    } ;



// =========================================== Edit Window end =======================================================

// ========================================== Help Window Start =================================================

    HelpWindow = function HelpWindow(pageEditor ) {

	var self = this, messageOverlay, editButton, hideOverlayCheckbox, messageDescription, messageTitle, loadingImage, loadingText, loadingDiv;

	backgroundDiv = DOM.BUILDER.DIV(elementAttributes.put({id : 'helpbgdiv'}).addStyle(' z-index: 2147483646; width: 100%; height: 100%; min-height: 800px; min-width: 1024px; left: 0; top: 0; position: fixed; display: none; -ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=87)"; filter: alpha(opacity=87); background: #fff; background: -webkit-gradient(radial, center 40%, 900, center 40%, 0, from(rgba(0, 0, 0, 0.1)), to(rgba(0, 0, 0, 0.87))); background: -moz-radial-gradient( center 40%, circle , rgba(255, 255, 255, 0) 0px , rgba(255, 255, 255, 255) 900px);').values());

	messageOverlay = DOM.BUILDER.DIV(elementAttributes.put({id : 'helpmsgoverlay'}).addStyle('z-index: 2147483647;opacity: 1.0; box-shadow: 0px 0px 5px #000; -webkit-box-shadow: 0px 0px 5px #000; -moz-box-shadow: 0px 0px 5px #000; -moz-border-radius:10px; -webkit-border-radius:10px; position:fixed; left:10%; top:15%; bottom:10%; right:10%; background:#000; display:none;').values());

	messageTitle = DOM.BUILDER.H1(normalFontAttributes.addStyle('position:fixed; top:17%; left:44.5%; color:#FFF; font-size:200%; line-height:120%; font-weight:normal; text-decoration:none;').values(), 'Help Window');

	messageOverlay.appendChild(messageTitle);

	messageDescription = DOM.BUILDER.TEXTAREA(normalFontAttributes.put({readonly:true}).addStyle('position:fixed; top:25%; left:14%; min-width:72%; max-width:72%; min-height:50%; max-height:50%; text-align:justify; color:#FFF; font-weight: normal; font-size:105%; line-height:130%;').values(), "TEXT:- \n\t Editor - It will popup a window and allow you to modify/replace text of select element on editor(right) box. \n\t\t To delete - Empty the editor(right) box and press 'OK'. \n\t See narrations - If the selected element has other narrations then it will list, on click. \n\t Audio - It allows you to enter audio URL. \n\n IMAGE:- \n\t Replace - It allows you to enter image URL. \n\t See narrations -  If the selected element has other image narration then it will show, on click. \n\n UNDO:- Use it when you want to revert back to previous change. \n\t  Revert deleted - Press 'Undo' button twice. \n\n PUBLISH:- To publish your crafted changes to database and blog (our/your). \n\t States - To the place you are targetting. \n\t Languages - In language you publishing. \n\t Style - In what style you crafted? \n\t Author - Who is a crafter? \n\t Our blog - If you don't have blogspot ID then check this to post it to our blog.");

	messageOverlay.appendChild(messageDescription);

	var text = DOM.BUILDER.SPAN(normalFontAttributes.addStyle('position:fixed; bottom:14.5%; left:49%; font-size:120%;').values(), 'OK');

	editButton = DOM.BUILDER.BUTTON(panelButtonAttributes.addStyle('position:fixed; left:46%; bottom:13%; color:#FFF; width:8%; height:5%; background: #777; background: -webkit-gradient(linear, left bottom, left top, color-stop(0, #777), color-stop(1, #fff)); background: -moz-linear-gradient(center bottom, #777 0%, #fff 100%); border: 1px solid #777; border-radius: 3px; border: 1px solid #777; box-shadow: #fff 0px 0px 2px 0px inset, rgba(0, 0, 0, .5) 0px 0px 2px 0px; -moz-box-shadow:#fff 0px 0px 2px 0px inset, rgba(0, 0, 0, .5) 0px 0px 2px 0px; -webkit-box-shadow:#fff 0px 0px 2px 0px inset, rgba(0, 0, 0, .5) 0px 0px 2px 0px;').values());
	editButton.onclick = function loadingEditButtonOnClick() {
	    document.body.removeChild(document.getElementById('helpbgdiv'));
	    document.body.removeChild(document.getElementById('helpmsgoverlay'));
	};

	editButton.appendChild(text);
	messageOverlay.appendChild(editButton);


	messageOverlay.appendChild(DOM.BUILDER.DIV(elementAttributes.addStyle('margin-left: 10px; margin-right: 10px;').values()));
	editButton.appendChild(text);
	messageOverlay.appendChild(editButton);

	document.body.appendChild(backgroundDiv);
	document.body.appendChild(messageOverlay);


	this.show = function show( textToDisplay) {
	    
	    if (textToDisplay) {
		DOM.textContent(loadingText, textToDisplay);
	    }
	};
	
	this.activate = function activate() {
	    backgroundDiv.style.display = 'block';
	    messageOverlay.style.display = 'block';
	};

    } ;



// ========================================= Help Window end ===================================================
    /*
     * Control for displaying/hiding an action panel that appears below the popup buttons.
     */
    PopupActionControl = function PopupActionControl(actionSlot ) {

	this.open = function open(actionPanel) {
	    if (actionSlot.firstChild) {
		actionSlot.replaceChild(actionPanel, actionSlot.firstChild);
	    } else {
		actionSlot.appendChild(actionPanel);
	    }
	    actionSlot.style.display = "block";
	};

	this.close = function close() {
	    actionSlot.style.display = "none";
	};
    } ;

    /*
     * control for displaying/hiding the popup buttons.
     */
    PopupControl = function PopupControl(pageEditor, rootElement, showAtCursor) {
	var self = this, selectedElement = null;
	var offsetX = 3, offsetY = 3;
	var popX = 0, popY = 0;
	var currentAction = null;

	var blurListener = function blurListener(saveChanges) {
	    self.close(saveChanges);
	};

	this.onOpen = function onOpen(selectedElement) {
	};

	this.onClose = function onClose(saveChanges) {
	};

	this.openAt = function openAt(atElement, x, y) {
	    var dimension = DOM.viewDimension(), popupWidth, popupHeight;
	    popX = x;
	    selectedElement = atElement;
	    var position = DOM.findPosition(atElement);
	    popY = position.y + selectedElement.offsetHeight + 15;
	    var type = selectedElement.getAttribute('m4pageedittype');
	    if (showAtCursor) {
		popY = y;
	    }
	    // To calculate the width, the element needs to be shown. So we move it off the screen temporarily.
	    rootElement.style.left = '-10000px';
	    rootElement.style.top = '-10000px';
	    rootElement.style.width = 'auto';
	    rootElement.style.display = 'block';
	    var popupSize = DOM.findSize(rootElement);
	    popupWidth = DOM.findSize(rootElement).width;
	    // FF sometimes needs 1 pixel buffer. IE doesn't like it.
	    if (!rootElement.currentStyle) {
		popupWidth = popupWidth + 1;
	    }

	    rootElement.style.width = popupWidth + 'px';
	    // If not enough space exist on the right on cursor, launch on the left side instead.
	    if ((popX + popupWidth) > dimension[0]) {
		popX = dimension[0] - popupWidth - 3;
		if (popX < 0) {
		    popX = 0;
		}
	    }

	    rootElement.style.left = popX + 'px';
	    rootElement.style.top = popY + 'px';
	    pageEditor.loseFocus();
	    pageEditor.addFocusListener(blurListener);
	    self.onOpen(selectedElement);
	};

	// @param saveChanges, save the current changes, default false, optional
	this.close = function close(saveChanges) {
	    self.onClose(saveChanges);
	    self.hideAction();
	    rootElement.style.left = '0px';
	    rootElement.style.top = '0px';
	    rootElement.style.display = 'none';
	    pageEditor.removeFocusListener(blurListener);
	    if (saveChanges) {
		pageEditor.saveAndClose();
	    } else {
		pageEditor.close();
	    }
	    selectedElement = null;
	};

	this.showAction = function showAction(popupAction) {
	    self.hideAction();
	    if (popupAction) {
		currentAction = popupAction;
		currentAction.open(selectedElement);
	    }
	};

	this.hideAction = function hideAction() {
	    if (currentAction) {
		currentAction.close();
	    }
	}
    };

    /*
     * Action for editing a hyperlink.
     */

    function renAction(pageEditor, actionSlot) {
	var self = this, renInput,renDiv,selectedElement,renActionControl,optionInput,v,x,i,undoButton,element,vxpath,vdata, varray=[],previousData,xpath;
	
	renActionControl = new PopupActionControl(actionSlot);      
	
	this.open = function open(element) {

	    renInput = DOM.BUILDER.SELECT(editTextInputAttributes.addStyle('margin-left: 5px; background: #FFFFFF;').addStyle(leftBorderStyle + rightBorderStyle).values());
	    
	    undoButton=DOM.BUILDER.INPUT(undoSubmitButton.addStyle('vertical-align: middle; float:left;  margin-left: 5px; margin-right: auto;').values());
	    
	    renDiv = DOM.BUILDER.DIV(popupContainerAttributes.addStyle('overflow: hidden !important; display: none;position: relative; margin-left: auto; margin-right: auto; margin-top: 5px; margin-bottom: 5px; height: auto !important; height: 60px;').values(), renInput,undoButton);
	    


	    xpath = DOM.getXPATH(element);
	    previousData = element.textContent; 

	    var xmlhttp = new XMLHttpRequest();
	    d = window.location.search.split('?')[1];
	    var a =[];
	    for (var i = 0;i<d.split('&').length;i++){ 
		a[d.split('&')[i].split('=')[0]] = d.split('&')[i].split('=')[1];
	    }
	    var url = a['foruri'];
	    var data="url="+encodeURIComponent(url)+"&xpath="+encodeURIComponent(xpath);
	    xmlhttp.onreadystatechange = function()
	    {
		if(xmlhttp.readyState == 4 && xmlhttp.status== 200)
		{
		    if(xmlhttp.responseText=='')
		    {
			renDiv.style.display = 'none';
			alert("Renarrations not available");
		    }
		    else {
			for (i=0;i<= varray.length;i++) varray.pop(i);
			for (i=0; i<=renInput.length;i++) renInput.remove(i,null);
			
			x=DOM.BUILDER.OPTION("please choose a Re-narration");
			renInput.add(x,null);
			
			renActionControl.open(renDiv);
			renDiv.style.display = 'block';
			var response=xmlhttp.responseText.substring(3).split('###');
			for (var j= 0; j< response.length ; j++){
			    d ={}
			    chunk = response[j].substring(1).split('&');
			    for (var i= 0; i< chunk.length ; i++){
				pair =chunk[i].split("::");
				key = pair[0];
				value = pair[1];
				d[key] = value;
			    }
			    varray.push(d);
			}
			for(i=0;i<varray.length;i++)	{
			    lang_ = varray[i]['lang'];
			    location_ = varray[i]['location']; 
			    style_ = varray[i]['style']; 
			    x=DOM.BUILDER.OPTION(lang_+', '+location_+', '+style_);
			    renInput.add(x,null);
			}
			renInput.onchange=function(){

			    if (renInput.selectedIndex -1 < 0)  alert("please choose a Re-narration ");
			    else   {
				DOM.evaluate(varray[renInput.selectedIndex - 1]['xpath'],varray[renInput.selectedIndex - 1]['data']);};
			    renInput.selectedIndex = 0;
			}
			
			undoButton.onclick =function(){
			    DOM.evaluate(xpath,previousData);
			};
			
		    }
		}
	    }
	    xmlhttp.open("POST","http://dev.a11y.in/narration",true);
	    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	    xmlhttp.send(data);
	    
	    
	};
	
	
	this.close = function close() {
      	    selectedElement = null;
	};
    }
    
    
    //******************************** Shalini - Changed AudioupdatePopupAction from ImageUpdatePopupAction *****************

    function AudioUpdateByUrl(pageEditor, actionControl) {
	var self = this, popupDiv, audioUrlInput, randomInput, audioUrlForm, selectedElement, targetName,audioElement;

	var addUrlLabel = DOM.BUILDER.SPAN(normalFontAttributes.addStyle('width: 100%; display: block; float: left; font-size: 10px;position:relative; margin-top: 5px;margin-left: 0px; margin-right: 5px; margin-bottom: 5px; background: transparent; color: #747474; text-shadow: 0 1px 0 #FFFFFF; text-align: left;').values());
	addUrlLabel.innerHTML = 'Add URL';

	audioUrlInput = DOM.BUILDER.INPUT(editTextInputAttributes.addStyle('display:block; background: #FFFFFF;').values());
	randomInput = DOM.BUILDER.INPUT(editAttributes.put({ name : 'random', type : 'hidden', value : '1' }).values());
    	audioUrlForm = DOM.BUILDER.FORM(elementAttributes.values(),
					audioUrlInput,
					DOM.BUILDER.INPUT(editSubmitAttributes.values()));

	audioUrlForm.onsubmit = function updateFormOnSubmit() {
            var url = audioUrlInput.value;
	    updateAudio(url);
            return false;
	};

	audioDiv = DOM.BUILDER.DIV(popupContainerAttributes.addStyle('width: 100%; float:left; position: relative; margin: 0px auto auto 10px; display: block;').values(), addUrlLabel, audioUrlForm);

	audioActionControl = new PopupActionControl(actionControl);

	this.getActionDiv = function getActionDiv() {
            return audioDiv;
	};

	this.open = function open(element) {
	    audioActionControl.open(audioDiv);
            audioUrlInput.value = '';
            selectedElement = element;
            audioDiv.style.display = 'block';
	};

	this.close = function close() {
            selectedElement = null;
            audioDiv.style.display = 'none';
	};

	updateAudio = function updateAudio(src) {
	    var command;
	    if (audioElement) {
		command = {
		    command : 'AUDIO_UPDATE',
		    element : audioElement,
		    elementId : audioElement.getAttribute('m4pageeditid'),
		    data : src,
		    previousData : originalHref
		};
	    } else {
		command = {
		    command : 'AUDIO_CREATE',
		    element : selectedElement,
		    elementType : 'audio/ogg',
		    xpath : DOM.getXPATH(selectedElement),
		    url : window.location.href,
		    elementId : selectedElement.getAttribute('m4pageeditid'),
		    data : src,
		    previousData : ''
		};
	    }
	    pageEditor.commandApply(command);
	};

    }


    //*******************************************************************

    /**
     * Action for updating an image. //Yass to be edited
     */
    function ImageUpdatePopupAction(pageEditor, actionSlot, updateType) {
	var self = this, selectedElement, imagePopupDiv, backgroundUploadPopup, uploadPopupDiv, imageUrlPopup, imageUrlDiv,
	imageSizeSpan, imageFitCheckbox, headerDiv, updateSize, fitElement, imageActionControl;

	imagePopupDiv = DOM.BUILDER.DIV(popupContainerAttributes.addStyle('position: relative; overflow: hidden !important; display: block; margin-top:3px; height: auto !important; height: 120px; margin-bottom: 10px;').values());
	headerDiv = DOM.BUILDER.DIV(normalFontAttributes.addStyle('position: relative;').values());

	imageActionControl = new PopupActionControl(actionSlot);

	imageSizeSpan = DOM.BUILDER.SPAN(normalFontAttributes.addStyle('font-size: 10px; position: relative; float: left; margin-top: 2px; margin-left: 10px; background: transparent; color: #747474; text-shadow: 0 1px 0 #FFFFFF;').values());
	imageSizeSpan.innerHTML = 'Image Size:';
	imageFitCheckbox = DOM.BUILDER.INPUT(editAttributes.put({ name : 'Fit Image', type : 'checkbox', checked : 'yes' }).addStyle('position:relative; margin-top: 2px; padding: 1px; background: transparent; float:right; vertical-align: bottom; display:block;').values());

	var imageLabel = DOM.BUILDER.LABEL(normalFontAttributes.addStyle('font-size: 10px; float:right;position:relative; margin-top:2px; margin-left: 5px; margin-right: 5px;background: transparent; color: #747474; text-shadow: 0 1px 0 #FFFFFF;').values());
	imageLabel.innerHTML = 'Fit Image';
	headerDiv.appendChild(imageSizeSpan);
	headerDiv.appendChild(imageLabel);
	headerDiv.appendChild(imageFitCheckbox);

	var backgroundImageOnLoad = function backgroundImageOnLoad(selectedElement, url, size) {
	    var command = {
		command : 'BACKGROUND_IMAGE_UPDATE',
		element : selectedElement,
		elementId : selectedElement.getAttribute('m4pageeditid'),
		data : url,
		previousData : selectedElement.style.backgroundImage
	    };
	    pageEditor.commandApply(command);
	};

	var sourceImageUpdateOnLoad = function sourceImageUpdateOnLoad(selectedElement, url, size) {
	    var image = new M4ImageElement(selectedElement).setRawImageSize(size), command, fittedSize = size;
	    if (imageFitCheckbox.checked) {
		fittedSize = image.getFittedSize();
	    }
	    command = {
		command : 'IMAGE_SRC_UPDATE',
		element : selectedElement,
		elementType : 'image',
		xpath : DOM.getXPATH(selectedElement),
		url : window.location.href,
		data : new UTIL.StringBuffer().append(fittedSize.width).append('x').append(fittedSize.height).append(',').append(url).toString(),
		previousData : {
		    'src' : selectedElement.src,
		    'size' : { width: selectedElement.width, height: selectedElement.height },
		    'rawImageSize' : image.getRawImageSize()
		}
	    };

	    updateSize();
	    pageEditor.commandApply(command);
	};
	var imageOnLoad = backgroundImageOnLoad;
	var uploadButtonText = 'Upload BG Image';

	if (updateType == 'IMAGE_SRC_UPDATE') {
	    imageOnLoad = sourceImageUpdateOnLoad;
	    uploadButtonText = 'Upload Image';
	    imagePopupDiv.appendChild(headerDiv);
	}

	backgroundUploadPopup = new ImageUpdateByUpload(self, uploadButtonText);
	backgroundUploadPopup.onImageLoad = imageOnLoad;
	uploadPopupDiv = backgroundUploadPopup.getActionDiv();

	imageUrlPopup = new ImageUpdateByUrl(pageEditor, self);
	imageUrlPopup.onImageLoad = imageOnLoad;
	imageUrlDiv = imageUrlPopup.getActionDiv();


	imagePopupDiv.appendChild(uploadPopupDiv);
	imagePopupDiv.appendChild(imageUrlDiv);

	this.open = function open(element) {
	    imageActionControl.open(imagePopupDiv);
	    selectedElement = element;
	    headerDiv.style.width = imagePopupDiv.offsetWidth;
	    backgroundUploadPopup.open(selectedElement);
	    imageUrlPopup.open(selectedElement);
	    updateSize();
	};

	this.close = function close() {
	    imageActionControl.close();
	    backgroundUploadPopup.close();
	    imageUrlPopup.close();
	    selectedElement = null;
	};

	this.onComplete = function onComplete() {
	};

	this.onError = function onError() {
	};

	this.actionComplete = function actionComplete() {
	    self.onComplete();
	};

	this.handleError = function handleError() {
	    self.onError();
	};

	updateSize = function updateSize() {
	    if (selectedElement) {
		var size = DOM.findSize(selectedElement);
		imageSizeSpan.innerHTML = new UTIL.StringBuffer().append('Image Size ').append(size.width).append('x').append(size.height).append(' pixels').toString();
	    }
	};

	function ImageUpdateByUpload(actionControl, uploadButtonText) {
	    var self = this,  uploadForm, uploadingMessage, uploadIframe, fileInput, pageSlugInput,
            uploadSlugInput, targetName, randomInput, selectedElement = null, sizingImage, showLoading, uploadButton,
            uploadPopupDiv;

	    uploadPopupDiv = DOM.BUILDER.DIV(popupContainerAttributes.addStyle('width: 110px; overflow: none; display: block; position: relative; margin: 10px auto auto 10px; float:left;').values());
	    uploadingMessage = DOM.BUILDER.SPAN(editTitleAttributes.addStyle("display:none").values(), "Loading...");
	    fileInput = DOM.BUILDER.INPUT(editTextInputAttributes.put({ name : 'file', type : 'file', size : '20' }).addStyle('width: 110px; cursor: pointer; height: 30px;opacity: 0;  -ms-filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0); filter:alpha(opacity=0); position: relative; float: none;').values());

	    pageSlugInput = DOM.BUILDER.INPUT(editAttributes.put({ name : 'pageSlug', type : 'hidden', value : pageSlug }).values());
	    uploadSlugInput = DOM.BUILDER.INPUT(editAttributes.put({ name : 'uploadSlug', type : 'hidden', value : uploadSlug }).values());
	    randomInput = DOM.BUILDER.INPUT(editAttributes.put({ name : 'random', type : 'hidden', value : '1' }).values());

	    targetName = 'm4-bolt-upload-target-' + Math.round(Math.random() * 10000000);

	    uploadButton = DOM.BUILDER.BUTTON(redButtonAttributes.addStyle('cursor: pointer;width: 110px; height: 25px; position: absolute; float:left; text-align: center;').addStyle(leftBorderStyle + rightBorderStyle).values(), uploadButtonText);

	    uploadButton.onclick = function uploadButtonOnClick(){
		return false;
	    };

	    uploadForm = DOM.BUILDER.FORM(elementAttributes.put({ target : targetName, encType : 'multipart/form-data', method : 'post', action : '/app/page-edit/upload' }).addStyle('display:block; margin: auto;').values());

	    showLoading = function showLoading() {
		uploadForm.style.display = "none";
		uploadingMessage.style.width = '110 px';
		uploadingMessage.style.display = "block";
	    };

	    uploadForm.onsubmit = function uploadFormOnSubmit() {
		showLoading();
	    };

	    fileInput.onchange = function fileInputOnChange() {
		showLoading();
		uploadForm.submit();
	    };

	    uploadIframe = DOM.BUILDER.IFRAME( { name : targetName, src : 'https://bo.lt/app/asset/empty.html?p=622fd096a39f5c36a6e06e41a9963dafaad61079', style : 'display: none' });
	    UTIL.addEvent(uploadIframe, 'load', function uploadIframeOnLoad() {
		var iframeBody;
		if (uploadIframe.contentDocument) {
		    iframeBody = uploadIframe.contentDocument.body;
		} else if (uploadIframe.contentWindow) {
		    iframeBody = uploadIframe.contentWindow.document.body;
		}
		var upload, resultText = DOM.textContent(iframeBody);

		if (!/^\s*\{.*\}\s*/.test(resultText) || selectedElement == null) {
		    return;
		}

		try {
		    upload = eval("(" + resultText + ")");
		} catch (error) {
		    console.error("Unable to interpret the upload image response", error);
		    actionControl.handleError();
		    return;
		}

		if (!upload.success) {
		    console.error("Unable to upload the specified file:", upload.error);
		    actionControl.handleError();
		    return;
		}

		sizingImage = new Image();
		sizingImage.onload = function sizingImageOnLoad() {
		    self.onImageLoad(selectedElement, upload.url, { width: sizingImage.width, height: sizingImage.height });
		    actionControl.actionComplete();
		};
		sizingImage.src = upload.url;
		randomInput.value = randomInput.value + 1;
	    });

	    uploadPopupDiv.appendChild(uploadForm);
	    uploadPopupDiv.appendChild(uploadingMessage);
	    uploadPopupDiv.appendChild(uploadIframe);

	    this.onImageLoad = function onImageLoad(selectedElement, url, size) {
	    };

	    this.getActionDiv = function getActionDiv() {
		return uploadPopupDiv;
	    };

	    this.open = function open(element) {
		selectedElement = element;
		uploadForm.style.display = "block";
		uploadingMessage.style.display = "none";
		fileInput.value = '';
		fileInput.select();
	    };

	    this.close = function close() {
		selectedElement = null;
		uploadingMessage.style.display = "none";
		uploadForm.style.display = "block";
	    };
	}

	function ImageUpdateByUrl(pageEditor, actionControl) {
	    var self = this, popupDiv, imageUrlInput, randomInput, imageUrlForm, selectedElement, targetName;

	    var addUrlLabel = DOM.BUILDER.SPAN(normalFontAttributes.addStyle('width: 100%; display: block; float: left; font-size: 10px;position:relative; margin-top: 5px;margin-left: 0px; margin-right: 5px; margin-bottom: 5px; background: transparent; color: #747474; text-shadow: 0 1px 0 #FFFFFF; text-align: left;').values());
	    addUrlLabel.innerHTML = 'Add URL';

	    imageUrlInput = DOM.BUILDER.INPUT(editTextInputAttributes.addStyle('display:block; background: #FFFFFF;').values());
	    randomInput = DOM.BUILDER.INPUT(editAttributes.put({ name : 'random', type : 'hidden', value : '1' }).values());

	    imageUrlForm = DOM.BUILDER.FORM(elementAttributes.put({ target : targetName, enctype : 'multipart/form-data', method : 'post', action : '/app/page-edit/upload' }).values(),
					    imageUrlInput,
					    DOM.BUILDER.INPUT(editAttributes.put({ name : 'pageSlug', type : 'hidden', value : pageSlug }).values()),
					    randomInput,
					    DOM.BUILDER.INPUT(editSubmitAttributes.values()));

	    imageUrlForm.onsubmit = function updateFormOnSubmit() {
		var url = imageUrlInput.value;
		if (url != '') {
		    randomInput.value = randomInput.value + 1;
		    var sizingImage = new Image();
		    sizingImage.onload = function sizingImageOnLoad() {
			self.onImageLoad(selectedElement, url, { width: sizingImage.width, height: sizingImage.height });
			actionControl.actionComplete();
		    };
		    sizingImage.src = url;
		}
		return false;
	    };

	    popupDiv = DOM.BUILDER.DIV(popupContainerAttributes.addStyle('width: 100%; float:left; position: relative; margin: 0px auto auto 10px; display: block;').values(),
				       addUrlLabel, imageUrlForm);

	    this.getActionDiv = function getActionDiv() {
		return popupDiv;
	    };

	    this.open = function open(element) {
		imageUrlInput.value = '';
		selectedElement = element;
		popupDiv.style.display = 'block';
	    };

	    this.close = function close() {
		selectedElement = null;
		popupDiv.style.display = 'none';
	    };

	    this.onImageLoad = function onImageLoad(element, url, size) {
	    };
	}

    }



    /**
     * Popup for all editable elements except text.
     */
    function EditableElementPopup(pageEditor, imageElement) {
	var self = this, popupControl, deleteElement, imagePopupDiv, deleteButton,renButton,selectedElement,
	linkUpdateAction, linkButton,  closeButton, imageButton, backgroundButton, redArrow,imageUpdateAction,
	imageUpdateDiv, uploadMode, backgroundButtonText, imageButtonText, buttonPanel, upArrow, actionSlot,subMenuAction,renUpdateAction;

	this.popupAt = function popupAt(element, popX, popY) {
	    popupControl.openAt(element, popX, popY);
	};

	this.popdown = function popdown() {
	    popupControl.close();
	};

	if (imageElement) {
	    uploadMode = 'IMAGE_SRC_UPDATE';
	    backgroundButtonText = "Replace";
	    imageButtonText = 'Image';
	}

	buttonPanel = DOM.BUILDER.DIV(buttonPanelAttributes.values());
	upArrow = DOM.BUILDER.SPAN(greyArrowAttributes.values());
	actionSlot = DOM.BUILDER.DIV(actionPanelAttributes.values());

	imagePopupDiv = DOM.BUILDER.DIV(popupContainerAttributes.addStyle('margin-bottom: 10px;').values());

	popupControl = new PopupControl(pageEditor, imagePopupDiv, true);
	popupControl.onOpen = function onOpen(element) {
	    selectedElement = element;
	    var actionSlotWidth = DOM.findSize(imagePopupDiv).width - DOM.findSize(redArrow).width;
	    var spanElement = imageButton.getElementsByTagName('span')[0];
	    if (DOM.isElementOfType(selectedElement, 'body')) {
		actionSlotWidth = actionSlotWidth - DOM.findSize(deleteButton).width;
		deleteButton.style.display = 'none';
		spanElement.innerHTML = 'Body';
	    } else {
		spanElement.innerHTML = imageButtonText;
		deleteButton.style.display = 'block';
	    }
	    actionSlot.style.width =   actionSlotWidth + 'px';
	};

	popupControl.onClose = function onClose() {
	    upArrow.style.display = 'none';
	    selectedElement = null;
	};

	closeButton = DOM.BUILDER.BUTTON(closeButtonAttributes.values());
	closeButton.onclick = function closeButtonOnClick() {
	    popupControl.close();
	    upArrow.style.display = 'none';
	    return false;
	};


	imageUpdateAction = new ImageUpdatePopupAction(pageEditor, actionSlot, uploadMode);
	imageUpdateAction.onComplete = function imageUpdateActionOnComplete() {
	    self.popdown();
	};

	var backgroundImage = 'http://dev.a11y.in/alipi/images/replace_image.png';
	backgroundButton = createActionButton(backgroundImage, backgroundButtonText, 'border-right: none;' + leftBorderStyle);
	backgroundButton.onclick = function backgroundButtonOnClick() {
	    popupControl.showAction(imageUpdateAction);
	    displayUpArrowUnderButton(backgroundButton, upArrow);
	    return false;
	};

	renUpdateAction = new renAction(pageEditor, actionSlot);
	renUpdateAction.onComplete = function renUpdateActionOnComplete() {
	    self.popdown(true);
	};


	var renImage = 'http://dev.a11y.in/alipi/images/renarration.png';
	renButton = createActionButton(renImage, 'See (other) narrations', 'border-right: none;');
	renButton.onclick = function renButtonOnClick() {
	    popupControl.showAction(renUpdateAction);
	    return false;
	};

	buttonPanel.appendChild(backgroundButton);
	buttonPanel.appendChild(renButton);
	imagePopupDiv.appendChild(closeButton);
	imagePopupDiv.appendChild(buttonPanel);
	imagePopupDiv.appendChild(actionSlot);

	document.body.appendChild(imagePopupDiv);

	deleteElement = function deleteElement() {
	    var command = {
		command : 'DELETE',
		element : selectedElement,
		url : '',
		xpath : '',
		elementType : 'text',
		data : '',
		previousData : ''
	    };
	    pageEditor.commandApply(command);
	    popupControl.close();
	};
    }

    /**
     * Popup for text edit.
     */
    function TextElementPopup(pageEditor) {
	var self = this, updateText, deleteElement, textPopupDiv, selectedElement, originalTextContent, deleteButton, 
	imageUpdateAction, popupControl, linkUpdateAction, linkButton, closeButton, textButton, doneButton,
	imageUpdateDiv, backgroundButton, redArrow, buttonPanel, upArrow, actionSlot,renButton, variablePassing;

	this.popupAt = function popupAt(element, popX, popY) {
	    popupControl.openAt(element, popX, popY);
	};

	
	this.popdown = function popdown(saveChanges) {
	    popupControl.close(saveChanges);
	};

	buttonPanel = DOM.BUILDER.DIV(buttonPanelAttributes.values());
	upArrow = DOM.BUILDER.SPAN(greyArrowAttributes.values());
	actionSlot = DOM.BUILDER.DIV(actionPanelAttributes.values());
	redArrow = DOM.BUILDER.SPAN(redArrowAttributes.values());

	textPopupDiv = DOM.BUILDER.DIV(popupContainerAttributes.values());

	var eatKeyboardEvents = function eatKeyboardEvents(event) {
            event.stopPropagation();
	};
	var handleKeyDown = function handleKeyDown(event) {
	    switch (event.keyCode) {
	    case 13:
		// Enter key
		self.popdown(true);
		event.stopPropagation();
		event.preventDefault();

		return false;
	    default:
		eatKeyboardEvents(event);
	    }
	};

	popupControl = new PopupControl(pageEditor, textPopupDiv, false);
	popupControl.onOpen = function onOpen(element) {
	    selectedElement = element;
	    originalTextContent = DOM.textContent(selectedElement);
	    actionSlot.style.marginLeft = (textButton.offsetWidth) + 'px';
	    UTIL.addEvent(selectedElement, 'keydown', handleKeyDown);
	    UTIL.addEvent(selectedElement, 'keyup', eatKeyboardEvents);
	    UTIL.addEvent(selectedElement, 'keypress', eatKeyboardEvents);
	    if (DOM.isIEBrowser() && DOM.isQuirksMode()) {
		actionSlot.style.marginTop = '-8px';
		actionSlot.style.paddingTop = '0px';
	    }
	    selectedElement.setAttribute('contentEditable', false);
	};

	popupControl.onClose = function onClose(saveChanges) {
	    upArrow.style.display = 'none';
	    if (saveChanges && (DOM.textContent(selectedElement) != originalTextContent)) // || (saveChanges && hasAudio==true)
	    {
		updateText();
	    } else {
		DOM.textContent(selectedElement, originalTextContent);
	    }
	    selectedElement = null;
	    originalTextContent = null;
	};

	closeButton = DOM.BUILDER.BUTTON(closeButtonAttributes.values());
	closeButton.onclick = function closeButtonOnClick() {
	    DOM.textContent(selectedElement, originalTextContent);
	    self.popdown(false);
	    upArrow.style.display = 'none';
	    return false;
	};



	var doneImage = 'http://dev.a11y.in/alipi/images/done.png';
	doneButton = createActionButton(doneImage, 'Editor', 'border-right: none;' + leftBorderStyle);
	doneButton.onclick = function doneButtonOnClick(elements) {
	    editWindow = new EditWindow(pageEditor);
 	    editWindow.activate();
	    document.getElementById('originaltext').value = selectedElement.textContent;
	    document.getElementById('texteditor').value = selectedElement.textContent;
	    document.getElementById('editoroverlay').appendChild(textButton);
	    selectedElement.setAttribute('id', 'alipiSelectedElement');
	};

	textButton = DOM.BUILDER.BUTTON(panelButtonAttributes.addStyle('position:fixed; left:46%; bottom:12%; color:#FFF; width:8%; height:5%; background: #777; background: -webkit-gradient(linear, left bottom, left top, color-stop(0, #777), color-stop(1, #fff)); background: -moz-linear-gradient(center bottom, #777 0%, #fff 100%); border: 1px solid #777; border-radius: 3px; border: 1px solid #777; box-shadow: #fff 0px 0px 2px 0px inset, rgba(0, 0, 0, .5) 0px 0px 2px 0px; -moz-box-shadow:#fff 0px 0px 2px 0px inset, rgba(0, 0, 0, .5) 0px 0px 2px 0px; -webkit-box-shadow:#fff 0px 0px 2px 0px inset, rgba(0, 0, 0, .5) 0px 0px 2px 0px;').values(), 'OK');
	textButton.onclick = function textButtonOnClick() {
	    document.getElementById('alipiSelectedElement').textContent = document.getElementById('texteditor').value;
	    document.body.removeChild(document.getElementById('editoroverlay'));
	    document.body.removeChild(document.getElementById('editorbgdiv'));
	    handleKeyDown;
	    document.getElementById('alipiSelectedElement').removeAttribute('id', 'alipiSelectedElement');
	    self.popdown(true);
	    return false;
	};


	var renImage = 'http://dev.a11y.in/alipi/images/renarration.png';
	renButton = createActionButton(renImage, 'See (other) narrations', 'border-right: none;');
	renButton.onclick = function renButtonOnClick() {
	    popupControl.showAction(renUpdateAction);
	    return false;
	};

	renUpdateAction = new renAction(pageEditor, actionSlot);
	renUpdateAction.onComplete = function renUpdateActionOnComplete() {
	    self.popdown(true);
	};

	audioUpdateAction = new AudioUpdateByUrl(pageEditor, actionSlot);
	audioUpdateAction.onComplete = function audioUpdateActionOnComplete() {
	    self.popdown();
	};
	
	var audioImage = 'http://dev.a11y.in/alipi/images/audio.png';
	audioButton = createActionButton(audioImage,'Audio','border-right:none;');
	audioButton.onclick = function audioButtonOnClick() {
	    popupControl.showAction(audioUpdateAction);
	    return false;
	};


	imageUpdateAction = new ImageUpdatePopupAction(pageEditor, actionSlot, 'BACKGROUND_IMAGE_UPDATE');
	imageUpdateAction.onComplete = function imageUpdateActionOnComplete() {
	    self.popdown(true);
	};

	var backgroundImage = 'http://dev.a11y.in/alipi/images/replace_image.png';
	backgroundButton = createActionButton(backgroundImage, 'BG&nbsp;Image', 'border-right: none;');
	backgroundButton.onclick = function backgroundButtonOnClick() {
	    popupControl.showAction(imageUpdateAction);
	    imageUpdateAction.open(selectedElement.parentNode);
	    displayUpArrowUnderButton(backgroundButton, upArrow);
	    return false;
	};

	buttonPanel.appendChild(doneButton);
	buttonPanel.appendChild(renButton);
	buttonPanel.appendChild(audioButton);
	textPopupDiv.appendChild(closeButton);
	textPopupDiv.appendChild(buttonPanel);
	textPopupDiv.appendChild(actionSlot);
	document.body.appendChild(textPopupDiv);

	updateText = function updateText() {
	    var command = {
		command : 'TEXT_UPDATE',
		element : selectedElement,
		url : window.location.href,
		xpath : DOM.getXPATH(selectedElement),
		elementType : 'text',
		data : DOM.textContent(selectedElement),
		previousData : originalTextContent
            };
	    pageEditor.commandApply(command);;
	    if (DOM.textContent(selectedElement).length == 0) {
		deleteElement();
	    }
	};

	deleteElement = function deleteElement() {
	    var command = {
		command : 'DELETE',
		element : selectedElement,
		url : '',
		elementType : 'text',
		data : '',
		xpath : '',
		data : '',
		previousData : ''
	    };
	    pageEditor.commandApply(command);
	};
    }



    /**
     * Overlay bar which can function in either visual editor or html editor mode.
     */
    function OverlayBar(pageEditor, isVisualEditor) {
	var self = this, overlayDiv, firstRowDiv, firstRowStyleAttributes, messageDiv, publishButton, undoButton,fillUpButton;
	var moveDiv, editModeChangeOverlayDiv, buttonDiv, editModeChangeButtonDiv, editModeChangeSaveButton, editModeChangeDiscardButton;
	var redButtonStyleAttributes, fillUpButtonStyleAttributes, firstRowDivOffset, calculateScrollPositionY, wrapperDiv,showKeepOriginalOverlay, publishOptions = new PublishOptions();

	messageDiv = DOM.BUILDER.DIV(editAttributes.addStyle('font-weight:italic; font-size:20px; font-family: Helvetica Neue,Helvetica,Arial,Sans-serif; position:absolute; left:30%; width:100%; display:inline-block;  color:#fff;').values());

	redButtonStyleAttributes = panelButtonAttributes.addStyle('position:absolute; top:-13px; right:04%; width:22%; height:25px; color:#FFF; font-size:18px; text-align:center; background: #AAA; background: -moz-linear-gradient(center bottom, #000 0%, #FFF 100%); -webkit-linear-gradient(center bottom, #000 0%, #FFF 100%); border: 1px solid #777; border-radius: 3px; -moz-border-radius:10px; -webkit-border-radius:3px; border: 1px solid #777;').values();

	undoButtonStyleAttributes = panelButtonAttributes.addStyle('position:absolute; left:35%; top:-13px; width:15%; height:25px; color:#FFF; font-size:18px; text-align:center; background: #AAA; background: -moz-linear-gradient(center bottom, #000 0%, #FFF 100%); -webkit-linear-gradient(center bottom, #000 0%, #FFF 100%); border: 1px solid #777; border-radius: 3px; -moz-border-radius:10px; -webkit-border-radius:3px; border: 1px solid #777;').values();

	helpLinkStyleAttributes = panelButtonAttributes.addStyle('position:absolute; left:0%; top:-13px; width:15%; height:25px; color:#FFF; font-size:18px; text-align:center; background: #AAA; background: -moz-linear-gradient(center bottom, #000 0%, #FFF 100%); -webkit-linear-gradient(center bottom, #000 0%, #FFF 100%); border: 1px solid #777; border-radius: 3px; -moz-border-radius:10px; -webkit-border-radius:3px; border: 1px solid #777;').values();

	publishButton = DOM.BUILDER.BUTTON(redButtonStyleAttributes, 'Publish'); 

	publishButton.onclick = function publishButtonOnClick() {
	    if (pageEditor.hasChangesPending() /* && (pageEditor.formUncomplete() ==false) */ ) {
 		targetWindow = new TargetWindow(pageEditor);
 		targetWindow.activate();
	
		okButton.onclick = function okButtonOnClick() { 
		    targetWindow.okClick();
		}
	    }
	    else{
		pageEditor.showMessage("Nothing to publish");
	    }
	    return false;
	};

	this.blogpost = function blogpost() {
	    pageEditor.commandPublish();
	    this.disabled=true;
	    pageEditor.showMessage("... Please wait, your blog is being posted");
	};
	// End of okButton function

	undoButton = DOM.BUILDER.BUTTON(undoButtonStyleAttributes, 'Undo');
	undoButton.onclick = function undoButtonOnClick() {
	    pageEditor.commandUndo();
	    return false;
	};

	helpLink = DOM.BUILDER.BUTTON(helpLinkStyleAttributes, 'Help');
	helpLink.onclick = function undoButtonOnClick() {
	    helpWindow = new HelpWindow(pageEditor);
	    helpWindow.activate();

	};


	editModeChangeButtonDiv = DOM.BUILDER.DIV(editAttributes.addStyle('width: 500px; position: relative; float: right; margin-right: 8px;').values(), editModeChangeSaveButton, editModeChangeDiscardButton);

	buttonDiv = DOM.BUILDER.DIV(editAttributes.addStyle('width: 500px; position: relative; float: right; margin-right: 8px;').values(), undoButton, publishButton, helpLink);

	firstRowDiv = DOM.BUILDER.DIV(DOM.BUILDER.DIV(editAttributes.addStyle('width:500px; position: absolute; top: 0; left: 1%;').values(), messageDiv), buttonDiv);

	var image = DOM.BUILDER.IMG(normalFontAttributes.put({src: 'http://dev.a11y.in/alipi/images/close_button.png'}).addStyle('position:fixed; top:0.5%; width:25px; height:25px;').values());

	wrapperDiv =  DOM.BUILDER.DIV(fontTypeAttributes.addStyle('overflow: inherit; overflow-x: visible; position: fixed; z-index: 2147483645; left: 0; top: 0;min-width:800px; width: 100%; height:30px;; background-color: rgba(0, 0, 0, 0.5);').values(), image, firstRowDiv);


	overlayDiv = DOM.BUILDER.DIV(fontTypeAttributes.addStyle('overflow: inherit;').values(), wrapperDiv);

	document.body.appendChild(overlayDiv);

	image.onclick=function(){
	    answer = confirm("Do you really want to exit the editor?")
	    if (answer !=0)
	    {
		window.location.reload();
	    }
	}

	this.show = function show(activate) {
	    overlayDiv.style.display = 'block';
	    var disabled = true;
	    var opacity = '0.4';
	    if (activate) {
		disabled = false;
		opacity = '1.0';
	    }

	    undoButton.disabled = false; 
	    publishButton.disabled = false; 

	    undoButton.style.opacity = "1"; 
	    publishButton.style.opacity = "1";
	    publishOptions.hide();
	};

	this.message = function message(value) {
	    messageDiv.innerHTML = value;
	};


	function PublishOptions() {
	    var self = this, wrapperDiv, keepOriginalCheckbox, activateOptionsTimerId, cancelTimer, activatePublishOptions;
	    var checkboxId = 'm4PublishOptionsCheckbox-' +  new Date().getTime();
	    keepOriginalCheckbox = DOM.BUILDER.INPUT(
		editAttributes.put({
		    name : 'Publish Options',
		    type : 'checkbox', id: checkboxId}).addStyle(
			'font-family: Helvetica Neue, Helvetica, Ariel, Sans-serif; font-size: 10px; width: 14px; height: 14px; margin: 0; padding: 0; position: relative; background: transparent;').values()
            );
	    keepOriginalCheckbox.onclick = function() {
		keepOriginal = keepOriginalCheckbox.checked;
	    };
	    var backgroundImage = 'url(http://dev.a11y.in/alipi/images/container_save_new_page.png) no-repeat scroll 0 0 transparent';
	    var position = 'fixed';

	    wrapperDiv =  DOM.BUILDER.DIV(editAttributes.addStyle('font-family: Helvetica Neue, Helvetica, Ariel, Sans-serif; font-size: 10px; display: table; vertical-align: middle; z-index: 2147483647; margin: 0; width: 134px; height: 33px; line-height: 33px; position: '+ position+ '; right: 10px; background:'+ backgroundImage + ' ; display:none;').values(), DOM.BUILDER.SPAN(editAttributes.addStyle(('font-family: Helvetica Neue, Helvetica, Ariel, Sans-serif; font-size: 10px; display: table-cell; vertical-align: middle; height: 14px; hasLayout=true;')).values(), DOM.BUILDER.SPAN(editAttributes.addStyle('font-family: Helvetica Neue, Helvetica, Ariel, Sans-serif; font-size: 10px; display: inline; vertical-align: middle; height: 10px; width: 14px; padding: 0; margin: 1px 0 0 13px;').values(), keepOriginalCheckbox), DOM.BUILDER.LABEL(normalFontAttributes.put({'for' : checkboxId}).addStyle(('font-family: Helvetica Neue, Helvetica, Ariel, Sans-serif; display: inline; font-size: 10px; background: transparent; color: #E9E9E9; padding: 0 0 0 5px;')).values(),'Save as new page.')));

	    UTIL.addEvent(wrapperDiv, 'mouseout', function publishButtonMouseOut(event) {
		self.hide();
	    });

	    UTIL.addEvent(wrapperDiv, 'mouseover', function publishButtonMouseOver(event) {
		cancelTimer();
		activatePublishOptions(true);
	    });

	    document.body.appendChild(wrapperDiv);

	    this.show = function show(onTop, margin) {
		if (onTop) {
		    wrapperDiv.style.top = '0px';
		    wrapperDiv.style.marginTop = margin + 'px';
		    DOM.deleteStyleProperty(wrapperDiv, 'bottom');
		} else {
		    wrapperDiv.style.bottom = '0px';
		    wrapperDiv.style.marginBottom = margin + 'px';;
		    DOM.deleteStyleProperty(wrapperDiv, 'top');
		}
		activatePublishOptions(true);
		cancelTimer();
		activateOptionsTimerId = setTimeout(function() {
		    activatePublishOptions(false);
		}, 5000);
	    };

	    this.hide = function hide() {
		activatePublishOptions(false);
	    };

	    this.scrollToPosition = function scrollToPosition(onTop, position) {
		if (onTop) {
		    wrapperDiv.style.top = position;
		} else {
		    wrapperDiv.style.bottom = position;
		}
	    };

	    cancelTimer = function cancelTimer() {
		if (activateOptionsTimerId) {
		    clearTimeout(activateOptionsTimerId);
		}
	    };

	    activatePublishOptions = function activatePublishOptions(activate) {
		if (hasEditPermission == 'true' && activate) {
		    wrapperDiv.style.display = 'table';
		} else {
		    wrapperDiv.style.display = 'none';
		}
	    };
	}
    }


    /**
     * Manages page level keyboard shortcuts.
     */
    function PageShortcuts(pageEditor) {
	this.enable = function enable() {
	    DOM.addListener('keydown', function keydownHandler(event) {
		switch (event.keyCode) {
		case 27:
		    // ESC
		    event.preventDefault();
		    event.stopPropagation();
		    pageEditor.close();
		    return false;
		    // case 77:
		    //   // "m"
		    //   if (pageEditor.hasFocus()) {
		    //     event.preventDefault();
		    //     event.stopPropagation();
		    //     pageEditor.moveOverlayBar();
		    //   }
		    //   return false;

		    // case 85:
		    //   // "u"
		    //   if (pageEditor.hasFocus()) {
		    //     event.preventDefault();
		    //     event.stopPropagation();
		    //     pageEditor.commandUndo();
		    //   }
		    return false;
		}
	    }, true);
	}
    }

    /**
     * Maintains command history and related features like undo and publish.
     */
    function EditCommandHistory(pageEditor) {
	var self = this, history = [], imageSrc, imageMatcher, imageHeight, imageWidth, buildDataString, anchorElement, anchorElementId, ajaxResultProcessor = new AjaxResultProcessor();

	this.hasChangesPending = function hasChangesPending() {
	    return history.length > 0;
	};
	this.formUncomplete = function formUnomplete(){
	    return (locName == '' &&  langName=='' && styleName == '' );
	};
	
	this.apply = function apply(command) {
	    var poofPosition, poofDiv;

	    switch (command.command) {
            case 'TEXT_UPDATE':
		DOM.textContent(command.element, command.data);
		pageEditor.showMessage('Text changed');
		break;
            case 'AUDIO_SRC_UPDATE':
		textElementPopup.hasAudio = true;	
		pageEditor.showMessage('Audio updated');
		break;

            case 'DELETE':
		poofPosition = DOM.findPosition(command.element);

		poofDiv = DOM.BUILDER.DIV({'style' : 'width:32px;height:32px;background: transparent url(http://dev.a11y.in/alipi/images/poof.png) no-repeat;position:absolute;top:' + poofPosition.y + 'px;left:' + poofPosition.x + 'px;'});
		document.body.appendChild(poofDiv);

		UTIL.animate(function(index, last) {
		    if (last) {
			document.body.removeChild(poofDiv);
		    } else {
			poofDiv.style.backgroundPosition = '0 -' + (index * 32) + 'px';
		    }
		}, 5, 100);

		DOM.overrideStyleProperty(command.element, 'display', 'none');
		pageEditor.showMessage('Section deleted');
		break;

            case 'IMAGE_SRC_UPDATE':
		imageMatcher = new RegExp("(\\d+)x(\\d+),(.+)").exec(command.data);
		imageWidth = imageMatcher[1];
		imageHeight = imageMatcher[2];
		imageSrc = imageMatcher[3];

		if (imageSrc && command.element.src != imageSrc) {
		    command.element.src = imageSrc;
		    pageEditor.showMessage('Image changed');
		}
		if (imageWidth == 0) {
		    command.element.removeAttribute('width');
		} else {
		    command.element.width = imageWidth;
		}

		if (imageHeight == 0) {
		    command.element.removeAttribute('height');
		} else {
		    command.element.height = imageHeight;
		}
		break;

            case 'ANCHOR_UPDATE':
		command.element.setAttribute('href', command.data);
		pageEditor.showMessage('Link changed');
		break;

            case 'ANCHOR_CREATE':
		anchorElement = DOM.BUILDER.A({ 'href' : command.data });
		command.element.parentNode.replaceChild(anchorElement, command.element);
		anchorElement.appendChild(command.element);
		command.previousData = anchorElement;
		pageEditor.showMessage('Link added');
		break;

	    case 'AUDIO_UPDATE':
		command.element.setAttribute('src', command.data);
		pageEditor.showMessage('Audio changed');
		break;
		
            case 'AUDIO_CREATE':
		audioElement = document.createElement('audio');
		audioElement.setAttribute('src',command.data);
		audioElement.setAttribute('controls','controls');
		command.element.appendChild(audioElement);
		audioElement.play();
		pageEditor.showMessage('Audio added');
		break;

            default:
		console.error('Unknown command:', command);
	    }

	    history.push(command);
	};

	this.undo = function undo() {
	    var imageElement, command;

	    if (self.hasChangesPending()) {
		command = history.pop();
		switch (command.command) {
		case 'TEXT_UPDATE':
		    command.element.innerHTML = command.previousData;
		    pageEditor.showMessage('Text change undone');
		    break;

		case 'DELETE':
		    DOM.restoreStyleProperty(command.element, 'display', '');
		    pageEditor.showMessage('Delete undone');
		    break;

		case 'IMAGE_SRC_UPDATE':
		    imageElement = new M4ImageElement(command.element);

		    command.element.src = command.previousData.src;
		    if (command.previousData.size.width) {
			command.element.width = command.previousData.size.width;
		    } else {
			command.element.removeAttribute('width');
		    }
		    if (command.previousData.size.height) {
			command.element.height = command.previousData.size.height;
		    } else {
			command.element.removeAttribute('height');
		    }
		    imageElement.setRawImageSize(command.previousData.rawImageSize)

		    pageEditor.showMessage('Image change undone');
		    break;
		    
		case 'AUDIO_SRC_UPDATE':
		    break;
		case 'ANCHOR_UPDATE':
		    command.element.setAttribute('href', command.previousData);
		    pageEditor.showMessage('Link change undone');
		    break;

		case 'ANCHOR_CREATE':
		    command.previousData.parentNode.replaceChild(command.element, command.previousData);
		    pageEditor.showMessage('Link removed');
		    break;

		default:
		    console.error('Unknown command:', command);
		}
	    } else {
		pageEditor.showMessage('Nothing to undo');
	    }
	};

	this.publish = function publish() {
	    var result;
	    if(document.getElementById('ourcheck').checked == false)
	    {
		localStorage.myContent = buildDataString();
		window.location.href = "http://dev.a11y.in/test.html";
		window.reload();
	    }
	    else{
		
		AJAX.post('http://dev.a11y.in/test',
	    		  buildDataString(), function(result) {
	    		      ajaxResultProcessor.processPublishedResponse(result);
	    		  });
	    }
	};

	this.switchMode = function switchMode(saveChanges) {
	    var result, requestParameters;

	    requestParameters = '?slug=' + pageSlug + '&uploadSlug=' + uploadSlug;
	    if (successUrl) {
		requestParameters = requestParameters + '&successUrl=' + encodeURIComponent(successUrl);
	    }

	    if (saveChanges) {
		result = AJAX.post('/app/page-edit/switch-edit-mode' + requestParameters,
				   buildDataString());
		ajaxResultProcessor.processSwitchModeResponse(result);
	    } else {
		window.location.href = 'https://bo.lt/app/page-edit/html' + requestParameters;
	    }
	};

	buildDataString = function buildDataString() {
	    
	    var check_xpath = [], temp_history = [], index = [];
	    for(x=0; x<history.length; x++) 
	    {
		check_xpath.push(history[x].xpath);
	    }
	    for(i=0; i<check_xpath.length-1; i++) 
	    {
		for(j=i+1; j<check_xpath.length; j++) 
		{
		    if (check_xpath[i] == check_xpath[j]) 
		    {
			index.push(i);  
		    } 
		}
	    }
	    if (index.length > 0) 
	    {
		for (var z=0; z<index.length; z++) 
		{
		    delete history[index[z]];
		}
	    }

	    for (var x=0; x<history.length; x++)
	    {
		if (history[x] != undefined)
		{
		    temp_history.push(history[x]);
		}
	    }

	    history = temp_history;

	    var command, buffer;
	    buffer = new UTIL.StringBuffer();
	    UTIL.forEach(history, function(index, command) {
		buffer.append('###'); //separates the commands
		buffer.append('about=');  //url=about    //removed '&' on purpose
		buffer.append(window.location.search.split('=')[1]);
		buffer.append('&lang=');//lang
		buffer.append(encodeURIComponent(langName));
		buffer.append('&location=');//location
		buffer.append(encodeURIComponent(locName));
		buffer.append('&style=');//style
		buffer.append(encodeURIComponent(styleSelect.value));
		buffer.append('&blog=');  //blog where to post
		buffer.append(encodeURIComponent("blog"));
		buffer.append('&elementtype='); // text, audio, img
		buffer.append(encodeURIComponent(command.elementType));
		buffer.append('&xpath=');//xpath
		buffer.append(encodeURIComponent(command.xpath));
		buffer.append('&data=');  //data
		buffer.append(encodeURIComponent(command.data));
		buffer.append('&author='); //author
		if (author.value == '') {
		    buffer.append(encodeURIComponent('Anonymous'));
		} else {
		    buffer.append(encodeURIComponent(author.value));
		}
	    }); 
	    return buffer.toString().substring(3);
	};
    }

    /**
     * Main coordinator for the visual editor's overlay, shortcuts, edits and primary popups.
     */
    function VisualPageEditor() {
	var self = this, overlayBar, pageShortcuts, editCommandHistory, editorHasFocus = true, listeners = new Array(),
	textElementSelector, imageElementSelector, editableElementSelector, preProcessors = new Array(),
	currentSelector = null, updateSelection, getSelectorForType, focus, closePopup;
	var ACTION = {
	    MOUSE_OVER : 0, MOUSE_OUT: 1, MOUSE_CLICK: 2
	};

	overlayBar = new OverlayBar(this, true);
	pageShortcuts = new PageShortcuts(this);
	editCommandHistory = new EditCommandHistory(this);

	preProcessors.push(new FlashPreProcessor());
	preProcessors.push(new IframePreProcessor());
	preProcessors.push(new FormPreProcessor());

	textElementSelector = new TextElementSelector(self);
	imageElementSelector = new ImageElementSelector(self);
	editableElementSelector = new EditableElementSelector(self);

	this.hasChangesPending = function hasChangesPending() {
	    return editCommandHistory.hasChangesPending();
	};


	this.formUncomplete = function fromUncomplete() {
	    return editCommandHistory.formUncomplete();
	};

	this.show = function show() {
	    DOM.addListener('mouseover', function globalMouseOverListener(event) {
		var type = event.target.getAttribute('m4pageedittype');
		if (type) {
		    event.preventDefault();
		    event.stopPropagation();
		    updateSelection(ACTION.MOUSE_OVER, event);
		}
	    }, true);

	    DOM.addListener('mouseout', function globalMouseOutListener(event) {
		var type = event.target.getAttribute('m4pageedittype');
		if (type) {
		    event.preventDefault();
		    event.stopPropagation();
		    updateSelection(ACTION.MOUSE_OUT, event);
		}
	    }, true);

	    DOM.addListener('click', function globalClickListener(event) {
		var type = event.target.getAttribute('m4pageedittype');
		if (event.target.getAttribute('m4pageeditcontrol')) {
		    // click is passthrough for our controls
		} else if (type) {
		    event.preventDefault();
		    event.stopPropagation();
		    updateSelection(ACTION.MOUSE_CLICK, event);
		} else {
		    // normal page elements
		    event.preventDefault();
		    event.stopPropagation();
		    self.saveAndClose();
		}
	    }, true);

	    // We intercept mousedown so things like drop down box won't work during edit mode.
	    DOM.addListener('mousedown', function globalMouseDownListener(event) {
		if (event.target.getAttribute('m4pageeditcontrol')) {
		    // passthrough
		} else if (event.target.getAttribute('m4pageedittype')) {
		    // passthrough
		} else if (event.clientX > document.body.clientWidth || event.clientY > document.body.clientHeight) {
		    // passthrough if this click was outside of the html page, meaning on a scrollbar
		} else {
		    // normal page elements
		    event.preventDefault();
		    event.stopPropagation();
		}
	    }, true);
	    pageShortcuts.enable();
	    overlayBar.show(false);
	    overlayBar.message("Ready to Narrate");
	};


	updateSelection = function updateSelection(action, event) {
	    var type, selector, element = event.target;
	    selector = getSelectorForType(element.getAttribute('m4pageedittype'));
	    if (selector) {
		switch (action) {
		case ACTION.MOUSE_OVER:
		    if (currentSelector == null) {
			selector.highlight(element);
		    }
		    break;
		case ACTION.MOUSE_OUT:
		    if (currentSelector == null) {
			selector.unhighlight(element);
		    }
		    break;
		case ACTION.MOUSE_CLICK:
		    if (currentSelector == null) {
			currentSelector = selector;
			currentSelector.select(element, event);
		    } else if (currentSelector.isCurrentSelection(element)) {
			currentSelector.select(element, event);
		    } else {
			self.saveAndClose();
			selector.focus();
			selector.highlight(element);
		    }
		    break;
		}
	    }
	};

	getSelectorForType = function getSelectorForType(type) {

	    switch (type) {
            case 'text':
		return textElementSelector;
            case 'image':
		return imageElementSelector;
            case 'edit':
		return editableElementSelector;
	    }
	    return null;
	};

	focus = function focus(saveChanges) {
	    editorHasFocus = true;
	    for (var i = 0; i < listeners.length; i++) {
		listeners[i](saveChanges)
	    }
	};

	closePopup = function closePopup(saveChanges) {
	    if (currentSelector != null) {
		currentSelector.unselect();
		currentSelector = null;
	    }
	    focus(saveChanges);
	};

	this.loseFocus = function loseFocus() {
	    editorHasFocus = false;
	};

	this.hasFocus = function hasFocus() {
	    return editorHasFocus;
	};

	this.addFocusListener = function addFocusListener(listener) {
	    listeners.push(listener)
	};

	this.removeFocusListener = function(listener) {
	    for (var i = 0; i < listeners.length; i++) {
		if (listeners[i] == listener) {
		    listeners.splice(i, 1);
		}
	    }
	};

	this.close = function close() {
	    closePopup(false);
	};

	this.saveAndClose = function saveAndClose() {
	    closePopup(true);
	};

	// this composition is necessary to avoid circular dependencies
	// this.moveOverlayBar = function moveOverlayBar() {
	//   overlayBar.move();
	// };

	this.showMessage = function showMessage(message) {
	    overlayBar.message(message);
	};

	this.commandApply = function commandApply(command) {
	    editCommandHistory.apply(command);
	};

	this.commandUndo = function commandUndo() {
	    editCommandHistory.undo();
	};

	this.commandPublish = function commandPublish() {

	    overlayBar.show(false);
	    self.saveAndClose();
	    for (var i = 0; i < preProcessors.length; i++) {
		preProcessors[i].restore();
	    }
	    editCommandHistory.publish();
	    overlayBar.show(true);
	};

	this.activateEditor = function activateEditor() {
	    overlayBar.show(true);
	    for (var i = 0; i < preProcessors.length; i++) {
		preProcessors[i].process();
	    }
	};

	function IframePreProcessor () {
	    this.process = function process() {
		// make iframes unclickable by overlaying transparent div over it.
		UTIL.forEach(document.getElementsByTagName('iframe'), function(index, iframe) {
		    var displayStyle = null;
		    if (document.defaultView && document.defaultView.getComputedStyle) {
			displayStyle = document.defaultView.getComputedStyle(iframe, null).getPropertyValue('display');
		    } else if (iframe.currentStyle) {
			displayStyle = iframe.currentStyle['display'];
		    }
		    if(displayStyle != 'none') {
			DOM.clickBlocker(iframe);
		    }
		    var iframeSourceUrl = iframe.src;
		    var isYouTubeIFrame = iframeSourceUrl.toLowerCase().indexOf('youtube') != -1;
		    if (isYouTubeIFrame) {
			// If the flash object is visible when the wmode property is set, then the state doesn't get updated.
			// So first set the parent node's display property to 'none, then add the wmode property and finally
			// restore the original display proeprty back on the parent.
			DOM.overrideStyleProperty(iframe.parentNode, 'display', 'none');
			if(iframeSourceUrl.indexOf('?') != -1) {
			    iframe.src = iframeSourceUrl + '&wmode=opaque';
			} else {
			    iframe.src = iframeSourceUrl + '?wmode=opaque';
			}
			DOM.restoreStyleProperty(iframe.parentNode, 'display');
		    }
		});
	    };

	    this.restore = function restore() {
	    };
	};

	function FlashPreProcessor() {
	    this.process = function process() {
		// make flash objects unclickable by overlaying transparent div over it.
		// If the flash object is visible when the wmode property is set, then the state doesn't get updated.
		// So first set the parent node's display property to 'none, then add the wmode property and finally
		// restore the original display proeprty back on the parent.
		UTIL.forEach(document.getElementsByTagName('object'), function(index, value) {
		    DOM.overrideStyleProperty(value.parentNode, 'display', 'none');
		    DOM.clickBlocker(value);
		    var param = document.createElement('param');
		    param.setAttribute('name', 'wmode');
		    param.setAttribute('value', 'opaque');
		    value.appendChild(param);
		    DOM.restoreStyleProperty(value.parentNode, 'display');
		});

		UTIL.forEach(document.getElementsByTagName('embed'), function(index, value) {
		    DOM.overrideStyleProperty(value.parentNode, 'display', 'none');
		    DOM.clickBlocker(value);
		    value.setAttribute('wmode', 'opaque');
		    DOM.restoreStyleProperty(value.parentNode, 'display');
		});
	    };

	    this.restore = function restore() {
	    };
	};

	function FormPreProcessor () {
	    var overrideElementAttribute = function overrideElementAttribute(nodeName, attributeName, attributeValue) {
		UTIL.forEach(document.getElementsByTagName(nodeName), function(index, inputElement) {
		    var type = inputElement.getAttribute('m4pageeditcontrol');
		    if (!type) {
			DOM.overrideAttribute(inputElement, attributeName, attributeValue);
		    }
		});
	    };

	    var restoreElementAttribute = function restoreElementAttribute(nodeName, attributeName) {
		UTIL.forEach(document.getElementsByTagName(nodeName), function(index, inputElement) {
		    var type = inputElement.getAttribute('m4pageeditcontrol');
		    if (!type) {
			DOM.restoreAttribute(inputElement, attributeName);
		    }
		});
	    };

	    this.process = function process() {
		overrideElementAttribute('input', 'readonly', 'true');
		overrideElementAttribute('textarea', 'readonly', 'true');
	    };

	    this.restore = function restore() {
		restoreElementAttribute('input', 'readonly');
		restoreElementAttribute('textarea', 'readonly');
	    };
	};

	function ImageElementSelector(pageEditor) {
	    var self = this, imageElementPopup = new EditableElementPopup(pageEditor, true), lastSelection = null;
	    this.highlight = function highlight(element) {
		DOM.overrideStyleProperty(element, 'outline', '#777 solid 2px');
		DOM.overrideStyleProperty(element, 'cursor', 'pointer');
	    };

	    this.unhighlight = function unhighlight(element) {
		DOM.restoreStyleProperty(element, 'cursor', '');
		DOM.restoreStyleProperty(element, 'outline', '');
	    };

	    this.select = function select(element, event) {
		if (lastSelection == null) {
		    lastSelection = element;
		    self.unhighlight(lastSelection);
		    self.highlight(lastSelection);
		    imageElementPopup.popupAt(lastSelection, event.pageX, event.pageY);
		}
	    };

	    this.unselect = function unselect() {
		if (lastSelection) {
		    self.unhighlight(lastSelection);
		}
		lastSelection = null;
	    };

	    this.isCurrentSelection = function isCurrentSelection(element) {
		return lastSelection == element;
	    };

            this.focus = function focus(element) {
		// NO OP
            };
	};

	function EditableElementSelector(pageEditor) {
	    var self = this, editableElementPopup = new EditableElementPopup(pageEditor, false), lastSelection = null;

	    this.highlight = function highlight(element) {
		DOM.overrideStyleProperty(element, 'outline', ''); 
		DOM.overrideStyleProperty(element, 'cursor', 'pointer');
	    };

	    this.unhighlight = function unhighlight(element) {
		DOM.restoreStyleProperty(element, 'cursor', '');
		DOM.restoreStyleProperty(element, 'outline', '');
	    };

	    this.select = function select(element, event) {
		if (lastSelection == null) {
		    lastSelection = element;
		    self.unhighlight(lastSelection);
		    self.highlight(lastSelection);
		    editableElementPopup.popupAt(lastSelection, event.pageX, event.pageY);
		}
	    };

	    this.unselect = function unselect() {
		if (lastSelection) {
		    self.unhighlight(lastSelection);
		}
		lastSelection = null;
	    };

	    this.isCurrentSelection = function isCurrentSelection(element) {
		return lastSelection == element;
	    }

            this.focus = function focus(element) {
		// NO OP
            };
	};

	function TextElementSelector(pageEditor) {
	    var self = this, lastSelection = null, textElementPopup = new TextElementPopup(pageEditor), editor,
            findAnchorAncestor, internalHighlight;

	    if(DOM.isIEBrowser()) {
		editor = new InternetExplorerInlineEditor();
	    } else {
		editor = new DefaultInlineEditor();
	    }

	    this.highlight = function highlight(element) {

		internalHighlight(element, '#fff', '#bbb', 'pointer');
		editor.activate(element);
	    };

	    this.unhighlight = function unhighlight(element) {
		DOM.restoreStyleProperty(element, 'borderLeft', '');
		DOM.restoreStyleProperty(element, 'borderRight', '');
		DOM.restoreStyleProperty(element, 'cursor', '');
		DOM.restoreStyleProperty(element, 'backgroundColor', ''); 
		DOM.restoreStyleProperty(element, 'color', '');
		editor.deactivate(element);
	    };

	    this.select = function select(element, event) {
		if (lastSelection == null) {
		    lastSelection = element;
		    self.unhighlight(lastSelection);
		    editor.activate(element);
		    internalHighlight(lastSelection, '#333', '#fff', 'text');
		    textElementPopup.popupAt(lastSelection, event.pageX, event.pageY);
		}
		editor.startEditing(event);
	    };


	    this.unselect = function unselect() {
		if (lastSelection) {
		    self.unhighlight(lastSelection);
		    editor.stopEditing();
		}
		lastSelection = null;
	    };

	    this.isCurrentSelection = function isCurrentSelection(element) {
		return lastSelection == element;
	    };

	    this.focus = function focus(element) {
		editor.focus();
	    };
	    internalHighlight = function internalHighlight(element, highlightColor, highlightBackground, cursorType) {
		// because element containing text often have a calculated height of
		// 0, even when text is showing, we need to highlight using background
		// color.
		DOM.overrideStyleProperty(element, 'cursor', cursorType);
		DOM.overrideStyleProperty(element, 'borderLeft', '#FFF solid 2px'); // Ajay -changed color but can't notice where
		DOM.overrideStyleProperty(element, 'borderRight', '#000 solid 2px'); // Ajay- Same here
		DOM.overrideStyleProperty(element, 'color', highlightColor);
		DOM.overrideStyleProperty(element, 'backgroundColor', highlightBackground);
	    };

	    function DefaultInlineEditor () {
		var self = this, currentEditableElement = null, activateAncestorNodes, ancestorsEditable = false, makeAncestorsEditable, updateCursorPosition;

		// FF doesn't let you delete the text inside the span if the ancestor is another inline element and that is uneditable
		// http://htmlhelp.com/reference/html40/inline.html
		var ELEMENTS_TO_OVERRIDE = {'a': 'a', 'abbr': 'abbr', 'acronym': 'acronym', 'b': 'b', 'basefont' : 'basefont',
					    'bdo': 'bdo', 'big' : 'big', 'br': 'br', 'cite': 'cite', 'dfn': 'dfn', 'em': 'em', 'font': 'font', 'i': 'i',
					    'img': 'img', 'input': 'input', 'kbd': 'kbd', 'label': 'label', 'q': 'q', 's': 's', 'samp': 'samp',
					    'select': 'select','small': 'small', 'span': 'span', 'strike': 'strike', 'strong': 'strong', 'sub': 'sub',
					    'sup': 'sup', 'textarea': 'textarea', 'tt': 'tt', 'u': 'u', 'var': 'var'};

		this.activate = function activate(element) {
		    currentEditableElement = element;
		    DOM.overrideAttribute(currentEditableElement, 'contentEditable', 'true');
		};

		this.deactivate = function deactivate() {
		    if (currentEditableElement) {
			DOM.restoreAttribute(currentEditableElement,'contentEditable');
		    }
		};

		this.startEditing = function startEditing(event) {
		    if (currentEditableElement && event.rangeOffset) {
			// FF specific
			ancestorsEditable = true;
			makeAncestorsEditable(currentEditableElement.parentNode, true);
			updateCursorPosition(event);
		    }
		};

		this.stopEditing = function stopEditing() {
		    if (currentEditableElement && ancestorsEditable) {
			ancestorsEditable = false;
			makeAncestorsEditable(currentEditableElement.parentNode, false);
		    }
		    self.deactivate();
		    currentEditableElement = null;
		};

		this.focus = function focus() {
		    window.getSelection().removeAllRanges();
		};

		updateCursorPosition = function updateCursorPosition(event) {
		    var selection = window.getSelection();
		    var range = selection.getRangeAt(0);

		    if (selection.anchorOffset == selection.focusOffset) {
			selection.collapse(currentEditableElement.firstChild, event.rangeOffset);
		    } else {
			range.setStart(currentEditableElement.firstChild, selection.anchorOffset);
			range.setEnd(currentEditableElement.firstChild, selection.focusOffset);
		    }
		};

		makeAncestorsEditable = function makeAncestorsEditable(element, editable) {
		    if (ELEMENTS_TO_OVERRIDE[element.nodeName.toLowerCase()]) {
			if (editable) {
			    DOM.overrideAttribute(element, 'contentEditable', 'true');
			} else {
			    DOM.restoreAttribute(element, 'contentEditable');
			}
		    }
		    if (element.parentNode) {
			makeAncestorsEditable(element.parentNode, editable);
		    } else {
			return;
		    }
		}
	    };
	};
    }

    /**
     * Main coordinator for the html editor's overlay and other functionality.
     */
    function HtmlPageEditor(editor) {
    	var self = this, overlayBar, buildDataString, ajaxResultProcessor = new AjaxResultProcessor();

	overlayBar = new OverlayBar(this, false);

	this.hasChangesPending = function hasChangesPending() {
	    return editor.getSession().getUndoManager().$undoStack.length > 0;
	};

	this.show = function show() {
	    overlayBar.show(false);
	    overlayBar.message('New page created for editing');
	};

	// this composition is necessary to avoid circular dependencies
	this.showMessage = function showMessage(message) {
	    overlayBar.message(message);
	};

	this.commandUndo = function commandUndo() {
	    if (self.hasChangesPending()) {
		editor.undo();
		self.showMessage('Change undone');
	    } else {
		self.showMessage('Nothing to undo');
	    }
	};

	this.commandPublish = function commandPublish() {
	    var result;
	    splashWindow.show('Saving...');
	    overlayBar.show(false);
	    result = AJAX.post('/app/page-edit/publish?slug=' + pageSlug + '&uploadSlug=' + uploadSlug + '&keepOriginal=' + keepOriginal,
			       buildDataString(), function(result) {
				   ajaxResultProcessor.processPublishedResponse(result);
			       });

	    overlayBar.show(true);
	};

	this.commandSwitchMode = function commandSwitchMode(saveChanges) {
	    var result;

	    overlayBar.enableSwitchSave(false);
	    var successUrlParam = '';
	    if (successUrl) {
		successUrlParam = '&successUrl=' + encodeURIComponent(successUrl);
	    }
	    if (saveChanges) {
		result = AJAX.post('/app/page-edit/switch-edit-mode?slug=' + pageSlug + '&uploadSlug=' + uploadSlug + successUrlParam, buildDataString());
	    } else {
		window.location.href = 'https://bo.lt/app/page-edit/?slug=' + pageSlug + '&uploadSlug=' + uploadSlug + successUrlParam;
		return;
	    }
	    ajaxResultProcessor.processSwitchModeResponse(result);

	    overlayBar.enableSwitchSave(true);
	};

	buildDataString = function buildDataString() {
	    return 'htmlContent=' + encodeURIComponent(editor.getSession().getValue());
	};

	this.activateditor = function activateEditor() {
	    overlayBar.show(true);
	};

	this.close = function close() {
	    //no op for html editor. added to keep the editor interface consistent
	};

	this.saveAndClose = function saveAndClose() {
	    //no op for html editor. added to keep the editor interface consistent
	};

    }
    splashWindow = new SplashWindow(pageEditor);
    splashWindow.show();
    if (editMode != 'HTML') {
	pageEditor = new VisualPageEditor();
	pageEditor.show();
    }

    var activateEditor = function activateEditor() {
	if (editMode == 'HTML') {
	    var editor, htmlMode;
	    editor = ace.edit("editor");
	    htmlMode = require("ace/mode/html").Mode;
	    editor.setTheme("ace/theme/eclipse");
	    editor.setShowPrintMargin(false);
	    editor.getSession().setMode(new htmlMode());
	    editor.getSession().setUseWrapMode(true);
	    pageEditor = new HtmlPageEditor(editor);
	}
	pageEditor.activateEditor();
	if (splashWindow) {
	    splashWindow.activate();
	}
    }
    loadingTimerId = setTimeout(activateEditor, 000);
    UTIL.addEvent(window, 'load', function() {
	clearTimeout(loadingTimerId);
	activateEditor();
    });

}
