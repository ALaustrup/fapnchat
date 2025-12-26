import * as mod from "./build/server/index.js";

console.log("EXPORT KEYS:", Object.keys(mod));
console.log("DEFAULT TYPE:", typeof mod.default);

if (mod.default) {
  console.log("DEFAULT VALUE TYPE:", typeof mod.default);
  if (typeof mod.default === "object" && mod.default !== null) {
    console.log("DEFAULT KEYS:", Object.keys(mod.default));
    if (mod.default.fetch) {
      console.log("DEFAULT HAS FETCH");
    }
  } else if (typeof mod.default === "function") {
    console.log("DEFAULT IS FUNCTION");
  }
}

if (typeof mod.fetch === "function") {
  console.log("NAMED FETCH EXPORT");
}

process.exit(0);

