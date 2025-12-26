process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
});

console.log("SCRIPT STARTED");

setTimeout(async () => {
  try {
    console.log("BEFORE IMPORT");
    const mod = await import("./build/server/index.js");
    console.log("AFTER IMPORT - SUCCESS");
    
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
    
    setTimeout(() => process.exit(0), 100);
  } catch (error) {
    console.error("ERROR:", error.message);
    console.error(error.stack);
    setTimeout(() => process.exit(1), 100);
  }
}, 100);

