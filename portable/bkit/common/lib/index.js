/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,e$6=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$5=new WeakMap;let n$4=class{constructor(t,e,o){if(this._$cssResult$=!0,o!==s$2){throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.")}this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const s=this.t;if(e$6&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$5.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$5.set(s,t))}return t}toString(){return this.cssText}};const c$2=e$6?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules){e+=s.cssText}return(t=>new n$4("string"==typeof t?t:t+"",void 0,s$2))(e)})(t):t
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */,{is:i$3,defineProperty:e$5,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$4,getOwnPropertySymbols:o$4,getPrototypeOf:n$3}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},f$1=(t,s)=>!i$3(t,s),b={attribute:!0,type:String,converter:u$1,reflect:!1,useDefault:!1,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b){if(s.state&&(s.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=!0),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$5(this.prototype,t,h)}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t}};return{get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties"))){return}const t=n$3(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(d$1("finalized"))){return}if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$4(t),...o$4(t)];for(const i of s){this.createProperty(i,t[i])}}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s){for(const[t,i]of s){this.elementProperties.set(t,i)}}}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e){i.unshift(c$2(s))}}else{void 0!==s&&i.push(c$2(s))}return i}static _$Eu(t,s){const i=s.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys()){this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i])}t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((s,o)=>{if(e$6){s.adoptedStyleSheets=o.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet))}else{for(const e of o){const o=document.createElement("style"),n=t$2.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o)}}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((t=>t.hostConnected?.()))}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()))}attributeChangedCallback(t,s,i){this._$AK(t,i)}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&!0===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null}}requestUpdate(t,s,i){if(void 0!==t){const e=this.constructor,h=this[t];if(i??=e.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(e._$Eu(t,i)))){return}this.C(t,s,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),!0!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),!0===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending){return}if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep){this[t]=s}this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0){for(const[s,i]of t){const{wrapped:t}=i,e=this[s];!0!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e)}}}let t=!1;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach((t=>t.hostUpdate?.())),this.update(s)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(s)}willUpdate(t){}_$AE(t){this._$EO?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach((t=>this._$ET(t,this[t]))),this._$EM()}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,i$2=t$1.trustedTypes,s$1=i$2?i$2.createPolicy("lit-html",{createHTML:t=>t}):void 0,h=`lit$${Math.random().toFixed(9).slice(2)}$`,o$3="?"+h,n$2=`<${o$3}>`,r$3=document,l=()=>r$3.createComment(""),c=t=>null===t||"object"!=typeof t&&"function"!=typeof t,a=Array.isArray,d="[ \t\n\f\r]",f=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,v=/-->/g,_=/>/g,m=RegExp(`>|${d}(?:([^\\s"'>=/]+)(${d}*=${d}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),p=/'/g,g=/"/g,$=/^(?:script|style|textarea|title)$/i,x=(i,...s)=>({_$litType$:1,strings:i,values:s}),T=Symbol.for("lit-noChange"),E=Symbol.for("lit-nothing"),A=new WeakMap,C=r$3.createTreeWalker(r$3,129);function P(t,i){if(!a(t)||!t.hasOwnProperty("raw")){throw Error("invalid template strings array")}return void 0!==s$1?s$1.createHTML(i):i}const V=(t,i)=>{const s=t.length-1,o=[];let r,l=2===i?"<svg>":3===i?"<math>":"",c=f;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,y=0;for(;y<s.length&&(c.lastIndex=y,u=c.exec(s),null!==u);){y=c.lastIndex,c===f?"!--"===u[1]?c=v:void 0!==u[1]?c=_:void 0!==u[2]?($.test(u[2])&&(r=RegExp("</"+u[2],"g")),c=m):void 0!==u[3]&&(c=m):c===m?">"===u[0]?(c=r??f,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?m:'"'===u[3]?g:p):c===g||c===p?c=m:c===v||c===_?c=f:(c=m,r=void 0)}const x=c===m&&t[i+1].startsWith("/>")?" ":"";l+=c===f?s+n$2:d>=0?(o.push(a),s.slice(0,d)+"$lit$"+s.slice(d)+h+x):s+h+(-2===d?i:x)}return[P(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),o]};class N{constructor({strings:t,_$litType$:s},n){let r;this.parts=[];let c=0,a=0;const u=t.length-1,d=this.parts,[f,v]=V(t,s);if(this.el=N.createElement(f,n),C.currentNode=this.el.content,2===s||3===s){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(r=C.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes()){for(const t of r.getAttributeNames()){if(t.endsWith("$lit$")){const i=v[a++],s=r.getAttribute(t).split(h),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:c,name:e[2],strings:s,ctor:"."===e[1]?H:"?"===e[1]?I:"@"===e[1]?L:k}),r.removeAttribute(t)}else{t.startsWith(h)&&(d.push({type:6,index:c}),r.removeAttribute(t))}}}if($.test(r.tagName)){const t=r.textContent.split(h),s=t.length-1;if(s>0){r.textContent=i$2?i$2.emptyScript:"";for(let i=0;i<s;i++){r.append(t[i],l()),C.nextNode(),d.push({type:2,index:++c})}r.append(t[s],l())}}}else if(8===r.nodeType){if(r.data===o$3){d.push({type:2,index:c})}else{let t=-1;for(;-1!==(t=r.data.indexOf(h,t+1));){d.push({type:7,index:c}),t+=h.length-1}}}c++}}static createElement(t,i){const s=r$3.createElement("template");return s.innerHTML=t,s}}function S(t,i,s=t,e){if(i===T){return i}let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=c(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(!1),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=S(t,h._$AS(t,i.values),h,e)),i}class M{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??r$3).importNode(i,!0);C.currentNode=e;let h=C.nextNode(),o=0,n=0,l=s[0];for(;void 0!==l;){if(o===l.index){let i;2===l.type?i=new R(h,h.nextSibling,this,t):1===l.type?i=new l.ctor(h,l.name,l.strings,this,t):6===l.type&&(i=new z(h,this,t)),this._$AV.push(i),l=s[++n]}o!==l?.index&&(h=C.nextNode(),o++)}return C.currentNode=r$3,e}p(t){let i=0;for(const s of this._$AV){void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++}}}class R{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=E,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=S(this,t,i),c(t)?t===E||null==t||""===t?(this._$AH!==E&&this._$AR(),this._$AH=E):t!==this._$AH&&t!==T&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>a(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==E&&c(this._$AH)?this._$AA.nextSibling.data=t:this.T(r$3.createTextNode(t)),this._$AH=t}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=N.createElement(P(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e){this._$AH.p(i)}else{const t=new M(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t}}_$AC(t){let i=A.get(t.strings);return void 0===i&&A.set(t.strings,i=new N(t)),i}k(t){a(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t){e===i.length?i.push(s=new R(this.O(l()),this.O(l()),this,this.options)):s=i[e],s._$AI(h),e++}e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e)}_$AR(t=this._$AA.nextSibling,i){for(this._$AP?.(!1,!0,i);t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class k{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=E,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=E}_$AI(t,i=this,s,e){const h=this.strings;let o=!1;if(void 0===h){t=S(this,t,i,0),o=!c(t)||t!==this._$AH&&t!==T,o&&(this._$AH=t)}else{const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++){r=S(this,e[s+n],i,n),r===T&&(r=this._$AH[n]),o||=!c(r)||r!==this._$AH[n],r===E?t=E:t!==E&&(t+=(r??"")+h[n+1]),this._$AH[n]=r}}o&&!e&&this.j(t)}j(t){t===E?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class H extends k{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===E?void 0:t}}class I extends k{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==E)}}class L extends k{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5}_$AI(t,i=this){if((t=S(this,t,i,0)??E)===T){return}const s=this._$AH,e=t===E&&s!==E||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==E&&(s===E||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t)}}const j=t$1.litHtmlPolyfillSupport;j?.(N,R),(t$1.litHtmlVersions??=[]).push("3.3.1");const s=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let i$1=class extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new R(i.insertBefore(l(),t),t,void 0,s??{})}return h._$AI(t),h})(r,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return T}};i$1._$litElement$=!0,i$1.finalized=!0,s.litElementHydrateSupport?.({LitElement:i$1});const o$2=s.litElementPolyfillSupport;o$2?.({LitElement:i$1}),(s.litElementVersions??=[]).push("4.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const o$1={attribute:!0,type:String,converter:u$1,reflect:!1,hasChanged:f$1},r$2=(t=o$1,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===n&&((t=Object.create(t)).wrapped=!0),s.set(r.name,t),"accessor"===n){const{name:o}=r;return{set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t)},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t)}}throw Error("Unsupported decorator location: "+n)};function n$1(t){return(e,o)=>"object"==typeof o?r$2(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */}function r$1(r){return n$1({...r,state:!0,attribute:!1})}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
let e$2;class i{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const e=(t=class extends i{constructor(t$1){if(super(t$1),1!==t$1.type||"class"!==t$1.name||t$1.strings?.length>2){throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}}render(t){return" "+Object.keys(t).filter((s=>t[s])).join(" ")+" "}update(s,[i]){if(void 0===this.st){this.st=new Set,void 0!==s.strings&&(this.nt=new Set(s.strings.join(" ").split(/\s/).filter((t=>""!==t))));for(const t in i){i[t]&&!this.nt?.has(t)&&this.st.add(t)}return this.render(i)}const r=s.element.classList;for(const t of this.st){t in i||(r.remove(t),this.st.delete(t))}for(const t in i){const s=!!i[t];s===this.st.has(t)||this.nt?.has(t)||(s?(r.add(t),this.st.add(t)):(r.remove(t),this.st.delete(t)))}return T}},(...e)=>({_$litDirective$:t,values:e}));
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var t;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function n(n,r,t){return n?r(n):t?.(n)}var __defProp=Object.defineProperty,__decorateClass=(decorators,target,key,kind)=>{for(var decorator,result=void 0,i=decorators.length-1;i>=0;i--){(decorator=decorators[i])&&(result=decorator(target,key,result)||result)}return result&&__defProp(target,key,result),result};function getType(value){return null===value?"null":Array.isArray(value)?"array":value.constructor.name.toLowerCase()}function isPrimitive(value){return value!==Object(value)}function*deepTraverse(obj){const stack=[[obj,"",[]]];for(;stack.length;){const[node,path,parents]=stack.shift();if(path&&(yield[node,path,parents]),!isPrimitive(node)){for(const[key,value]of Object.entries(node)){stack.push([value,`${path}${path?".":""}${key}`,[...parents,path]])}}}}var JSONConverter={fromAttribute:value=>value&&value.trim()?JSON.parse(value):void 0,toAttribute:value=>JSON.stringify(value)},isDefined=value=>void 0!==value,isMatchingPath=(path,criteria)=>criteria instanceof RegExp?!!path.match(criteria):function(str,glob){const strParts=str.split("."),globaParts=glob.split("."),isStar=s=>"*"===s,isGlobStar=s=>"**"===s;let strIndex=0,globIndex=0;for(;strIndex<strParts.length;){const globPart=globaParts[globIndex];if(globPart===strParts[strIndex]||isStar(globPart)){globIndex++,strIndex++}else{if(!isGlobStar(globPart)){return!1}globIndex++,strIndex=strParts.length-(globaParts.length-globIndex)}}return globIndex===globaParts.length}(path,criteria),toggleNode=(path,expanded)=>state2=>({expanded:{...state2.expanded,[path]:isDefined(expanded)?!!expanded:!state2.expanded[path]}}),expand=(regexOrGlob,isExpanded)=>(_state,el)=>{const expanded={};if(regexOrGlob){for(const[,path,parents]of deepTraverse(el.data)){isMatchingPath(path,regexOrGlob)&&(expanded[path]=isExpanded,parents.forEach((p=>expanded[p]=isExpanded)))}}return{expanded}},highlight=path=>()=>({highlight:path}),JsonViewer_styles_default=((t,...e)=>{const o=1===t.length?t[0]:e.reduce(((e,s,o)=>e+(t=>{if(!0===t._$cssResult$){return t.cssText}if("number"==typeof t){return t}throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1]),t[0]);return new n$4(o,t,s$2)})`
    :where(:host) {
        --background-color: #2a2f3a;
        --color: #f8f8f2;
        --string-color: #a3eea0;
        --number-color: #d19a66;
        --boolean-color: #4ba7ef;
        --null-color: #df9cf3;
        --property-color: #6fb3d2;
        --preview-color: rgba(222, 175, 143, 0.9);
        --highlight-color:  #c92a2a;
        --outline-color: #e0e4e5;
        --outline-width: 1px;
        --outline-style: dotted;

        --font-family: Nimbus Mono PS, Courier New, monospace;
        --font-size: 1rem;
        --line-height: 1.2rem;

        --indent-size: 0.5rem;
        --indentguide-size: 1px;
        --indentguide-style: solid;
        --indentguide-color: #495057;
        --indentguide-color-active: #ced4da;
        --indentguide: var(--indentguide-size) var(--indentguide-style) var(--indentguide-color);
        --indentguide-active: var(--indentguide-size) var(--indentguide-style) var(--indentguide-color-active);
    }

    :host {
        display: block;
        background-color: var(--background-color);
        color: var(--color);
        font-family: var(--font-family);
        font-size: var(--font-size);
        line-height: var(--line-height);
    }

    :focus {
        outline-color: var(--outline-color);
        outline-width: var(--outline-width);
        outline-style: var(--outline-style);
    }

    .preview {
        color: var(--preview-color);
    }

    .null {
        color: var(--null-color);
    }

    .key {
        color: var(--property-color);
        display: inline-flex;
        align-items: flex-start;
    }

    .collapsable::before {
        display: inline-flex;
        font-size: 0.8em;
        content: '▶';
        width: var(--line-height);
        height: var(--line-height);
        align-items: center;
        justify-content: center;

        transition: transform 195ms ease-out;
        transform: rotate(90deg);

        color: inherit;
    }

    .collapsable--collapsed::before {
        transform: rotate(0);
    }

    .collapsable {
        cursor: pointer;
        user-select: none;
    }

    .string {
        color: var(--string-color);
    }

    .number {
        color: var(--number-color);
    }

    .boolean {
        color: var(--boolean-color);
    }

    ul {
        padding: 0;
        clear: both;
    }

    ul,
    li {
        list-style: none;
        position: relative;
    }

    li ul > li {
        position: relative;
        margin-left: calc(var(--indent-size) + var(--line-height));
        padding-left: 0px;
    }

    ul ul::before {
        content: '';
        border-left: var(--indentguide);
        position: absolute;
        left: calc(var(--line-height) / 2 - var(--indentguide-size));
        top: 0.2rem;
        bottom: 0.2rem;
    }

    ul ul:hover::before {
        border-left: var(--indentguide-active);
    }

    mark {
        background-color: var(--highlight-color);
    }
`,JsonViewer=class extends i$1{constructor(){super(),this.state={expanded:{},filtered:{},highlight:null},this.lastFocusedItem=null,this.#handlePropertyClick=path=>e=>{e.preventDefault(),this.setState(toggleNode(path))},this.#handleFocusIn=event=>{const target=event.target;event.target===this&&this.#focusItem(this.lastFocusedItem||this.nodeElements[0]),target.matches('[role="treeitem"]')&&(this.lastFocusedItem&&(this.lastFocusedItem.tabIndex=-1),this.lastFocusedItem=target,this.tabIndex=-1,target.tabIndex=0)},this.#handleFocusOut=event=>{const relatedTarget=event.relatedTarget;relatedTarget&&this.contains(relatedTarget)||(this.tabIndex=0)},this.addEventListener("focusin",this.#handleFocusIn),this.addEventListener("focusout",this.#handleFocusOut)}static{this.styles=[JsonViewer_styles_default]}static customRenderer(value,_path){return JSON.stringify(value)}async setState(stateFn){const currentState=this.state;this.state={...currentState,...stateFn(currentState,this)}}connectedCallback(){this.hasAttribute("data")||isDefined(this.data)||this.setAttribute("data",this.innerText),this.setAttribute("role","node"),this.setAttribute("tabindex","0"),super.connectedCallback()}#handlePropertyClick;#handleFocusIn;#handleFocusOut;#handleKeyDown(event){if(!["ArrowDown","ArrowUp","ArrowRight","ArrowLeft","Home","End"].includes(event.key)){return}const nodes=[...this.nodeElements],isLtr=this.matches(":dir(ltr)"),isRtl=this.matches(":dir(rtl)");if(nodes.length>0){event.preventDefault();const activeItemIndex=nodes.findIndex((item=>item.matches(":focus"))),activeItem=nodes[activeItemIndex],isExpanded=this.state.expanded[activeItem.dataset.path],isLeaf=isPrimitive((json=this.data,activeItem.dataset.path.split(".").reduce(((acc,key)=>acc[key]),json))),focusItemAt=index=>{const item=nodes[Math.max(Math.min(index,nodes.length-1),0)];this.#focusItem(item)},toggleExpand=expanded=>{this.setState(toggleNode(activeItem.dataset.path,expanded))};"ArrowDown"===event.key?focusItemAt(activeItemIndex+1):"ArrowUp"===event.key?focusItemAt(activeItemIndex-1):isLtr&&"ArrowRight"===event.key||isRtl&&"ArrowLeft"===event.key?!activeItem||isExpanded||isLeaf?focusItemAt(activeItemIndex+1):toggleExpand(!0):isLtr&&"ArrowLeft"===event.key||isRtl&&"ArrowRight"===event.key?activeItem&&isExpanded&&!isLeaf?toggleExpand(!1):focusItemAt(activeItemIndex-1):"Home"===event.key?focusItemAt(0):"End"===event.key&&focusItemAt(nodes.length-1)}var json}#focusItem(item){item.focus()}expand(glob){this.setState(expand(glob,!0))}expandAll(){this.setState(expand("**",!0))}collapseAll(){this.setState(expand("**",!1))}collapse(glob){this.setState(expand(glob,!1))}*search(criteria){for(const[node,path]of deepTraverse(this.data)){isPrimitive(node)&&String(node).match(criteria)&&(this.expand(path),this.updateComplete.then((()=>{const node2=this.shadowRoot.querySelector(`[data-path="${path}"]`);node2.scrollIntoView({behavior:"smooth",inline:"center",block:"center"}),node2.focus()})),this.setState(highlight(path)),yield{value:node,path})}this.setState(highlight(null))}filter(criteria){var regexOrGlob;this.setState((regexOrGlob=criteria,(_state,el)=>{const filtered={};if(regexOrGlob){for(const[,path,parents]of deepTraverse(el.data)){isMatchingPath(path,regexOrGlob)?(filtered[path]=!1,parents.forEach((p=>filtered[p]=!1))):filtered[path]=!0}}return{filtered}}))}resetFilter(){this.setState((()=>({filtered:{}})))}renderObject(node,path){return x`
            <ul part="object" role="group">
                ${function*(o,f){if(void 0!==o){let i=0;for(const t of o){yield f(t,i++)}}}(Object.entries(node),(([key,nodeData])=>{const nodePath=path?`${path}.${key}`:key,isPrimitiveNode=isPrimitive(nodeData),isExpanded=this.state.expanded[nodePath];return this.state.filtered[nodePath]?E:x`
                              <li
                                  part="property"
                                  role="treeitem"
                                  data-path="${nodePath}"
                                  aria-expanded="${isExpanded?"true":"false"}"
                                  tabindex="-1"
                                  .hidden="${this.state.filtered[nodePath]}"
                                  aria-hidden="${this.state.filtered[nodePath]}"
                              >
                                  <span
                                      part="key"
                                      class="${e({key,collapsable:!isPrimitiveNode,"collapsable--collapsed":!this.state.expanded[nodePath]})}"
                                      @click="${isPrimitiveNode?null:this.#handlePropertyClick(nodePath)}"
                                  >
                                      ${key}:
                                      ${n(!isPrimitiveNode&&!isExpanded,(()=>this.renderNodePreview(nodeData)))}
                                  </span>

                                  ${n(isPrimitiveNode||isExpanded,(()=>this.renderValue(nodeData,nodePath)))}
                              </li>
                          `}))}
            </ul>
        `}renderValue(value,path=""){return isPrimitive(value)?this.renderPrimitive(value,path):this.renderObject(value,path)}renderNodePreview(node){return x`<span part="preview" class="preview"> ${function(node,{nodeCount=3,maxLength=15}={}){const isArray=Array.isArray(node),objectNodes=Object.keys(node),keys=objectNodes.slice(0,nodeCount),preview=[],getNodePreview=nodeValue=>{switch(getType(nodeValue)){case"object":return 0===Object.keys(nodeValue).length?"{ }":"{ ... }";case"array":return 0===nodeValue.length?"[ ]":"[ ... ]";case"string":return`"${nodeValue.substring(0,maxLength)}${nodeValue.length>maxLength?"...":""}"`;default:return String(nodeValue)}},childPreviews=[];for(const key of keys){const nodePreview=[],nodeValue=node[key];isArray||nodePreview.push(`${key}: `),nodePreview.push(getNodePreview(nodeValue)),childPreviews.push(nodePreview.join(""))}objectNodes.length>nodeCount&&childPreviews.push("..."),preview.push(childPreviews.join(", "));const previewText=preview.join("");return isArray?`[ ${previewText} ]`:`{ ${previewText} }`}(node)} </span>`}renderPrimitive(node,path){const highlight2=this.state.highlight,nodeType=getType(node),renderedValue=this.constructor.customRenderer(node,path),primitiveNode=x`
            <span part="primitive primitive-${nodeType}" class="${getType(node)}"> ${renderedValue} </span>
        `;return path===highlight2?x`<mark part="highlight">${primitiveNode}</mark>`:primitiveNode}render(){const data=this.data;return x`
            <div
                part="base"
                @keydown=${this.#handleKeyDown}
                @focusin="${this.#handleFocusIn}"
                @focusout="${this.#handleFocusOut}"
            >
                ${n(isDefined(data),(()=>this.renderValue(data)))}
            </div>
        `}};__decorateClass([n$1({converter:JSONConverter,type:Object})],JsonViewer.prototype,"data"),__decorateClass([r$1()],JsonViewer.prototype,"state"),__decorateClass([r$1()],JsonViewer.prototype,"lastFocusedItem"),__decorateClass([(n,o)=>((e,t,c)=>(c.configurable=!0,c.enumerable=!0,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,c),c))(n,o,{get(){return(this.renderRoot??(e$2??=document.createDocumentFragment())).querySelectorAll("[role=\"treeitem\"]")}})
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */],JsonViewer.prototype,"nodeElements"),customElements.define("json-viewer",JsonViewer);
//# sourceMappingURL=index.js.map
