import * as mod from "./build/server/index.js";

console.log("EXPORT KEYS:", Object.keys(mod));
console.log("DEFAULT TYPE:", typeof mod.default);
console.log("DEFAULT VALUE:", mod.default);

if (mod.default?.fetch) {
  console.log("DEFAULT HAS FETCH");
}

if (typeof mod.fetch === "function") {
  console.log("NAMED FETCH EXPORT");
}

process.exit(0);

