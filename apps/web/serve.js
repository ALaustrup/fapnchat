console.log("SCRIPT STARTED");

setTimeout(async () => {
  try {
    console.log("BEFORE IMPORT");
    const mod = await import("./build/server/index.js");
    console.log("AFTER IMPORT");
    
    console.log("EXPORT KEYS:", Object.keys(mod));
    console.log("DEFAULT TYPE:", typeof mod.default);
    
    if (mod.default) {
      console.log("DEFAULT VALUE TYPE:", typeof mod.default);
      if (typeof mod.default === "object") {
        console.log("DEFAULT KEYS:", Object.keys(mod.default));
        if (mod.default.fetch) {
          console.log("DEFAULT HAS FETCH");
        }
      }
    }
    
    if (typeof mod.fetch === "function") {
      console.log("NAMED FETCH EXPORT");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("ERROR:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}, 100);

