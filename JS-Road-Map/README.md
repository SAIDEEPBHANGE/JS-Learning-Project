# JavaScript Roadmap and Revision Notes

Use this roadmap as a reference while learning and revising JavaScript. Topics
are grouped by a suggested learning order, not by completion status. Apply
them in the [learning projects](../README.md#projects).

```mermaid
flowchart LR
    Basics["Variables, types and operators"] --> Control["Control flow and functions"]
    Control --> Objects["Objects, arrays and collections"]
    Objects --> Browser["DOM and browser events"]
    Browser --> Async["Promises, async/await and APIs"]
    Async --> Organize["Modules, classes and debugging"]
    Organize --> Next["React, Node.js and TypeScript"]
```

## 1. Beginner Topics

### Introduction to JavaScript

- JavaScript is a programming language used in browsers and other
  environments, such as Node.js. The host provides APIs; for example, the DOM
  is a browser API rather than part of the JavaScript language.
- ECMAScript specifies the language. Modern JavaScript is based on successive
  ECMAScript editions; support for features depends on the runtime.
- Run code in the browser developer console, in a script linked from HTML, or
  with Node.js. Use the console and error messages to inspect behavior.

### Variables

- `let` declares a block-scoped variable that can be reassigned. `const` is
  block-scoped and cannot be reassigned, but an object it references can
  still be mutated.
- `var` is function-scoped (or global when declared outside a function), can
  be redeclared, and is generally avoided in new code.
- Declarations are processed before execution. Accessing `let` or `const`
  before initialization throws because they are in the temporal dead zone;
  a hoisted `var` is initialized to `undefined`.
- Scope determines where a name is accessible: block, function, or global.
  Use descriptive names; identifiers cannot begin with a digit or be reserved
  words.

```js
const user = { name: "Sam" };
user.name = "Alex"; // The object can change even though user cannot be reassigned.
let count = 0;
count += 1;
```

### Data Types and Objects

- Primitive types: string, number, boolean, `undefined`, `null`, bigint, and
  symbol. Objects, including arrays and functions, are reference values.
- `typeof` identifies most primitive types, but `typeof null` returns
  `"object"`; use `value === null` to check for null.
- Objects have prototypes. Property lookup follows the prototype chain when a
  property is not found on the object itself.
- Built-in objects include `Array`, `Date`, `Math`, `JSON`, `Map`, and `Set`.

### Type Conversion and Coercion

- Explicit conversion is requested in code, such as `Number("42")`,
  `String(42)`, or `Boolean(value)`.
- Implicit coercion happens when an operator or context converts a value.
  For example, `"5" + 1` is `"51"`, while `"5" - 1` is `4`.
- Empty strings, `0`, `NaN`, `null`, `undefined`, and `false` are falsy;
  objects and arrays are truthy, even when empty.

### Data Structures

- **Array:** an ordered collection; common methods include `map`, `filter`,
  `find`, and `reduce`. Typed arrays represent binary numeric data in a
  specific format.
- **Map:** stores key-value pairs with keys of any type. **Set:** stores
  unique values.
- **WeakMap** and **WeakSet** hold weak references to eligible keys/values
  (objects or non-registered symbols) and are not iterable. They do not
  prevent those values from being garbage-collected.
- **JSON:** a text format for exchanging structured data. `JSON.stringify`
  serializes supported values; `JSON.parse` reads JSON text and throws on
  invalid input. JSON does not represent every JavaScript value.

### Equality and Comparisons

- `===` and `!==` compare without type coercion. Prefer them when that is the
  intended behavior. `==` and `!=` may coerce operands before comparing.
- `Object.is` treats `NaN` as equal to itself and distinguishes `0` from
  `-0`; strict equality does the opposite for these cases.
- SameValueZero treats `NaN` as equal to itself and `0` as equal to `-0`.
  It is used by operations such as `Array.prototype.includes` and `Set`.
- `isLooselyEqual` and `isStrictlyEqual` are specification algorithms, not
  functions to call directly. Relational operators (`<`, `>`, `<=`, `>=`)
  have their own conversion and comparison rules.

### Loops and Iteration

- Use `for` when an index or counter is useful; `while` and `do...while` loop
  based on a condition. A `do...while` body runs at least once.
- `for...of` reads values from an iterable, such as an array. `for...in`
  enumerates enumerable property names, including inherited ones; it is
  usually not the right choice for array values.
- `break` exits a loop; `continue` skips to its next iteration.

### Control Flow and Errors

- `if...else` selects branches based on conditions. `switch` compares its
  expression to cases using strict equality; use `break` to avoid unwanted
  fall-through.
- `throw` raises an exception. Use `try...catch` to handle a failure and
  `finally` for cleanup that should run whether or not an error occurred.
- Create descriptive errors with `Error` or an appropriate built-in subtype
  such as `TypeError`. Handle errors where the program can respond usefully.

### Expressions and Operators

- Assignment (`=`, `+=`), arithmetic (`+`, `-`, `*`, `/`, `%`, `**`), and
  comparison operators combine or compare values.
- Logical `&&` and `||` short-circuit and return operands, not necessarily
  booleans. `??` uses its right operand only when the left is `null` or
  `undefined`.
- The conditional operator `condition ? a : b` chooses one expression.
  Unary operators include `!`, `typeof`, and unary `-`; the comma operator
  evaluates expressions left to right and returns the last value.
- Bitwise operators work on 32-bit integers for numbers. BigInt supports
  many arithmetic and bitwise operators, but cannot generally be mixed with
  numbers in arithmetic. `+` also concatenates strings.

### Functions

- Functions package reusable behavior. Parameters receive arguments; default
  parameters supply a value when an argument is `undefined`.
- Rest parameters collect remaining arguments into an array. Ordinary
  functions also have an `arguments` object; arrow functions do not have
  their own.
- Arrow functions are concise and capture `this` from their surrounding
  scope. An IIFE is a function expression invoked immediately.
- Lexical scope determines which outer variables a function can access. A
  closure retains access to its surrounding lexical environment after the
  outer function returns.
- Recursion calls the same function again and needs a base case. Function
  calls use the call stack. Built-ins such as `parseInt` and `Number` are
  available for common operations.
- Strict mode (`"use strict"`) makes certain mistakes errors and changes some
  semantics. ES modules and class bodies are strict automatically.

```js
function makeCounter(start = 0) {
  let count = start;
  return () => ++count; // The returned function closes over count.
}
const next = makeCounter();
next(); // 1
next(); // 2
```

### `this` and Function Borrowing

- For an ordinary function, `this` depends on how it is called. In
  `object.method()`, it is normally `object`; a detached call can have a
  different value. In strict mode, a plain function call has `undefined`
  as `this`; non-strict behavior depends on the environment.
- At top level, `this` depends on the execution context: for example, it is
  `undefined` in an ES module. Browser event listeners called as ordinary
  functions receive the event target's `currentTarget` as `this`.
- Arrow functions have no own `this`; they use the enclosing context.
- Borrow a method or set its receiver explicitly with `call(thisArg, ...args)`
  or `apply(thisArg, argsArray)`. `bind(thisArg, ...args)` returns a new
  function with a bound receiver and optional arguments.

## 2. Intermediate Topics

### Asynchronous JavaScript

- The call stack executes synchronous code. The event loop coordinates queued
  work when the stack is available; promise reactions run as microtasks.
- `setTimeout` schedules a callback after at least a delay; `setInterval`
  repeats it. Use `clearTimeout` or `clearInterval` to cancel.
- Callbacks are functions passed to run later. Deeply nested callbacks can
  become hard to maintain, sometimes called callback hell.
- A promise represents a pending, fulfilled, or rejected result. Use
  `.then`, `.catch`, and `.finally`, or `async`/`await` with `try...catch`.
  `Promise.all` waits for all inputs and rejects if one rejects.

```js
async function loadUser(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}
```

### Working with APIs

- `fetch` returns a promise for a response. Check `response.ok`: HTTP errors
  such as 404 do not normally reject the promise. Parse JSON with
  `await response.json()` and handle network and parsing errors.
- `XMLHttpRequest` is an older API for HTTP requests and uses event handlers.
  Understand it when maintaining older code; `fetch` is common in modern
  browser code.
- API use may require credentials, permissions, CORS support, and careful
  handling of rate limits. Never expose private credentials in client code.

### Modules

- ES modules use `export` and `import`; browsers can load them with
  `<script type="module">`. Modules have their own scope and run in strict
  mode.
- CommonJS uses `require` and `module.exports` and is common in existing
  Node.js code. The module system depends on the runtime and configuration.

### Iterators and Generators

- An iterable provides an iterator via `Symbol.iterator`. The iterator's
  `next()` returns an object with `value` and `done`; `for...of` consumes
  iterables.
- A generator function (`function*`) returns an iterator and pauses at
  `yield`, resuming when the iterator advances.

### Classes

- Classes provide syntax for constructing objects with shared methods.
  `constructor` initializes instances; `extends` and `super` support
  inheritance.
- JavaScript classes build on prototypes. Instance methods are generally
  stored on the class prototype; `static` methods belong to the class itself.

### Memory Management

- Memory is allocated for values, used, and eventually reclaimed. JavaScript
  engines use garbage collection to reclaim objects that are no longer
  reachable.
- Unneeded references, event listeners, timers, or detached DOM nodes can
  keep data reachable. Remove listeners and clear timers when no longer needed.

### DOM APIs

- Select nodes with methods such as `querySelector`; create and insert them
  with `createElement` and `append`. Use `textContent` for plain text.
- Register interaction handlers with `addEventListener`. Event delegation
  handles events from multiple children at a shared parent using bubbling.
- Be careful with `innerHTML`: inserting untrusted content can introduce
  script-injection vulnerabilities. Validate and safely handle external input.

### Browser DevTools

- Use the **Console** to inspect errors and values, and **Sources** to set
  breakpoints and step through execution.
- Use **Network** to inspect requests, responses, and failures; use
  **Application** to inspect local storage and other browser data.
- Use **Performance** recordings to investigate slow work and **Memory**
  snapshots to investigate retained objects and potential leaks.

## 3. Next Topics

- **React:** a library for building interfaces from components; study
  component state, props, effects, and rendering after practicing JavaScript
  and the DOM.
- **Node.js:** a JavaScript runtime outside the browser; explore its module
  systems, package management, file APIs, and server-side programming.

## Related Learning Paths

- **Frontend:** HTML, CSS, accessibility, responsive design, browser APIs,
  and user-interface development.
- **TypeScript:** JavaScript with a static type system; practice types,
  interfaces, generics, and compiling or type-checking a project.
